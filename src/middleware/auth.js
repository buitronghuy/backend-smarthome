// @ts-nocheck
const { Role } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { prepareResponse, ACTION } = require('../CONST/response');
const { models } = require('../db');
const { logger } = require('../helpers/logger');

/**
 * It checks if the user is authenticated and if the user is an admin
 * @param req - The request object.
 * @param res - The response object
 * @param next - This is a callback function that is called when the middleware is done.
 * @returns A function that is being exported.
 */
const isAdminPermission = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const verifiedToken = jwt.verify(token, process.env.SECRET_TOKEN);

      const user = await models.user.findFirst({
        where: { id: verifiedToken.id, roles: Role.ADMIN, active: true },
      });

      if (!user) {
        return prepareResponse(
          res,
          403,
          'You dont have permission to this resource',
        );
      }

      next();
    } catch (error) {
      logger.error(error);
      return prepareResponse(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return prepareResponse(res, 401, 'Not authorized, token in missing');
  }
};

/**
 * It checks if the user is authenticated
 * @param req - The request object
 * @param res - The response object
 * @param next - This is a callback function that is called when the middleware is done.
 * @returns A function that is being exported.
 */
const isAuthenticated = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const verifiedToken = jwt.verify(token, process.env.SECRET_TOKEN);

      const user = await models.user.findFirst({
        where: { id: verifiedToken.id, active: true },
      });

      if (!user) {
        return prepareResponse(res, 403, 'Access denied!');
      }

      req.user = user;
      next();
    } catch (error) {
      logger.error(error);
      return prepareResponse(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return prepareResponse(res, 401, 'Not authorized, token in missing');
  }
};

/**
 * It checks if the user has permission to perform an action on a class
 * @param req - The request object
 * @param res - The response object
 * @param action - The action that the user is trying to perform.
 * @param arg - The id of the object you want to check.
 * @returns A function that takes in a request, response, action, and arg.
 */
const hasPermissionOnClass = async (req, res, action, arg) => {
  const { id } = req.user;

  try {
    let ok = true;
    const hasPermissionOnClass = await models.class.findFirst({
      where: { host: id },
      select: { id: true, host: true },
    });

    if (!hasPermissionOnClass) {
      ok = false;
    }

    if (hasPermissionOnClass) {
      switch (action) {
        case ACTION.CLASS_USER:
          const classUser = await models.classUser.findFirst({
            where: { id: arg },
          });

          if (classUser.classId !== hasPermissionOnClass.id) {
            ok = false;
          }
          break;
        case ACTION.CLASS_CALENDAR:
          const classCalendar = await models.classCalendar.findFirst({
            where: { id: arg },
          });

          if (classCalendar.classId !== hasPermissionOnClass.id) {
            ok = false;
          }
          break;
        case ACTION.USER_ATTENDANCE:
          const userAttendance = await models.userAttendance.findFirst({
            where: { id: arg },
          });
          const isClassCalendar = await models.classCalendar.findFirst({
            where: { id: userAttendance.classCalendarId },
          });

          if (isClassCalendar.classId !== hasPermissionOnClass.id) {
            ok = false;
          }
          break;
        default:
          break;
      }
    }

    return ok;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message);
  }
};

module.exports = { isAdminPermission, isAuthenticated, hasPermissionOnClass };
