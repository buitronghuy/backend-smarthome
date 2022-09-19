const bcrypt = require('bcryptjs');
const { Role } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { prepareResponse } = require('../CONST/response');
const { isEmailExist } = require('../services/UserService');
const { models } = require('../db');
const { logger } = require('../helpers/logger');

/**
 * It gets all users from the database and returns them to the user
 * @param req - The request object.
 * @param res - The response object.
 * @returns An object with a status code, message and data.
 */
const getAllUsers = async (req, res) => {
  const { page, size } = req.query;

  const pageSize = parseInt(size, 10);
  const currentPage = parseInt(page, 10);

  try {
    const conditions = {};
    if (page && size) {
      conditions.AND = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      };
    }

    if (req.user.roles !== Role.ADMIN) {
      conditions.roles = Role.USER;
    }

    const allUsers = await models.user.findMany({
      where: {
        ...conditions,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    const count = allUsers.length;

    return prepareResponse(res, 200, 'Get all users successfully', {
      count,
      allUsers,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 404, 'Users Not Found');
  }
};

/**
 * It creates a new user
 * @param req - The request object.
 * @param res - The response object.
 */
const createUser = async (req, res) => {
  const { name, email, password, house } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const isEmailExisted = await isEmailExist(email);
    if (isEmailExisted) {
      return prepareResponse(
        res,
        409,
        'Email is already used by another account. Please use a new email',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await models.user.create({
      data: { name, email, password: hashedPassword, house },
    });

    return prepareResponse(res, 201, 'Created New User Successfully', {
      newUser,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, 'Create New User Failed');
  }
};
 
const updateUserInfo = async (req, res) => {
  const { name, email, house } = req.body;
  const { id } = req.params;
  let params = {};

  try {
    const user = await models.user.findUnique({ where: { id } });

    if (!user) {
      return prepareResponse(res, 404, 'User not exists');
    }

    if (email && (await isEmailExist(email))) {
      return prepareResponse(
        res,
        409,
        'Email is already used by another account. Please use another email',
      );
    }

    if (req.user.roles !== Role.ADMIN) {
      params = { name };
    } else {
      params = { ...req.body };
    }

    const userInfo = await models.user.update({
      where: { id },
      data: { ...params },
    });
    return prepareResponse(res, 201, 'Update User Info Successfully', {
      userInfo,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, 'Update User Info Failed');
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await models.user.findFirst({ where: { id } });

    if (!user) {
      return prepareResponse(res, 404, 'User not exists');
    }

    await models.user.delete({ where: { id } });
    return prepareResponse(res, 201, 'User is deleted');
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, 'Delete User Failed');
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUserInfo,
  deleteUser,
};
