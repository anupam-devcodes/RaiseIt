const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendSuccess, sendError } = require("../utils/response");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  college: user.college,
  avatar: user.avatar,
});

const register = async (req, res) => {
  try {
    const { name, email, password, college, role } = req.body;

    if (!name || !email || !password || !college) {
      return sendError(res, 400, "All required fields are missing");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, "User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college,
      role: role || "student",
      authProviders: ["local"],
    });

    const token = generateToken(user);

    return sendSuccess(res, 201, "Registration successful", {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendError(res, 500, "Registration failed");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid credentials");
    }

    const token = generateToken(user);

    return sendSuccess(res, 200, "Login successful", {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendError(res, 500, "Login failed");
  }
};

const getMe = async (req, res) => {
  return sendSuccess(res, 200, "User profile fetched", { user: req.user });
};

module.exports = {
  register,
  login,
  getMe,
};
