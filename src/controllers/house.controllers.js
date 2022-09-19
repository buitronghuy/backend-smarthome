const { Role } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { prepareResponse } = require("../CONST/response");
const { models } = require("../db");
const { logger } = require("../helpers/logger");

const getOneHouse = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.roles !== Role.ADMIN) {
      const isUserHouse = await models.User.findFirst({
        where: { house: id, id: req.user.id },
      });

      if (!isUserHouse) {
        return prepareResponse(
          res,
          403,
          "Access Denied! You have not permission to access this House."
        );
      }
    }

    const HouseInfo = await models.House.findFirst({
      where: { id },
    });

    return prepareResponse(res, 200, "Get House Info successfully", {
      HouseInfo,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 404, "Houses Not Found");
  }
};

const getAllHouse = async (req, res) => {
  try {
    const allHouses = await models.House.findMany();
    const count = allHousees.length;

    return prepareResponse(res, 200, "Get all Houses successfully", {
      count,
      allHouses,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 404, "Houses Not Found");
  }
};

const createNewHouse = async (req, res) => {
  const { houseName } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const newHouse = await models.House.create({
      data: {
        houseName,
      },
    });

    return prepareResponse(res, 201, "Created New House Successfully", {
      ...newHouse,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, "Create New House Failed");
  }
};

const updateHouse = async (req, res) => {
  const { houseName } = req.body;
  const { id } = req.params;

  let params = {};

  try {
    const [isHouseExists] = await Promise.all([
      models.House.findFirst({ where: { id } }),
    ]);

    if (!isHouseExists) {
      return prepareResponse(res, 404, "House not exists");
    }

    params = { houseName };

    const houseInfo = await models.House.update({
      where: { id },
      data: { ...params },
    });

    return prepareResponse(res, 201, "Update House Info Successfully", {
      ...houseInfo,
      file: { ...getAllFiles },
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, "Update House Info Failed");
  }
};

const deleteHouse = async (req, res) => {
  const { id } = req.params;

  try {
    const isHouseExists = await models.House.findFirst({ where: { id } });

    if (!isHouseExists) {
      return prepareResponse(res, 404, "House not exists");
    }

    await models.House.delete({ where: { id } });
    return prepareResponse(res, 201, "Deleted House and related its data");
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, "Delete House Failed");
  }
};

module.exports = {
  getOneHouse,
  getAllHouse,
  createNewHouse,
  updateHouse,
  deleteHouse,
};
