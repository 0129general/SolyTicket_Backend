import express from "express";
import helmet from "helmet";
import cors from "cors";
import httpStatus from "http-status";
import { ApiError } from "./utils";
import { error, xss } from "./middlewares";
import router from "./routes/v1/index";
import bodyParser from "body-parser";
import session from "express-session";
import "./services/subscriptionBatch";
import { sessionConfig } from "./config/session";
import { keycloak } from "./middlewares/keycloak";

const app = express();

export const memoryStore = new session.MemoryStore();

app.use(session(sessionConfig));

app.use(keycloak.middleware());

// set security HTTP headers
app.use(helmet());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// enable cors
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"],
    credentials: true,
  }),
);

// v1 api routes
app.use("/v1", router);

// health check
app.get("/health", (_, res) => {
  res.send({ message: "ok" });
});


// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  //log error
  console.log(
    "request not found : " + req.url + " " + req.method + " " + new Date(),
  );
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(error.errorConverter);

// handle error
app.use(error.errorHandler);

//log called endpoints

app.use((req, res, next) => {
  console.log(req.method + " " + req.url);
  next();
});

export default app;
