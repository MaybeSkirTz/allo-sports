import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, updateArticleSchema, loginSchema, registerSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-key-change-in-production";
const SALT_ROUNDS = 10;

// Extend Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
      };
    }
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 150);
}

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    next();
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // -------------------------
  // AUTH ROUTES
  // -------------------------

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Données invalides", errors: parseResult.error.errors });
      }

      const { username, email, password, firstName, lastName } = parseResult.data;

      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: null,
        role: "AUTHOR", // New users are authors by default
      });

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Données invalides" });
      }

      const { username, password } = parseResult.data;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Erreur lors de la connexion" });
    }
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie("token");
    res.json({ message: "Déconnecté" });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // -------------------------
  // PUBLIC ARTICLE ROUTES
  // -------------------------

  app.get("/api/articles", async (_req, res) => {
    try {
      const articles = await storage.getPublishedArticles();
      res.json(articles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/articles/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const articles = await storage.searchArticles(query);
      res.json(articles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/articles/my", requireAuth, requireRole("AUTHOR", "ADMIN"), async (req, res) => {
    try {
      const articles = await storage.getArticlesByAuthor(req.user!.id);
      res.json(articles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticleById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      res.json(article);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // -------------------------
  // PROTECTED ARTICLE ROUTES
  // -------------------------

  app.post("/api/articles", requireAuth, requireRole("AUTHOR", "ADMIN"), async (req, res) => {
    try {
      const parseResult = insertArticleSchema.safeParse({
        ...req.body,
        authorId: req.user!.id,
      });

      if (!parseResult.success) {
        return res.status(400).json({ message: "Données invalides", errors: parseResult.error.errors });
      }

      const article = await storage.createArticle({
        ...parseResult.data,
        slug: slugify(parseResult.data.title),
      });
      res.status(201).json(article);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/articles/:id", requireAuth, requireRole("AUTHOR", "ADMIN"), async (req, res) => {
    try {
      const article = await storage.getArticleById(req.params.id);

      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }

      if (article.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const parseResult = updateArticleSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Données invalides", errors: parseResult.error.errors });
      }

      const updateData: Record<string, unknown> = { ...parseResult.data };
      if (updateData.title && typeof updateData.title === 'string') {
        updateData.slug = slugify(updateData.title);
      }

      const updated = await storage.updateArticle(req.params.id, updateData as any);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/articles/:id", requireAuth, requireRole("AUTHOR", "ADMIN"), async (req, res) => {
    try {
      const article = await storage.getArticleById(req.params.id);

      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }

      if (article.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteArticle(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
