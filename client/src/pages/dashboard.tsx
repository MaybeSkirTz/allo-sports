import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Clock,
  FileText,
  Star,
  MoreVertical,
  ArrowLeft,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ArticleWithAuthor } from "@shared/schema";

const CATEGORY_COLORS: Record<string, string> = {
  NHL: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  NBA: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  NFL: "bg-green-500/10 text-green-600 dark:text-green-400",
  Soccer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ATP: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  WTA: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  F1: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ArticleRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Skeleton className="w-20 h-14 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-8 w-8" />
    </div>
  );
}

function ArticleRow({ article, onDelete, onTogglePublish }: { 
  article: ArticleWithAuthor; 
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, published: boolean) => void;
}) {
  const categoryColor = CATEGORY_COLORS[article.category] || "bg-blue-500/10 text-blue-500";

  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {article.imageUrl ? (
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold truncate" data-testid={`text-article-title-${article.id}`}>
            {article.title}
          </h3>
          {article.featured && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
  <Badge variant="secondary" className={`text-xs ${categoryColor}`}>
    {article.category}
  </Badge>

  <span className="flex items-center gap-1">
    <Clock className="h-3 w-3" />
    {formatDate(article.createdAt)}
  </span>

  <span className="flex items-center gap-1">
    <Eye className="h-3 w-3" />
    {article.views ?? 0}
  </span>
</div>
      </div>
      
      <div className="flex items-center gap-3">
        <Badge 
          variant={article.published ? "default" : "secondary"}
          className={article.published ? "bg-green-500/10 text-green-600 dark:text-green-400" : ""}
        >
          {article.published ? "Publié" : "Brouillon"}
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-article-menu-${article.id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/article/${article.id}`} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Voir l'article
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/editor/${article.id}`} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onTogglePublish(article.id, !article.published)}
              className="flex items-center gap-2"
            >
              {article.published ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Dépublier
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Publier
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer l'article?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. L'article "{article.title}" sera définitivement supprimé.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(article.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: articles, isLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles/my"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article.",
        variant: "destructive",
      });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      await apiRequest("PATCH", `/api/articles/${id}`, { published });
    },
    onSuccess: (_, { published }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: published ? "Article publié" : "Article dépublié",
        description: published 
          ? "L'article est maintenant visible au public."
          : "L'article est maintenant en brouillon.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'article.",
        variant: "destructive",
      });
    },
  });

  const publishedCount = articles?.filter(a => a.published).length || 0;
  const draftCount = articles?.filter(a => !a.published).length || 0;

  const authorName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Auteur";
  const initials = authorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <img src="/4.png"/>
                </div>
                <h1 className="text-xl font-bold tracking-tight hidden sm:block">
                  Allo<span className="text-blue-500"> Sports</span>
                </h1>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Accueil</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 pl-3 border-l">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{authorName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-muted-foreground">Gérez vos articles et publications</p>
          </div>
          <Link href="/editor">
            <Button className="gap-2 shadow-lg" data-testid="button-new-article">
              <Plus className="h-4 w-4" />
              Nouvel article
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{articles?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total articles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{publishedCount}</p>
                  <p className="text-sm text-muted-foreground">Publiés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{draftCount}</p>
                  <p className="text-sm text-muted-foreground">Brouillons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Mes articles</CardTitle>
            <CardDescription>Liste de tous vos articles créés</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div>
                {[...Array(5)].map((_, i) => (
                  <ArticleRowSkeleton key={i} />
                ))}
              </div>
            ) : articles && articles.length > 0 ? (
              <div>
                {articles.map((article) => (
                  <ArticleRow 
                    key={article.id} 
                    article={article}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onTogglePublish={(id, published) => togglePublishMutation.mutate({ id, published })}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Aucun article</h3>
                <p className="text-muted-foreground mb-6">
                  Commencez par créer votre premier article
                </p>
                <Link href="/editor">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer un article
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
