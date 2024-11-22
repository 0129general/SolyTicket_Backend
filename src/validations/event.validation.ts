import { query } from "express";
import Joi from "joi";

const getEventById = {
  query: Joi.object().keys({
    eventId: Joi.string().required(),
  }),
};

const getEventByCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
};

const getEventByCategoryType = {
  params: Joi.object().keys({
    categoryTypeId: Joi.string().required(),
  }),
};

const getEventByNameSearch = {
  params: Joi.object().keys({
    eventName: Joi.string().required(),
  }),
};

const getEventsByFilter = {
  query: Joi.object().keys({
    locationId: Joi.string(),
    page: Joi.number().required(),
    size: Joi.number().required(),
    cityId: Joi.string(),
    endDate: Joi.string(),
    startDate: Joi.string(),
    categoryTypeId: Joi.string(),
    categoryId: Joi.string(),
    organizerId: Joi.string(),
    sortBy: Joi.string().valid("date", "eventName"),
    sortOrder: Joi.string().valid("asc", "desc"),
  }),
};

const buyEventTicket = {
  body: Joi.object().keys({
    eventId: Joi.string().required(),
    ticketCategoryId: Joi.string().required(),
    userId: Joi.string().required(),
  }),
};

const addViewedEvent = {
  body: Joi.object().keys({
    eventId: Joi.string().required(),
    userId: Joi.string().required(),
  }),
};

const getSimilarEvents = {
  query: Joi.object().keys({
    eventId: Joi.string().required(),
  }),
};

const getEventsByCreator = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const getEventAttendeesByCreator = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
    eventId: Joi.string().required(),
  }),
};

export default {
  getEventById,
  getEventByCategory,
  getEventByCategoryType,
  getEventByNameSearch,
  getEventsByFilter,
  buyEventTicket,
  addViewedEvent,
  getSimilarEvents,
  getEventsByCreator,
  getEventAttendeesByCreator,
};
