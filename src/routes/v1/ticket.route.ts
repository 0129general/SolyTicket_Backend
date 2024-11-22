import express from "express";
import validate from "../../middlewares/validate";
import { keycloak, roleGuard } from "../../middlewares/keycloak";
import ticketValidation from "../../validations/ticket.validation";
import ticketController from "../../controllers/ticket.controller";

const router = express.Router();

router.route("/sell-ticket").post(
  validate(ticketValidation.sellTicket),
  //keycloak.protect(roleGuard(["soly-org"])),
  ticketController.sellTicket,
);

router.route("/add-token-uri").post(
  validate(ticketValidation.addTokenUri),
  //keycloak.protect(roleGuard(["soly-org"])),
  ticketController.addTokenUriAll,
);

export default router;
