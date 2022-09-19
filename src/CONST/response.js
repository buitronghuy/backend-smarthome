const prepareResponse = (res, status, message, args) => {
  res.status(status).json({
    message,
    ...args,
  });
};

const ACTION = {
  CLASS_USER: 'CLASS_USER',
  USER_ATTENDANCE: 'USER_ATTENDANCE',
  CLASS_CALENDAR: 'CLASS_CALENDAR',
};

module.exports = { prepareResponse, ACTION };
