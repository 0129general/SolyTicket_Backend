import Joi from "joi";

const getLocationId = {
  query: Joi.object().keys({
    locationId: Joi.string().required(),
  }),
};

const getAvaibleLocationId = {
  query: Joi.object().keys({
    locationId: Joi.string().required(),
    eventId: Joi.string().required(),
  }),
};

const createBlock = {
  body: Joi.object().keys({
    locationId: Joi.string().required(),
    numOfColumns: Joi.number().required(),
    numOfRows: Joi.number().required(),
    blockName: Joi.string().required(),
  }),
};

export default {
  createBlock,
  getLocationId,
  getAvaibleLocationId,
};
