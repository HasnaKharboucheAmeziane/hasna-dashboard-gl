import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { getDevisStatusLabel, type DevisRow } from "@/utils/devis";

const statusVariant = (statut: string) => {
  switch (statut.toLowerCase()) {
    case "accepté": return "default";
    case "en cours": return "secondary";
    case "à valider": return "outline";
    case "brouillon": return "outline";
    case "envoyé": return "secondary";
    case "refusé": return "destructive";
    default: return "secondary";
  }
};

export default function Devis() {
  const { data: devis, isLoading } = useQuery({
    queryKey: ["devis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devis")
        .select("*, clients(nom_entreprise, contact_email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DevisRow[];
    },
  });

  const fmt = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  const openDevisWindow = (id: string) => {
    window.open(`/devis/${id}`, "_blank", "noopener,noreferrer");
  };

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
                  {devis.map((d) => {
                    const statusLabel = getDevisStatusLabel(d.statut);
                    const isPendingValidation = statusLabel === "à valider";

                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.numero_devis}</TableCell>
                        <TableCell>{d.clients?.nom_entreprise || "—"}</TableCell>
                        <TableCell>{d.type_service}</TableCell>
                        <TableCell>{fmt(d.montant_ht)}</TableCell>
                        <TableCell>
                          {isPendingValidation ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDevisWindow(d.id)}
                              className="gap-2"
                            >
                              {statusLabel}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Badge variant={statusVariant(statusLabel)}>{statusLabel}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
