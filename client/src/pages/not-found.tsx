import { Link } from "wouter";
import { Trophy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                Allo<span className="text-primary">Sports</span>Hub
              </h1>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-5xl font-bold text-muted-foreground">404</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Page non trouvée</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link href="/">
            <Button className="gap-2" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} AlloSportsHub. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
