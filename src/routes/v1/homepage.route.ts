import express from "express";
import homePageController from "../../controllers/homepage.controller";
import locationValidation from "../../validations/location.validation";
import validate from "../../middlewares/validate";

const router = express.Router();

router.route("/get-homepage-values").get(homePageController.getHomepageValues);

router.route("/get-recent-events").get(homePageController.getRecentEvents);

router.route("/get-hot-tickets").get(homePageController.getHotTickets);

router.route("/get-soly-advice").get(homePageController.getSolyAdvice);

router.route("/get-newly-sales").get(homePageController.getNewlySales);

router
  .route("/get-categories-with-count")
  .get(homePageController.getCategoriesWithCount);

router
  .route("/get-locations-for-homepage")
  .get(homePageController.getLocationsForHomepage);

router
  .route("/get-locations-with-seating-block")
  .get(
    validate(locationValidation.getLocationId),
    homePageController.getLocationsWithSeatingBlock,
  );

router
  .route("/get-locations-with-avaible-seating-block")
  .get(
    validate(locationValidation.getAvaibleLocationId),
    homePageController.getLocationsWithAvailableSeatingBlock,
  );
router
  .route("/get-locations-for-create")
  .get(homePageController.getLocationsForCreate);

router
  .route("/get-highlighted-events")
  .get(homePageController.gethighlightedEvent);

export default router;

// import express from "express";
// import homePageController from "../../controllers/homepage.controller";
// import { keycloak, roleGuard } from "../../middlewares/keycloak";

// const router = express.Router();

// router.route("/get-homepage-values")
//   .get(keycloak.protect('ADMIN'), homePageController.getHomepageValues);

// router.route("/get-recent-events").get(keycloak.protect(), homePageController.getRecentEvents);

// router
//   .route("/get-categories-with-count")
//   .get(keycloak.protect(roleGuard(['SUPERUSER'])), homePageController.getCategoriesWithCount);

// router
//   .route("/get-locations-for-homepage")
//   .get(keycloak.protect(roleGuard(['ADMIN'])), homePageController.getLocationsForHomepage);

// router
//   .route("/get-highlighted-events")
//   .get(keycloak.protect(roleGuard(['SUPERUSER', 'ADMIN'])), homePageController.gethighlightedEvent);

// export default router;
