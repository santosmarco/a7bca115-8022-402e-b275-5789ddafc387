import { relations } from "drizzle-orm";
import { pgTableCreator, text, uuid, varchar } from "drizzle-orm/pg-core";

const createTable = pgTableCreator((name) => `titan-mvp_${name}`);

export const users = createTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export const videos = createTable("videos", {
  id: varchar("id", { length: 256 }).primaryKey(),
  title: varchar("title", { length: 256 }),
  description: varchar("description", { length: 256 }),
  url: varchar("url", { length: 256 }),
  userId: uuid("user_id").references(() => users.id),
  summary: text("summary"),
});

export const videosRelations = relations(videos, ({ one }) => ({
  user: one(users, { fields: [videos.userId], references: [users.id] }),
}));
