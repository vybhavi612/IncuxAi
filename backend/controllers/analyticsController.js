import { db } from '../services/firebaseService.js';

// Helper to compute analytics for a single intern in Firestore
const computeInternAnalytics = async (internId) => {
  const userDoc = await db.collection('users').doc(internId).get();
  if (!userDoc.exists) return null;
  const user = { id: userDoc.id, ...userDoc.data() };
  delete user.password;

  // Fetch all attendance logs for this intern
  const attendanceSnapshot = await db.collection('attendances')
    .where('internId', '==', internId)
    .get();

  const attendanceLogs = [];
  attendanceSnapshot.forEach(doc => {
    const data = doc.data();
    attendanceLogs.push({
      id: doc.id,
      ...data
    });
  });

  const totalLogs = attendanceLogs.length;

  // Punctuality rate
  const onTimeLogs = attendanceLogs.filter(log => log.status === 'on-time').length;
  const lateLogs = attendanceLogs.filter(log => log.status === 'late').length;
  const punctualityRate = totalLogs > 0 ? Math.round((onTimeLogs / totalLogs) * 100) : 100;

  // Average late duration
  const totalLateMins = attendanceLogs.reduce((sum, log) => sum + (log.lateBy || 0), 0);
  const avgLateMins = lateLogs > 0 ? Math.round(totalLateMins / lateLogs) : 0;

  // Total session hours
  const totalSessionMins = attendanceLogs.reduce((sum, log) => sum + (log.sessionDuration || 0), 0);
  const totalSessionHours = Math.round((totalSessionMins / 60) * 10) / 10;
  const avgSessionMins = totalLogs > 0 ? Math.round(totalSessionMins / totalLogs) : 0;

  // Project submissions stats
  const projectsSnapshot = await db.collection('projects')
    .where('internId', '==', internId)
    .get();

  const projects = [];
  projectsSnapshot.forEach(doc => {
    projects.push(doc.data());
  });

  const totalProjects = projects.length;
  const approvedProjects = projects.filter(p => p.status === 'approved').length;
  const rejectedProjects = projects.filter(p => p.status === 'rejected').length;
  const pendingProjects = projects.filter(p => p.status === 'pending').length;
  const projectCompletionRate = totalProjects > 0 ? Math.round((approvedProjects / totalProjects) * 100) : 0;

  // Badge determinations
  const badges = [];
  let recommendation = '';

  if (totalLogs >= 3 && punctualityRate >= 90 && approvedProjects >= 1 && rejectedProjects === 0) {
    badges.push({
      name: 'Top Performer',
      color: 'emerald',
      description: 'Excellent punctuality and successful project completions.'
    });
    recommendation = `${user.firstName} is demonstrating stellar performance with outstanding punctuality and high-quality deliverables. Recommend giving them leadership responsibilities or more complex assignments.`;
  } else if (punctualityRate < 70 || (totalLogs >= 3 && avgSessionMins < 180)) {
    badges.push({
      name: 'At Risk',
      color: 'rose',
      description: 'Struggling with attendance requirements or low session times.'
    });
    recommendation = `${user.firstName}'s low punctuality rate (${punctualityRate}%) or low active hours puts them at risk. Recommend an immediate one-on-one session to establish core scheduling expectations.`;
  } else if (rejectedProjects > 0 || (totalProjects > 0 && projectCompletionRate < 50)) {
    badges.push({
      name: 'Needs Mentorship',
      color: 'amber',
      description: 'Struggling to complete github submissions successfully.'
    });
    recommendation = `${user.firstName} is struggling with codebase submissions or code reviews. Recommend pairing them with a technical mentor to review pull request expectations and architecture.`;
  } else if (totalLogs >= 5 && punctualityRate >= 85) {
    badges.push({
      name: 'Consistent Intern',
      color: 'blue',
      description: 'Reliable clock-in history and steady engagement.'
    });
    recommendation = `${user.firstName} is meeting all baseline performance expectations. Continue monitoring progress and provide regular positive reinforcement during sprints.`;
  } else {
    recommendation = `${user.firstName} is adjusting to the internship curriculum. Provide constructive feedback on tasks and monitor attendance trends.`;
  }

  // Include default badge if none
  if (badges.length === 0) {
    badges.push({
      name: 'Rising Star',
      color: 'indigo',
      description: 'Active participant in the onboarding pipeline.'
    });
  }

  return {
    intern: user,
    metrics: {
      totalLogs,
      onTimeLogs,
      lateLogs,
      punctualityRate,
      avgLateMins,
      totalSessionHours,
      avgSessionMins,
      totalProjects,
      approvedProjects,
      rejectedProjects,
      pendingProjects,
      projectCompletionRate
    },
    badges,
    aiRecommendation: recommendation
  };
};

// @desc    Get Authenticated Intern's performance analytics
// @route   GET /api/analytics/my
// @access  Private (Intern only)
export const getMyAnalytics = async (req, res) => {
  try {
    const analytics = await computeInternAnalytics(req.user.id);
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching my analytics:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Get Specific Intern's analytics
// @route   GET /api/analytics/intern/:id
// @access  Private (Admin only)
export const getInternAnalytics = async (req, res) => {
  try {
    const analytics = await computeInternAnalytics(req.params.id);
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Intern not found or has no database record.'
      });
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching intern analytics:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// @desc    Get Admin Overview stats and charts data
// @route   GET /api/analytics/overview
// @access  Private (Admin only)
export const getAdminOverview = async (req, res) => {
  try {
    const internsSnapshot = await db.collection('users')
      .where('role', '==', 'intern')
      .get();
    
    let totalPunctuality = 0;
    let countedInterns = 0;
    const internCards = [];
    const badgeStats = { 'Top Performer': 0, 'Consistent Intern': 0, 'Needs Mentorship': 0, 'At Risk': 0, 'Rising Star': 0 };

    for (const doc of internsSnapshot.docs) {
      const report = await computeInternAnalytics(doc.id);
      if (report) {
        internCards.push({
          id: doc.id,
          name: `${report.intern.firstName} ${report.intern.lastName}`,
          email: report.intern.email,
          profilePhotoURL: report.intern.profilePhotoURL,
          punctuality: report.metrics.punctualityRate,
          projectsCompleted: report.metrics.approvedProjects,
          projectsTotal: report.metrics.totalProjects,
          badges: report.badges,
          recommendation: report.aiRecommendation
        });

        if (report.metrics.totalLogs > 0) {
          totalPunctuality += report.metrics.punctualityRate;
          countedInterns++;
        }

        report.badges.forEach(b => {
          if (badgeStats[b.name] !== undefined) {
            badgeStats[b.name]++;
          }
        });
      }
    }

    const averageWorkspacePunctuality = countedInterns > 0 ? Math.round(totalPunctuality / countedInterns) : 100;

    // Chart: Daily attendance trends for the last 7 days
    const attendanceTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const dayLogsSnapshot = await db.collection('attendances')
        .where('date', '==', dateStr)
        .get();
      
      const dayLogs = [];
      dayLogsSnapshot.forEach(doc => dayLogs.push(doc.data()));

      attendanceTrends.push({
        date: dateStr,
        label: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
        count: dayLogs.length,
        onTime: dayLogs.filter(l => l.status === 'on-time').length,
        late: dayLogs.filter(l => l.status === 'late').length
      });
    }

    res.status(200).json({
      success: true,
      data: {
        avgWorkspacePunctuality: averageWorkspacePunctuality,
        badgeSummary: badgeStats,
        internOverview: internCards,
        attendanceTrends
      }
    });
  } catch (error) {
    console.error('Error fetching admin overview analytics:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};
