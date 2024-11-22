import express from "express";
import collectionController from "../../controllers/collection.controller";
import validate from "../../middlewares/validate";
import collectionValidation from "../../validations/collection.validation";
import { keycloak, roleGuard } from "../../middlewares/keycloak";

const router = express.Router();

// router
//   .route("/get-categories-with-count")
//   .get(keycloak.protect(roleGuard(['SUPERUSER'])), homePageController.getCategoriesWithCount);

router
  .route("/get-collection-of-org")
  .get(
    validate(collectionValidation.getOrgId),
    //keycloak.protect(roleGuard(["soly-org"])),
    collectionController.getCollectionOfOrg,
  );

router
  .route("/get-collection-with-ownes")
  .get(
    validate(collectionValidation.getCustomerId),
    //keycloak.protect(roleGuard(["soly-org"])),
    collectionController.getCollectionsWithOwnes,
  );

router
  .route("/create-collection")
  .post(
    validate(collectionValidation.createCollection),
    //keycloak.protect(roleGuard(["soly-org"])),
    collectionController.createCollection,
  );

router.route("/contract").post(collectionController.createCollection);

export default router;
