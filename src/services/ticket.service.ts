import httpStatus from "http-status";
import prisma from "../dbClient";
import ApiError from "../utils/ApiError";
import { JsonValue } from "@prisma/client/runtime/library";
import { TicketCategory } from "@prisma/client";
import blockchainService, {
  constructMetadata,
  constructMetadataPinata,
  loadIpfs,
  loadIpfsweb3,
  mintBulkTokens,
} from "./blockchain.service";
import { ApiResponse } from "../models/models";

const createEventFromPendingApprove = async (
  ticketCategories: TicketCategory[],
  eventId: string,
  contractAddress: string,
): Promise<boolean> => {
  try {
    const event = await getEventById(eventId);
    if (!event) {
      throw new ApiError(httpStatus.BAD_REQUEST, "PendingEvent not found");
    }

    const user = await prisma.user.findUnique({ where: { id: event.userId } });
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Organizatör bulunamadı");
    }

    const location = await prisma.location.findUnique({
      where: { id: event.locationId },
    });
    if (!location) {
      throw new ApiError(httpStatus.BAD_REQUEST, "lokasyon bulunamadı");
    }
    // const ipfsImg = await loadIpfsweb3(
    //   Buffer.from(event.image.split(",")[1], "base64"),
    // );

    // const metadataCIDs: string[] = [];
    const tokenIds: number[] = [];
    let token = 1;
    for (const ticketCat of ticketCategories) {
      let seatIds;
      if (
        ticketCat.blockSeatEntity &&
        typeof ticketCat.blockSeatEntity === "object" &&
        "seats" in ticketCat.blockSeatEntity
      ) {
        const blockSeats = ticketCat.blockSeatEntity as {
          block: string;
          seats: string[] | "all";
        };

        if (blockSeats.seats === "all") {
          // Get all seat IDs for the block
          seatIds = await getBlockSeats(blockSeats.block);
        } else if (Array.isArray(blockSeats.seats)) {
          seatIds = blockSeats.seats;
        }
      } else {
        console.error(
          "blockSeatEntity is not valid:",
          ticketCat.blockSeatEntity,
        );
      }

      if (seatIds && seatIds.length > 0) {
        const seatsToProcess = seatIds.slice(0, ticketCat.quantity);
        for (const seatId of seatIds) {
          console.log(seatId);
          const seat = await prisma.seat.findUnique({
            where: { id: seatId.id },
            select: { title: true },
          });
          console.log(seat);
          if (!seat) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Koltuk bulunamadı");
          }

          const metadataCID = await constructMetadataPinata(
            event.eventName,
            event.desc ?? "",
            token,
            event.image,
            user?.name,
            event.date,
            location.name,
            ticketCat.name,
            seat.title,
          );
          console.log(metadataCID);
          await prisma.tickets.create({
            data: {
              price: ticketCat.price,
              ticketTypeName: ticketCat.name,
              tokenId: token,
              createdAt: new Date(),
              eventId: event.id,
              ticketCategoryId: ticketCat.id,
              userId: event.userId,
              seat: seat.title,
              block: ticketCat.name,
              ipfsImage: event.image,
              ipfsMetadata: metadataCID,
            },
          });
          // metadataCIDs.push(metadataCID);
          tokenIds.push(token);
          token++;
        }
      }
    }

    addTokenUriAll(event.id);

    return true;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

async function getBlockSeats(blockId: string): Promise<any[]> {
  // Fetch all seat IDs for the given block ID from your database
  const seats = await prisma.seat.findMany({
    where: { seatingBlockId: blockId },
    select: { id: true },
  });
  return seats.map((seat) => seat.id);
}

async function getPendingEventById(id: string) {
  return prisma.pendingEvent.findUnique({
    where: {
      id,
    },
  });
}

async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: {
      id,
    },
  });
}

const sellTicket = async (ticketId: string): Promise<boolean> => {
  try {
    const tickets = await prisma.tickets.findUnique({
      where: {
        id: ticketId,
      },
    });
    if (!tickets) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Bilet Bulunmadı");
    }

    // await constructMetadata("test","testttt", 1,"QmceK1vooxtJrQpjDKAfbS1WnKysohLYZaUMh4eHiYpheR","",new Date(),"","","")

    await blockchainService.viewTokenuri(
      6,
      "0x3e86105fBE5Bf14a03743322Eb478B471c084CA0",
    );

    // const addTokenMetadata = await blockchainService.AddTokenUris(
    //   6,
    //   "QmPEgeyvkAngDAVFrHHhTpoeHY7ndkZPwxyvMN9DAEZcMH",
    //   "0x3e86105fBE5Bf14a03743322Eb478B471c084CA0",
    // );

    return true;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

const addTokenUriAll = async (
  eventId: string,
): Promise<ApiResponse<string[]>> => {
  try {
    const event = await getEventById(eventId);
    if (!event) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Etkinlik not found");
    }

    const tickets = await prisma.tickets.findMany({
      where: {
        eventId: eventId,
      },
    });
    if (!tickets) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Bilet Bulunmadı");
    }
    if (!tickets || tickets.length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "No tickets found for the event",
      );
    }
    const tokenIds: number[] = tickets.map((ticket) => ticket.tokenId);
    const ipfsMetadataList: string[] = tickets.map(
      (ticket) => ticket.ipfsMetadata ?? "",
    );

    const addTokenMetadata = await blockchainService.AddTokenUris(
      tokenIds,
      ipfsMetadataList,
      event.contractAddress,
    );

    await Promise.all(
      tokenIds.map(async (tokenId) => {
        const refreshUrl = `https://api.opensea.io/api/v2/chain/matic/contract/${event.contractAddress}/nfts/${tokenId}/refresh`;

        // Call OpenSea API to refresh metadata
        await fetch(refreshUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "393a3051917d4d63bdb6778f3dc0de19",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                `Failed to refresh metadata for token ID ${tokenId}`,
              );
            }
          })
          .catch((error) => {
            console.error(
              `Error refreshing metadata for token ID ${tokenId}:`,
              error,
            );
          });
      }),
    );

    return {
      success: true,
      date: new Date(),
      data: ipfsMetadataList,
    };
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
};

export default {
  createEventFromPendingApprove,
  sellTicket,
  addTokenUriAll,
};
