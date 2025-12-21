import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { 
  Trophy, 
  ArrowLeft, 
  Save, 
  Eye, 
  Loader2,
  ImageIcon,
  Star,
  StarOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertArticleSchema } from "@shared/schema";
import type { ArticleWithAuthor } from "@shared/schema";
import { z } from "zod";

const CATEGORIES = ["NHL", "NBA", "NFL", "Soccer", "MLB"];

const editorSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  excerpt: z.string().min(10, "L'extrait doit contenir au moins 10 caractères"),
  content: z.string().min(50, "Le contenu doit contenir au moins 50 caractères"),
  category: z.string().min(1, "Sélectionnez une catégorie"),
  imageUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  imageCredit: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  scheduledAt: z.string().optional(),
});

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const openTwitterShare = (title: string, slug: string) => {
  const articleUrl = `${window.location.origin}/article/${slug}`;
  const tweetText = `🚀 Nouvel article : ${title}\n\nÀ lire ici 👇\n`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(articleUrl)}`;
  window.open(twitterUrl, '_blank', 'width=550,height=420');
};

type EditorForm = z.infer<typeof editorSchema>;

export default function Editor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/editor/:id");
  const articleId = params?.id;
  const isEditing = !!articleId;

  const { data: existingArticle, isLoading: isLoadingArticle } = useQuery<ArticleWithAuthor>({
    queryKey: ["/api/articles", articleId],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${articleId}`);
      if (!res.ok) throw new Error("Article not found");
      return res.json();
    },
    enabled: isEditing,
  });

  const form = useForm<EditorForm>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      category: "",
      imageUrl: "",
      imageCredit: "",
      published: false,
      featured: false,
    },
  });

  useEffect(() => {
    if (existingArticle) {
      form.reset({
        title: existingArticle.title,
        excerpt: existingArticle.excerpt,
        content: existingArticle.content,
        category: existingArticle.category,
        imageUrl: existingArticle.imageUrl || "",
        imageCredit: existingArticle.imageCredit || "",
        published: existingArticle.published || false,
        featured: existingArticle.featured || false,
      });
    }
  }, [existingArticle, form]);

const createMutation = useMutation({
    mutationFn: async (data: EditorForm) => {
      const payload = {
        ...data,
        slug: slugify(data.title),
        imageUrl: data.imageUrl || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined,
      };
      const res = await apiRequest("POST", "/api/articles", payload);
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/my"] });
      toast({ title: "Article créé", description: "Votre article a été créé avec succès." });

      if (variables.published) {
        openTwitterShare(variables.title, data.slug);
      }

      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message || "Impossible de créer l'article.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EditorForm) => {
      const payload = {
        ...data,
        slug: slugify(data.title),
        imageUrl: data.imageUrl || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined,
      };
      const res = await apiRequest("PATCH", `/api/articles/${articleId}`, payload);
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles", articleId] });
      toast({ title: "Article modifié", description: "Vos modifications ont été enregistrées." });

      if (variables.published) {
        openTwitterShare(variables.title, data.slug);
      }

      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message || "Impossible de modifier l'article.", variant: "destructive" });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: EditorForm) {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  const imageUrl = form.watch("imageUrl");

  if (isEditing && isLoadingArticle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

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
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isEditing ? "Modifier l'article" : "Nouvel article"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Modifiez les informations de votre article" 
              : "Créez un nouvel article pour votre audience"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Contenu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Un titre accrocheur pour votre article"
                              className="text-lg focus-visible:ring-blue-500"
                              {...field}
                              data-testid="input-title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Extrait</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Un court résumé de l'article (apparaît dans les aperçus)"
                              rows={3}
                              className="text-lg focus-visible:ring-blue-500"
                              {...field}
                              data-testid="input-excerpt"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contenu</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Rédigez le contenu complet de votre article ici..."
                              rows={15}
                              className="font-serif leading-relaxed focus-visible:ring-blue-500"
                              {...field}
                              data-testid="input-content"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Publication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category" className="focus-visible:ring-blue-500">
                                <SelectValue placeholder="Sélectionner une catégorie" className="focus-visible:ring-blue-500"/>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Publier
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Rendre l'article visible au public
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-published"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              {field.value ? (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                              À la une
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Mettre en avant sur la page d'accueil
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-featured"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de l'image</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://exemple.com/image.jpg"
                              className="focus-visible:ring-blue-500"
                              {...field}
                              data-testid="input-image-url"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {imageUrl ? (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={imageUrl} 
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                          <p className="text-sm">Aperçu de l'image</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <FormField
  control={form.control}
  name="imageCredit"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Crédit photo</FormLabel>
      <FormControl>
        <Input
          placeholder="Ex: Getty Images / NHL"
          className="focus-visible:ring-blue-500"
          {...field}
          data-testid="input-image-credit"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
                <Button 
                  type="submit" 
                  className="w-full gap-2 shadow-lg"
                  disabled={isSubmitting}
                  data-testid="button-save"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin blue-500" />
                      {isEditing ? "Enregistrement..." : "Création..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditing ? "Enregistrer" : "Créer l'article"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}