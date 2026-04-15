import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Tarifs() {
  const { data: tarifs, isLoading } = useQuery({
    queryKey: ["tarifs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tarifs").select("*, clients(nom_entreprise)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Tarifs</h1>
          <p className="text-muted-foreground text-sm mt-1">Grille tarifaire et conditions</p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Liste des tarifs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Chargement...</p>
            ) : !tarifs?.length ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Aucun tarif enregistré</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Montant HT</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tarifs.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.numero_devis}</TableCell>
                      <TableCell>{(t.clients as any)?.nom_entreprise || "—"}</TableCell>
                      <TableCell>{t.type_service}</TableCell>
                      <TableCell>{t.montant_ht.toLocaleString("fr-FR")} €</TableCell>
                      <TableCell>
                        <Badge variant={t.statut === "actif" ? "default" : "secondary"}>{t.statut}</Badge>
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
