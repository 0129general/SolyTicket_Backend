import express from "express";
import validate from "../../middlewares/validate";
import filterTypeValidation from "../../validations/filterType.validation";
import filterTypeController from "../../controllers/filterType.controller";

const router = express.Router();

router.route("/get-locations").get(filterTypeController.getLocations);

router.route("/get-categories").get(filterTypeController.getCategories);
router
  .route("/get-locations-in-cities")
  .get(filterTypeController.getLocationsInCities);

router
  .route("/get-category-types")
  .get(
    validate(filterTypeValidation.getCategoryTypeById),
    filterTypeController.getCategoryTypes,
  );

router
  .route("/search-category-event-organizer")
  .get(
    validate(filterTypeValidation.searchCategoryEventOrganizer),
    filterTypeController.searchCategoryEventOrganizer,
  );

router
  .route("/get-event-page-filters")
  .get(filterTypeController.getEventPageFilters);

export default router;
