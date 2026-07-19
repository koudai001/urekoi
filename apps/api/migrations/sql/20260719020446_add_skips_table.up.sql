-- create "skips" table
CREATE TABLE "skips" (
  "id" bigserial NOT NULL,
  "from_user_id" bigint NOT NULL,
  "to_user_id" bigint NOT NULL,
  "created_at" timestamptz NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_skips_from_user" FOREIGN KEY ("from_user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_skips_to_user" FOREIGN KEY ("to_user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "chk_skips_no_self_skip" CHECK (from_user_id <> to_user_id)
);
-- create index "idx_skips_from_to" to table: "skips"
CREATE UNIQUE INDEX "idx_skips_from_to" ON "skips" ("from_user_id", "to_user_id");
