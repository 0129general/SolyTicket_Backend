import httpStatus from "http-status";
import { ApiError, catchAsync, pick } from "../utils";
import memoryTicketService from "../services/memoryTicket.service";
import jwt, { JwtPayload } from "jsonwebtoken";

const generateMemoryTicket = catchAsync(async (req, res) => {
  const { image, activityName, userId, displayName } = req.body;

  const data = await memoryTicketService.generateMemoryTicket(
    image,
    displayName,
    activityName,
    userId,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }

  res.send({ data });
});

const createMemoryContract = catchAsync(async (req, res) => {
  const { contractName, numberOfTickets, tag } = req.body;
  const data = await memoryTicketService.createMemoryContract(
    contractName,
    numberOfTickets,
    tag,
  );

  res.send(data);
});

const imageGenerator = catchAsync(async (req, res) => {
  const { displayName } = req.body;
  const data = await memoryTicketService.imageWithLabelConverter(displayName);

  res.send(data);
});

const getUserInfoForMemory = catchAsync(async (req, res) => {
  const { activityName, userId } = req.query;

  const data = await memoryTicketService.getUserInfoForMemory(
    userId as string,
    activityName as string,
  );
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "events could not found");
  }

  res.send(data);
});

const getNFTmetaData = catchAsync(async (req, res) => {
  const { userId, activityName } = req.query;
  console.log(userId);
  const data = await memoryTicketService.getNFTmetaData(
    userId as string,
    activityName as string,
  );
  console.log(data);
  res.send(data);
});

export default {
  generateMemoryTicket,
  createMemoryContract,
  imageGenerator,
  getUserInfoForMemory,
  getNFTmetaData,
};
