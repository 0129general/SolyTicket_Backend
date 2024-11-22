import httpStatus from "http-status";
import { ApiError, catchAsync } from "../utils";
import collectionService from "../services/collection.service";
import blockchainService from "../services/blockchain.service";

const getCollectionOfOrg = catchAsync(async (req, res) => {
  const data = await collectionService.getCollectionOfOrg(
    req.query.orgId as string,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Koleksiyonlar Bulunamadı");
  }
  res.send(data);
});

const getCollectionsWithOwnes = catchAsync(async (req, res) => {
  const data = await collectionService.getCollectionsWithOwnes(
    req.query.userId as string,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Koleksiyonlar Bulunamadı");
  }
  res.send(data);
});

const createCollection = catchAsync(async (req, res) => {
  const {
    image,
    orgId,
    name,
    discountPercentage,
    expireAt,
    events,
    eventsToUse,
  } = req.body;
  const data = await collectionService.createCollection(
    orgId,
    name,
    discountPercentage,
    expireAt,
    image,
    events,
    eventsToUse,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "İşlem Gerçekleştirilemedi");
  }
  res.send(data);
});

export default {
  getCollectionOfOrg,
  getCollectionsWithOwnes,
  createCollection,
};
