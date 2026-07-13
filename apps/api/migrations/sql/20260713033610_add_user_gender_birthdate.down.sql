-- reverse: modify "users" table
ALTER TABLE "users" DROP COLUMN "birthdate", DROP COLUMN "gender", DROP CONSTRAINT "chk_users_gender";
-- reverse: modify "profiles" table
ALTER TABLE "profiles" ADD COLUMN "age" smallint NOT NULL;
