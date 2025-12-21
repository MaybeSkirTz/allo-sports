import { db } from "./db";
import { users, articles } from "../shared/schema.js";
import { eq, and, ilike, desc, sql } from "drizzle-orm";
import type {
  User,
  InsertUser,
  Article,
  InsertArticle,
  UpdateArticle,
  ArticleWithAuthor,
} from "../shared/schema.js";

export const storage = {
  /* ================= USERS ================= */

  async getUser(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user ?? null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user ?? null;
  },

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  /* ================= ARTICLES ================= */

  async getPublishedArticles(): Promise<ArticleWithAuthor[]> {
  const rows = await db
    .select({
      article: articles,
      authorId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
    })
    .from(articles)
    .leftJoin(users, eq(users.id, articles.authorId))
    .where(eq(articles.published, true))
    .orderBy(desc(articles.createdAt));

  return rows.map((row) => ({
    ...row.article,
    author: row.authorId
      ? {
          id: row.authorId,
          firstName: row.firstName,
          lastName: row.lastName,
          profileImageUrl: row.profileImageUrl,
        }
      : null,
  }));
},

async incrementArticleViews(id: string): Promise<void> {
  await db
    .update(articles)
    .set({
      views: sql`${articles.views} + 1`,
    })
    .where(eq(articles.id, id));
},

  async getArticleById(id: string): Promise<ArticleWithAuthor | null> {
  const rows = await db
    .select({
      article: articles,
      authorId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
    })
    .from(articles)
    .leftJoin(users, eq(users.id, articles.authorId))
    .where(eq(articles.id, id));

  const row = rows[0];
  if (!row) return null;

  return {
    ...row.article,
    author: row.authorId
      ? {
          id: row.authorId,
          firstName: row.firstName,
          lastName: row.lastName,
          profileImageUrl: row.profileImageUrl,
        }
      : null,
  };
},

  async getArticlesByAuthor(authorId: string): Promise<Article[]> {
    return db
      .select()
      .from(articles)
      .where(eq(articles.authorId, authorId))
      .orderBy(desc(articles.createdAt));
  },

  async searchArticles(query: string): Promise<ArticleWithAuthor[]> {
  const q = `%${query}%`;

  const rows = await db
    .select({
      article: articles,
      authorId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
    })
    .from(articles)
    .leftJoin(users, eq(users.id, articles.authorId))
    .where(
      and(
        eq(articles.published, true),
        ilike(articles.title, q)
      )
    );

  return rows.map((row) => ({
    ...row.article,
    author: row.authorId
      ? {
          id: row.authorId,
          firstName: row.firstName,
          lastName: row.lastName,
          profileImageUrl: row.profileImageUrl,
        }
      : null,
  }));
},

  async createArticle(data: InsertArticle): Promise<Article> {
  const [article] = await db.insert(articles).values({
    ...data,
    slug: data.slug!, // <- assertion non-null
  }).returning();
  return article;
},

  async updateArticle(id: string, data: UpdateArticle): Promise<Article | null> {
    const [article] = await db
      .update(articles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();

    return article ?? null;
  },

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  },
};