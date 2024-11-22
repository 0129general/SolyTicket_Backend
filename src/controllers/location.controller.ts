import httpStatus from "http-status";
import { ApiError, catchAsync } from "../utils";
import locationService from "../services/location.service";

const createBlocks = catchAsync(async (req, res) => {
  const data = await locationService.createBlocks(
    req.body.locationId as string,
    req.body.numOfRows,
    req.body.numOfColumns,
    req.body.blockName,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Lokasyon Bulunamadı");
  }
  res.send(data);
});

export default {
  createBlocks,
};
