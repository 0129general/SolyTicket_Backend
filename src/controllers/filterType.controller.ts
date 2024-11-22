import httpStatus from "http-status";
import { ApiError, catchAsync, pick } from "../utils";
import filterTypesService from "../services/filterTypes.service";

const getLocations = catchAsync(async (req, res) => {
  const data = await filterTypesService.getLocations();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getLocationsInCities = catchAsync(async (req, res) => {
  const data = await filterTypesService.getLocationsInCities();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getCategories = catchAsync(async (req, res) => {
  const data = await filterTypesService.getCategories();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const getCategoryTypes = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["categoryId"]);
  const data = await filterTypesService.getCategoryTypes(filter);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }
  res.send(data);
});

const searchCategoryEventOrganizer = catchAsync(async (req, res) => {
  const { value } = req.query;
  const data = await filterTypesService.searchCategoryEventOrganizer(
    value as string,
  );
  // if (!data) {
  //     throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  // }
  res.send(data);
});

const getEventPageFilters = catchAsync(async (req, res) => {
  const data = await filterTypesService.getEventPageFilters();
  // if (!data) {
  //     throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  // }
  res.send(data);
});

export default {
  getLocations,
  getCategories,
  getCategoryTypes,
  searchCategoryEventOrganizer,
  getEventPageFilters,
  getLocationsInCities,
};
