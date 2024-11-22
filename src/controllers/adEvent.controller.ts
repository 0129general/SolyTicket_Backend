import httpStatus from "http-status";
import { ApiError, catchAsync } from "../utils";
import adEventService from "../services/adEvent.service";

const getTypesAdsWithPrice = catchAsync(async (req, res) => {
  const data = await adEventService.getTypesAdsWithPrice();
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Reklam Tipleri Bulunamadı");
  }
  res.send(data);
});

const getAvaibleDatesForType = catchAsync(async (req, res) => {
  const data = await adEventService.getAvaibleDatesForType(
    req.query.typeId as string,
    req.query.eventId as string,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Uygun Tarihler Bulunamadı");
  }
  res.send(data);
});

const getAdsOfOrg = catchAsync(async (req, res) => {
  const data = await adEventService.getAdsOfOrg(req.query.orgId as string);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Reklamlar Bulunamadı");
  }
  res.send(data);
});

const reserveDatesForEvent = catchAsync(async (req, res) => {
  const { orgId, typeId, eventId, image, dateList } = req.body;
  const data = await adEventService.reserveDatesForEvent(
    orgId,
    typeId,
    eventId,
    image,
    dateList,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "İşlem Gerçekleştirilemedi");
  }
  res.send(data);
});

export default {
  getTypesAdsWithPrice,
  getAvaibleDatesForType,
  getAdsOfOrg,
  reserveDatesForEvent,
};
