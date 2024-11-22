import { AdType } from "@prisma/client";
import { ApiResponse } from "../models/models";
import prisma from "../dbClient";
import { ApiError } from "../utils";
import httpStatus from "http-status";

const createBlocks = async (
  locationId: string,
  numOfRows: number,
  numOfColumns: number,
  blockName: string,
): Promise<ApiResponse<any>> => {
  try {
    // Check existence of location
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Lokasyon Bulunamadı");
    }

    // Create a seating block
    const seatingBlock = await prisma.seatingBlock.create({
      data: {
        name: blockName,

        locationId: location.id,
        numOfRows: numOfRows.toString(),
        numOfColumns: numOfColumns.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Generate seats based on rows and columns
    const seats = [];
    for (let row = 1; row <= numOfRows; row++) {
      for (let col = 1; col <= numOfColumns; col++) {
        seats.push({
          seatNumber: row * 100 + col,
          title: `Sıra ${row} Koltuk ${col}`,
          empty: true,
          row: row,
          column: col,
          seatingBlockId: seatingBlock.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Bulk create seats
    // Note: Prisma does not support bulkCreate directly, use createMany for bulk operations
    const seatsCreated = await prisma.seat.createMany({
      data: seats,
    });

    return {
      success: true,
      date: new Date(),
      data: seatsCreated,
    };
  } catch (error) {
    console.error("Koleksiyonlar Bulunamadı:", error);
    throw new Error("Koleksiyonlar Bulunamadı");
  }
};

export default {
  createBlocks,
};
