const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const validateUser = await User.findOne({ email });

    if (validateUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({
      message: "Faculty registered successfully!",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Failed to register. Server Error.",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (user.password === password) {
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      });
    } else {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Failed to login",
      error: error.message,
    });
  }
};

const validateUser = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err);
        return res.status(401).json({ message: "Invalid token" });
      } else {
        return res.status(200).json({
          message: "Token is valid",
          email: decoded.email,
          valid: true,
        });
      }
    });
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({
      message: "Failed to validate token",
      error: error.message,
    });
  }
};

module.exports = { registerUser, loginUser, validateUser };
