const asyncHandler = require("express-async-handler");
const Jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Admin = require("../../../models/admin/adminModel");
const User = require("../../../models/userModel");

// Create initial admin account if none exists
const createInitialAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: "admin@gmail.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin@123", 10);
      await Admin.create({
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
        isActive: true
      });
      console.log("Initial admin account created successfully");
    }
  } catch (error) {
    console.error("Error creating initial admin:", error);
  }
};

const adminLogin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Account is deactivated" 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = Jwt.sign(
      { 
        id: admin._id,
        email: admin.email, 
        role: admin.role 
      }, 
      process.env.JWT_SECRET || "1921u0030",
      { expiresIn: "30d" }
    );

    // Update last login
    await Admin.findByIdAndUpdate(admin._id, {
      lastLogin: new Date()
    });

    // Set secure cookie with proper options
    res.cookie("adminToken", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    // Send success response with token (for localStorage backup)
    res.status(200).json({ 
      success: true,
      message: "Login successful",
      token: token, // Include token for localStorage
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});

// Add middleware to verify admin token
const verifyAdminToken = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookie or authorization header
    let token = req.cookies.adminToken;
    
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Access denied. No token provided." 
      });
    }

    // Verify token
    const decoded = Jwt.verify(token, process.env.JWT_SECRET || "1921u0030");
    
    // Find admin
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token or admin deactivated" 
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ 
      success: false,
      message: "Invalid token" 
    });
  }
});

// Add route to verify current admin session
const verifyAdminSession = asyncHandler(async (req, res) => {
  try {
    // Get token from cookie or authorization header
    let token = req.cookies.adminToken;
    
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No active session" 
      });
    }

    // Verify token
    const decoded = Jwt.verify(token, process.env.JWT_SECRET || "1921u0030");
    
    // Find admin
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid session" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Valid session",
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Session verification error:", error);
    res.status(401).json({ 
      success: false,
      message: "Invalid session" 
    });
  }
});

const logoutAdmin = asyncHandler(async (req, res) => {
  try {
    // Clear all admin-related cookies
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    res.status(200).json({ 
      success: true,
      message: 'Logout successful' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error during logout' 
    });
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "User blocked successfully", 
      user 
    });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).json({ 
      success: false,
      message: "Something went wrong while blocking user." 
    });
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "User unblocked successfully", 
      user 
    });
  } catch (err) {
    console.error("Unblock user error:", err);
    res.status(500).json({ 
      success: false,
      message: "Something went wrong while unblocking user." 
    });
  }
});

const userList = asyncHandler(async (req, res) => {
  try {
    let users = await User.find({}).select("-password").sort({createdAt:-1}); 
    
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users: users,
      count: users.length
    });
  } catch (err) {
    console.error("User list error:", err);
    res.status(500).json({ 
      success: false,
      message: "Something went wrong while fetching users." 
    });
  }
});

module.exports = { 
  adminLogin, 
  userList, 
  blockUser, 
  unblockUser, 
  logoutAdmin,
  createInitialAdmin,
  verifyAdminToken,
  verifyAdminSession
};