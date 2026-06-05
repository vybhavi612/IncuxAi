import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, auth } from '../services/firebaseService.js';
import { logActivity } from '../utils/activityLogger.js';

// Helper to generate JWT
const generateJWT = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET || 'supersecretjwtkey123456!',
    { expiresIn: '7d' }
  );
};

// Register Controller
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, profilePhotoURL } = req.body;

    // 1. Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: email, password, firstName, lastName'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // 2. Check for duplicate user email in Firestore
    const existingSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!existingSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // 3. Create User in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await auth.createUser({
        email: email,
        password: password,
        displayName: `${firstName} ${lastName}`,
      });
    } catch (fbError) {
      console.error('Firebase Auth User creation failed:', fbError.message);
      return res.status(500).json({
        success: false,
        message: `Firebase Registration Failed: ${fbError.message}`
      });
    }

    const firebaseUID = firebaseUser.uid;

    // 4. Hash Password & Create Firestore User record
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      firebaseUID,
      firstName,
      lastName,
      role: role || 'intern',
      profilePhotoURL: profilePhotoURL || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').doc(firebaseUID).set(userData);

    // 5. Generate JWT Token
    const jwtToken = generateJWT(firebaseUID, userData.email, userData.role);

    // Track activity in Audit trail
    await logActivity(
      firebaseUID,
      'register',
      `Registered user: ${userData.email} (${userData.role})`,
      req
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token: jwtToken,
      user: {
        id: firebaseUID,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        profilePhotoURL: userData.profilePhotoURL,
        firebaseUID
      }
    });

  } catch (error) {
    console.error('Registration controller error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password, firebaseIdToken } = req.body;
    let userId = null;
    let userData = null;

    // Method A: Firebase ID Token login (Preferred production flow)
    if (firebaseIdToken) {
      try {
        const decodedToken = await auth.verifyIdToken(firebaseIdToken);
        userId = decodedToken.uid;

        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
          return res.status(404).json({
            success: false,
            message: 'User matching authenticated Firebase credentials not found in local database'
          });
        }
        userData = userDoc.data();
      } catch (tokenError) {
        console.error('Firebase ID Token validation failed:', tokenError.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid Firebase ID Token'
        });
      }
    } 
    // Method B: Email/Password fallback (API testing/Standard login)
    else if (email && password) {
      const searchEmail = email.toLowerCase().trim();
      const snapshot = await db.collection('users').where('email', '==', searchEmail).limit(1).get();
      
      if (snapshot.empty) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const userDoc = snapshot.docs[0];
      userId = userDoc.id;
      userData = userDoc.data();

      const isMatch = await bcrypt.compare(password, userData.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide email/password or firebaseIdToken'
      });
    }

    if (!userData.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate JWT Token
    const jwtToken = generateJWT(userId, userData.email, userData.role);

    // Track activity in Audit logs
    await logActivity(
      userId,
      'login',
      `Logged in user: ${userData.email}`,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: jwtToken,
      user: {
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        profilePhotoURL: userData.profilePhotoURL
      }
    });

  } catch (error) {
    console.error('Login controller error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// Get current profile
export const getProfile = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    delete userData.password;

    res.status(200).json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Get Profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};
