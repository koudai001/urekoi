-- reverse: modify "users" table
ALTER TABLE "users" ADD COLUMN "birthdate" date NOT NULL, ADD COLUMN "gender" character varying(10) NOT NULL, ADD COLUMN "password" character varying(255) NOT NULL, ADD CONSTRAINT "chk_users_gender" CHECK ((gender)::text = ANY (ARRAY[('male'::character varying)::text, ('female'::character varying)::text]));
