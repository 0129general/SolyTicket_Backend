import express from "express";
import validate from "../../middlewares/validate";
import { pendingEventValidation } from "../../validations";
import { userController } from "../../controllers";
import pendingEventController from "../../controllers/pendingEvent.controller";
import authenticateMiddleware from "../../middlewares/authenticate";
import { keycloakConfig } from "../../config/keycloak";
import KeycloakConnect from "keycloak-connect";
import { keycloak, roleGuard } from "../../middlewares/keycloak";

const router = express.Router();

router
  .route("/create-event-for-pending")
  .post(
    validate(pendingEventValidation.createPendingEvent),
    //keycloak.protect(roleGuard(["soly-org"])),
    pendingEventController.createPendingEvent,
  );

router
  .route("/update-event-for-pending/:eventId")
  .put(
    validate(pendingEventValidation.updatePendingEvent),
    //keycloak.protect(roleGuard(["soly-org"])),
    pendingEventController.updatePendingEvent,
  );

router
  .route("/get-all-event-for-pending")
  .get(authenticateMiddleware, pendingEventController.getAllPendingEvents);

router.route("/get-all-event-for-pending-by-id").get(
  validate(pendingEventValidation.getById),
  //keycloak.protect(roleGuard(["soly-org"])),
  // authenticateMiddleware,
  pendingEventController.getPendingEventByCreatorId,
);

// router.route("/get-all-event-for-pending-by-id").get(
//   validate(pendingEventValidation.getById),
//   // authenticateMiddleware,
//   pendingEventController.getPendingEventByCreatorId,
// );

router.route("/get-pending-event-by-id").get(
  validate(pendingEventValidation.getEventId),
  //keycloak.protect(roleGuard(["soly-org"])),
  // authenticateMiddleware,
  pendingEventController.getPendingEventById,
);

router.route("/approve-pending-event").post(
  validate(pendingEventValidation.getEventIdPost),
  // authenticateMiddleware,
  pendingEventController.approvePendingEvent,
);

router
  .route("/reject-pending-event")
  .post(
    validate(pendingEventValidation.getEventId),
    authenticateMiddleware,
    pendingEventController.rejectPendingEvent,
  );

export default router;
