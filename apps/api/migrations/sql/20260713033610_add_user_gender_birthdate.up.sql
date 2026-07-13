-- modify "profiles" table
ALTER TABLE "profiles" DROP COLUMN "age";
-- modify "users" table
ALTER TABLE "users" ADD CONSTRAINT "chk_users_gender" CHECK ((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[])), ADD COLUMN "gender" character varying(10) NOT NULL, ADD COLUMN "birthdate" date NOT NULL;
