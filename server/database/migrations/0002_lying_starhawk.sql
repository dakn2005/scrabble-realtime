CREATE UNIQUE INDEX IF NOT EXISTS "gameNameUniqueIndex" ON "games" USING btree (lower("name"));