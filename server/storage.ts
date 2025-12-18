import { 
  type User, 
  type InsertUser, 
  type Article,
  type InsertArticle,
  type UpdateArticle,
  type ArticleWithAuthor
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Articles
  getArticleById(id: string): Promise<ArticleWithAuthor | undefined>;
  getPublishedArticles(): Promise<ArticleWithAuthor[]>;
  getArticlesByAuthor(authorId: string): Promise<ArticleWithAuthor[]>;
  searchArticles(query: string): Promise<ArticleWithAuthor[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, data: UpdateArticle): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private articles: Map<string, Article>;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    
    // Create a demo author
    const demoAuthorId = randomUUID();
    const demoAuthor: User = {
      id: demoAuthorId,
      username: "sportsjournalist",
      email: "journalist@allosportshub.com",
      password: "$2b$10$uq4rEFwLhc5adnoUMyH.5.Po0g1qwuIPmZF8d7H7YV0Fls0eiut/O", // demo123
      firstName: "Marc",
      lastName: "Tremblay",
      profileImageUrl: null,
      role: "AUTHOR",
      createdAt: new Date(),
    };
    this.users.set(demoAuthorId, demoAuthor);

    // Create demo articles
    const articles: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: "Le Canadien remporte une victoire spectaculaire face aux Bruins",
        slug: "canadien-victoire-bruins",
        excerpt: "Dans un match palpitant au Centre Bell, le Canadien de Montréal a démontré sa résilience en revenant de deux buts pour s'imposer 4-3 en prolongation.",
        content: `Le Centre Bell était en ébullition hier soir alors que le Canadien de Montréal affrontait les Bruins de Boston dans un duel classique de la rivalité historique entre les deux équipes.

Mené 2-0 après la première période, le Tricolore a puisé dans ses réserves pour offrir à ses partisans une remontée mémorable. Cole Caufield a été le héros de la soirée avec deux buts, dont celui de la victoire en prolongation.

"C'est exactement ce type de matchs qui définit le caractère d'une équipe", a déclaré l'entraîneur-chef après la rencontre. "Nos joueurs n'ont jamais abandonné et ont continué à jouer avec intensité."

Le gardien Samuel Montembeault a également été brillant, réalisant 35 arrêts dont plusieurs spectaculaires en troisième période pour garder son équipe dans le match.

Avec cette victoire, le Canadien grimpe au quatrième rang de la division Atlantique et continue de surprendre les observateurs cette saison.`,
        category: "NHL",
        imageUrl: "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=1200&h=675&fit=crop",
        authorId: demoAuthorId,
        published: true,
        featured: true,
      },
      {
        title: "La NBA suspend la saison : ce que cela signifie pour les équipes canadiennes",
        slug: "nba-suspension-equipes-canadiennes",
        excerpt: "La décision surprise de la NBA de suspendre temporairement la saison a des répercussions majeures sur les Raptors de Toronto et l'ensemble de la ligue.",
        content: `La NBA a annoncé hier une suspension temporaire de la saison régulière, une décision qui affecte particulièrement les Raptors de Toronto alors qu'ils étaient en pleine course aux séries éliminatoires.

Cette pause d'une semaine, motivée par des considérations de santé et de sécurité des joueurs, intervient à un moment crucial du calendrier. Les Raptors, actuellement sixièmes de la Conférence Est, devront maintenir leur forme physique et mentale pendant cette période d'inactivité.

"C'est une situation inhabituelle, mais nous devons nous adapter", a commenté le directeur général de l'équipe. "Nos joueurs continueront à s'entraîner et à rester prêts pour la reprise."

Pour les fans canadiens, cette pause signifie également un report des matchs très attendus contre les Celtics et les 76ers, des confrontations qui auraient pu avoir un impact significatif sur le classement final.

La ligue a assuré que tous les matchs reportés seraient reprogrammés et que la saison se terminerait comme prévu.`,
        category: "NBA",
        imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=675&fit=crop",
        authorId: demoAuthorId,
        published: true,
        featured: false,
      },
      {
        title: "Victoire historique du CF Montréal en Ligue des Champions de la CONCACAF",
        slug: "cf-montreal-ligue-champions-concacaf",
        excerpt: "Le CF Montréal écrit une nouvelle page de son histoire en se qualifiant pour les demi-finales de la Ligue des Champions de la CONCACAF.",
        content: `Le CF Montréal a réalisé un exploit majeur en battant le Club América 3-2 au total des deux matchs, se qualifiant ainsi pour les demi-finales de la Ligue des Champions de la CONCACAF.

Cette victoire marque un tournant historique pour le club montréalais, qui n'avait jamais atteint ce stade de la compétition. Devant une foule record au Stade Saputo, les joueurs ont livré une performance exceptionnelle.

"C'est un moment spécial pour notre club et pour le soccer québécois", a déclaré le capitaine après le match. "Nous avons prouvé que nous pouvons rivaliser avec les meilleures équipes du continent."

Le prochain adversaire sera déterminé lors du tirage au sort prévu la semaine prochaine. L'équipe pourrait affronter des géants comme le Club León ou le Tigres UANL.

Les billets pour les demi-finales seront mis en vente vendredi prochain.`,
        category: "Soccer",
        imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&fit=crop",
        authorId: demoAuthorId,
        published: true,
        featured: false,
      },
      {
        title: "Félix Auger-Aliassime atteint les quarts de finale à l'Open d'Australie",
        slug: "felix-auger-aliassime-open-australie",
        excerpt: "Le Québécois Félix Auger-Aliassime continue son parcours impressionnant à Melbourne en dominant son adversaire en quatre sets.",
        content: `Félix Auger-Aliassime poursuit son excellent début de saison 2024 en atteignant les quarts de finale de l'Open d'Australie, le premier Grand Chelem de l'année.

Le Montréalais a défait le numéro 12 mondial en quatre sets (6-4, 3-6, 6-3, 7-5) dans un match de haute intensité qui a duré près de trois heures. Sa puissance au service et son jeu de fond de court ont fait la différence.

"Je me sens vraiment bien sur ce court", a confié Auger-Aliassime après sa victoire. "Mon service fonctionne bien et je joue avec beaucoup de confiance."

Son prochain adversaire sera le tenant du titre, une confrontation très attendue par les amateurs de tennis du monde entier.

Avec cette performance, le Québécois devrait grimper dans le top 10 mondial la semaine prochaine.`,
        category: "ATP",
        imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&h=675&fit=crop",
        authorId: demoAuthorId,
        published: true,
        featured: false,
      },
      {
        title: "Grand Prix du Canada : les préparatifs battent leur plein",
        slug: "grand-prix-canada-preparatifs",
        excerpt: "À quelques mois du Grand Prix du Canada de Formule 1, le Circuit Gilles-Villeneuve se prépare à accueillir les meilleures écuries du monde.",
        content: `Le Circuit Gilles-Villeneuve de Montréal se prépare activement pour le Grand Prix du Canada de Formule 1, prévu pour le mois de juin prochain.

Des travaux d'amélioration sont en cours sur la piste et dans les installations pour offrir aux pilotes et aux spectateurs une expérience optimale. La resurfaçage de certaines sections et l'amélioration des zones d'échappement font partie des modifications prévues.

"Nous voulons que ce Grand Prix soit encore plus spectaculaire que les années précédentes", a déclaré le directeur de l'événement. "Montréal mérite un événement à la hauteur de sa réputation."

Les billets pour l'édition 2024 se vendent rapidement, avec plus de 70% des places déjà réservées. Les organisateurs s'attendent à accueillir plus de 300 000 spectateurs sur l'ensemble du week-end.

Le Grand Prix du Canada reste l'un des événements sportifs les plus populaires au pays.`,
        category: "F1",
        imageUrl: "https://images.unsplash.com/photo-1504707748692-419802cf939d?w=1200&h=675&fit=crop",
        authorId: demoAuthorId,
        published: true,
        featured: false,
      },
    ];

    articles.forEach((articleData) => {
      const id = randomUUID();
      const article: Article = {
        ...articleData,
        id,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
        updatedAt: new Date(),
      };
      this.articles.set(id, article);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Article methods
  private attachAuthor(article: Article): ArticleWithAuthor {
    const author = this.users.get(article.authorId);
    return {
      ...article,
      author: author ? {
        id: author.id,
        firstName: author.firstName,
        lastName: author.lastName,
        profileImageUrl: author.profileImageUrl,
      } : null,
    };
  }

  async getArticleById(id: string): Promise<ArticleWithAuthor | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    return this.attachAuthor(article);
  }

  async getPublishedArticles(): Promise<ArticleWithAuthor[]> {
    const articles = Array.from(this.articles.values())
      .filter(article => article.published)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    return articles.map(article => this.attachAuthor(article));
  }

  async getArticlesByAuthor(authorId: string): Promise<ArticleWithAuthor[]> {
    const articles = Array.from(this.articles.values())
      .filter(article => article.authorId === authorId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    return articles.map(article => this.attachAuthor(article));
  }

  async searchArticles(query: string): Promise<ArticleWithAuthor[]> {
    const lowerQuery = query.toLowerCase();
    const articles = Array.from(this.articles.values())
      .filter(article => 
        article.published && (
          article.title.toLowerCase().includes(lowerQuery) ||
          article.excerpt.toLowerCase().includes(lowerQuery) ||
          article.content.toLowerCase().includes(lowerQuery) ||
          article.category.toLowerCase().includes(lowerQuery)
        )
      )
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    return articles.map(article => this.attachAuthor(article));
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const article: Article = {
      ...insertArticle,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: string, data: UpdateArticle): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updated: Article = {
      ...article,
      ...data,
      updatedAt: new Date(),
    };
    this.articles.set(id, updated);
    return updated;
  }

  async deleteArticle(id: string): Promise<boolean> {
    return this.articles.delete(id);
  }
}

export const storage = new MemStorage();
