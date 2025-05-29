import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import type { z } from "zod"

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  image: text("image"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  status: text("status").default("pending").notNull(),
  category: text("category").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  questionId: integer("question_id").references(() => questions.id, { onDelete: "cascade" }),
  answerId: integer("answer_id").references(() => answers.id, { onDelete: "cascade" }),
  parentId: integer("parent_id").references(() => comments.id, { onDelete: "cascade" }),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  questionId: integer("question_id").references(() => questions.id, { onDelete: "cascade" }),
  answerId: integer("answer_id").references(() => answers.id, { onDelete: "cascade" }),
  commentId: integer("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Zod schemas
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
export const insertQuestionSchema = createInsertSchema(questions)
export const selectQuestionSchema = createSelectSchema(questions)
export const insertAnswerSchema = createInsertSchema(answers)
export const selectAnswerSchema = createSelectSchema(answers)
export const insertCommentSchema = createInsertSchema(comments)
export const selectCommentSchema = createSelectSchema(comments)

export type User = z.infer<typeof selectUserSchema>
export type Question = z.infer<typeof selectQuestionSchema>
export type Answer = z.infer<typeof selectAnswerSchema>
export type Comment = z.infer<typeof selectCommentSchema>
