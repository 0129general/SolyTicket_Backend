import Joi from "joi";

const sellTicket = {
  body: Joi.object().keys({
    ticketId: Joi.string().required(),
  }),
};

const addTokenUri = {
  body: Joi.object().keys({
    eventId: Joi.string().required(),
  }),
};

export default {
  sellTicket,
  addTokenUri,
};
