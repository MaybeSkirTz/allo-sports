import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Settings, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { user } = useAuth();

  // Sécurité : Si l'utilisateur n'est pas ADMIN, on le renvoie à l'accueil
  if (!user || user.role !== "ADMIN") {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar simple */}
      <aside className="w-64 border-r bg-background hidden md:block">
        <div className="p-6">
          <h2 className="text-lg font-bold">Admin Panel</h2>
        </div>
        <nav className="px-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" /> Articles
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Users className="h-4 w-4" /> Utilisateurs
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Gestion du site</h1>
            <Link href="/create-article">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Nouvel Article
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="articles">
            <TabsList className="mb-4">
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            </TabsList>

            <TabsContent value="articles">
              <Card>
                <CardHeader>
                  <CardTitle>Tous les articles</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Ici on mettra un tableau (Table) avec la liste des articles */}
                  <p className="text-muted-foreground text-sm">Chargement de la liste...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Membres de la plateforme</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Ici on mettra la gestion des rôles */}
                  <p className="text-muted-foreground text-sm">Liste des utilisateurs...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}