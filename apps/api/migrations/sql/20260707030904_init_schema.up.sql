-- create "users" table
CREATE TABLE "users" (
  "id" bigserial NOT NULL,
  "email" character varying(255) NOT NULL,
  "password" character varying(255) NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "deleted_at" timestamptz NULL,
  PRIMARY KEY ("id")
);
-- create index "idx_users_deleted_at" to table: "users"
CREATE INDEX "idx_users_deleted_at" ON "users" ("deleted_at");
-- create index "idx_users_email" to table: "users"
CREATE UNIQUE INDEX "idx_users_email" ON "users" ("email");
-- create "likes" table
CREATE TABLE "likes" (
  "id" bigserial NOT NULL,
  "from_user_id" bigint NOT NULL,
  "to_user_id" bigint NOT NULL,
  "created_at" timestamptz NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_likes_from_user" FOREIGN KEY ("from_user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_likes_to_user" FOREIGN KEY ("to_user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- create "matches" table
CREATE TABLE "matches" (
  "id" bigserial NOT NULL,
  "user1_id" bigint NOT NULL,
  "user2_id" bigint NOT NULL,
  "matched_at" timestamptz NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_matches_user1" FOREIGN KEY ("user1_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_matches_user2" FOREIGN KEY ("user2_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- create "messages" table
CREATE TABLE "messages" (
  "id" bigserial NOT NULL,
  "match_id" bigint NOT NULL,
  "sender_user_id" bigint NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamptz NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_messages_match" FOREIGN KEY ("match_id") REFERENCES "matches" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "fk_messages_sender_user" FOREIGN KEY ("sender_user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- create "prefectures" table
CREATE TABLE "prefectures" (
  "id" smallint NOT NULL,
  "name" character varying(10) NOT NULL,
  PRIMARY KEY ("id")
);
-- create "profiles" table
CREATE TABLE "profiles" (
  "id" bigserial NOT NULL,
  "user_id" bigint NOT NULL,
  "nickname" character varying(50) NOT NULL,
  "age" smallint NOT NULL,
  "prefecture_code" smallint NOT NULL,
  "bio" text NULL,
  "occupation" character varying(50) NULL,
  "hometown" character varying(50) NULL,
  "blood_type" character varying(10) NULL,
  "mbti" character varying(10) NULL,
  "body_type" character varying(20) NULL,
  "education" character varying(20) NULL,
  "holiday" character varying(20) NULL,
  "alcohol" character varying(20) NULL,
  "smoking" character varying(20) NULL,
  "height_cm" smallint NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_profiles_prefecture" FOREIGN KEY ("prefecture_code") REFERENCES "prefectures" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- create index "idx_profiles_user_id" to table: "profiles"
CREATE UNIQUE INDEX "idx_profiles_user_id" ON "profiles" ("user_id");
-- create "profile_images" table
CREATE TABLE "profile_images" (
  "id" bigserial NOT NULL,
  "profile_id" bigint NOT NULL,
  "url" character varying(255) NOT NULL,
  "sort_order" smallint NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_profile_images_profile" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- create "tags" table
CREATE TABLE "tags" (
  "id" bigserial NOT NULL,
  "label" character varying(50) NOT NULL,
  "category" character varying(50) NOT NULL,
  "image_url" character varying(255) NOT NULL,
  PRIMARY KEY ("id")
);
-- create index "idx_tags_label" to table: "tags"
CREATE UNIQUE INDEX "idx_tags_label" ON "tags" ("label");
-- create "profile_tags" table
CREATE TABLE "profile_tags" (
  "id" bigserial NOT NULL,
  "profile_id" bigint NOT NULL,
  "tag_id" bigint NOT NULL,
  "created_at" timestamptz NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_profile_tags_profile" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_profile_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- create "refresh_tokens" table
CREATE TABLE "refresh_tokens" (
  "id" bigserial NOT NULL,
  "user_id" bigint NOT NULL,
  "token_hash" character varying(255) NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- create index "idx_refresh_tokens_token_hash" to table: "refresh_tokens"
CREATE UNIQUE INDEX "idx_refresh_tokens_token_hash" ON "refresh_tokens" ("token_hash");
