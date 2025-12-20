import { useRoute, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2, 
  Bookmark,
  Trophy,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ArticleWithAuthor } from "@shared/schema";

const CATEGORY_COLORS: Record<string, string> = {
  NHL: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  NBA: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  NFL: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  Soccer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  ATP: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  WTA: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  F1: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getReadTime(content: string | undefined) {
  if (!content) return "1 min de lecture";
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min de lecture`;
}

function ArticlePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="aspect-video w-full rounded-2xl mb-8" />
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-3/4 mb-8" />
        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}

function RelatedArticleCard({ article }: { article: ArticleWithAuthor }) {
  const categoryColor = CATEGORY_COLORS[article.category] || "bg-blue-500/10 text-blue-500 border-blue-500/20";
  
  return (
    <Link href={`/article/${article.id}`}>
      <Card className="overflow-hidden border shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-video overflow-hidden relative">
          <img
            src={article.imageUrl || "https://images.unsplash.com/photo-1461896836934-gy5rba-sport?w=400&h=225&fit=crop"}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <Badge variant="outline" className={`mb-2 text-xs ${categoryColor}`}>
            {article.category}
          </Badge>
          <h3 className="font-bold line-clamp-2 group-hover:text-blue-500 transition-colors">
            {article.title}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ArticlePage() {
  const [, params] = useRoute("/article/:id");
  const articleId = params?.id;

  const { data: article, isLoading, error } = useQuery<ArticleWithAuthor>({
    queryKey: ["article", articleId],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${articleId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Article not found");
      return res.json();
    },
    enabled: !!articleId,
  });

  const { data: allArticles } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles"],
    queryFn: async () => {
      const res = await fetch("/api/articles", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch articles");
      return res.json();
    },
  });

  const relatedArticles = (allArticles || [])
    .filter((a) => a.id !== articleId && a.category === article?.category && a.published)
    .slice(0, 3);

  if (isLoading) {
    return <ArticlePageSkeleton />;
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-500/80 flex items-center justify-center shadow-lg">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Allo<span className="text-blue-500"> Sports</span>
                  </h1>
                </div>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Trophy className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-muted-foreground mb-8">
              L'article que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Link href="/">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shareUrl =
  typeof window !== "undefined" ? window.location.href : "";

const shareText = `${article.title} - Allo Sports`;

const shareOnX = () => {
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`,
    "_blank"
  );
};

const shareOnFacebook = () => {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`,
    "_blank"
  );
};

const copyLink = async () => {
  await navigator.clipboard.writeText(shareUrl);
  alert("Lien copié dans le presse-papier");
};

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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-500/80 flex items-center justify-center shadow-lg">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight hidden sm:block">
                  Allo<span className="text-blue-500"> Sports</span>
                </h1>
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/">
                <Button variant="ghost" className="gap-2" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Retour</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{article.category}</span>
        </nav>

        <div className="mb-8">
  <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
    <img
      src={article.imageUrl || "https://images.unsplash.com/photo-1461896836934-gy5rba-sport?w=1200&h=675&fit=crop"}
      alt={article.title}
      className="w-full h-full object-cover"
    />
  </div>

  {article.imageCredit && (
    <p className="mt-2 text-xs text-muted-foreground italic">
       {article.imageCredit}
    </p>
  )}
</div>

        <Badge variant="outline" className={`mb-4 ${categoryColor}`}>
          {article.category}
        </Badge>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight" data-testid="text-article-title">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-background shadow-md">
              <AvatarImage src={article.author?.profileImageUrl || undefined} />
              <AvatarFallback className="text-lg font-semibold bg-blue-500/10 text-blue-500">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg" data-testid="text-author-name">{authorName}</p>
              <p className="text-sm text-muted-foreground">Auteur</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4" />
              <span>{getReadTime(article.content)}</span>
            </div>
          </div>
          
          <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm" className="gap-2">
      <Share2 className="h-4 w-4" />
      <span className="hidden sm:inline">Partager</span>
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={shareOnX}>
      Partager sur X
    </DropdownMenuItem>

    <DropdownMenuItem onClick={shareOnFacebook}>
      Partager sur Facebook
    </DropdownMenuItem>

    <DropdownMenuSeparator />

    <DropdownMenuItem onClick={copyLink}>
      Copier le lien
    </DropdownMenuItem>

    <DropdownMenuItem
      onClick={() => {
        copyLink();
        alert("Lien copié — collez-le dans Instagram");
      }}
    >
      Instagram (copier le lien)
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
        </div>

        <article className="prose prose-lg dark:prose-invert max-w-none mb-16">
          <p className="text-xl text-muted-foreground font-medium leading-relaxed mb-8">
            {article.excerpt}
          </p>
          {article.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="leading-relaxed">{paragraph}</p>
          ))}
        </article>

        {relatedArticles.length > 0 && (
          <section className="border-t pt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-bold">Articles similaires</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <RelatedArticleCard key={related.id} article={related} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t bg-muted/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Allo Sports. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
