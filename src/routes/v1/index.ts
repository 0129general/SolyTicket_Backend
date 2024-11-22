import express, { Router } from "express";
import userRoute from "./user.route";
import pendingEventRoute from "./pendingEvent.route";
import eventRoute from "./event.route";
import filterTypeRoute from "./filterType.route";
//08/09/2024 kalktı
import ticketRoute from "./ticket.route";
import homePageRoute from "./homepage.route";
import adEventRoute from "./adEvent.route";
import collectionRoute from "./collection.route";
import locationRoute from "./location.route";

const router = express.Router();

interface Routes {
  path: string;
  route: Router;
}

const routes: Routes[] = [
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/pending-events",
    route: pendingEventRoute,
  },
  {
    path: "/events",
    route: eventRoute,
  },
  {
    path: "/filter-type",
    route: filterTypeRoute,
  },
  {
    path: "/ticket",
    route: ticketRoute,
  },
  {
    path: "/homepage",
    route: homePageRoute,
  },
  {
    path: "/ad-event",
    route: adEventRoute,
  },
  {
    path: "/collection",
    route: collectionRoute,
  },
  {
    path: "/location",
    route: locationRoute,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
