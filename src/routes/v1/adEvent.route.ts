import express from "express";
import adEventController from "../../controllers/adEvent.controller";
import validate from "../../middlewares/validate";
import adEventValidation from "../../validations/adEvent.validation";
import { keycloak, roleGuard } from "../../middlewares/keycloak";

const router = express.Router();

router
  .route("/get-types-ads-with-price")
  .get(
    //keycloak.protect(roleGuard(["soly-org"])),
    adEventController.getTypesAdsWithPrice,
  );

router
  .route("/get-avaible-dates-for-type")
  .get(
    validate(adEventValidation.getTypeId),
    //keycloak.protect(roleGuard(["soly-org"])),
    adEventController.getAvaibleDatesForType,
  );

router
  .route("/get-ads-of-org")
  .get(
    validate(adEventValidation.getOrgId),
    //keycloak.protect(roleGuard(["soly-org"])),
    adEventController.getAdsOfOrg,
  );

router
  .route("/reserve-dates-for-event")
  .post(
    validate(adEventValidation.reserveDatesForEvent),
    //keycloak.protect(roleGuard(["soly-org"])),
    adEventController.reserveDatesForEvent,
  );

export default router;
