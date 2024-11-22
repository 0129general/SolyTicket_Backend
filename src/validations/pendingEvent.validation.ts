import Joi from "joi";

const createPendingEvent = {
  body: Joi.object().keys({
    date: Joi.date().required(),
    desc: Joi.array().required(),
    highlight: Joi.array().required(),
    numberOfPerson: Joi.string().required(),
    eventName: Joi.string().required(),
    image: Joi.string().required(),
    locationId: Joi.string().required(),
    time: Joi.string().required(),
    userId: Joi.string().required(),
    categoryId: Joi.string().required(),
    eventCategoryTypeId: Joi.string().required(),
    ticketPriceEntity: Joi.array().required(),
  }),
};

const updatePendingEvent = {
  params: Joi.object().keys({
    eventId: Joi.string().uuid().required(),
  }),

  body: Joi.object().keys({
    date: Joi.date().required(),
    desc: Joi.string().required(),
    eventName: Joi.string().required(),
    image: Joi.string().required(),
    locationId: Joi.string().required(),
    time: Joi.string().required(),
    userId: Joi.string().required(),
    categoryId: Joi.string().required(),
    eventCategoryTypeId: Joi.string().required(),
    ticketPriceEntity: Joi.array().required(),
  }),
};

const getById = {
  query: Joi.object().keys({
    creatorId: Joi.string().required(),
  }),
};

const getEventId = {
  query: Joi.object().keys({
    eventId: Joi.string().required(),
  }),
};

const getEventIdPost = {
  body: Joi.object().keys({
    eventId: Joi.string().required(),
  }),
};

export default {
  createPendingEvent,
  updatePendingEvent,
  getById,
  getEventId,
  getEventIdPost,
};
