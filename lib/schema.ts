import { pgTable, serial, text, timestamp, integer, boolean, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

// Tables
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  displayName: text("display_name"),
  image: text("image"),
  photoURL: text("photo_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
}))

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "published", "rejected"] })
    .default("pending")
    .notNull(),
  category: text("category", { 
    enum: ["Faith", "Practices", "Theology", "History", "General"] 
  }).notNull(),
  votes: integer("votes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  authorIdx: index("questions_author_idx").on(table.authorId),
  statusIdx: index("questions_status_idx").on(table.status),
  categoryIdx: index("questions_category_idx").on(table.category),
}))

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  votes: integer("votes").default(0).notNull(),
  isAccepted: boolean("is_accepted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  questionIdx: index("answers_question_idx").on(table.questionId),
  authorIdx: index("answers_author_idx").on(table.authorId),
}))

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questionId: integer("question_id").references(() => questions.id, { onDelete: "cascade" }),
  answerId: integer("answer_id").references(() => answers.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"), // Remove self-reference to avoid circular dependency
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  authorIdx: index("comments_author_idx").on(table.authorId),
  questionIdx: index("comments_question_idx").on(table.questionId),
  answerIdx: index("comments_answer_idx").on(table.answerId),
  parentIdx: index("comments_parent_idx").on(table.parentId),
}))

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: text("target_type", { enum: ["question", "answer", "comment"] }).notNull(),
  targetId: integer("target_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("likes_user_idx").on(table.userId),
  targetIdx: index("likes_target_idx").on(table.targetType, table.targetId),
  uniqueLike: uniqueIndex("likes_unique_idx").on(table.userId, table.targetType, table.targetId),
}))

// Relations (defined separately to avoid circular dependencies)
export const usersRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  answers: many(answers),
  comments: many(comments),
  likes: many(likes),
}))

export const questionsRelations = relations(questions, ({ one, many }) => ({
  author: one(users, {
    fields: [questions.authorId],
    references: [users.id],
  }),
  answers: many(answers),
  comments: many(comments),
}))

export const answersRelations = relations(answers, ({ one, many }) => ({
  author: one(users, {
    fields: [answers.authorId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [comments.questionId],
    references: [questions.id],
  }),
  answer: one(answers, {
    fields: [comments.answerId],
    references: [answers.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}))

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}))

// Zod schemas - create them properly
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
export const insertQuestionSchema = createInsertSchema(questions)
export const selectQuestionSchema = createSelectSchema(questions)
export const insertAnswerSchema = createInsertSchema(answers)
export const selectAnswerSchema = createSelectSchema(answers)
export const insertCommentSchema = createInsertSchema(comments)
export const selectCommentSchema = createSelectSchema(comments)
export const insertLikeSchema = createInsertSchema(likes)
export const selectLikeSchema = createSelectSchema(likes)

// Export types using z.infer
export type User = z.infer<typeof selectUserSchema>
export type Question = z.infer<typeof selectQuestionSchema>
export type Answer = z.infer<typeof selectAnswerSchema>
export type Comment = z.infer<typeof selectCommentSchema>
export type Like = z.infer<typeof selectLikeSchema>