import httpStatus from "http-status";
import { ApiError, catchAsync, pick } from "../utils";
import homepageService from "../services/homepage.service";

const getHomepageValues = catchAsync(async (req, res) => {
  const data = await homepageService.getHomepageValues();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

const getRecentEvents = catchAsync(async (req, res) => {
  const data = await homepageService.getRecentEvents();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

const getHotTickets = catchAsync(async (req, res) => {
  const data = await homepageService.getHotTickets();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Sıcak Biletler Bulunamadı");
  }
  res.send(data);
});

const getSolyAdvice = catchAsync(async (req, res) => {
  const data = await homepageService.getSolyAdvice();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Soly Tavsiyesi Bulunamadı");
  }
  res.send(data);
});

const getNewlySales = catchAsync(async (req, res) => {
  const data = await homepageService.getNewlySales();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Yeni satıştalar bulunamadı");
  }
  res.send(data);
});

const getCategoriesWithCount = catchAsync(async (req, res) => {
  const data = await homepageService.getCategoriesWithCount();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

const gethighlightedEvent = catchAsync(async (req, res) => {
  const data = await homepageService.gethighlightedEvent();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

const getLocationsForHomepage = catchAsync(async (req, res) => {
  const data = await homepageService.getLocationsForHomepage();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

const getLocationsForCreate = catchAsync(async (req, res) => {
  const data = await homepageService.getLocationsForCreate();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "homepage values cannot found");
  }
  res.send(data);
});

const getLocationsWithSeatingBlock = catchAsync(async (req, res) => {
  const data = await homepageService.getLocationsWithSeatingBlock(
    req.query.locationId as string,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Bloklar bulunamadı");
  }
  res.send(data);
});

const getLocationsWithAvailableSeatingBlock = catchAsync(async (req, res) => {
  const data = await homepageService.getLocationsWithAvailableSeatingBlock(
    req.query.locationId as string,
    req.query.eventId as string,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Bloklar bulunamadı");
  }
  res.send(data);
});

export default {
  getHomepageValues,
  getRecentEvents,
  getCategoriesWithCount,
  gethighlightedEvent,
  getLocationsForHomepage,
  getLocationsForCreate,
  getLocationsWithSeatingBlock,
  getHotTickets,
  getSolyAdvice,
  getNewlySales,
  getLocationsWithAvailableSeatingBlock,
};
