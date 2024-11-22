import httpStatus from "http-status";
import { ApiError, catchAsync } from "../utils";
import ticketService from "../services/ticket.service";

const sellTicket = catchAsync(async (req, res) => {
  const data = await ticketService.sellTicket(req.body.ticketId as string);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Bilet Bulunamadı");
  }
  res.send(data);
});

const addTokenUriAll = catchAsync(async (req, res) => {
  const data = await ticketService.addTokenUriAll(req.body.eventId as string);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "Bilet Bulunamadı");
  }
  res.send(data);
});

export default {
  sellTicket,
  addTokenUriAll,
};
