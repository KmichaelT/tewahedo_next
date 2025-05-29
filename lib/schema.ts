import { pgTable, serial, text, timestamp, integer, boolean, index, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
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

// Zod schemas - create them manually to avoid compatibility issues
export const insertUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  displayName: z.string().optional(),
  image: z.string().optional(),
  photoURL: z.string().optional(),
  isAdmin: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const insertQuestionSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  authorId: z.string(),
  status: z.enum(["pending", "published", "rejected"]).default("pending"),
  category: z.enum(["Faith", "Practices", "Theology", "History", "General"]),
  votes: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const insertAnswerSchema = z.object({
  id: z.number().optional(),
  content: z.string().min(1),
  questionId: z.number(),
  authorId: z.string(),
  votes: z.number().default(0),
  isAccepted: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const insertCommentSchema = z.object({
  id: z.number().optional(),
  content: z.string().min(1),
  authorId: z.string(),
  questionId: z.number().optional(),
  answerId: z.number().optional(),
  parentId: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const insertLikeSchema = z.object({
  id: z.number().optional(),
  userId: z.string(),
  targetType: z.enum(["question", "answer", "comment"]),
  targetId: z.number(),
  createdAt: z.date().optional(),
})

// Export types using z.infer
export type User = z.infer<typeof insertUserSchema>
export type Question = z.infer<typeof insertQuestionSchema>
export type Answer = z.infer<typeof insertAnswerSchema>
export type Comment = z.infer<typeof insertCommentSchema>
export type Like = z.infer<typeof insertLikeSchema>

// Additional schemas for database select operations
export const selectUserSchema = insertUserSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const selectQuestionSchema = insertQuestionSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const selectAnswerSchema = insertAnswerSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const selectCommentSchema = insertCommentSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const selectLikeSchema = insertLikeSchema.extend({
  id: z.number(),
  createdAt: z.date(),
})

// Export select types
export type SelectUser = z.infer<typeof selectUserSchema>
export type SelectQuestion = z.infer<typeof selectQuestionSchema>
export type SelectAnswer = z.infer<typeof selectAnswerSchema>
export type SelectComment = z.infer<typeof selectCommentSchema>
export type SelectLike = z.infer<typeof selectLikeSchema>