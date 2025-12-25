import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2, 
  PlayCircle,
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
  MLB: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
};

// --- COMPOSANT SEO (Pour que Facebook/X voient l'image) ---
function SEOHead({ title, description, image, url }: { title: string, description: string, image: string, url: string }) {
  useEffect(() => {
    // Titre de la page
    document.title = `${title} | Allo Sports`;

    // Fonction pour mettre à jour ou créer une balise meta
    const updateMeta = (name: string, content: string, isProperty = false) => {
      let element = document.querySelector(`meta[${isProperty ? 'property' : 'name'}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(isProperty ? 'property' : 'name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Open Graph (Facebook / LinkedIn)
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', url, true);
    updateMeta('og:type', 'article', true);

    // Twitter Card (X)
    updateMeta('twitter:card', 'summary_large_image', false);
    updateMeta('twitter:title', title, false);
    updateMeta('twitter:description', description, false);
    updateMeta('twitter:image', image, false);

  }, [title, description, image, url]);

  return null;
}

// --- FONCTIONS UTILITAIRES ---

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

// --- PARSEUR DE CONTENU (Vidéos, Crédits, etc.) ---
function RenderArticleContent({ content }: { content: string }) {
  // On divise par paragraphes
  const paragraphs = content.split("\n\n");

  return (
    <div className="space-y-6">
      {paragraphs.map((paragraph, index) => {
        // 1. Détection YouTube (Lien seul sur une ligne)
        // Format supporté: https://www.youtube.com/watch?v=XXXX ou https://youtu.be/XXXX
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const youtubeMatch = paragraph.match(youtubeRegex);

        // Si le paragraphe est JUSTE un lien YouTube (ou très court avec le lien)
        if (youtubeMatch && paragraph.length < 100) {
          const videoId = youtubeMatch[1];
          return (
            <div key={index} className="my-8">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-0"
                />
              </div>
            </div>
          );
        }

        // 2. Détection de Crédit spécifique [Crédit: Nom]
        // Exemple dans l'éditeur: "Bla bla bla... [Crédit: RDS]"
        if (paragraph.includes("[Crédit:")) {
            const parts = paragraph.split("[Crédit:");
            const text = parts[0];
            const credit = parts[1].replace("]", "").trim();
            return (
                <p key={index} className="leading-relaxed">
                    {text}
                    <span className="block mt-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Source/Crédit : {credit}
                    </span>
                </p>
            );
        }

        // 3. Texte normal
        return <p key={index} className="leading-relaxed text-lg text-foreground/90">{paragraph}</p>;
      })}
    </div>
  );
}

// --- SKELETON ---
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

  if (isLoading) return <ArticlePageSkeleton />;

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
         <h1 className="text-2xl font-bold mb-4">Article introuvable</h1>
         <Link href="/"><Button>Retour à l'accueil</Button></Link>
      </div>
    );
  }

  // --- LOGIQUE DE PARTAGE ---
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  
  // Facebook : On ne peut pas pré-remplir le texte (règle Facebook), mais l'image sera là grâce aux Meta Tags
  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  // X (Twitter) : On utilise l'URL qui génère une "Card" (Image + Titre)
  const shareOnX = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`,
      "_blank"
    );
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    alert("Lien copié !");
  };

  const authorName = article.author 
    ? [article.author.firstName, article.author.lastName].filter(Boolean).join(" ") || "Auteur"
    : "Auteur";
  const initials = authorName.slice(0, 2).toUpperCase();
  const categoryColor = CATEGORY_COLORS[article.category] || "bg-blue-500/10 text-blue-500 border-blue-500/20";

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Injection des Meta Tags pour les réseaux sociaux */}
      <SEOHead 
        title={article.title}
        description={article.excerpt}
        image={article.imageUrl || "https://allosports.ca/4.png"} // Image par défaut si pas d'image
        url={shareUrl}
      />

      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <img src="/4.png" alt="Logo"/>
                </div>
                <h1 className="text-xl font-bold tracking-tight hidden sm:block">
                  Allo<span className="text-blue-500"> Sports</span>
                </h1>
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/">
                <Button variant="ghost" className="gap-2">
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

        {/* Image principale */}
        <div className="mb-8">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
            <img
              src={article.imageUrl || "/placeholder-sport.jpg"}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          {article.imageCredit && (
            <p className="mt-2 text-xs text-muted-foreground italic flex items-center gap-1">
               © {article.imageCredit}
            </p>
          )}
        </div>

        <Badge variant="outline" className={`mb-4 ${categoryColor}`}>
          {article.category}
        </Badge>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Info Auteur & Partage */}
        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-background shadow-md">
              <AvatarImage src={article.author?.profileImageUrl || undefined} />
              <AvatarFallback className="text-lg font-semibold bg-blue-500/10 text-blue-500">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{authorName}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(article.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{getReadTime(article.content)}</span>
             </div>

             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Partager</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={shareOnFacebook}>Facebook</DropdownMenuItem>
                <DropdownMenuItem onClick={shareOnX}>X (Twitter)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={copyLink}>Copier le lien</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* --- CONTENU DE L'ARTICLE (AVEC VIDÉOS) --- */}
        <article className="prose prose-lg dark:prose-invert max-w-none mb-16">
          <p className="text-xl text-muted-foreground font-medium leading-relaxed mb-8 border-l-4 border-blue-500 pl-4">
            {article.excerpt}
          </p>
          
          {/* C'est ici que la magie opère pour les vidéos */}
          <RenderArticleContent content={article.content} />
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