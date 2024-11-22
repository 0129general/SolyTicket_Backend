import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envVarsSchema = Joi.object({
  MEMORY_STORE_SECRET: Joi.string().required(),
}).unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const sessionConfig = {
  secret: envVars.MEMORY_STORE_SECRET,
  resave: false,
  saveUninitialized: true,
};
