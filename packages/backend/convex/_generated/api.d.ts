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
import type * as branches from "../branches.js";
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
  branches: typeof branches;
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
