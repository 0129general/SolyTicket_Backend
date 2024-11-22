import httpStatus from "http-status";
import { ApiError, catchAsync, pick } from "../utils";
import eventService from "../services/event.service";
import { Request, Response } from "express";

const getEventById = catchAsync(async (req, res) => {
  const data = await eventService.getEventById(req.query.eventId as string);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getEventByCategory = catchAsync(async (req, res) => {
  const data = await eventService.getEventByCategory(req.params.categoryId);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getEventByCategoryType = catchAsync(async (req, res) => {
  const data = await eventService.getEventByCategoryType(
    req.params.categoryTypeId,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getEventByNameSearch = catchAsync(async (req, res) => {
  const data = await eventService.getEventByNameSearch(req.params.eventName);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getEventsByFilter = catchAsync(async (req: Request, res: Response) => {
  const {
    page,
    size,
    cityId,
    startDate,
    endDate,
    locationId,
    categoryTypeId,
    categoryId,
    organizerId,
    sortBy,
    sortOrder,
  } = req.query;

  const data = await eventService.getEventsByFilter(
    parseInt(page as string, 10),
    parseInt(size as string, 10),
    cityId as string,
    locationId as string,
    startDate as string,
    endDate as string,
    categoryTypeId as string,
    categoryId as string,
    organizerId as string,
    sortBy as "date" | "eventName",
    sortOrder as "asc" | "desc",
  );

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Events could not be found");
  }

  res.send(data);
});

const buyEventTicket = catchAsync(async (req: Request, res: Response) => {
  const { eventId, ticketCategoryId, userId } = req.body;

  const data = await eventService.buyEventTicket(
    eventId,
    ticketCategoryId,
    userId,
  );

  res.send(data);
});

const addViewedEvent = catchAsync(async (req, res) => {
  const data = await eventService.addViewedEvent(
    req.body.eventId as string,
    req.body.userId as string,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getSimilarEvents = catchAsync(async (req, res) => {
  const data = await eventService.getSimilarEvents(req.query.eventId as string);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getEventsByCreator = catchAsync(async (req, res) => {
  const data = await eventService.getEventsByCreator(
    req.query.userId as string,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getOrgUpcomingEvents = catchAsync(async (req, res) => {
  const data = await eventService.getOrgUpcomingEvents(
    req.query.userId as string,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getEventAttendeesByCreator = catchAsync(async (req, res) => {
  const data = await eventService.getEventAttendeesByCreator(
    req.query.userId as string,
    req.query.eventId as string,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Etkinlik Bulunamadı");
  }
  res.send(data);
});

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
  getOrgUpcomingEvents,
  getEventAttendeesByCreator,
};
