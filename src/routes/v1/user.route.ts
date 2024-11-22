import express from "express";
import validate from "../../middlewares/validate";
import { userValidation } from "../../validations";
import { userController } from "../../controllers";
import { keycloak, roleGuard } from "../../middlewares/keycloak";

const router = express.Router();

router
  .route("/")
  .get(validate(userValidation.getUsers), userController.getUsers);

router
  .route("/get-mne")
  .get(validate(userValidation.getUserId), userController.getMne);

router.route("/get-organizer-statistics").get(
  validate(userValidation.getOrganizerStatistics),
  //keycloak.protect(roleGuard(["soly-org"])),
  userController.getOrganizerStatistics,
);

router
  .route("/signup")
  .post(validate(userValidation.createUser), userController.createUser);

router
  .route("/signup-keycloack")
  .post(
    validate(userValidation.createUser),
    userController.createUserWithKeycloack,
  );

router
  .route("/signup-org")
  .post(validate(userValidation.createOrg), userController.createOrg);

router
  .route("/logout")
  .post(validate(userValidation.logout), userController.logout);

router
  .route("/get-tickets-of-user")
  .get(validate(userValidation.getUserId), userController.ticketsFromWallet);

router
  .route("/get-organizers-dashboard-for-mobile")
  .get(
    validate(userValidation.getUserId),
    userController.getOrganizerDashboardForMobile2,
  );

router
  .route("/verify")
  .post(validate(userValidation.verify), userController.verify);

router
  .route("/request-password-reset")
  .post(
    validate(userValidation.requestPasswordReset),
    userController.requestPasswordReset,
  );

router
  .route("/reset-password")
  .post(validate(userValidation.resetPassword), userController.resetPassword);
router
  .route("/metamask-signup")
  .post(
    validate(userValidation.createMetamaskUser),
    userController.createMetamaskUser,
  );

router
  .route("/google-signup")
  .post(
    validate(userValidation.createGoogleUser),
    userController.createGoogleUser,
  );

router
  .route("/login")
  .post(validate(userValidation.login), userController.login);

router
  .route("/:userId")
  .get(validate(userValidation.getUser), userController.getUser)
  .put(validate(userValidation.updateUser), userController.updateUser)
  .delete(validate(userValidation.deleteUser), userController.deleteUser);

// router.route("/get-organizers-dashboard-for-mobile").get(
//   validate(userValidation.getUserId),
//   // //keycloak.protect(roleGuard(["soly-org"])),
//   userController.getOrganizerDashboardForMobile2,
// );

export default router;
