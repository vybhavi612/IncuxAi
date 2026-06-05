import { db } from '../services/firebaseService.js';
import { logActivity } from '../utils/activityLogger.js';

export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, profilePhotoURL } = req.body;

    // Check permissions: User can only update their own profile, unless they are admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You can only update your own profile'
      });
    }

    const userDocRef = db.collection('users').doc(id);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    const updateData = { updatedAt: new Date() };

    // If updating email, check uniqueness
    if (email && email.toLowerCase() !== userData.email.toLowerCase()) {
      const emailExistsSnapshot = await db.collection('users')
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();

      if (!emailExistsSnapshot.empty) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      updateData.email = email.toLowerCase();
    }

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    
    if (profilePhotoURL !== undefined) {
      updateData.profilePhotoURL = profilePhotoURL;
      updateData.profilePhotoUploadedAt = new Date();
    }

    await userDocRef.update(updateData);

    // Get fresh user record
    const updatedUserDoc = await userDocRef.get();
    const finalUserData = updatedUserDoc.data();

    // Log Activity
    await logActivity(
      req.user.id,
      'profile-update',
      `Updated user profile details for ${finalUserData.email}`,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUserDoc.id,
        email: finalUserData.email,
        firstName: finalUserData.firstName,
        lastName: finalUserData.lastName,
        role: finalUserData.role,
        profilePhotoURL: finalUserData.profilePhotoURL,
        profilePhotoUploadedAt: finalUserData.profilePhotoUploadedAt
      }
    });

  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile'
    });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      delete data.password;
      users.push({
        id: doc.id,
        ...data
      });
    });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching users'
    });
  }
};
