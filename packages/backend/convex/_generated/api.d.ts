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
import type * as branches_errors from "../branches/errors.js";
import type * as branches_mutations from "../branches/mutations.js";
import type * as branches_queries from "../branches/queries.js";
import type * as branches_utils from "../branches/utils.js";
import type * as cities_errors from "../cities/errors.js";
import type * as cities_mutations from "../cities/mutations.js";
import type * as cities_queries from "../cities/queries.js";
import type * as cities_utils from "../cities/utils.js";
import type * as emails_sender from "../emails/sender.js";
import type * as emails_templates from "../emails/templates.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as persons_mutations from "../persons/mutations.js";
import type * as privateData from "../privateData.js";
import type * as todos from "../todos.js";
import type * as trainers_errors from "../trainers/errors.js";
import type * as trainers_mutations from "../trainers/mutations.js";
import type * as trainers_queries from "../trainers/queries.js";
import type * as trainers_utils from "../trainers/utils.js";
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
  "branches/errors": typeof branches_errors;
  "branches/mutations": typeof branches_mutations;
  "branches/queries": typeof branches_queries;
  "branches/utils": typeof branches_utils;
  "cities/errors": typeof cities_errors;
  "cities/mutations": typeof cities_mutations;
  "cities/queries": typeof cities_queries;
  "cities/utils": typeof cities_utils;
  "emails/sender": typeof emails_sender;
  "emails/templates": typeof emails_templates;
  healthCheck: typeof healthCheck;
  http: typeof http;
  "persons/mutations": typeof persons_mutations;
  privateData: typeof privateData;
  todos: typeof todos;
  "trainers/errors": typeof trainers_errors;
  "trainers/mutations": typeof trainers_mutations;
  "trainers/queries": typeof trainers_queries;
  "trainers/utils": typeof trainers_utils;
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
