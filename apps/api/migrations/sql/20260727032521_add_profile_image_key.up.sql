-- modify "profile_images" table
ALTER TABLE "profile_images" DROP COLUMN "url", ADD COLUMN "image_key" character varying(255) NOT NULL;
-- modify "messages" table
ALTER TABLE "messages" DROP CONSTRAINT "fk_messages_match", ADD CONSTRAINT "fk_matches_messages" FOREIGN KEY ("match_id") REFERENCES "matches" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
