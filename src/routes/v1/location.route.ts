import express from "express";
import locationController from "../../controllers/location.controller";
import validate from "../../middlewares/validate";
import locationValidation from "../../validations/location.validation";
import { keycloak, roleGuard } from "../../middlewares/keycloak";

const router = express.Router();

router.route("/create-blocks").post(
  validate(locationValidation.createBlock),
  //keycloak.protect(roleGuard(["soly-org"])),
  locationController.createBlocks,
);

export default router;
