const express = require('express');
const { body } = require('express-validator');
const {
  getAllHouse,
  createNewHouse,
  updateHouse,
  deleteHouse,
  getOneHouse,
} = require('../controllers/house.controllers');
const { isAuthenticated, isAdminPermission } = require('../middleware/auth');

const houseRouter = express.Router();

// House routes
houseRouter.get('/house', isAuthenticated, isAdminPermission, getAllHouse);
houseRouter.get('/house/:id', isAuthenticated, getOneHouse);

houseRouter.post(
  '/house',
  isAuthenticated,
  body('houseName').notEmpty(),
  createNewHouse,
);

houseRouter.put(
  '/house/:id',
  isAuthenticated,
  body('houseName').notEmpty(),
  updateHouse,
);

houseRouter.delete(
  '/house/:id',
  isAuthenticated,
  deleteHouse,
);

module.exports = { houseRouter };
