-- modify "likes" table
ALTER TABLE "likes" ADD CONSTRAINT "chk_likes_no_self_like" CHECK (from_user_id <> to_user_id);
-- create index "idx_likes_from_to" to table: "likes"
CREATE UNIQUE INDEX "idx_likes_from_to" ON "likes" ("from_user_id", "to_user_id");
-- modify "matches" table
ALTER TABLE "matches" ADD CONSTRAINT "chk_matches_user1_id" CHECK (user1_id < user2_id);
-- create index "idx_matches_pair" to table: "matches"
CREATE UNIQUE INDEX "idx_matches_pair" ON "matches" ("user1_id", "user2_id");
-- modify "profile_images" table
ALTER TABLE "profile_images" DROP CONSTRAINT "fk_profile_images_profile", ADD CONSTRAINT "fk_profiles_images" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
