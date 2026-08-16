-- create index "idx_likes_to_user_id" to table: "likes"
CREATE INDEX "idx_likes_to_user_id" ON "likes" ("to_user_id");
-- create index "idx_matches_user2_id" to table: "matches"
CREATE INDEX "idx_matches_user2_id" ON "matches" ("user2_id");
-- create index "idx_profile_images_profile_id" to table: "profile_images"
CREATE INDEX "idx_profile_images_profile_id" ON "profile_images" ("profile_id");
-- create index "idx_profile_tags_profile_id" to table: "profile_tags"
CREATE INDEX "idx_profile_tags_profile_id" ON "profile_tags" ("profile_id");
