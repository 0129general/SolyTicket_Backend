import httpStatus from "http-status";
import prisma from "../dbClient";
import ApiError from "../utils/ApiError";
import eventService from "./event.service";
import { PendingEvent } from "@prisma/client";
import { ApiResponse } from "../models/models";
import ticketService from "./ticket.service";

const createPendingEvent = async (
  date: Date,
  desc: string[],
  highlight: string[],
  numberOfPerson: string,
  eventName: string,
  image: string,
  locationId: string,
  time: string,
  userId: string,
  categoryId: string,
  eventCategoryTypeId: string,

  ticketPriceEntity: any,
): Promise<ApiResponse<any>> => {
  try {
    const descriptionString = desc.join("\n");
    const highlightStr = highlight.join("\n");
    const [location, category, eventType] = await Promise.all([
      prisma.location.findUnique({ where: { id: locationId } }),
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.categoryType.findUnique({ where: { id: eventCategoryTypeId } }),
    ]);

    if (!location) {
      throw new ApiError(httpStatus.BAD_REQUEST, ` Lokasyon bulunamadı`);
    }
    if (!category) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Kategori bulunamadı`);
    }
    if (!eventType) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Kategori tipi bulunamadı`);
    }

    const eventAlreadyExists = await eventExists(eventName, date);
    if (eventAlreadyExists) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Aynı Etkinlik Daha Önce Oluşturuldu.",
      );
    }

    const newPendingEvent = await prisma.pendingEvent.create({
      data: {
        creatorId: { connect: { id: userId } },
        date,
        eventName,
        eventCategory: { connect: { id: categoryId } },
        eventCategoryType: { connect: { id: eventCategoryTypeId } },
        image,
        location: { connect: { id: locationId } },
        time,
        desc: descriptionString,
        highlight: highlightStr,
        numberOfPerson,
      },
    });

    if (ticketPriceEntity.length > 0) {
      for (let index = 0; index < ticketPriceEntity.length; index++) {
        const element = ticketPriceEntity[index];
        const ticketeCategory = await prisma.ticketCategory.create({
          data: {
            name: element.name,
            price: Number(element.price),
            quantity: 0,
            pendingId: newPendingEvent.id,
            blockSeatEntity: {
              block: element.block,
              seats: element.allSeats ? "all" : element.seats,
            },
          },
        });
      }
    }

    return { date: new Date(), success: true, data: newPendingEvent };
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

async function eventExists(eventName: string, date: Date): Promise<boolean> {
  const count = await prisma.pendingEvent.count({
    where: {
      eventName,
      date,
    },
  });
  return count > 0;
}

const updatePendingEvent = async (
  eventId: string,
  date: Date,
  desc: string,
  eventName: string,
  image: string,
  locationId: string,
  time: string,
  categoryId: string,
  eventCategoryTypeId: string,
  ticketPriceEntity: Record<string, any>,
): Promise<ApiResponse<any>> => {
  try {
    const newPendingEvent = await prisma.pendingEvent.update({
      where: {
        id: eventId,
      },
      data: {
        date,
        eventName,
        eventCategory: { connect: { id: categoryId } },
        eventCategoryType: { connect: { id: eventCategoryTypeId } },
        image,
        location: { connect: { id: locationId } },
        time,
        desc,
        // ticketPriceEntity,
      },
    });
    return { date: new Date(), success: true, data: newPendingEvent };
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

async function getAllPendingEvents(): Promise<PendingEvent[]> {
  try {
    const pendingEvents = await prisma.pendingEvent.findMany({
      where: {
        isActive: false,
      },
    });
    return pendingEvents;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching active pending events");
  }
}

const getPendingEventByCreatorId = async (
  creatorId: string,
): Promise<ApiResponse<any[]>> => {
  try {
    const userId = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { id: true },
    });

    if (userId) {
      const pendingEvents = await prisma.pendingEvent.findMany({
        where: {
          creatorId: userId,
          isActive: false,
        },
        select: {
          id: true,
          // creatorId: true,
          date: true,
          eventName: true,
          // categoryId: true,
          // categoryTypeId: true,
          // locationId: true,
          time: true,
          desc: true,
          // ticketPriceEntity: true,
          eventCategory: true,
          eventCategoryType: true,
          location: true,
          TicketCategory: {
            select: {
              id: true,
              name: true,
              blockSeatEntity: true,
              price: true,
            },
          },
        },
      });
      return { date: new Date(), success: true, data: pendingEvents };
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
    }
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching pending event by creatorId");
  }
};

const getPendingEventById = async (
  eventId: string,
): Promise<ApiResponse<any>> => {
  try {
    const pendingEvents = await prisma.pendingEvent.findUnique({
      where: {
        id: eventId,
      },

      select: {
        id: true,
        // creatorId: true,
        date: true,
        eventName: true,
        // categoryId: true,
        // categoryTypeId: true,
        // locationId: true,
        time: true,
        desc: true,
        highlight: true,
        numberOfPerson: true,
        image: true,
        // ticketPriceEntity: true,
        eventCategory: true,
        eventCategoryType: true,
        location: true,
        TicketCategory: {
          select: {
            id: true,
            name: true,
            blockSeatEntity: true,
            price: true,
          },
        },
      },
    });
    return { date: new Date(), success: true, data: pendingEvents };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching pending event by creatorId");
  }
};

const approvePendingEvent = async (
  eventId: string,
): Promise<ApiResponse<any>> => {
  try {
    // Fetch the pending event outside the transaction to reduce transaction duration
    const pendingEvent = await prisma.pendingEvent.findUnique({
      where: { id: eventId },
    });

    if (!pendingEvent) {
      throw new ApiError(httpStatus.BAD_REQUEST, "PendingEvent not found");
    }

    // Create event and ticket categories within a single transaction
    const { newEvent, category: ticketCategories } = await prisma.$transaction(
      async (transaction) => {
        const approveResponse =
          await eventService.createEventFromPendingApprove(
            pendingEvent,
            transaction,
          );
        return approveResponse; // Directly return the response without extra wrapping
      },
      { maxWait: 30000, timeout: 30000 },
    );

    // const ticketCategories = await prisma.ticketCategory.findMany({
    //   where: { pendingId: "53e4a14e-9771-4dc4-bd0c-d86ad8d2100d" },
    // });

    // const newEvent = await prisma.event.findUnique({
    //   where: { id: "2fc8d674-4046-49a0-83d2-012636b29390" },
    // });
    if (!newEvent) {
      throw new ApiError(httpStatus.BAD_REQUEST, "PendingEvent not found");
    }
    // Create tickets in a separate step
    await ticketService.createEventFromPendingApprove(
      ticketCategories,
      newEvent.id,
      newEvent.contractAddress,
    );

    // Update pending event status
    await prisma.pendingEvent.update({
      where: { id: eventId },
      data: { isActive: true },
    });

    return { date: new Date(), success: true, data: newEvent };
  } catch (error) {
    console.error("Error approving event:", error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const rejectPendingEvent = async (eventId: string): Promise<boolean> => {
  try {
    await prisma.pendingEvent.delete({
      where: { id: eventId },
    });

    return true;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

export default {
  createPendingEvent,
  updatePendingEvent,
  getAllPendingEvents,
  getPendingEventByCreatorId,
  approvePendingEvent,
  rejectPendingEvent,
  getPendingEventById,
};
