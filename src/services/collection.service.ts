import { AdType } from "@prisma/client";
import { ApiResponse } from "../models/models";
import prisma from "../dbClient";

const getCollectionOfOrg = async (orgId: string): Promise<ApiResponse<any>> => {
  try {
    const organizerExists = await prisma.organizer.findUnique({
      where: { userId: orgId },
    });

    if (!organizerExists) {
      throw new Error(`Organizatör Bulunamadı`);
    }
    // Fetch all AdEvents for the given organizer ID
    const collection = await prisma.collection.findMany({
      where: {
        organizerId: organizerExists.id,
      },
      include: {
        coupons: true,
        events: true,
        applicableEvents: true,
      },
    });

    return {
      success: true,
      date: new Date(),
      data: collection,
    };
  } catch (error) {
    console.error("Koleksiyonlar Bulunamadı:", error);
    throw new Error("Koleksiyonlar Bulunamadı");
  }
};

const createCollection = async (
  orgId: string,
  name: string,
  discountPercentage: number,
  expireAt: string,
  image: string,
  events: Array<string>,
  eventsToUse: Array<string>,
): Promise<ApiResponse<any>> => {
  try {
    // Check if the organizer exists
    const organizerExists = await prisma.organizer.findUnique({
      where: { userId: orgId },
    });

    if (!organizerExists) {
      throw new Error(`Organizatör Bulunamadı`);
    }

    // Fetch all events related to the collection and applicable events
    const existingEvents = await prisma.event.findMany({
      where: {
        id: { in: [...events, ...eventsToUse] },
      },
      select: { id: true },
    });

    const existingEventIds = existingEvents.map((event) => event.id);

    // Check if all provided events exist
    const missingEvents = events.filter(
      (eventId) => !existingEventIds.includes(eventId),
    );
    const missingApplicableEvents = eventsToUse.filter(
      (eventId) => !existingEventIds.includes(eventId),
    );

    if (missingEvents.length > 0) {
      throw new Error(
        `Aşağıdaki etkinlikler bulunamadı: ${missingEvents.join(", ")}`,
      );
    }

    if (missingApplicableEvents.length > 0) {
      throw new Error(
        `Kuponun geçerli olacağı aşağıdaki etkinlikler bulunamadı: ${missingApplicableEvents.join(
          ", ",
        )}`,
      );
    }

    // Create new collection
    const newCollection = await prisma.collection.create({
      data: {
        name,
        image: image,
        discountPercentage,
        expireAt: new Date(expireAt),
        events: {
          connect: events.map((eventId) => ({ id: eventId })), // Connect the events to the collection
        },
        applicableEvents: {
          connect: eventsToUse.map((eventId) => ({ id: eventId })), // Connect the applicable events for the coupon
        },
        organizerId: organizerExists.id,
      },
      include: {
        events: true, // Include the connected events in the response
        applicableEvents: true, // Include the applicable events in the response
      },
    });

    return {
      success: true,
      date: new Date(),
      data: newCollection,
    };
  } catch (error) {
    console.error("Koleksiyon Oluşturulamadı:", error);
    throw new Error(error as string);
  }
};

const getCollectionsWithOwnes = async (userId: string) => {
  try {
    // Check if the customer exists
    console.log(userId);

    const customerExists = await prisma.customer.findUnique({
      where: { userId: userId },
    });

    if (!customerExists) {
      throw new Error(`Müşteri Bulunamadı`);
    }

    // Fetch all collections and related data (coupons, events, applicableEvents)
    const collections = await prisma.collection.findMany({
      include: {
        coupons: true,
        events: {
          include: {
            location: true,
          },
        },
        applicableEvents: {
          include: {
            location: true,
          },
        },
      },
    });
    // Fetch all attended events from tickets for the user
    const attendedEvents = await prisma.tickets.findMany({
      where: {
        userId: userId,
        isUsed: true,
      },
      select: {
        eventId: true,
      },
    });

    // Get attended event IDs
    const attendedEventIds = attendedEvents.map((ticket) => ticket.eventId);

    // Map through the collections and mark attended events
    const collectionsWithAttendanceStatus = collections.map((collection) => {
      const markedEvents = collection.events.map((event) => ({
        ...event,
        attended: attendedEventIds.includes(event.id),
      }));
      const markedApplicableEvents = collection.applicableEvents.map(
        (event) => ({
          ...event,
          attended: attendedEventIds.includes(event.id),
        }),
      );

      return {
        ...collection,
        events: markedEvents,
        applicableEvents: markedApplicableEvents,
      };
    });

    return {
      success: true,
      date: new Date(),
      data: collectionsWithAttendanceStatus,
    };
  } catch (error) {
    console.error("Koleksiyonlar Bulunamadı:", error);
    throw new Error("Koleksiyonlar Bulunamadı");
  }
};

export default {
  getCollectionOfOrg,
  getCollectionsWithOwnes,
  createCollection,
};
