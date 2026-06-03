import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { buildDevisPdfData, getDevisStatusLabel, type DevisRow } from "@/utils/devis";
import { generateDevisPdf } from "@/utils/generateDevisPdf";

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

export default function DevisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: devis, isLoading } = useQuery({
    queryKey: ["devis", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devis")
        .select("*, clients(nom_entreprise, contact_email)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as DevisRow;
    },
    enabled: !!id,
  });

  const fmt = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  const handleSendEmail = () => {
    if (!devis?.clients?.contact_email) {
      toast.error("Aucun email client disponible");
      return;
    }

    const pdfData = buildDevisPdfData(devis);
    generateDevisPdf(pdfData, { download: true });

    const subject = encodeURIComponent(`Devis ${devis.numero_devis} - GreenLogistics`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver ci-joint notre devis ${devis.numero_devis}.\n\nCordialement,\nL'équipe GreenLogistics`
    );

    window.open(`mailto:${devis.clients.contact_email}?subject=${subject}&body=${body}`, "_blank");
    toast.success(`Email prêt pour ${devis.clients.contact_email}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Devis</h1>
          <Card><CardContent className="py-8 text-center text-muted-foreground">Chargement...</CardContent></Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!devis) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Devis introuvable</h1>
          <Button variant="outline" onClick={() => navigate("/devis")}>Retour aux devis</Button>
        </div>
      </DashboardLayout>
    );
  }

  const pdfData = buildDevisPdfData(devis);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <Button variant="ghost" className="px-0" onClick={() => navigate("/devis")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux devis
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold">Devis {devis.numero_devis}</h1>
              <Badge variant={statusVariant(devis.statut)}>{getDevisStatusLabel(devis.statut)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Client : {devis.clients?.nom_entreprise || "—"}</p>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto">
            <p className="text-sm text-muted-foreground">Email client</p>
            <p className="font-medium break-all">{devis.clients?.contact_email || "Non renseigné"}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Devis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-semibold">{pdfData.clientNom}</p>
                    <p className="text-sm">{pdfData.clientEmail || "—"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Fournisseur</p>
                    <p className="font-semibold">GreenLogistics SAS</p>
                    <p className="text-sm">commercial@greenlogistics.fr</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Objet du devis</p>
                    <p className="font-medium">{pdfData.typeService} - {pdfData.zone}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Service</p>
                      <p className="font-medium">{pdfData.typeService}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Zone</p>
                      <p className="font-medium">{pdfData.zone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Poids</p>
                      <p className="font-medium">{pdfData.poids} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Colis</p>
                      <p className="font-medium">×{pdfData.nbColis}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="hidden sm:grid sm:grid-cols-[1.6fr_0.6fr_0.8fr_0.8fr] gap-3 text-sm font-medium text-muted-foreground">
                    <div>Description</div>
                    <div>Quantité</div>
                    <div>Prix unitaire</div>
                    <div>Total HT</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-[1.6fr_0.6fr_0.8fr_0.8fr] gap-3 rounded-lg border border-border/50 bg-muted/20 p-4 text-sm">
                    <div className="col-span-2 sm:col-span-1">
                      <p className="font-medium text-foreground">{pdfData.typeService} - {pdfData.zone}</p>
                      <p className="text-muted-foreground">Poids : {pdfData.poids} kg</p>
                    </div>
                    <div><span className="sm:hidden text-muted-foreground text-xs">Qté : </span>{pdfData.nbColis}</div>
                    <div><span className="sm:hidden text-muted-foreground text-xs">PU : </span>{fmt(pdfData.prixUnitaire)}</div>
                    <div className="col-span-2 sm:col-span-1 font-medium"><span className="sm:hidden text-muted-foreground text-xs font-normal">Total HT : </span>{fmt(pdfData.prixUnitaire * pdfData.nbColis)}</div>
                  </div>

                  {pdfData.optionsDetail.length > 0 && pdfData.optionsDetail.map((option, index) => (
                    <div key={`${option.nom}-${index}`} className="grid grid-cols-2 sm:grid-cols-[1.6fr_0.6fr_0.8fr_0.8fr] gap-3 rounded-lg border border-border/50 p-4 text-sm">
                      <div className="col-span-2 sm:col-span-1 font-medium">{option.nom}</div>
                      <div><span className="sm:hidden text-muted-foreground text-xs">Qté : </span>1</div>
                      <div><span className="sm:hidden text-muted-foreground text-xs">PU : </span>{fmt(option.prix)}</div>
                      <div className="col-span-2 sm:col-span-1 font-medium"><span className="sm:hidden text-muted-foreground text-xs font-normal">Total HT : </span>{fmt(option.prix)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Totaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total HT</span>
                  <span className="font-medium">{fmt(pdfData.totalHT)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA 20%</span>
                  <span className="font-medium">{fmt(pdfData.totalTVA)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total TTC</span>
                  <span>{fmt(pdfData.totalTTC)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Envoi au client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Destinataire</p>
                  <p className="font-medium break-all">{devis.clients?.contact_email || "Non renseigné"}</p>
                </div>
                <Button className="w-full" onClick={handleSendEmail} disabled={!devis.clients?.contact_email}>
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer par email au client
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
