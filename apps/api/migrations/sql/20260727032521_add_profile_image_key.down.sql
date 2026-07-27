-- reverse: modify "messages" table
ALTER TABLE "messages" DROP CONSTRAINT "fk_matches_messages", ADD CONSTRAINT "fk_messages_match" FOREIGN KEY ("match_id") REFERENCES "matches" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;
-- reverse: modify "profile_images" table
ALTER TABLE "profile_images" DROP COLUMN "image_key", ADD COLUMN "url" character varying(255) NOT NULL;
