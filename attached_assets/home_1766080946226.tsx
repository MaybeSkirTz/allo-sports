import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, ChevronRight, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import type { ArticleWithAuthor } from "@shared/schema";

const CATEGORIES = [
  "Tous",
  "NHL",
  "NBA",
  "NFL",
  "Soccer",
  "ATP",
  "WTA",
  "F1",
];

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getReadTime(content: string) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min de lecture`;
}

function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function ArticleCard({ article }: { article: ArticleWithAuthor }) {
  const authorName = [article.author?.firstName, article.author?.lastName]
    .filter(Boolean)
    .join(" ") || "Auteur";
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Link href={`/article/${article.id}`}>
      <Card
        className="overflow-visible cursor-pointer hover-elevate active-elevate-2 transition-transform"
        data-testid={`card-article-${article.id}`}
      >
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img
            src={article.imageUrl || "https://images.unsplash.com/photo-1461896836934- voices-of-sport?w=800&h=450&fit=crop"}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2">
            {article.category}
          </Badge>
          <h3 className="font-bold text-lg line-clamp-2 mb-2" data-testid={`text-title-${article.id}`}>
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={article.author?.profileImageUrl || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{authorName}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
  const authorName = [article.author?.firstName, article.author?.lastName]
    .filter(Boolean)
    .join(" ") || "Auteur";

  return (
    <Link href={`/article/${article.id}`}>
      <div
        className="relative aspect-[21/9] rounded-lg overflow-hidden cursor-pointer group"
        data-testid="hero-article"
      >
        <img
          src={article.imageUrl || "https://images.unsplash.com/photo-1461896836934-rvba5b-sport?w=1920&h=800&fit=crop"}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <Badge className="mb-3 bg-primary text-primary-foreground">
            {article.category}
          </Badge>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 line-clamp-2">
            {article.title}
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl line-clamp-2 mb-4">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{authorName}</span>
            </div>
            <span className="text-white/60">|</span>
            <span className="text-sm">{formatDate(article.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const { data: articles, isLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles"],
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles/search", searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/articles/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const displayedArticles = searchQuery.length >= 2 ? searchResults : articles;

  const filteredArticles = displayedArticles?.filter((article) => {
    if (selectedCategory === "Tous") return true;
    return article.category === selectedCategory;
  });

const publishedArticles = filteredArticles?.filter(
  (a) => a.published === true
) || [];

const featuredArticle = articles?.find((a) => a.featured) || articles?.[0];
const regularArticles =
  filteredArticles?.filter((a) => a.id !== featuredArticle?.id) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <h1 className="text-xl md:text-2xl font-bold text-primary cursor-pointer" data-testid="link-home">
                Allo-SportsHub
              </h1>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>

            {/* Auth Controls */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
  <>
    {(user?.role === "AUTHOR" || user?.role === "ADMIN") && (
      <Link href="/dashboard">
        <Button variant="outline">Dashboard</Button>
      </Link>
    )}

    <Button
      variant="ghost"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      Déconnexion
    </Button>
  </>
) : (
  <Link href="/login">
    <Button>Connexion</Button>
  </Link>
)}
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
                data-testid={`button-category-${category}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!searchQuery && featuredArticle && (
          <section className="mb-12">
            <HeroArticle article={featuredArticle} />
          </section>
        )}

        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Résultats pour "{searchQuery}"
            </h2>
            {isSearching && <p className="text-muted-foreground">Recherche en cours...</p>}
            {!isSearching && searchResults?.length === 0 && (
              <p className="text-muted-foreground">Aucun article trouvé</p>
            )}
          </div>
        )}

        {/* Articles Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery ? "" : selectedCategory === "Tous" ? "Derniers Articles" : selectedCategory}
            </h2>
            {!searchQuery && (
              <Button variant="ghost" className="gap-1">
                Voir tout <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
              </>
            ) : regularArticles.length > 0 ? (
              regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchQuery ? "Aucun résultat trouvé" : "Aucun article disponible pour le moment"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Allo Sports</h3>
              <p className="text-muted-foreground text-sm">
                Votre source d'actualité sportive préférée au Québec!
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Catégories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {CATEGORIES.slice(1, 5).map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className="hover:text-foreground transition-colors"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liens Rapides</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-foreground transition-colors">Accueil</Link></li>
                <li><Link href="/" className="hover:text-foreground transition-colors">Facebook</Link></li>
                <li><Link href="/" className="hover:text-foreground transition-colors">Twitter</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Devenir Auteur</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Rejoignez notre équipe de rédacteurs passionnés de sport.
              </p>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Rejoindre l'équipe
                </Button>
              </Link>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 Allo Sports. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
