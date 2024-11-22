import express from "express";
import memoryTicketController from "../../controllers/memoryTicket.controller";
import validate from "../../middlewares/validate";
import memoryTicketValidation from "../../validations/memoryTicket.validation";
import authenticateMiddleware from "../../middlewares/authenticate";

const router = express.Router();

router
  .route("/create-contract-for-memory")
  .post(
    validate(memoryTicketValidation.createMemoryContract),
    memoryTicketController.createMemoryContract,
  );

router.route("/generate-memory-ticket").post(
  validate(memoryTicketValidation.createMemoryTicket),
  // authenticateMiddleware,
  memoryTicketController.generateMemoryTicket,
);

router
  .route("/generate-memory-image")
  .post(
    validate(memoryTicketValidation.imageGenerator),
    memoryTicketController.imageGenerator,
  );

router
  .route("/get-user-info-for-memory")
  .get(
    validate(memoryTicketValidation.getUserInfoForMemory),
    memoryTicketController.getUserInfoForMemory,
  );

router
  .route("/get-NFT-metaData")
  .get(
    validate(memoryTicketValidation.getNFTmetaData),
    memoryTicketController.getNFTmetaData,
  );

export default router;
