import { BookOpen, CheckCircle2, ChevronRight, Mail, Users, Calculator, FileText, DollarSign, LayoutDashboard, Settings, X } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
  link?: string;
}

const steps: Step[] = [
  {
    icon: LayoutDashboard,
    title: "Tableau de bord",
    description: "Obtenez une vue d'ensemble de votre activité : clients, devis en cours, chiffre d'affaires et derniers devis créés.",
    link: "/",
  },
  {
    icon: Users,
    title: "Clients",
    description: "Consultez la liste de vos clients, accédez à leur fiche détaillée et ajoutez des notes internes horodatées (appels, relances, comptes-rendus).",
    link: "/clients",
  },
  {
    icon: Calculator,
    title: "Simulateur",
    description: "Sélectionnez le type de service, la zone et le poids. Le total HT et TTC se calcule automatiquement en temps réel. Cliquez sur \"Valider en devis\" pour enregistrer.",
    link: "/simulateur",
  },
  {
    icon: FileText,
    title: "Devis",
    description: "Retrouvez tous vos devis. Les statuts \"À valider\" vous permettent d'ouvrir le détail et d'envoyer le devis par email au client.",
    link: "/devis",
  },
  {
    icon: DollarSign,
    title: "Tarifs",
    description: "Consultez la grille tarifaire par service, zone et tranche de poids. Ces tarifs alimentent automatiquement le simulateur.",
    link: "/tarifs",
  },
  {
    icon: Settings,
    title: "Administration",
    description: "Gérez les données du site : clients, devis, tarifs et options. Réservé aux utilisateurs habilités.",
    link: "/admin",
  },
];

const shortcuts: { title: string; items: string[] }[] = [
  {
    title: "Pour créer un devis rapidement",
    items: [
      "Rendez-vous dans le Simulateur",
      "Choisissez le service et la zone",
      "Indiquez le poids estimé",
      "Ajoutez les options souhaitées",
      "Cliquez sur \"Valider en devis\"",
    ],
  },
  {
    title: "Pour relancer un client",
    items: [
      "Ouvrez la fiche client",
      "Consultez l'historique des notes",
      "Ajoutez une nouvelle note horodatée",
      "Utilisez le bouton d'envoi d'email",
    ],
  },
];

export function UserGuide() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary hidden sm:inline-flex"
          aria-label="Ouvrir le guide utilisateur"
        >
          <BookOpen className="h-4 w-4" />
          <span>Guide</span>
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-0">
            Aide
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-2 border-b">
          <SheetTitle className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            Guide utilisateur
          </SheetTitle>
          <SheetDescription>
            Bienvenue dans GreenLogistics. Retrouvez ici les étapes clés pour utiliser l'application au quotidien.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Parcours commercial
            </h3>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <a
                  key={step.title}
                  href={step.link}
                  className={cn(
                    "group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent hover:border-primary/30"
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">
                        {index + 1}. {step.title}
                      </p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Actions rapides
            </h3>
            {shortcuts.map((shortcut) => (
              <div key={shortcut.title} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  {shortcut.title}
                </div>
                <ol className="space-y-1.5">
                  {shortcut.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </section>

          <section className="rounded-lg bg-primary/5 border border-primary/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Mail className="h-4 w-4" />
              Besoin d'aide ?
            </div>
            <p className="text-sm text-muted-foreground">
              Pour toute question ou suggestion, contactez l'équipe support de GreenLogistics.
            </p>
          </section>
        </div>

        <SheetClose asChild>
          <Button variant="outline" className="w-full mt-2" size="sm">
            <X className="h-4 w-4 mr-1.5" />
            Fermer le guide
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
