-- modify "profiles" table
ALTER TABLE "profiles" ADD CONSTRAINT "chk_profiles_gender" CHECK ((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[])), ADD COLUMN "gender" character varying(10) NOT NULL, ADD COLUMN "birthdate" date NOT NULL;
-- create "auth_identities" table
CREATE TABLE "auth_identities" (
  "id" bigserial NOT NULL,
  "user_id" bigint NOT NULL,
  "provider" character varying(50) NOT NULL,
  "provider_user_id" character varying(255) NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_users_auth_identities" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- create index "idx_auth_identities_provider_user" to table: "auth_identities"
CREATE UNIQUE INDEX "idx_auth_identities_provider_user" ON "auth_identities" ("provider", "provider_user_id");
-- create index "idx_auth_identities_user_id" to table: "auth_identities"
CREATE INDEX "idx_auth_identities_user_id" ON "auth_identities" ("user_id");
-- create "password_credentials" table
CREATE TABLE "password_credentials" (
  "user_id" bigserial NOT NULL,
  "password_hash" character varying(255) NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  PRIMARY KEY ("user_id"),
  CONSTRAINT "fk_users_password_credential" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
