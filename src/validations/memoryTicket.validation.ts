import Joi from "joi";

const createMemoryContract = {
  body: Joi.object().keys({
    contractName: Joi.string().required(),
    numberOfTickets: Joi.number().required(),
    tag: Joi.string().required(),
  }),
};

const createMemoryTicket = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    image: Joi.string().required(),
    displayName: Joi.string().required(),
  }),
};

const getUserInfoForMemory = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
    activityName: Joi.string().required(),
  }),
};

const getNFTmetaData = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
    activityName: Joi.string().required(),
  }),
};

const imageGenerator = {
  body: Joi.object().keys({
    displayName: Joi.string().required(),
  }),
};

export default {
  createMemoryContract,
  createMemoryTicket,
  imageGenerator,
  getUserInfoForMemory,
  getNFTmetaData,
};
