/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as addresses_errors from "../addresses/errors.js";
import type * as addresses_mutations from "../addresses/mutations.js";
import type * as addresses_queries from "../addresses/queries.js";
import type * as addresses_utils from "../addresses/utils.js";
import type * as addresses_validations from "../addresses/validations.js";
import type * as admins_index from "../admins/index.js";
import type * as admins_mutations from "../admins/mutations.js";
import type * as admins_queries from "../admins/queries.js";
import type * as admins_utils from "../admins/utils.js";
import type * as admins_validations from "../admins/validations.js";
import type * as branches_errors from "../branches/errors.js";
import type * as branches_mutations from "../branches/mutations.js";
import type * as branches_queries from "../branches/queries.js";
import type * as branches_utils from "../branches/utils.js";
import type * as branches_validations from "../branches/validations.js";
import type * as cities_errors from "../cities/errors.js";
import type * as cities_mutations from "../cities/mutations.js";
import type * as cities_queries from "../cities/queries.js";
import type * as cities_utils from "../cities/utils.js";
import type * as cities_validations from "../cities/validations.js";
import type * as client_branches_index from "../client_branches/index.js";
import type * as client_branches_mutations from "../client_branches/mutations.js";
import type * as client_branches_queries from "../client_branches/queries.js";
import type * as client_branches_utils from "../client_branches/utils.js";
import type * as client_branches_validations from "../client_branches/validations.js";
import type * as clients_index from "../clients/index.js";
import type * as clients_mutations from "../clients/mutations.js";
import type * as clients_queries from "../clients/queries.js";
import type * as clients_utils from "../clients/utils.js";
import type * as clients_validations from "../clients/validations.js";
import type * as emails_sender from "../emails/sender.js";
import type * as emails_templates from "../emails/templates.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as invitations_index from "../invitations/index.js";
import type * as invitations_mutations from "../invitations/mutations.js";
import type * as invitations_queries from "../invitations/queries.js";
import type * as invitations_utils from "../invitations/utils.js";
import type * as invitations_validations from "../invitations/validations.js";
import type * as persons_mutations from "../persons/mutations.js";
import type * as persons_queries from "../persons/queries.js";
import type * as persons_validations from "../persons/validations.js";
import type * as privateData from "../privateData.js";
import type * as todos from "../todos.js";
import type * as trainers_errors from "../trainers/errors.js";
import type * as trainers_mutations from "../trainers/mutations.js";
import type * as trainers_queries from "../trainers/queries.js";
import type * as trainers_utils from "../trainers/utils.js";
import type * as trainers_validations from "../trainers/validations.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "addresses/errors": typeof addresses_errors;
  "addresses/mutations": typeof addresses_mutations;
  "addresses/queries": typeof addresses_queries;
  "addresses/utils": typeof addresses_utils;
  "addresses/validations": typeof addresses_validations;
  "admins/index": typeof admins_index;
  "admins/mutations": typeof admins_mutations;
  "admins/queries": typeof admins_queries;
  "admins/utils": typeof admins_utils;
  "admins/validations": typeof admins_validations;
  "branches/errors": typeof branches_errors;
  "branches/mutations": typeof branches_mutations;
  "branches/queries": typeof branches_queries;
  "branches/utils": typeof branches_utils;
  "branches/validations": typeof branches_validations;
  "cities/errors": typeof cities_errors;
  "cities/mutations": typeof cities_mutations;
  "cities/queries": typeof cities_queries;
  "cities/utils": typeof cities_utils;
  "cities/validations": typeof cities_validations;
  "client_branches/index": typeof client_branches_index;
  "client_branches/mutations": typeof client_branches_mutations;
  "client_branches/queries": typeof client_branches_queries;
  "client_branches/utils": typeof client_branches_utils;
  "client_branches/validations": typeof client_branches_validations;
  "clients/index": typeof clients_index;
  "clients/mutations": typeof clients_mutations;
  "clients/queries": typeof clients_queries;
  "clients/utils": typeof clients_utils;
  "clients/validations": typeof clients_validations;
  "emails/sender": typeof emails_sender;
  "emails/templates": typeof emails_templates;
  healthCheck: typeof healthCheck;
  http: typeof http;
  "invitations/index": typeof invitations_index;
  "invitations/mutations": typeof invitations_mutations;
  "invitations/queries": typeof invitations_queries;
  "invitations/utils": typeof invitations_utils;
  "invitations/validations": typeof invitations_validations;
  "persons/mutations": typeof persons_mutations;
  "persons/queries": typeof persons_queries;
  "persons/validations": typeof persons_validations;
  privateData: typeof privateData;
  todos: typeof todos;
  "trainers/errors": typeof trainers_errors;
  "trainers/mutations": typeof trainers_mutations;
  "trainers/queries": typeof trainers_queries;
  "trainers/utils": typeof trainers_utils;
  "trainers/validations": typeof trainers_validations;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
