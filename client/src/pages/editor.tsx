import { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Loader2,
  Bold, 
  Italic, 
  Heading2, 
  Quote, 
  List,
  Youtube,   // Icône pour YouTube
  Twitter,   // Icône pour X
  Copyright  // Icône pour Crédit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ArticleWithAuthor } from "@shared/schema";

// Liste des catégories disponibles
const CATEGORIES = ["NHL", "NBA", "NFL", "Soccer", "ATP", "WTA", "F1", "MLB"];

// Schéma de validation du formulaire
const articleFormSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  excerpt: z.string().min(20, "L'extrait doit contenir au moins 20 caractères"),
  content: z.string().min(50, "Le contenu est trop court"),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
  imageUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

type ArticleFormData = z.infer<typeof articleFormSchema>;

export default function Editor() {
  const [, params] = useRoute("/editor/:id");
  const articleId = params?.id;
  const isEditing = !!articleId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  // Récupération de l'article si on est en mode édition
  const { data: article, isLoading: articleLoading } = useQuery<ArticleWithAuthor>({
    queryKey: ["/api/articles", articleId],
    enabled: isEditing && isAuthenticated,
  });

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      category: "",
      imageUrl: "",
      published: false,
      featured: false,
    },
  });

  // Remplir le formulaire quand les données de l'article arrivent
  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        imageUrl: article.imageUrl || "",
        published: article.published || false,
        featured: article.featured || false,
      });
    }
  }, [article, form]);

  // --- FONCTION D'INSERTION DE TEXTE (BARRE D'OUTILS) ---
  const insertFormat = (format: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.getValues("content");
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    let newText = "";
    
    // Logique d'insertion selon le bouton cliqué
    switch (format) {
      case "bold": 
        newText = `${before}**${selection || "texte gras"}**${after}`; 
        break;
      case "italic": 
        newText = `${before}_${selection || "texte italique"}_${after}`; 
        break;
      case "h2": 
        newText = `${before}\n## ${selection || "Sous-titre"}\n${after}`; 
        break;
      case "quote": 
        newText = `${before}\n> ${selection || "Citation"}\n${after}`; 
        break;
      case "list": 
        newText = `${before}\n- ${selection || "Élément"}${after}`; 
        break;
      case "youtube": 
        // Ajoute des sauts de ligne pour être sûr
        newText = `${before}\n\nhttps://www.youtube.com/watch?v=VIDEO_ID\n\n${after}`; 
        break;
      case "twitter": 
        newText = `${before}\n\nhttps://x.com/user/status/123456789\n\n${after}`; 
        break;
      case "credit": 
        newText = `${before} [Crédit: Source] ${after}`; 
        break;
      default: 
        return;
    }

    form.setValue("content", newText);
    
    // Remettre le focus sur la zone de texte
    setTimeout(() => textarea.focus(), 0);
  };

  // --- SAUVEGARDE ET MISE À JOUR ---
  const createMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const response = await apiRequest("POST", "/api/articles", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "Article créé", description: "Votre article a été publié avec succès." });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de créer l'article.", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const response = await apiRequest("PATCH", `/api/articles/${articleId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "Mis à jour", description: "Vos modifications sont enregistrées." });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier l'article.", variant: "destructive" });
    }
  });

  const onSubmit = (data: ArticleFormData) => {
    if (isEditing) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Loading states
  if (authLoading || (isEditing && articleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Security check
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header fixe en haut */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold hidden sm:block">
                {isEditing ? "Modifier l'article" : "Nouvel article"}
              </h1>
            </div>
            <div className="flex gap-2">
                {isEditing && article?.published && (
                    <Link href={`/article/${articleId}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" /> Voir
                        </Button>
                    </Link>
                )}
            </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-6">
                
                {/* --- BARRE D'OUTILS --- */}
                <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-lg border sticky top-0 z-10">
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("bold")} title="Gras">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("italic")} title="Italique">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("h2")} title="Sous-titre">
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("quote")} title="Citation">
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("list")} title="Liste">
                    <List className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-1" />
                  
                  {/* --- BOUTONS SPÉCIAUX --- */}
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("youtube")} title="Insérer YouTube" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Youtube className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("twitter")} title="Insérer X (Twitter)" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormat("credit")} title="Ajouter un crédit/source">
                    <Copyright className="h-4 w-4" />
                  </Button>
                </div>

                {/* Champ Titre */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                            placeholder="Titre principal" 
                            className="text-2xl font-bold border-none px-0 shadow-none focus-visible:ring-0" 
                            {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Sélecteur Catégorie */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir une catégorie" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                       </Select>
                       <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Champ Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de l'image de couverture</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Champ Extrait */}
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel>Extrait (Introduction)</FormLabel>
                       <FormControl>
                           <Textarea 
                                placeholder="Un court résumé accrocheur..." 
                                className="resize-none italic text-muted-foreground" 
                                rows={2} 
                                {...field} 
                            />
                       </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Champ Contenu Principal */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu de l'article</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Rédigez votre article ici..." 
                          className="min-h-[500px] font-serif text-lg leading-relaxed p-4 border rounded-md focus-visible:ring-1" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Options de publication */}
                <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t">
                  <FormField 
                    control={form.control} 
                    name="published" 
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Publier</FormLabel>
                            <p className="text-sm text-muted-foreground">Rendre visible aux lecteurs</p>
                        </div>
                      </FormItem>
                  )}/>
                  
                  <FormField 
                    control={form.control} 
                    name="featured" 
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>À la une</FormLabel>
                            <p className="text-sm text-muted-foreground">Afficher dans le carrousel</p>
                        </div>
                      </FormItem>
                  )}/>
                </div>

              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-4 sticky bottom-4 z-10">
              <Link href="/dashboard">
                <Button type="button" variant="outline" className="shadow-lg bg-background">Annuler</Button>
              </Link>
              <Button type="submit" disabled={isPending} className="gap-2 shadow-lg bg-blue-600 hover:bg-blue-700 text-white">
                {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isEditing ? "Enregistrer les modifications" : "Créer l'article"}
              </Button>
            </div>
            
          </form>
        </Form>
      </main>
    </div>
  );
}