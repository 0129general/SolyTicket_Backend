# express-typescript-prisma-boilerplate

REST API Boilerplate with Node JS, TypeScript, Express and Prisma setup

<!-- KEYCLOACK CREDS -->

KEYCLOAK_URL - base url of runned Keycloak server(admin console)
KEYCLOAK_REALM - created realm for your project
KEYCLOAK_CLIENT_ID - created client for your project's part (frontend, backend, ...)
KEYCLOAK_CLIENT_SECRET - {{your_client}} -> Credentials -> Client Secret

Extra info

To allow your backend client manage users you should make such action
1.When you create client on the second step(Capability config) select 'Client authenfication', 'Authorization', and 'Implicit flow' checkboxes 2.{{your_client}} -> Service account roles -> Assign role -> choose ('realm-management' realm-admin)
