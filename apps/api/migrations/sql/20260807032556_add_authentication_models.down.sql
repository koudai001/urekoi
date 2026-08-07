-- reverse: create "password_credentials" table
DROP TABLE "password_credentials";
-- reverse: create index "idx_auth_identities_user_id" to table: "auth_identities"
DROP INDEX "idx_auth_identities_user_id";
-- reverse: create index "idx_auth_identities_provider_user" to table: "auth_identities"
DROP INDEX "idx_auth_identities_provider_user";
-- reverse: create "auth_identities" table
DROP TABLE "auth_identities";
-- reverse: modify "profiles" table
ALTER TABLE "profiles" DROP COLUMN "birthdate", DROP COLUMN "gender", DROP CONSTRAINT "chk_profiles_gender";
