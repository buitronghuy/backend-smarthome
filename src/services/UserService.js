const { models } = require('../db');

const isEmailExist = async (email) => {
  const user = await models.user.findUnique({ where: { email } });
  if (user) {
    return true;
  }
  return false;
};

module.exports = { isEmailExist };
