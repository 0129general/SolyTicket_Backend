import { KeycloakConfig } from "keycloak-connect";
import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envVarsSchema = Joi.object({
  KEYCLOAK_REALM: Joi.string().required(),
  KEYCLOAK_URL: Joi.string().uri().required(),
  KEYCLOAK_CLIENT_ID: Joi.string().required(),
}).unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const keycloakConfig: KeycloakConfig = {
  realm: envVars.KEYCLOAK_REALM,
  "bearer-only": true,
  "auth-server-url": envVars.KEYCLOAK_URL,
  "ssl-required": "external",
  resource: envVars.KEYCLOAK_CLIENT_ID,
  "confidential-port": 0,
};
