import KeycloakConnect from "keycloak-connect";
import { keycloakConfig } from "../config/keycloak";
import { memoryStore } from "../app";

export const keycloak = new KeycloakConnect(
  {
    store: memoryStore,
  },
  keycloakConfig,
);

export const roleGuard = (allowedRoles?: string[]): KeycloakConnect.GuardFn => {
  // console.log("allowed", allowedRoles)
  return (token) => {
    // console.log(token)
    if (!allowedRoles || !allowedRoles.length) {
      return true;
    }

    return allowedRoles.some((role) => token.hasRole(role));
  };
};
