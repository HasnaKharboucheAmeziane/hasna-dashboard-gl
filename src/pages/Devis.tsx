import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function Devis() {
  const { data: devis, isLoading } = useQuery({
    queryKey: ["devis"],
    queryFn: async () => {
      const { data, error } = await supabase.from("devis").select("*, clients(nom_entreprise)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Devis</h1>
          <p className="text-muted-foreground text-sm mt-1">Suivi et gestion de vos devis</p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Liste des devis</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Chargement...</p>
            ) : !devis?.length ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Aucun devis enregistré</p>
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
                  {devis.map((d) => (
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
