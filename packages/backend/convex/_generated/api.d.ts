/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as __tests___test_utils_builders from "../__tests__/test_utils/builders.js";
import type * as __tests___test_utils_fakeCtx from "../__tests__/test_utils/fakeCtx.js";
import type * as __tests___test_utils_run from "../__tests__/test_utils/run.js";
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
import type * as chat_conversations_errors from "../chat/conversations/errors.js";
import type * as chat_conversations_index from "../chat/conversations/index.js";
import type * as chat_conversations_mutations from "../chat/conversations/mutations.js";
import type * as chat_conversations_queries from "../chat/conversations/queries.js";
import type * as chat_conversations_utils from "../chat/conversations/utils.js";
import type * as chat_conversations_validations from "../chat/conversations/validations.js";
import type * as chat_index from "../chat/index.js";
import type * as chat_messages_errors from "../chat/messages/errors.js";
import type * as chat_messages_index from "../chat/messages/index.js";
import type * as chat_messages_mutations from "../chat/messages/mutations.js";
import type * as chat_messages_queries from "../chat/messages/queries.js";
import type * as chat_messages_utils from "../chat/messages/utils.js";
import type * as chat_messages_validations from "../chat/messages/validations.js";
import type * as chat_trainer_catalog_errors from "../chat/trainer_catalog/errors.js";
import type * as chat_trainer_catalog_index from "../chat/trainer_catalog/index.js";
import type * as chat_trainer_catalog_queries from "../chat/trainer_catalog/queries.js";
import type * as chat_trainer_catalog_validations from "../chat/trainer_catalog/validations.js";
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
import type * as clients_internalQueries from "../clients/internalQueries.js";
import type * as clients_mutations from "../clients/mutations.js";
import type * as clients_queries from "../clients/queries.js";
import type * as clients_utils from "../clients/utils.js";
import type * as clients_validations from "../clients/validations.js";
import type * as emails_sender from "../emails/sender.js";
import type * as emails_templates from "../emails/templates.js";
import type * as emergency_contact_index from "../emergency_contact/index.js";
import type * as emergency_contact_mutations from "../emergency_contact/mutations.js";
import type * as healthCheck from "../healthCheck.js";
import type * as health_metrics_mutuations from "../health_metrics/mutuations.js";
import type * as health_metrics_queries from "../health_metrics/queries.js";
import type * as health_metrics_validations from "../health_metrics/validations.js";
import type * as http from "../http.js";
import type * as invitations_errors from "../invitations/errors.js";
import type * as invitations_index from "../invitations/index.js";
import type * as invitations_mutations from "../invitations/mutations.js";
import type * as invitations_queries from "../invitations/queries.js";
import type * as invitations_utils from "../invitations/utils.js";
import type * as invitations_validations from "../invitations/validations.js";
import type * as persons_mutations from "../persons/mutations.js";
import type * as persons_queries from "../persons/queries.js";
import type * as persons_validations from "../persons/validations.js";
import type * as postLikes_index from "../postLikes/index.js";
import type * as postLikes_mutations from "../postLikes/mutations.js";
import type * as postLikes_queries from "../postLikes/queries.js";
import type * as postLikes_validations from "../postLikes/validations.js";
import type * as posts_errors from "../posts/errors.js";
import type * as posts_index from "../posts/index.js";
import type * as posts_mutations from "../posts/mutations.js";
import type * as posts_queries from "../posts/queries.js";
import type * as posts_utils from "../posts/utils.js";
import type * as posts_validations from "../posts/validations.js";
import type * as privateData from "../privateData.js";
import type * as profiles_admin_index from "../profiles/admin/index.js";
import type * as profiles_admin_mutations from "../profiles/admin/mutations.js";
import type * as profiles_admin_queries from "../profiles/admin/queries.js";
import type * as profiles_admin_validations from "../profiles/admin/validations.js";
import type * as profiles_client_index from "../profiles/client/index.js";
import type * as profiles_client_mutations from "../profiles/client/mutations.js";
import type * as profiles_client_queries from "../profiles/client/queries.js";
import type * as profiles_client_validations from "../profiles/client/validations.js";
import type * as profiles_common_utils from "../profiles/common/utils.js";
import type * as profiles_trainer_index from "../profiles/trainer/index.js";
import type * as profiles_trainer_mutations from "../profiles/trainer/mutations.js";
import type * as profiles_trainer_queries from "../profiles/trainer/queries.js";
import type * as profiles_trainer_validations from "../profiles/trainer/validations.js";
import type * as role_assignments_queries from "../role_assignments/queries.js";
import type * as todos from "../todos.js";
import type * as trainers_errors from "../trainers/errors.js";
import type * as trainers_mutations from "../trainers/mutations.js";
import type * as trainers_queries from "../trainers/queries.js";
import type * as trainers_utils from "../trainers/utils.js";
import type * as trainers_validations from "../trainers/validations.js";
import type * as users from "../users.js";
import type * as utils_validation from "../utils/validation.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "__tests__/test_utils/builders": typeof __tests___test_utils_builders;
  "__tests__/test_utils/fakeCtx": typeof __tests___test_utils_fakeCtx;
  "__tests__/test_utils/run": typeof __tests___test_utils_run;
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
  "chat/conversations/errors": typeof chat_conversations_errors;
  "chat/conversations/index": typeof chat_conversations_index;
  "chat/conversations/mutations": typeof chat_conversations_mutations;
  "chat/conversations/queries": typeof chat_conversations_queries;
  "chat/conversations/utils": typeof chat_conversations_utils;
  "chat/conversations/validations": typeof chat_conversations_validations;
  "chat/index": typeof chat_index;
  "chat/messages/errors": typeof chat_messages_errors;
  "chat/messages/index": typeof chat_messages_index;
  "chat/messages/mutations": typeof chat_messages_mutations;
  "chat/messages/queries": typeof chat_messages_queries;
  "chat/messages/utils": typeof chat_messages_utils;
  "chat/messages/validations": typeof chat_messages_validations;
  "chat/trainer_catalog/errors": typeof chat_trainer_catalog_errors;
  "chat/trainer_catalog/index": typeof chat_trainer_catalog_index;
  "chat/trainer_catalog/queries": typeof chat_trainer_catalog_queries;
  "chat/trainer_catalog/validations": typeof chat_trainer_catalog_validations;
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
  "clients/internalQueries": typeof clients_internalQueries;
  "clients/mutations": typeof clients_mutations;
  "clients/queries": typeof clients_queries;
  "clients/utils": typeof clients_utils;
  "clients/validations": typeof clients_validations;
  "emails/sender": typeof emails_sender;
  "emails/templates": typeof emails_templates;
  "emergency_contact/index": typeof emergency_contact_index;
  "emergency_contact/mutations": typeof emergency_contact_mutations;
  healthCheck: typeof healthCheck;
  "health_metrics/mutuations": typeof health_metrics_mutuations;
  "health_metrics/queries": typeof health_metrics_queries;
  "health_metrics/validations": typeof health_metrics_validations;
  http: typeof http;
  "invitations/errors": typeof invitations_errors;
  "invitations/index": typeof invitations_index;
  "invitations/mutations": typeof invitations_mutations;
  "invitations/queries": typeof invitations_queries;
  "invitations/utils": typeof invitations_utils;
  "invitations/validations": typeof invitations_validations;
  "persons/mutations": typeof persons_mutations;
  "persons/queries": typeof persons_queries;
  "persons/validations": typeof persons_validations;
  "postLikes/index": typeof postLikes_index;
  "postLikes/mutations": typeof postLikes_mutations;
  "postLikes/queries": typeof postLikes_queries;
  "postLikes/validations": typeof postLikes_validations;
  "posts/errors": typeof posts_errors;
  "posts/index": typeof posts_index;
  "posts/mutations": typeof posts_mutations;
  "posts/queries": typeof posts_queries;
  "posts/utils": typeof posts_utils;
  "posts/validations": typeof posts_validations;
  privateData: typeof privateData;
  "profiles/admin/index": typeof profiles_admin_index;
  "profiles/admin/mutations": typeof profiles_admin_mutations;
  "profiles/admin/queries": typeof profiles_admin_queries;
  "profiles/admin/validations": typeof profiles_admin_validations;
  "profiles/client/index": typeof profiles_client_index;
  "profiles/client/mutations": typeof profiles_client_mutations;
  "profiles/client/queries": typeof profiles_client_queries;
  "profiles/client/validations": typeof profiles_client_validations;
  "profiles/common/utils": typeof profiles_common_utils;
  "profiles/trainer/index": typeof profiles_trainer_index;
  "profiles/trainer/mutations": typeof profiles_trainer_mutations;
  "profiles/trainer/queries": typeof profiles_trainer_queries;
  "profiles/trainer/validations": typeof profiles_trainer_validations;
  "role_assignments/queries": typeof role_assignments_queries;
  todos: typeof todos;
  "trainers/errors": typeof trainers_errors;
  "trainers/mutations": typeof trainers_mutations;
  "trainers/queries": typeof trainers_queries;
  "trainers/utils": typeof trainers_utils;
  "trainers/validations": typeof trainers_validations;
  users: typeof users;
  "utils/validation": typeof utils_validation;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
