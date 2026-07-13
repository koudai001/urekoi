-- reverse: create index "idx_refresh_tokens_token_hash" to table: "refresh_tokens"
DROP INDEX "idx_refresh_tokens_token_hash";
-- reverse: create "refresh_tokens" table
DROP TABLE "refresh_tokens";
-- reverse: create "profile_tags" table
DROP TABLE "profile_tags";
-- reverse: create index "idx_tags_label" to table: "tags"
DROP INDEX "idx_tags_label";
-- reverse: create "tags" table
DROP TABLE "tags";
-- reverse: create "profile_images" table
DROP TABLE "profile_images";
-- reverse: create index "idx_profiles_user_id" to table: "profiles"
DROP INDEX "idx_profiles_user_id";
-- reverse: create "profiles" table
DROP TABLE "profiles";
-- reverse: create "prefectures" table
DROP TABLE "prefectures";
-- reverse: create "messages" table
DROP TABLE "messages";
-- reverse: create "matches" table
DROP TABLE "matches";
-- reverse: create "likes" table
DROP TABLE "likes";
-- reverse: create index "idx_users_email" to table: "users"
DROP INDEX "idx_users_email";
-- reverse: create index "idx_users_deleted_at" to table: "users"
DROP INDEX "idx_users_deleted_at";
-- reverse: create "users" table
DROP TABLE "users";
