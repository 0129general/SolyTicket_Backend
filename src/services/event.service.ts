import {
  PendingEvent,
  Prisma,
  PrismaClient,
  Tickets,
  ViewedEvent,
} from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../dbClient";
import ApiError from "../utils/ApiError";
import { Event, TicketCategory } from "@prisma/client";
import { ApiResponse } from "../models/models";
import blockchainService from "../services/blockchain.service";
import { v4 as uuidv4 } from "uuid";
import { connect } from "http2";
import { JsonObject } from "@prisma/client/runtime/library";

interface FilterEventsParams {
  page: number;
  pageSize: number;
  startDate: string;
  locationId?: string;
  endDate?: string;
  categoryTypeId?: string;
  sortBy?: "date" | "eventName";
  sortOrder?: "asc" | "desc";
}

interface EventCategory {
  id: string;
  name: string;
  image: string;
}

interface EventCategoryType {
  id: string;
  name: string;
  categoryId: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  image: string;
  cityId: string;
}

interface Ticket {
  isUsed: boolean;
  sold: boolean;
}

interface EventsCreatorResponse {
  id: string;
  date: string;
  desc: string | null;
  eventName: string;
  image: string;
  time: string;
  userId: string;
  contractAddress: string;
  categoryId: string;
  categoryTypeId: string;
  locationId: string;
  priceLabel: string;
  createdAt: string;
  updatedAt: string;
  eventCategory: EventCategory;
  eventCategoryType: EventCategoryType;
  location: Location;
  Tickets: Ticket[];
  totalTickets: number;
  soldTickets: number;
}

async function getBlockCapacity(blockId: string) {
  const blockInfo = await prisma.seatingBlock.findUnique({
    where: { id: blockId },
    select: { numOfRows: true, numOfColumns: true },
  });

  if (!blockInfo) return 0;

  const numRows = parseInt(blockInfo.numOfRows);
  const numColumns = parseInt(blockInfo.numOfColumns);

  return numRows * numColumns;
}

const createEventFromPendingApprove = async (
  pendingEvent: PendingEvent,
  transaction: Prisma.TransactionClient,
): Promise<{ newEvent: Event; category: TicketCategory[] }> => {
  if (pendingEvent.isActive) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Organizasyon daha önceden oluşturuldu",
    );
  }

  const ticketCategories = await prisma.ticketCategory.findMany({
    where: { pendingId: pendingEvent.id },
  });

  let totalSeats = 0;
  for (const category of ticketCategories) {
    if (
      typeof category.blockSeatEntity === "object" &&
      category.blockSeatEntity
    ) {
      const blockSeats = category.blockSeatEntity as JsonObject;
      if (blockSeats.seats === "all" && blockSeats) {
        const capacity = await getBlockCapacity(blockSeats.block as string);
        totalSeats += capacity;
      } else if (Array.isArray(blockSeats.seats)) {
        totalSeats += blockSeats.seats.length;
      }
    }
  }

  if (totalSeats === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Koltuk Sayısı 0");
  }

  const eventContractAddress = await blockchainService.createTicket(
    totalSeats,
    "SolyTicket - " + pendingEvent.eventName,
    "Soly",
  );

  if (!eventContractAddress) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Error in deploying contract");
  }

  // Compute the lowest price
  const lowestPrice = ticketCategories.reduce(
    (min, category) => Math.min(min, category.price),
    Infinity,
  );

  // Create the event with the lowest price already set
  const newEvent = await transaction.event.create({
    data: {
      userId: pendingEvent.userId,
      date: pendingEvent.date,
      desc: pendingEvent.desc,
      eventName: pendingEvent.eventName,
      categoryId: pendingEvent.categoryId,
      categoryTypeId: pendingEvent.categoryTypeId,
      locationId: pendingEvent.locationId,
      contractAddress: eventContractAddress,
      time: pendingEvent.time,
      image: pendingEvent.image,
      highlight: pendingEvent.highlight,
      priceLabel: lowestPrice.toString(),
    },
  });

  // Update TicketCategory records with the new eventId
  const categoryUpdates = await Promise.all(
    ticketCategories.map((category) =>
      transaction.ticketCategory.update({
        where: { id: category.id },
        data: { eventId: newEvent.id },
      }),
    ),
  );

  return { newEvent, category: categoryUpdates };
};

const createTickets = async (
  newEvent: Event,
  ticketCategories: TicketCategory[],
  pendingEvent: PendingEvent,
  eventContractAddress: string,
): Promise<void> => {
  let tokenCounter = 0;
  const ticketData: Tickets[] = [];

  for (const ticketCat of ticketCategories) {
    for (let i = 0; i < ticketCat.quantity; i++) {
      const resFromMint = await blockchainService.generateTicketNFT(
        newEvent.image,
        newEvent.eventName,
        newEvent.desc ?? "",
        tokenCounter,
        eventContractAddress,
      );
      if (resFromMint) {
        ticketData.push({
          id: uuidv4(), // Ensure uuidv4() returns a string
          userId: pendingEvent.userId,
          eventId: newEvent.id,
          ticketCategoryId: ticketCat.id,
          ticketTypeName: ticketCat.name,
          price: ticketCat.price,
          tokenId: 0,
          isUsed: false,
          sold: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          heldUntil: null,
          block: "",
          seat: "",
          ipfsImage: "",
          ipfsMetadata: "",
        });
        tokenCounter++;
      }
    }
  }

  if (ticketData.length > 0) {
    await prisma.tickets.createMany({
      data: ticketData,
    });
  }
};

const getEventById = async <Key extends keyof Event>(
  eventId: string,
): Promise<ApiResponse<Pick<Event, Key> | null>> => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        location: true,
        eventCategory: true,
        eventCategoryType: true,
        collections: {
          include: {
            coupons: true,
            events: true,
            applicableEvents: true,
          },
        },
        TicketCategory: true,
        creatorId: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });
    return { success: true, date: new Date(), data: event };
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const getEventByCategory = async <Key extends keyof Event>(
  categoryId: string,
): Promise<Event[]> => {
  try {
    const event = await prisma.event.findMany({
      where: {
        categoryId: categoryId,
      },
    });

    return event;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const getEventByCategoryType = async <Key extends keyof Event>(
  categoryTypeId: string,
): Promise<Event[]> => {
  try {
    const event = await prisma.event.findMany({
      where: {
        categoryTypeId: categoryTypeId,
      },
    });

    return event;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const getEventByNameSearch = async <Key extends keyof Event>(
  eventName: string,
): Promise<Event[]> => {
  try {
    const events = await prisma.event.findMany({
      where: {
        eventName: {
          contains: eventName,
        },
      },
    });

    return events;
  } catch (error) {
    console.error("Error searching events:", error);
    throw error;
  }
};

const getEventsByFilter = async (
  page: number,
  pageSize: number,
  cityId: string,
  locationId: string,
  startDate: string,
  endDate: string,
  categoryTypeId: string,
  categoryId: string,
  organizerId: string,
  sortBy = "date",
  sortOrder = "asc",
): Promise<ApiResponse<Event[]>> => {
  try {
    const filters: any = {};
    if (cityId) {
      filters.location = { cityId };
    }

    if (locationId) {
      if (!filters.location) {
        filters.location = {};
      }
      filters.location.id = locationId;
    }

    filters.date = { gte: new Date() };

    if (startDate || endDate) {
      filters.date = {};
      if (startDate) {
        filters.date.gte = new Date(startDate);
      }
      if (endDate) {
        filters.date.lte = new Date(endDate);
      }
    } else {
      // Default to filtering events from now onwards
      filters.date = { gte: new Date() };
    }

    if (categoryTypeId) {
      filters.categoryTypeId = categoryTypeId;
    }

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    if (organizerId) {
      filters.userId = organizerId;
    }

    const sortOptions: Record<string, any> = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder;
    }

    const events = await prisma.event.findMany({
      where: filters,
      orderBy: sortOptions,
      include: {
        location: {
          include: {
            city: true, // Include city data
          },
        },
        eventCategory: true,
        eventCategoryType: true,
        creatorId: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      success: true,
      date: new Date(),
      data: events,
    };
  } catch (error) {
    console.error("Error searching events:", error);
    throw error;
  }
};

const buyEventTicket = async (
  eventId: string,
  ticketCategoryId: string,
  userId: string,
): Promise<ApiResponse<any>> => {
  try {
    const event = await getEventById(eventId);
    if (!event) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Event not found");
    }

    if (event.date < new Date()) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Event has already passed");
    }

    const ticketCategory = await prisma.ticketCategory.findUnique({
      where: {
        id: ticketCategoryId,
      },
    });

    if (!ticketCategory) {
      throw new ApiError(httpStatus.BAD_REQUEST, "ticketCategory not found");
    }

    const availableTickets = await prisma.tickets.count({
      where: {
        ticketCategoryId: ticketCategoryId,
        // userId: "",
        // sold: false
      },
    });

    if (availableTickets === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "All tickets in this category are sold out",
      );
    }

    const userBoughtTicket = await prisma.tickets.findFirst({
      where: {
        userId: userId,
        eventId: eventId,
      },
    });

    if (userBoughtTicket) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User has already bought a ticket for this event",
      );
    }

    //TODO purchase payment

    const randomTicket = await prisma.tickets.findFirst({
      where: {
        ticketCategoryId: ticketCategoryId,
        // sold: false
      },
      // orderBy: {
      //   // Order randomly
      //   createdAt: 'asc',
      // },
    });

    if (!randomTicket) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "No available ticket found for the given category",
      );
    }

    const updatedTicket = await prisma.tickets.update({
      where: {
        id: randomTicket.id,
      },
      data: {
        userId: userId,
      },
    });

    //TODO SEND NFT USER

    return {
      success: true,
      date: new Date(),
      data: updatedTicket,
    };
  } catch (error) {
    console.error("Error searching events:", error);
    throw error;
  }
};

async function getPendingEventById(id: string) {
  return prisma.pendingEvent.findUnique({
    where: {
      id,
    },
  });
}

const addViewedEvent = async (
  eventId: string,
  userId: string,
): Promise<ApiResponse<ViewedEvent>> => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
    if (!event) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Etkinlik Bulunamadı");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Kullanıcı bulunamadı");
    }

    const res = await prisma.viewedEvent.create({
      data: {
        event: { connect: { id: eventId } },
        user: { connect: { id: userId } },
      },
    });

    return { date: new Date(), data: res, success: true, message: "Success" };
  } catch (error) {
    console.error("Error searching events:", error);
    throw error;
  }
};

const getSimilarEvents = async (
  eventId: string,
): Promise<ApiResponse<Event[]>> => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventCategory: true,
        eventCategoryType: true,
      },
    });

    if (!event) {
      throw new Error("Etkinlik Bulunamadı");
    }

    // Fetch events with the same category and category type, but only those occurring in the future
    const similarEvents = await prisma.event.findMany({
      where: {
        id: { not: eventId },
        categoryId: event.categoryId,
        date: {
          gt: new Date(), // Only include events with a start date later than today
        },
      },
      include: {
        location: true,
        eventCategory: true,
        eventCategoryType: true,
        creatorId: true,
      },
    });

    // Shuffle and select 4 random events
    const shuffledEvents = similarEvents.sort(() => 0.5 - Math.random());
    const selectedEvents = shuffledEvents.slice(0, 4);
    return {
      success: true,
      date: new Date(),
      data: selectedEvents,
    };
  } catch (error) {
    console.error("Error searching events:", error);
    throw error;
  }
};

const getEventsByCreator = async (
  userId: string,
): Promise<ApiResponse<EventsCreatorResponse[]>> => {
  try {
    const events = await prisma.event.findMany({
      where: { userId: userId },
      include: {
        eventCategory: true,
        eventCategoryType: true,
        location: true,
        Tickets: {
          select: {
            isUsed: true,
            sold: true,
          },
        },
      },
    });

    const eventsWithTicketCounts = events.map((event) => {
      const totalTickets = event.Tickets.length ?? 0;
      const soldTickets =
        event.Tickets.filter((ticket) => ticket.sold).length ?? 0;

      return {
        ...event,
        date: event.date.toISOString(), // Convert Date to string
        createdAt: event.createdAt.toISOString(), // Convert Date to string
        updatedAt: event.updatedAt.toISOString(), // Convert Date to string
        totalTickets,
        soldTickets,
      };
    });

    return {
      success: true,
      date: new Date(),
      data: eventsWithTicketCounts,
    };
  } catch (error) {
    console.error("Error searching events:", error);
    throw error;
  }
};

const getOrgUpcomingEvents = async (
  userId: string,
): Promise<ApiResponse<Event[]>> => {
  try {
    const events = await prisma.event.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date(),
        },
      },
    });

    return {
      success: true,
      date: new Date(),
      data: events,
    };
  } catch (error) {
    console.error("Error searching events:", error);
    throw error;
  }
};
interface Attendees {
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
}

const getEventAttendeesByCreator = async (
  creatorId: string,
  eventId: string,
): Promise<ApiResponse<any>> => {
  try {
    // Fetch the event based on the creatorId and eventId to ensure the creator owns the event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: creatorId,
      },
      include: {
        Tickets: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // If no event is found, return an empty array with success true
    if (!event) {
      return {
        success: true,
        date: new Date(),
        data: [],
      };
    }

    const attendees = event.Tickets.filter((ticket) => ticket.sold).map(
      (ticket) => ({
        attendeeId: ticket.owner.id,
        attendeeName: ticket.owner.name,
        attendeeEmail: ticket.owner.email,
        block: ticket.block,
        seat: ticket.seat,
      }),
    );

    // Calculate total sales (total number of tickets sold)
    const totalSales = attendees.length;

    // Prepare event information (you can customize this as per your event schema)
    const eventInfo = {
      eventId: event.id,
      eventName: event.eventName,
      eventDate: event.date,
      totalTickets: totalSales,
    };

    // Return the final response
    return {
      success: true,
      date: new Date(),
      data: {
        attendees: attendees,
        eventInfo: eventInfo,
        totalSales: totalSales,
      },
    };
  } catch (error) {
    console.error("Error fetching event attendees and details:", error);
    throw error;
  }
};

export default {
  createEventFromPendingApprove,
  getEventById,
  getEventByCategory,
  getEventByCategoryType,
  getEventByNameSearch,
  getEventsByFilter,
  buyEventTicket,
  createTickets,
  addViewedEvent,
  getSimilarEvents,
  getEventsByCreator,
  getOrgUpcomingEvents,
  getEventAttendeesByCreator,
};
