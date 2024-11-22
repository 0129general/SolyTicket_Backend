import Joi from "joi";

const getTypeId = {
  query: Joi.object().keys({
    typeId: Joi.string().required(),
    eventId: Joi.string().required(),
  }),
};

const getOrgId = {
  query: Joi.object().keys({
    orgId: Joi.string().required(),
  }),
};

const reserveDatesForEvent = {
  body: Joi.object().keys({
    orgId: Joi.string().required(),
    typeId: Joi.string().required(),
    eventId: Joi.string().required(),
    image: Joi.string().required(),
    dateList: Joi.array().required(),
  }),
};

export default {
  getTypeId,
  getOrgId,
  reserveDatesForEvent,
};
