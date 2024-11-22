import { AdType } from "@prisma/client";
import { ApiResponse } from "../models/models";
import prisma from "../dbClient";

const getTypesAdsWithPrice = async (): Promise<ApiResponse<AdType[]>> => {
  try {
    const adTypes = await prisma.adType.findMany({
      select: {
        type: true,
        price: true,
        id: true,
        imageSize: true,
      },
    });

    return {
      success: true,
      date: new Date(),
      data: adTypes,
    };
  } catch (error) {
    console.error("Reklam Tipleri bulunamadı:", error);
    throw new Error("Reklam Tipleri bulunamadı");
  }
};

const getAdsOfOrg = async (orgId: string): Promise<ApiResponse<any>> => {
  try {
    const organizerExists = await prisma.organizer.findUnique({
      where: { userId: orgId },
    });

    if (!organizerExists) {
      throw new Error(`Organizatör Bulunamadı`);
    }
    // Fetch all AdEvents for the given organizer ID
    const adEvents = await prisma.adEvent.findMany({
      where: {
        organizerId: organizerExists.id,
      },
      include: {
        adType: true, // Include the adType information
        event: true, // Include the event information
      },
    });

    return {
      success: true,
      date: new Date(),
      data: adEvents, // Return the list of ad events with details
    };
  } catch (error) {
    console.error("Reklamlar Bulunamadı:", error);
    throw new Error("Reklamlar Bulunamadı");
  }
};

const getAvaibleDatesForType = async (
  adTypeId: string,
  eventId: string,
): Promise<ApiResponse<Date[]>> => {
  try {
    // Define the default date range (next 14 days)
    const start = new Date(); // Today
    const end = new Date();
    end.setDate(start.getDate() + 14); // 14 days from today

    // Fetch the count of reserved dates for the selected ad type within the 14-day range
    const reservedDates = await prisma.adEvent.groupBy({
      by: ["startDate"],
      where: {
        adTypeId: adTypeId,
        startDate: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        _all: true,
      },
    });

    // Fetch any existing events for the same `eventId` within the date range
    const existingEventsForEvent = await prisma.adEvent.findMany({
      where: {
        eventId: eventId,
        adTypeId: adTypeId,
        startDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        startDate: true,
      },
    });

    // Create a map of reserved dates with their count
    const reservedDatesMap = new Map(
      reservedDates.map((date) => [
        date.startDate.toISOString().split("T")[0],
        date._count._all,
      ]),
    );

    // Create a set of dates where the same event already exists
    const existingEventDatesSet = new Set(
      existingEventsForEvent.map(
        (event) => event.startDate.toISOString().split("T")[0],
      ),
    );

    // Function to check if a date is available (less than 10 events already scheduled)
    const isDateAvailable = (date: Date) => {
      const dateKey = date.toISOString().split("T")[0];
      const hasRoomForMoreEvents =
        !reservedDatesMap.has(dateKey) || reservedDatesMap.get(dateKey)! < 10;
      const eventNotScheduledOnDate = !existingEventDatesSet.has(dateKey);

      return hasRoomForMoreEvents && eventNotScheduledOnDate;
    };

    // Generate all dates within the range and filter based on availability
    const availableDates: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d); // Clone date
      if (isDateAvailable(currentDate)) {
        availableDates.push(currentDate);
      }
    }

    return {
      success: true,
      date: new Date(),
      data: availableDates, // Return the list of available dates
    };
  } catch (error) {
    console.error("Uygun Tarihler Bulunamadı:", error);
    throw new Error("Uygun Tarihler Bulunamadı");
  }
};

const reserveDatesForEvent = async (
  orgId: string,
  typeId: string,
  eventId: string,
  image: string,
  dateList: Array<string>,
): Promise<ApiResponse<any>> => {
  try {
    const reservedAdEvents = [];

    const organizerExists = await prisma.organizer.findUnique({
      where: { userId: orgId },
    });

    if (!organizerExists) {
      throw new Error(`Organizatör Bulunamadı`);
    }

    const eventExists = await prisma.event.findUnique({
      where: { id: eventId },
    });

    const adTypeExists = await prisma.adType.findUnique({
      where: { id: typeId },
    });

    if (!eventExists) {
      throw new Error(`Etkinlik Bulunamadı`);
    }

    if (!adTypeExists) {
      throw new Error(`Reklam Tipi Bulunamadı`);
    }

    for (const dateStr of dateList) {
      const date = new Date(dateStr);

      const existingAdEvents = await prisma.adEvent.findMany({
        where: {
          adTypeId: typeId,
          startDate: {
            equals: date,
          },
        },
      });

      if (existingAdEvents.length >= 10) {
        throw new Error(`Bu ${dateStr} tarihte yeterli reklam kalmamıştır.`);
      }
      // If date is available, create the AdEvent
      const newAdEvent = await prisma.adEvent.create({
        data: {
          startDate: date,
          endDate: date, // Assuming single-day reservations; adjust if needed
          eventId: eventId,
          organizerId: organizerExists.id,
          adTypeId: typeId,
          image: image,
          status: true,
        },
      });

      reservedAdEvents.push(newAdEvent);
    }

    return {
      success: true,
      date: new Date(),
      data: reservedAdEvents,
    };
  } catch (error) {
    console.error("Reklamlar Bulunamadı:", error);
    throw new Error(error as string);
  }
};

export default {
  getTypesAdsWithPrice,
  getAvaibleDatesForType,
  getAdsOfOrg,
  reserveDatesForEvent,
};
