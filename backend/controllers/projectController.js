import { db } from '../services/firebaseService.js';
import { logActivity } from '../utils/activityLogger.js';

// Helper to populate user objects
const populateProjectList = async (snapshot) => {
  const list = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Fetch intern details
    const internDoc = await db.collection('users').doc(data.internId).get();
    let internObj = null;
    if (internDoc.exists) {
      const uData = internDoc.data();
      delete uData.password;
      internObj = { id: internDoc.id, ...uData };
    }

    // Fetch reviewer details
    let reviewerObj = null;
    if (data.reviewerId) {
      const revDoc = await db.collection('users').doc(data.reviewerId).get();
      if (revDoc.exists) {
        reviewerObj = {
          id: revDoc.id,
          firstName: revDoc.data()?.firstName,
          lastName: revDoc.data()?.lastName
        };
      }
    }

    list.push({
      _id: doc.id,
      id: doc.id,
      ...data,
      internId: internObj,
      reviewerId: reviewerObj
    });
  }
  return list;
};

const populateProjectDoc = async (docId) => {
  const doc = await db.collection('projects').doc(docId).get();
  if (!doc.exists) return null;
  const data = doc.data();

  const internDoc = await db.collection('users').doc(data.internId).get();
  let internObj = null;
  if (internDoc.exists) {
    const uData = internDoc.data();
    delete uData.password;
    internObj = { id: internDoc.id, ...uData };
  }

  let reviewerObj = null;
  if (data.reviewerId) {
    const revDoc = await db.collection('users').doc(data.reviewerId).get();
    if (revDoc.exists) {
      reviewerObj = {
        id: revDoc.id,
        firstName: revDoc.data()?.firstName,
        lastName: revDoc.data()?.lastName
      };
    }
  }

  return {
    _id: doc.id,
    id: doc.id,
    ...data,
    internId: internObj,
    reviewerId: reviewerObj
  };
};

// @desc    Submit a new project / repository
// @route   POST /api/projects
// @access  Private (Intern only)
export const submitProject = async (req, res) => {
  try {
    const { title, description, githubUrl } = req.body;

    if (!title || !description || !githubUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and GitHub repository URL.'
      });
    }

    // Validate GitHub URL
    const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(\/)?$/;
    if (!githubRegex.test(githubUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid GitHub repository URL (e.g. https://github.com/username/repo-name).'
      });
    }

    const projectData = {
      internId: req.user.id,
      title,
      description,
      githubUrl,
      status: 'pending',
      feedback: '',
      reviewerId: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('projects').add(projectData);

    // Log Activity
    await logActivity(
      req.user.id, 
      'project-submit', 
      `Submitted project: "${title}" (${githubUrl})`, 
      req
    );

    const populated = await populateProjectDoc(docRef.id);

    // Socket.io Real-Time Alert to Admins
    if (req.io) {
      req.io.emit('project_update', {
        action: 'submit',
        project: populated
      });

      req.io.emit('new_alert', {
        type: 'project_submission',
        message: `${req.user.firstName} ${req.user.lastName} submitted a new project: "${title}".`,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Project submitted successfully.',
      data: populated
    });
  } catch (error) {
    console.error('Error submitting project:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Get Authenticated Intern's project submissions
// @route   GET /api/projects/my
// @access  Private (Intern only)
export const getMyProjects = async (req, res) => {
  try {
    const snapshot = await db.collection('projects')
      .where('internId', '==', req.user.id)
      .get();

    const projects = await populateProjectList(snapshot);
    // Sort by createdAt descending (avoids Firestore composite index)
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching my projects:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Get All project submissions
// @route   GET /api/projects
// @access  Private (Admin only)
export const getAllProjects = async (req, res) => {
  try {
    const { status } = req.query;
    let queryRef = db.collection('projects');
    
    if (status) {
      queryRef = queryRef.where('status', '==', status);
    }
    
    const snapshot = await queryRef.get();
    const projects = await populateProjectList(snapshot);
    // Sort by createdAt descending (avoids Firestore composite index)
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching all projects:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Review a project submission (Approve/Reject)
// @route   PUT /api/projects/:id/review
// @access  Private (Admin only)
export const reviewProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status: "approved" or "rejected".'
      });
    }

    const projectDocRef = db.collection('projects').doc(id);
    const projectDoc = await projectDocRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Project submission not found.'
      });
    }

    await projectDocRef.update({
      status,
      feedback: feedback || '',
      reviewerId: req.user.id,
      reviewedAt: new Date(),
      updatedAt: new Date()
    });

    // Log Activity
    await logActivity(
      req.user.id, 
      'project-review', 
      `Reviewed project "${projectDoc.data().title}" - Status: ${status}`, 
      req
    );

    const populated = await populateProjectDoc(id);

    // Socket.io alerts
    if (req.io) {
      req.io.emit('project_update', {
        action: 'review',
        project: populated
      });
      
      req.io.emit('new_alert', {
        type: 'project_reviewed',
        message: `Project "${populated.title}" has been ${status}.`,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: `Project successfully marked as ${status}.`,
      data: populated
    });
  } catch (error) {
    console.error('Error reviewing project:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};
