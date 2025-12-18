import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, 
  ChevronRight, 
  Clock, 
  TrendingUp,
  Zap,
  Trophy,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import type { ArticleWithAuthor } from "@shared/schema";

const CATEGORIES = [
  { name: "Tous", icon: Trophy },
  { name: "NHL", icon: null },
  { name: "NBA", icon: null },
  { name: "NFL", icon: null },
  { name: "Soccer", icon: null },
  { name: "ATP", icon: null },
  { name: "WTA", icon: null },
  { name: "F1", icon: null },
];

const CATEGORY_COLORS: Record<string, string> = {
  NHL: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  NBA: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  NFL: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  Soccer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  ATP: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  WTA: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  F1: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

function formatRelativeTime(date: Date | string | null) {
  if (!date) return "";
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Il y a quelques minutes";
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

function getReadTime(content: string | undefined) {
  if (!content) return "1 min";
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
}

function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden border shadow-sm">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-5">
        <Skeleton className="h-5 w-20 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-5" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ArticleCard({ article }: { article: ArticleWithAuthor }) {
  const authorName = article.author 
    ? [article.author.firstName, article.author.lastName].filter(Boolean).join(" ") || "Auteur"
    : "Auteur";
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AU";

  const categoryColor = CATEGORY_COLORS[article.category] || "bg-primary/10 text-primary border-primary/20";

  return (
    <Link href={`/article/${article.id}`}>
      <Card
        className="overflow-hidden border shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        data-testid={`card-article-${article.id}`}
      >
        <div className="aspect-video overflow-hidden relative">
          <img
            src={article.imageUrl || "https://images.unsplash.com/photo-1461896836934-gy5rba-sport?w=800&h=450&fit=crop"}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-5">
          <Badge variant="outline" className={`mb-3 font-medium text-xs ${categoryColor}`}>
            {article.category}
          </Badge>
          <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors" data-testid={`text-title-${article.id}`}>
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-5">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
                <AvatarImage src={article.author?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-medium block">{authorName}</span>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(article.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              <span>{getReadTime(article.content)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function HeroArticle({ article }: { article: ArticleWithAuthor }) {
  const authorName = article.author 
    ? [article.author.firstName, article.author.lastName].filter(Boolean).join(" ") || "Auteur"
    : "Auteur";

  return (
    <Link href={`/article/${article.id}`}>
      <div
        className="relative aspect-[21/9] min-h-[400px] lg:min-h-[500px] rounded-2xl overflow-hidden cursor-pointer group"
        data-testid="hero-article"
      >
        <img
          src={article.imageUrl || "https://images.unsplash.com/photo-1461896836934-gy5rba-sport?w=1920&h=800&fit=crop"}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        
        <div className="absolute top-6 left-6">
          <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1.5 text-sm shadow-lg border-0">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            À la une
          </Badge>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            {article.category}
          </Badge>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 line-clamp-3 leading-tight drop-shadow-lg">
            {article.title}
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-3xl line-clamp-2 mb-6">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-2 ring-white/30">
                <AvatarImage src={article.author?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs bg-white/20 text-white">
                  {authorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{authorName}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-white/60" />
            <span className="text-sm">{formatRelativeTime(article.createdAt)}</span>
            <span className="w-1 h-1 rounded-full bg-white/60" />
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-sm">{getReadTime(article.content)} de lecture</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SecondaryHeroCard({ article }: { article: ArticleWithAuthor }) {
  const authorName = article.author 
    ? [article.author.firstName, article.author.lastName].filter(Boolean).join(" ") || "Auteur"
    : "Auteur";

  return (
    <Link href={`/article/${article.id}`}>
      <div className="relative h-full min-h-[200px] rounded-xl overflow-hidden cursor-pointer group">
        <img
          src={article.imageUrl || "https://images.unsplash.com/photo-1461896836934-gy5rba-sport?w=600&h=400&fit=crop"}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Badge variant="outline" className="mb-2 bg-white/10 text-white border-white/20 backdrop-blur-sm text-xs">
            {article.category}
          </Badge>
          <h3 className="font-bold text-white text-base line-clamp-2 leading-snug mb-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-white/80 text-xs">
            <span>{authorName}</span>
            <span className="w-1 h-1 rounded-full bg-white/60" />
            <span>{formatRelativeTime(article.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const { data: articles, isLoading, error } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles"],
    queryFn: async () => {
      const res = await fetch("/api/articles", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch articles");
      return res.json();
    },
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles/search", searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/articles/search?q=${encodeURIComponent(searchQuery)}`, { credentials: "include" });
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const displayedArticles = searchQuery.length >= 2 ? searchResults : articles;
  const safeArticles = displayedArticles || [];

  const filteredArticles = safeArticles.filter((article) => {
    if (!article || !article.published) return false;
    if (selectedCategory === "Tous") return true;
    return article.category === selectedCategory;
  });

  const featuredArticle = filteredArticles.find((a) => a.featured) || filteredArticles[0];
  const secondaryArticles = filteredArticles.slice(1, 3);
  const regularArticles = filteredArticles.slice(featuredArticle ? 3 : 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Allo<span className="text-primary">Sports</span>Hub
                  </h1>
                </div>
              </div>
            </Link>

            <div className="flex-1 max-w-lg relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un article, une équipe, un joueur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 h-11 bg-muted/50 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
                data-testid="input-search"
              />
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  {(user?.role === "AUTHOR" || user?.role === "ADMIN") && (
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="hidden sm:flex" data-testid="button-dashboard">
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    data-testid="button-logout"
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm" data-testid="button-login">
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 h-10 bg-muted/50 border-0 rounded-xl"
                data-testid="input-search-mobile"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className={`whitespace-nowrap rounded-full transition-all ${
                  selectedCategory === category.name 
                    ? "shadow-md" 
                    : "hover:bg-muted"
                }`}
                data-testid={`button-category-${category.name}`}
              >
                {category.icon && <category.icon className="h-4 w-4 mr-1.5" />}
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Résultats pour "{searchQuery}"
            </h2>
            {isSearching && <p className="text-muted-foreground mt-2">Recherche en cours...</p>}
            {!isSearching && searchResults?.length === 0 && (
              <p className="text-muted-foreground mt-2">Aucun article trouvé</p>
            )}
          </div>
        )}

        {!searchQuery && !isLoading && filteredArticles.length > 0 && featuredArticle && (
          <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <HeroArticle article={featuredArticle} />
              </div>
              {secondaryArticles.length > 0 && (
                <div className="grid grid-rows-2 gap-4">
                  {secondaryArticles.map((article) => (
                    <SecondaryHeroCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {!searchQuery && (
          <section className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <h2 className="text-2xl font-bold">
                  {selectedCategory === "Tous" ? "Derniers Articles" : selectedCategory}
                </h2>
              </div>
              <Button variant="ghost" className="gap-1 text-muted-foreground" data-testid="button-view-all">
                Voir tout <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-destructive">Erreur lors du chargement des articles</p>
              </div>
            )}

            {!isLoading && !error && regularArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {!isLoading && !error && filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Aucun article disponible</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {selectedCategory !== "Tous" 
                    ? `Aucun article dans la catégorie ${selectedCategory} pour le moment.`
                    : "Les articles arrivent bientôt. Restez connecté!"}
                </p>
              </div>
            )}
          </section>
        )}

        {searchQuery && !isSearching && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t bg-muted/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">AlloSportsHub</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Votre source d'actualité sportive préférée au Québec. Suivez toutes les ligues majeures avec passion.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Catégories
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {CATEGORIES.slice(1, 5).map((cat) => (
                  <li key={cat.name}>
                    <button
                      onClick={() => setSelectedCategory(cat.name)}
                      className="hover:text-foreground transition-colors"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Liens Rapides</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Facebook</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Devenir Auteur
              </h4>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Rejoignez notre équipe de rédacteurs passionnés de sport et partagez votre expertise.
              </p>
              <Link href="/register">
                <Button variant="outline" size="sm" className="w-full" data-testid="button-become-author">
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} AlloSportsHub. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
