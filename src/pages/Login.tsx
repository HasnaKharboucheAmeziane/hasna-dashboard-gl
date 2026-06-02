import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Leaf } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [authLoading, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (data.session) {
          toast({
            title: "Compte créé",
            description: "Votre compte est prêt, redirection vers le dashboard.",
          });
          navigate("/", { replace: true });
        } else {
          toast({
            title: "Compte créé",
            description: "Vérifiez votre email pour confirmer votre inscription.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      const message =
        error?.message === "User already registered"
          ? "Cet email existe déjà. Passez en mode connexion pour entrer dans le dashboard."
          : error?.message === "Invalid login credentials"
            ? "Email ou mot de passe incorrect."
            : error?.message === "Email not confirmed"
              ? "Votre email n'est pas encore confirmé. Réessayez l'inscription ou utilisez un autre compte."
              : error?.message ?? "Une erreur est survenue.";

      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">GreenLogistics</CardTitle>
            <CardDescription className="mt-1">
              {isSignUp ? "Créer un compte" : "Connectez-vous à votre espace commercial"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 border-dashed border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => {
              setEmail("hasnakharbouchepro@gmail.com");
              setPassword("Yamina1953");
            }}
          >
            Démo rapide
          </Button>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
