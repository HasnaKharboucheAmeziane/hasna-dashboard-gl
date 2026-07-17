import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Users, FileText, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpBubble } from "@/components/HelpBubble";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusVariant = (statut: string) => {
  switch (statut.toLowerCase()) {
    case "accepté": return "default";
    case "en cours": return "secondary";
    case "brouillon": return "outline";
    case "refusé": return "destructive";
    default: return "secondary";
  }
};

export default function Dashboard() {
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: devis } = useQuery({
    queryKey: ["devis"],
    queryFn: async () => {
      const { data, error } = await supabase.from("devis").select("*, clients(nom_entreprise)");
      if (error) throw error;
      return data;
    },
  });

  const totalCA = clients?.reduce((sum, c) => sum + (c.ca_annuel || 0), 0) || 0;
  const totalDevis = devis?.reduce((sum, d) => sum + (d.montant_ht || 0), 0) || 0;
  const recentDevis = devis?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            Tableau de bord
            <HelpBubble title="Bienvenue 👋">
              Cette page donne une <strong>vue d'ensemble</strong> de votre activité : nombre de clients, devis en cours, chiffre d'affaires cumulé et derniers devis créés.
              <br /><br />
              Utilisez la <strong>sidebar à gauche</strong> pour naviguer entre les différentes sections (Clients, Devis, Simulateur, Tarifs, Administration).
            </HelpBubble>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble de votre activité commerciale</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Clients" value={clients?.length || 0} icon={Users} description="Total clients actifs" />
          <StatCard title="Devis" value={devis?.length || 0} icon={FileText} description="Devis en cours" />
          <StatCard title="CA Total" value={`${totalCA.toLocaleString("fr-FR")} €`} icon={TrendingUp} description="Chiffre d'affaires annuel" />
          <StatCard title="Montant Devis" value={`${totalDevis.toLocaleString("fr-FR")} €`} icon={DollarSign} description="Montant total HT" />
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Derniers devis</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDevis.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Aucun devis pour le moment</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Devis</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Montant HT</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDevis.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.numero_devis}</TableCell>
                      <TableCell>{(d.clients as any)?.nom_entreprise || "—"}</TableCell>
                      <TableCell>{d.type_service}</TableCell>
                      <TableCell>{d.montant_ht.toLocaleString("fr-FR")} €</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(d.statut)}>{d.statut}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
