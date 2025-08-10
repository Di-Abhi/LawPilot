const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');
// const emailService = require('../services/emailService');

// Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
  // MANUAL REGISTER
  register: async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { name, email, password, role } = req.body;

      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new Users({
        name,
        email,
        password: hashedPassword,
        role: role || 'client', // Default role if not specified
      });

      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // MANUAL LOGIN
  login: async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      const user = await Users.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign(payload, process.env.REFRESH_JWT_SECRET, { expiresIn: '7d' });

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('jwtToken', token, { 
        httpOnly: true, 
        secure: isProduction, 
        domain: 'localhost', 
        path: '/' 
      });
      res.cookie('refreshToken', refreshToken, { 
        httpOnly: true, 
        secure: isProduction, 
        domain: 'localhost', 
        path: '/' 
      });

      res.json({ message: 'User authenticated', userDetails: payload, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GOOGLE LOGIN
  googleAuth: async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ message: 'Missing token' });

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name } = payload;

      let user = await Users.findOne({ email });

      if (!user) {
        user = new Users({
          name,
          email,
          googleId,
          isGoogleUser: true,
          role: 'client', // default role for Google sign-in
        });
        await user.save();
      }

      const jwtPayload = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign(jwtPayload, process.env.REFRESH_JWT_SECRET, { expiresIn: '7d' });

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('jwtToken', token, { 
        httpOnly: true, 
        secure: isProduction, 
        domain: 'localhost', 
        path: '/' 
      });
      res.cookie('refreshToken', refreshToken, { 
        httpOnly: true, 
        secure: isProduction, 
        domain: 'localhost', 
        path: '/' 
      });

      res.json({ message: 'Google user authenticated', userDetails: jwtPayload, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Google login failed' });
    }
  },

  // CHECK USER SESSION
  isUserLoggedIn: async (req, res) => {
    const token = req.cookies.jwtToken;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Unauthorized' });

      const user = await Users.findById(decoded.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json({ userDetails: user });
    });
  },

  // REFRESH ACCESS TOKEN
  refreshAccessToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
      const user = await Users.findById(decoded.id);

      const newAccessToken = jwt.sign(
        { id: user._id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('jwtToken', newAccessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        domain: 'localhost', 
        path: '/' 
      });
      res.json({ message: 'Token refreshed', userDetails: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Token refresh failed' });
    }
  },

  // LOGOUT
  logout: (req, res) => {
    res.clearCookie('jwtToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  },

  // SEND RESET CODE TO EMAIL
  // sendResetPasswordToken: async (req, res) => {
  //   try {
  //     const { email } = req.body;
  //     if (!email) return res.status(400).json({ message: 'Email required' });

  //     const user = await Users.findOne({ email });
  //     if (!user) return res.status(404).json({ message: 'User not found' });

  //     const code = Math.floor(100000 + Math.random() * 900000).toString();
  //     const expiry = Date.now() + 10 * 60 * 1000;

  //     user.resetToken = code;
  //     user.resetTokenExpiry = expiry;
  //     await user.save();

  //     await emailService.send(email, 'Password Reset Code', `Your code: ${code}`);

  //     res.status(200).json({ message: 'Reset code sent' });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: 'Failed to send reset code' });
  //   }
  // },

  resetPassword: async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;

      const user = await Users.findOne({ email });
      if (!user || user.resetToken !== code || user.resetTokenExpiry < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired reset code' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpiry = null;

      await user.save();

      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Reset failed' });
    }
  }
};

module.exports = authController;
