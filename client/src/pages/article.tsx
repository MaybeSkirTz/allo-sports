import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2, 
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

// --- PARSEUR DE CONTENU INTELLIGENT ---
function RenderArticleContent({ content }: { content: string }) {
  // CORRECTION: On coupe par saut de ligne simple (\n)
  const lines = content.split(/\r?\n/);

  return (
    <div className="space-y-4 text-lg text-foreground/90 leading-relaxed">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        
        // Gestion des lignes vides (pour l'espacement visuel)
        if (!trimmed) return <div key={index} className="h-2" />;

        // 1. Détection YouTube
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const youtubeMatch = trimmed.match(youtubeRegex);

        if (youtubeMatch) {
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

        // 2. Détection Twitter / X
        // Cherche les liens twitter.com ou x.com contenant un ID
        const twitterRegex = /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/;
        const twitterMatch = trimmed.match(twitterRegex);

        if (twitterMatch) {
          const tweetId = twitterMatch[3]; // L'ID du tweet
          return (
            <div key={index} className="my-6 flex justify-center">
              <div className="w-full max-w-[550px]">
                 {/* Tweet aligné au centre, thème sombre */}
                 <TwitterTweetEmbed tweetId={tweetId} options={{ theme: 'dark', align: 'center' }} />
              </div>
            </div>
          );
        }

        // 3. Détection de Crédit [Crédit: ...]
        if (trimmed.includes("[Crédit:")) {
            const parts = trimmed.split("[Crédit:");
            const textPart = parts[0];
            const creditPart = parts[1].replace("]", "").trim();
            
            return (
                <div key={index}>
                    {textPart && <p className="mb-1">{textPart}</p>}
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider border-l-4 border-blue-500 pl-3 py-1 bg-muted/30 inline-block rounded-r-md">
                        Source : {creditPart}
                    </p>
                </div>
            );
        }

        // 4. Texte standard (Paragraphe)
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

// --- SKELETON (Chargement) ---
function ArticlePageSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-20 px-4 max-w-4xl mx-auto">
        <Skeleton className="aspect-video w-full rounded-2xl mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
    </div>
  );
}

// --- CARTE ARTICLE SIMILAIRE ---
function RelatedArticleCard({ article }: { article: ArticleWithAuthor }) {
  const categoryColor = CATEGORY_COLORS[article.category] || "bg-blue-500/10 text-blue-500 border-blue-500/20";
  return (
    <Link href={`/article/${article.id}`}>
      <Card className="overflow-hidden border shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-video overflow-hidden relative">
          <img
            src={article.imageUrl || "/placeholder-sport.jpg"}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <Badge variant="outline" className={`mb-2 text-xs ${categoryColor}`}>{article.category}</Badge>
          <h3 className="font-bold line-clamp-2 group-hover:text-blue-500 transition-colors">{article.title}</h3>
        </CardContent>
      </Card>
    </Link>
  );
}

// --- COMPOSANT PRINCIPAL ---
export default function ArticlePage() {
  const [, params] = useRoute("/article/:id");
  const articleId = params?.id;

  // 1. Récupération de l'article courant
  const { data: article, isLoading, error } = useQuery<ArticleWithAuthor>({
    queryKey: ["article", articleId],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${articleId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Article not found");
      return res.json();
    },
    enabled: !!articleId,
  });

  // 2. Récupération de tous les articles pour "Articles similaires"
  const { data: allArticles } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles"],
    queryFn: async () => fetch("/api/articles", { credentials: "include" }).then(res => res.json()),
  });

  const relatedArticles = (allArticles || [])
    .filter((a) => a.id !== articleId && a.category === article?.category && a.published)
    .slice(0, 3);

  if (isLoading) return <ArticlePageSkeleton />;
  if (error || !article) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Article introuvable</h1>
      <Link href="/"><Button>Retour à l'accueil</Button></Link>
    </div>
  );

  // --- LOGIQUE DE PARTAGE ET SEO ---
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  // IMPORTANT: Si pas d'image, on met une image par défaut
  const imageUrl = article.imageUrl || "https://allosports.ca/4.png"; 

  const shareOnFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  const shareOnX = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`, "_blank");
  const copyLink = async () => { await navigator.clipboard.writeText(shareUrl); alert("Lien copié !"); };

  const authorName = article.author ? `${article.author.firstName} ${article.author.lastName}` : "Auteur";
  const initials = authorName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* --- REACT HELMET (SEO & SOCIAL SHARE) --- */}
      <Helmet>
        <title>{article.title} | Allo Sports</title>
        <meta name="description" content={article.excerpt} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:site_name" content="Allo Sports" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                 <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-white">
                    <img src="/4.png" className="w-8 h-8" alt="Logo"/>
                 </div>
                 <h1 className="text-xl font-bold hidden sm:block">Allo<span className="text-blue-500">Sports</span></h1>
              </div>
            </Link>
            <div className="flex gap-2">
                <ThemeToggle />
                <Link href="/"><Button variant="ghost" size="sm">Retour</Button></Link>
            </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Fil d'ariane */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Accueil</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{article.category}</span>
        </nav>

        {/* Image à la une */}
        <div className="mb-8 relative rounded-2xl overflow-hidden shadow-xl aspect-video bg-muted">
          <img src={imageUrl} alt={article.title} className="w-full h-full object-cover" />
          {article.imageCredit && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs px-4 py-2 pt-8">
               © {article.imageCredit}
            </div>
          )}
        </div>

        <Badge className={`mb-4 ${CATEGORY_COLORS[article.category] || "bg-secondary"}`} variant="outline">
            {article.category}
        </Badge>

        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-foreground">{article.title}</h1>

        {/* Infos Auteur et Boutons de partage */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8 pb-8 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                <AvatarFallback>{initials}</AvatarFallback>
                <AvatarImage src={article.author?.profileImageUrl || undefined} />
            </Avatar>
            <div>
                <p className="font-semibold text-lg leading-none mb-1">{authorName}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {formatDate(article.createdAt)}</span>
                </div>
            </div>
          </div>
          
          <div className="flex gap-2">
             <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
                <Clock className="h-3 w-3"/> {getReadTime(article.content)}
             </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:-translate-y-0.5">
                        <Share2 className="h-4 w-4"/> Partager
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer">
                        Partager sur Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareOnX} className="cursor-pointer">
                        Partager sur X (Twitter)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
                        Copier le lien
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>

        {/* CORPS DE L'ARTICLE */}
        <article className="prose prose-lg dark:prose-invert max-w-none mb-16">
           <p className="text-xl text-muted-foreground font-medium mb-8 pl-4 border-l-4 border-blue-500 italic">
               {article.excerpt}
           </p>
           
           {/* Rendu intelligent du contenu */}
           <RenderArticleContent content={article.content} />
        </article>

        {/* Articles Similaires */}
        {relatedArticles.length > 0 && (
          <section className="border-t pt-12 mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"/> À lire aussi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(a => <RelatedArticleCard key={a.id} article={a} />)}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t bg-muted/30 py-8 text-center text-sm text-muted-foreground mt-12">
        <div className="max-w-7xl mx-auto px-4">
            <p className="mb-2">© {new Date().getFullYear()} Allo Sports. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}