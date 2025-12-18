import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RequireAuthor } from "@/components/auth/RequireAuthor";

import Home from "@/pages/home";
import ArticlePage from "@/pages/article";
import Dashboard from "@/pages/dashboard";
import Editor from "@/pages/editor";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/article/:id" component={ArticlePage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/dashboard">
        <RequireAuthor>
          <Dashboard />
        </RequireAuthor>
      </Route>

      <Route path="/editor">
        <RequireAuthor>
          <Editor />
        </RequireAuthor>
      </Route>

      <Route path="/editor/:id">
        <RequireAuthor>
          <Editor />
        </RequireAuthor>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
