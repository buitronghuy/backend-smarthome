// @ts-nocheck
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { prepareResponse } = require("../CONST/response");
const { isEmailExist } = require("../services/UserService");
const { models } = require("../db");
const { logger } = require("../helpers/logger");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("jwt");

    if (!token) {
      return prepareResponse(res, 403, "Access Denied");
    }

    const verifiedToken = await jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = verifiedToken;
    next();
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 401, "Invalid Token");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return prepareResponse(res, 406, "Please provide email and password!");
  }

  try {
    const userCredential = await models.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        roles: true,
        password: true,
      },
    });

    if (!userCredential) {
      return prepareResponse(res, 404, "Could not found email");
    }

    if (!userCredential.active) {
      return prepareResponse(res, 403, "Your account is inactive");
    }

    const isValidPassword = await bcrypt.compare(
      password,
      userCredential.password
    );
    if (!isValidPassword) {
      return prepareResponse(res, 404, "Your email or password is incorrect");
    }

    const token = await jwt.sign(
      { id: userCredential.id, roles: userCredential.roles },
      process.env.SECRET_TOKEN,
      {
        expiresIn: "24h",
      }
    );

    return prepareResponse(res, 200, `Hello ${userCredential.name}`, {
      email,
      token,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 401, "Login Failed");
  }
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (await isEmailExist(email)) {
      return prepareResponse(
        res,
        409,
        "Email is already used by another account. Please use a new email"
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const accessToken = jwt.sign(
      { email },
      process.env.CONFIRM_EMAIL_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXP,
      }
    );

    const newUser = await models.user.create({
      data: { name, email, password: hashedPassword },
      select: { email: true, name: true },
    });

    return prepareResponse(res, 201, "Signup User Successfully", { newUser });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, "Signup User Failed");
  }
};

module.exports = {
  login,
  signup,
  verifyToken,
};
