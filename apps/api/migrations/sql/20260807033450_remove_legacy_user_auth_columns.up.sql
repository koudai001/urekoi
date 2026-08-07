-- modify "users" table
ALTER TABLE "users" DROP CONSTRAINT "chk_users_gender", DROP COLUMN "password", DROP COLUMN "gender", DROP COLUMN "birthdate";
