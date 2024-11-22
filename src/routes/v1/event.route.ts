import express from "express";
import validate from "../../middlewares/validate";
import eventValidation from "../../validations/event.validation";
import eventController from "../../controllers/event.controller";
import authenticateMiddleware from "../../middlewares/authenticate";
import { keycloak, roleGuard } from "../../middlewares/keycloak";

const router = express.Router();

router
  .route("/get-event-by-id")
  .get(validate(eventValidation.getEventById), eventController.getEventById);

router
  .route("/get-event-by-category")
  .post(
    validate(eventValidation.getEventByCategory),
    eventController.getEventByCategory,
  );

router
  .route("/get-event-by-category-type")
  .post(
    validate(eventValidation.getEventByCategoryType),
    eventController.getEventByCategoryType,
  );

router
  .route("/get-event-by-name")
  .post(
    validate(eventValidation.getEventByNameSearch),
    eventController.getEventByNameSearch,
  );

router
  .route("/get-events-by-filter")
  .get(
    validate(eventValidation.getEventsByFilter),
    eventController.getEventsByFilter,
  );

router
  .route("/buy-event-ticket")
  .post(
    validate(eventValidation.buyEventTicket),
    authenticateMiddleware,
    eventController.buyEventTicket,
  );

router
  .route("/add-viewed-event")
  .post(
    validate(eventValidation.addViewedEvent),
    eventController.addViewedEvent,
  );

router
  .route("/get-similar-events")
  .get(
    validate(eventValidation.getSimilarEvents),
    eventController.getSimilarEvents,
  );

router
  .route("/get-org-upcoming-events")
  .get(
    validate(eventValidation.getEventsByCreator),
    eventController.getOrgUpcomingEvents,
  );

router
  .route("/get-events-by-creator")
  .get(
    validate(eventValidation.getEventsByCreator),
    //keycloak.protect(roleGuard(["soly-org"])),
    eventController.getEventsByCreator,
  );

router.route("/get-event-attendees-by-creator").get(
  validate(eventValidation.getEventAttendeesByCreator),
  // //keycloak.protect(roleGuard(["soly-org"])),
  eventController.getEventAttendeesByCreator,
);

export default router;
