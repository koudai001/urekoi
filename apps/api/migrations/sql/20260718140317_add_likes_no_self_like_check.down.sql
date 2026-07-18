-- reverse: modify "profile_images" table
ALTER TABLE "profile_images" DROP CONSTRAINT "fk_profiles_images", ADD CONSTRAINT "fk_profile_images_profile" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
-- reverse: create index "idx_matches_pair" to table: "matches"
DROP INDEX "idx_matches_pair";
-- reverse: modify "matches" table
ALTER TABLE "matches" DROP CONSTRAINT "chk_matches_user1_id";
-- reverse: create index "idx_likes_from_to" to table: "likes"
DROP INDEX "idx_likes_from_to";
-- reverse: modify "likes" table
ALTER TABLE "likes" DROP CONSTRAINT "chk_likes_no_self_like";
