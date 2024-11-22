import { AdEvent, Location, TicketCategory } from "@prisma/client";
import { ethers } from "ethers";
import prisma from "../dbClient";
import { ApiError } from "../utils";
import httpStatus from "http-status";
import { Event } from "@prisma/client";
import { ApiResponse } from "../models/models";

interface HomepageValues {
  upcomingEventsCount: number;
  ticketSoldCount: number;
  totalCustomerCount: number;
}

interface CategorywithCount {
  id: string;
  categoryName: string;
  count: number;
}

interface LocationsForHomepage {
  id: string;
  locationName: string;
  locationAddress: string;
}

interface IdNameQuery {
  id: string;
  name: string;
}

async function getHomepageValues(): Promise<ApiResponse<HomepageValues>> {
  try {
    const today = new Date();
    const [upcomingEventsCount, ticketSoldCount, totalCustomerCount] =
      await Promise.all([
        prisma.event.count({
          where: {
            date: {
              gt: new Date(),
            },
          },
        }),
        prisma.tickets.count(),
        prisma.user.count({
          where: {
            type: "CUSTOMER",
          },
        }),
      ]);
    return {
      date: new Date(),
      success: true,
      message: "S",
      data: { upcomingEventsCount, ticketSoldCount, totalCustomerCount },
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
}

const getRecentEvents = async (
  limit: number = 10,
): Promise<ApiResponse<Event[]>> => {
  try {
    const upcomingEvents = await prisma.event.findMany({
      where: {
        date: {
          gt: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
      include: {
        location: true,
        eventCategory: true,
        eventCategoryType: true,
        creatorId: true,
      },
      take: limit,
    });

    return {
      date: new Date(),
      success: true,
      message: "S",
      data: upcomingEvents,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
};

const getHotTickets = async (
  limit: number = 10,
): Promise<ApiResponse<any[]>> => {
  try {
    const hotType = await prisma.adType.findUnique({ where: { type: "Hot" } });
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let todaysAdEvents = await prisma.adEvent.findMany({
      where: {
        startDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        adTypeId: hotType?.id,
      },
      orderBy: {
        startDate: "asc", // Order by start date ascending
      },
      include: {
        event: {
          include: {
            location: true,
            eventCategory: true,
            eventCategoryType: true,
          },
        },
        adType: true, // Include adType details
        Organizer: true, // Include organizer details
      },
      take: limit,
    });

    let events = todaysAdEvents.map((adEvent) => ({
      id: adEvent.event.id,
      eventName: adEvent.event.eventName,
      date: adEvent.startDate,
      location: adEvent.event.location,
      image: adEvent.image,
      eventCategory: adEvent.event.eventCategory,
      eventCategoryType: adEvent.event.eventCategoryType,
      organizer: adEvent.Organizer,
      type: "adEvent", // Tag to identify the source
    }));

    // If there are fewer events than the limit, fetch random upcoming events
    if (events.length < limit) {
      const remainingLimit = limit - events.length;

      const upcomingRandomEvents = await prisma.event.findMany({
        where: {
          date: {
            gt: endOfDay, // After today's end
          },
        },
        orderBy: {
          date: "asc",
        },
        include: {
          location: true,
          eventCategory: true,
          eventCategoryType: true,
          Organizer: true, // Include organizer details
        },
        take: remainingLimit, // Fetch only the remaining number of events
      });

      // Map upcoming events into the same common format
      const upcomingEvents = upcomingRandomEvents.map((event) => ({
        id: event.id,
        eventName: event.eventName,
        date: event.date,
        image: event.image,
        location: event.location,
        eventCategory: event.eventCategory,
        eventCategoryType: event.eventCategoryType,
        organizer: event.Organizer,
        type: "randomEvent", // Tag to identify the source
      }));

      // Combine both arrays
      events = [...events, ...upcomingEvents];
    }

    return {
      date: new Date(),
      success: true,
      message: "Today's ad events fetched successfully",
      data: events,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const getSolyAdvice = async (
  limit: number = 10,
): Promise<ApiResponse<any[]>> => {
  try {
    const adviceType = await prisma.adType.findUnique({
      where: { type: "SolyAdvice" },
    });
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysAdEvents = await prisma.adEvent.findMany({
      where: {
        startDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        adTypeId: adviceType?.id,
      },
      orderBy: {
        startDate: "asc", // Order by start date ascending
      },
      include: {
        event: {
          include: {
            location: true,
            eventCategory: true,
            eventCategoryType: true,
          },
        },
        adType: true, // Include adType details
        Organizer: true, // Include organizer details
      },
      take: limit,
    });
    // Map adEvent into a common format
    let events = todaysAdEvents.map((adEvent) => ({
      id: adEvent.event.id,
      eventName: adEvent.event.eventName,
      date: adEvent.startDate,
      location: adEvent.event.location,
      image: adEvent.image,
      eventCategory: adEvent.event.eventCategory,
      eventCategoryType: adEvent.event.eventCategoryType,
      organizer: adEvent.Organizer,
      type: "adEvent", // Tag to identify the source
    }));

    // If there are fewer events than the limit, fetch random upcoming events
    if (events.length < limit) {
      const remainingLimit = limit - events.length;

      const upcomingRandomEvents = await prisma.event.findMany({
        where: {
          date: {
            gt: endOfDay, // After today's end
          },
        },
        orderBy: {
          date: "asc",
        },
        include: {
          location: true,
          eventCategory: true,
          eventCategoryType: true,
          Organizer: true, // Include organizer details
        },
        take: remainingLimit, // Fetch only the remaining number of events
      });

      // Map upcoming events into the same common format
      const upcomingEvents = upcomingRandomEvents.map((event) => ({
        id: event.id,
        eventName: event.eventName,
        date: event.date,
        image: event.image,
        location: event.location,
        eventCategory: event.eventCategory,
        eventCategoryType: event.eventCategoryType,
        organizer: event.Organizer,
        type: "randomEvent", // Tag to identify the source
      }));

      // Combine both arrays
      events = [...events, ...upcomingEvents];
    }
    return {
      date: new Date(),
      success: true,
      message: "Today's ad events fetched successfully",
      data: events,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const getNewlySales = async (
  limit: number = 10,
): Promise<ApiResponse<Event[]>> => {
  try {
    const newlyCreatedEvents = await prisma.event.findMany({
      where: {
        date: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        location: true,
        eventCategory: true,
        eventCategoryType: true,
        creatorId: true,
      },
      take: limit,
    });

    return {
      date: new Date(),
      success: true,
      message: "Newly Created Events Retrieved",
      data: newlyCreatedEvents,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const getCategoriesWithCount = async (): Promise<
  ApiResponse<CategorywithCount[]>
> => {
  try {
    const upcomingEventsByCategory = await prisma.category.findMany({
      select: {
        name: true,
        id: true,
        Event: {
          where: {
            date: {
              gt: new Date(),
            },
          },
          select: {
            _count: true,
          },
        },
      },
    });

    const formattedResults: CategorywithCount[] = upcomingEventsByCategory.map(
      (category) => ({
        id: category.id,
        categoryName: category.name,
        count: category.Event.length,
      }),
    );

    return {
      date: new Date(),
      success: true,
      message: "S",
      data: formattedResults,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
};

const gethighlightedEvent = async (
  limit: number = 10,
): Promise<ApiResponse<any[]>> => {
  try {
    const highType = await prisma.adType.findUnique({
      where: { type: "Highlight" },
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's ad events
    let todaysAdEvents = await prisma.adEvent.findMany({
      where: {
        startDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        adTypeId: highType?.id,
      },
      orderBy: {
        startDate: "asc", // Order by start date ascending
      },
      include: {
        event: {
          include: {
            location: true,
            eventCategory: true,
            eventCategoryType: true,
          },
        },
        adType: true, // Include adType details
        Organizer: true, // Include organizer details
      },
      take: limit,
    });

    // Map adEvent into a common format
    let events = todaysAdEvents.map((adEvent) => ({
      id: adEvent.event.id,
      eventName: adEvent.event.eventName,
      date: adEvent.startDate,
      location: adEvent.event.location,
      image: adEvent.image,
      eventCategory: adEvent.event.eventCategory,
      eventCategoryType: adEvent.event.eventCategoryType,
      organizer: adEvent.Organizer,
      type: "adEvent", // Tag to identify the source
    }));

    // If there are fewer events than the limit, fetch random upcoming events
    if (events.length < limit) {
      const remainingLimit = limit - events.length;

      const upcomingRandomEvents = await prisma.event.findMany({
        where: {
          date: {
            gt: endOfDay, // After today's end
          },
        },
        orderBy: {
          date: "asc",
        },
        include: {
          location: true,
          eventCategory: true,
          eventCategoryType: true,
          Organizer: true, // Include organizer details
        },
        take: remainingLimit, // Fetch only the remaining number of events
      });

      // Map upcoming events into the same common format
      const upcomingEvents = upcomingRandomEvents.map((event) => ({
        id: event.id,
        eventName: event.eventName,
        date: event.date,
        image: event.image,
        location: event.location,
        eventCategory: event.eventCategory,
        eventCategoryType: event.eventCategoryType,
        organizer: event.Organizer,
        type: "randomEvent", // Tag to identify the source
      }));

      // Combine both arrays
      events = [...events, ...upcomingEvents];
    }

    return {
      date: new Date(),
      success: true,
      message: "Ad events and random events fetched successfully",
      data: events,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const getLocationsForHomepage = async (
  limit: number = 4,
): Promise<ApiResponse<LocationsForHomepage[]>> => {
  try {
    const locations = await prisma.location.findMany({
      take: limit,
    });

    const formattedResults: LocationsForHomepage[] = locations.map(
      (location) => ({
        id: location.id,
        locationName: location.name,
        locationAddress: location.address,
        image: location.image,
      }),
    );

    return {
      date: new Date(),
      success: true,
      message: "S",
      data: formattedResults,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
};

const getLocationsForCreate = async (): Promise<ApiResponse<IdNameQuery[]>> => {
  try {
    const locations = await prisma.location.findMany({});

    const formattedResults: IdNameQuery[] = locations.map((location) => ({
      id: location.id,
      name: location.name,
      map: location.map,
      transportation: location.transportation,
      address: location.address,
      image: location.image,
    }));

    return {
      date: new Date(),
      success: true,
      message: "S",
      data: formattedResults,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    //   throw new Error("Error in homepage values");
  }
};

interface Seat {
  id: string;
  seatNumber: number;
  title: string;
  empty: boolean;
  row: number;
  column: number;
  createdAt: Date;
  updatedAt: Date;
  seatingBlockId: string;
  status: string;
}

interface SeatingBlock {
  id: string;
  name: string;
  locationId: string;
  numOfRows: string;
  numOfColumns: string;
  createdAt: Date;
  updatedAt: Date;
  seats: Seat[][];
}

interface GroupedSeats {
  [key: number]: Seat[];
}

// Get seating blocks with seats grouped by row based on locationId
const getLocationsWithSeatingBlock = async (
  locationId: string,
): Promise<ApiResponse<any>> => {
  try {
    const seatingBlocks = await prisma.seatingBlock.findMany({
      where: { locationId },
      include: {
        seats: {
          orderBy: [
            { row: "asc" }, // Order by row ascending
            { column: "asc" }, // Then by column ascending
          ],
        },
      },
    });

    if (seatingBlocks.length === 0) {
      throw new Error("No blocks found for the specified location");
    }

    const processedBlocks = seatingBlocks.map((block) => {
      const rows: Seat[][] = []; // Array to hold rows of seats
      block.seats.forEach((seat) => {
        rows[seat.row - 1] = rows[seat.row - 1] || []; // Initialize the row array if not already initialized
        rows[seat.row - 1].push({
          ...seat,
          status: "available", // Set the default status for each seat
        });
      });

      return {
        ...block,
        seats: rows.filter((row) => row !== undefined), // Filter out any undefined entries
      };
    });

    return {
      date: new Date(),
      success: true,
      message: "Success",
      data: processedBlocks,
    };
  } catch (error) {
    console.error("Error fetching seating blocks: ", error);
    throw new ApiError(httpStatus.BAD_REQUEST, "Error retrieving data");
  }
};

interface BlockSeat {
  id: string;
  status: string;
}

interface BlockSeatEntity {
  block: string;
  seats: BlockSeat[] | "all";
}

const isBlockSeatEntity = (value: unknown): value is BlockSeatEntity => {
  if (
    typeof value === "object" &&
    value !== null &&
    "block" in value &&
    "seats" in value
  ) {
    const blockSeatEntity = value as BlockSeatEntity;

    if (typeof blockSeatEntity.block !== "string") {
      return false;
    }

    if (typeof blockSeatEntity.seats === "string") {
      return blockSeatEntity.seats === "all";
    } else if (Array.isArray(blockSeatEntity.seats)) {
      return blockSeatEntity.seats.every(
        (seat) =>
          typeof seat.id === "string" && typeof seat.status === "string",
      );
    }
  }

  return false;
};

const getLocationsWithAvailableSeatingBlock = async (
  locationId: string,
  eventId: string,
): Promise<ApiResponse<any>> => {
  try {
    const seatingBlocks = await prisma.seatingBlock.findMany({
      where: { locationId },
      include: {
        seats: {
          orderBy: [{ row: "asc" }, { column: "asc" }],
        },
      },
    });

    if (seatingBlocks.length === 0) {
      throw new Error("No blocks found for the specified location");
    }

    const ticketCategories: TicketCategory[] =
      await prisma.ticketCategory.findMany({
        where: { eventId: eventId },
      });

    if (ticketCategories.length === 0) {
      throw new Error("Bilet kategorisi bulunmadı");
    }

    const processedBlocks = seatingBlocks
      .map((block) => {
        const rows: Seat[][] = [];

        const matchingTicketCategory = ticketCategories.find((category) => {
          const blockSeatEntity = category.blockSeatEntity as any;

          if (isBlockSeatEntity(blockSeatEntity)) {
            const normalizedBlockSeatEntityBlock = blockSeatEntity.block.trim();
            const normalizedBlockId = block.id.trim();
            return normalizedBlockSeatEntityBlock == normalizedBlockId;
          }

          return false;
        });

        if (!matchingTicketCategory) {
          return null;
        }

        block.seats.forEach((seat) => {
          rows[seat.row - 1] = rows[seat.row - 1] || [];

          const blockSeatEntity = matchingTicketCategory.blockSeatEntity as any;

          let seatStatus = "reserved";

          if (
            blockSeatEntity.seats === "all" &&
            isBlockSeatEntity(blockSeatEntity)
          ) {
            seatStatus = "available";
          } else if (
            isBlockSeatEntity(blockSeatEntity) &&
            Array.isArray(blockSeatEntity.seats)
          ) {
            const matchingSeat = blockSeatEntity.seats.find(
              (blockSeat) => blockSeat.id === seat.id,
            );

            seatStatus = matchingSeat?.status || "reserved";
          }

          rows[seat.row - 1].push({
            ...seat,
            status: seatStatus,
          });
        });

        return {
          ...block,
          seats: rows.filter((row) => row !== undefined),
        };
      })
      .filter((block) => block !== null);

    return {
      date: new Date(),
      success: true,
      message: "Success",
      data: processedBlocks,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Error retrieving data");
  }
};

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
