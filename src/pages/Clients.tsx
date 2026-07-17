import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HelpBubble } from "@/components/HelpBubble";
export default function Clients() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            Clients
            <HelpBubble title="Portefeuille clients">
              Retrouvez ici tous vos clients. <strong>Cliquez sur le nom d'une entreprise</strong> pour ouvrir sa fiche détaillée avec ses informations et ses notes internes horodatées (appels, relances, comptes-rendus).
              <br /><br />
              Pour <strong>créer un nouveau client</strong>, rendez-vous dans la section <em>Administration</em>.
            </HelpBubble>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gestion de votre portefeuille clients</p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Liste des clients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Chargement...</p>
            ) : !clients?.length ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Aucun client enregistré</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>CA Annuel</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        <Link to={`/clients/${c.id}`} className="text-primary hover:underline cursor-pointer">
                          {c.nom_entreprise}
                        </Link>
                      </TableCell>
                      <TableCell>{c.contact_email}</TableCell>
                      <TableCell>{c.type_client}</TableCell>
                      <TableCell>{(c.ca_annuel || 0).toLocaleString("fr-FR")} €</TableCell>
                      <TableCell>
                        <Badge variant={c.statut === "actif" ? "default" : "secondary"}>{c.statut}</Badge>
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
