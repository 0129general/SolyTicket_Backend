import { Category, CategoryType, City, Location } from "@prisma/client";
import { ethers } from "ethers";
import prisma from "../dbClient";
import { ApiError } from "../utils";
import httpStatus from "http-status";
import { ApiResponse } from "../models/models";

async function getLocations(): Promise<ApiResponse<City[]>> {
  try {
    const locations = await prisma.city.findMany({});

    return {
      data: locations,
      date: new Date(),
      success: true,
      message: "Success",
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching active pending events");
  }
}

async function getLocationsInCities(): Promise<ApiResponse<Location[]>> {
  try {
    const locations = await prisma.location.findMany({});

    return {
      data: locations,
      date: new Date(),
      success: true,
      message: "Success",
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching active pending events");
  }
}

async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const categories = await prisma.category.findMany({});

    return {
      data: categories,
      date: new Date(),
      success: true,
      message: "Success",
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching active pending events");
  }
}

async function getCategoryTypes(options: {
  categoryId?: string;
}): Promise<ApiResponse<CategoryType[]>> {
  try {
    const categoryId = options.categoryId;

    const categoryType = await prisma.categoryType.findMany({
      where: { categoryId: categoryId },
    });

    return {
      data: categoryType,
      date: new Date(),
      success: true,
      message: "Success",
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching active pending events");
  }
}

async function searchCategoryEventOrganizer(
  value: string,
): Promise<ApiResponse<any[]>> {
  try {
    const events = await prisma.event.findMany({
      where: {
        eventName: {
          contains: value,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        eventName: true,
        image: true,
      },
    });

    const categories = await prisma.category.findMany({
      where: {
        name: {
          contains: value,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const organizers = await prisma.user.findMany({
      where: {
        type: "ORGANIZER",
        name: {
          contains: value,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    const combinedResults: any[] = [
      ...events.map((event) => ({
        id: event.id,
        image: event.image,
        name: event.eventName,
        type: "event",
      })),
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
        type: "category",
      })),
      ...organizers.map((organizer) => ({
        id: organizer.id,
        image: organizer.image,
        name: organizer.name,
        type: "organizer",
      })),
    ];

    return {
      data: combinedResults,
      date: new Date(),
      success: true,
      message: "Success",
    };
  } catch (error) {
    return { data: [], date: new Date(), success: false, message: "Fail" };
    // throw new ApiError(httpStatus.BAD_REQUEST, error as any);
    // throw new Error("Error fetching active pending events");
  }
}

async function getEventPageFilters(): Promise<ApiResponse<any>> {
  try {
    const orderTypes = [
      { id: "1", name: "Tarihe Göre Artan" },
      { id: "2", name: "Tarihe Göre Azalan" },
    ];

    const categories = await prisma.category.findMany({
      include: {
        CategoryType: true,
      },
    });

    const locations = await prisma.location.findMany();

    const organizers = await prisma.user.findMany({
      where: {
        type: "ORGANIZER", // Adjust based on your actual role field
      },
    });

    const response = {
      orderTypes,
      categories,
      locations,
      organizers,
    };

    return {
      data: response,
      date: new Date(),
      success: true,
      message: "Success",
    };
  } catch (error) {
    return { data: [], date: new Date(), success: false, message: "Fail" };
  }
}

export default {
  getLocations,
  getCategoryTypes,
  getCategories,
  searchCategoryEventOrganizer,
  getEventPageFilters,
  getLocationsInCities,
};
