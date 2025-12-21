import { useState, useEffect, Fragment } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
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
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem
} from "@/components/ui/carousel";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import type { ArticleWithAuthor } from "@shared/schema";

const CATEGORIES = [
  { name: "Tous", icon: Trophy },
  { name: "NHL", icon: null },
  { name: "NBA", icon: null },
  { name: "NFL", icon: null },
  { name: "Soccer", icon: null },
  { name: "MLB", icon: null },
];

const CATEGORY_COLORS: Record<string, string> = {
  NHL: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  NBA: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  NFL: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  Soccer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  MLB: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
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

  const categoryColor = CATEGORY_COLORS[article.category] || "bg-blue-500/10 text-blue-500 border-blue-500/20";

  return (
    <Link href={`/article/${article.id}`}>
      <Card
        className="overflow-hidden border shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col"
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
        <CardContent className="p-5 flex flex-col flex-1">
          <Badge variant="outline" className={`mb-3 font-medium text-xs w-fit ${categoryColor}`}>
            {article.category}
          </Badge>
          <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-3 group-hover:text-blue-500 transition-colors" data-testid={`text-title-${article.id}`}>
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-5 flex-1">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between gap-3 mt-auto">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
                <AvatarImage src={article.author?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs font-medium bg-blue-500/10 text-blue-500">
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
        className="relative w-full aspect-[21/9] min-h-[400px] lg:min-h-[500px] rounded-2xl overflow-hidden cursor-pointer group"
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
          <Badge className="bg-blue-500 text-blue-500-foreground font-semibold px-3 py-1.5 text-sm shadow-lg border-0">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            À la une
          </Badge>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            {article.category}
          </Badge>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 line-clamp-3 leading-tight drop-shadow-lg max-w-4xl">
            {article.title}
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-3xl line-clamp-2 mb-6 hidden md:block">
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

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [showAll, setShowAll] = useState(false);
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["/api/articles", selectedCategory],
    queryFn: async ({ pageParam = 0 }) => {
      const categoryParam = selectedCategory !== "Tous" ? `&category=${selectedCategory}` : "";
      const res = await fetch(`/api/articles?offset=${pageParam}&limit=9${categoryParam}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch articles");
      return res.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 9 ? allPages.length * 9 : undefined;
    },
  });
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { data: articles } = useQuery<ArticleWithAuthor[]>({
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

  const sortedArticles = [...filteredArticles].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
  );
  let featuredArticles = sortedArticles.filter((a) => a.featured === true);
  let regularArticles = sortedArticles.filter((a) => !a.featured);

  const articlesToDisplay = showAll
  ? sortedArticles
  : regularArticles;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <img src="/4.png" alt="Logo" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Allo<span className="text-blue-500"> Sports</span>
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
                className="pl-11 pr-4 h-11 bg-muted/50 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20"
                data-testid="input-search"
              />
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  {(user?.role === "AUTHOR" || user?.role === "ADMIN") && (
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hidden sm:flex"
                        data-testid="button-dashboard"
                      >
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
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" data-testid="button-login">
                      Connexion
                    </Button>
                  </Link>

                  <Link href="/register">
                    <Button size="sm" data-testid="button-register">
                      Inscription
                    </Button>
                  </Link>
                </div>
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
              <Search className="h-6 w-6 text-blue-500" />
              Résultats pour "{searchQuery}"
            </h2>
            {isSearching && <p className="text-muted-foreground mt-2">Recherche en cours...</p>}
            {!isSearching && searchResults?.length === 0 && (
              <p className="text-muted-foreground mt-2">Aucun article trouvé</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {searchResults?.filter(a => a.published).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* SECTION HERO (CAROUSEL) */}
        {!searchQuery && !isLoading && featuredArticles.length > 0 && (
          <section className="mb-12 relative">
            <Carousel opts={{ loop: true }} setApi={setCarouselApi} className="w-full">
              <CarouselContent>
                {featuredArticles.map((article) => (
                  <CarouselItem key={article.id}>
                    <HeroArticle article={article} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {featuredArticles.length > 1 && (
              <>
                <button
                  onClick={() => carouselApi?.scrollPrev()}
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur shadow-xl hidden md:flex items-center justify-center"
                >
                  ‹
                </button>
                <button
                  onClick={() => carouselApi?.scrollNext()}
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur shadow-xl hidden md:flex items-center justify-center"
                >
                  ›
                </button>
              </>
            )}
          </section>
        )}

        {/* SECTION GRILLE INFINIE */}
        {!searchQuery && (
          <section className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-blue-500 rounded-full" />
                <h2 className="text-2xl font-bold">
                  {selectedCategory === "Tous" ? "Derniers Articles" : selectedCategory}
                </h2>
              </div>
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

            {!isLoading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {regularArticles.length === 0 && featuredArticles.length === 0 && (
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

                {/* DÉTECTEUR DE SCROLL POUR CHARGER PLUS */}
                <div ref={ref} className="h-32 flex flex-col items-center justify-center mt-8 border-t border-dashed">
                  {isFetchingNextPage ? (
                    <div className="flex flex-col items-center gap-2 text-blue-500">
                      <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
                      <span className="text-sm font-medium">Chargement de la suite...</span>
                    </div>
                  ) : hasNextPage ? (
                    <p className="text-muted-foreground text-xs uppercase tracking-widest">Faites défiler pour charger plus d'articles</p>
                  ) : regularArticles.length > 0 ? (
                    <p className="text-muted-foreground text-sm font-medium italic">Vous avez atteint la fin de la liste !</p>
                  ) : null}
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <img src="/4.png" alt="Logo footer" />
                </div>
                <span className="text-xl font-bold">Allo Sports</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Votre source d'actualité sportive préférée au Québec. Suivez toutes les ligues majeures avec passion.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Catégories
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {CATEGORIES.slice(1, 6).map((cat) => (
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
                  <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
                </li>
                <li>
                  <a href="https://www.facebook.com/profile.php?id=61585003447679" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Facebook</a>
                </li>
                <li>
                  <a href="https://x.com/Allosportss" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">X</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Allo Sports. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}