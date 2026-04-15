import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileDown, Mail, Eye } from "lucide-react";
import { generateDevisPdf, type DevisPdfData } from "@/utils/generateDevisPdf";

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

interface DevisRow {
  id: string;
  numero_devis: string;
  type_service: string;
  montant_ht: number;
  statut: string;
  options: any;
  id_client: string;
  created_at: string;
  clients: { nom_entreprise: string; contact_email: string } | null;
}

function buildPdfData(d: DevisRow): DevisPdfData {
  const opts = d.options || {};
  const detail = opts.detail_calcul || {};
  const totalHT = d.montant_ht;
  const totalTVA = totalHT * 0.2;
  const totalTTC = totalHT * 1.2;

  return {
    numeroDevis: d.numero_devis,
    date: new Date(d.created_at).toLocaleDateString("fr-FR"),
    clientNom: d.clients?.nom_entreprise || "—",
    clientEmail: d.clients?.contact_email || "",
    typeService: d.type_service,
    zone: opts.zone || "",
    poids: opts.poids || 0,
    nbColis: opts.nb_colis || 1,
    prixUnitaire: detail.prix_transport_unitaire || totalHT,
    optionsDetail: detail.options_detail || [],
    totalHT,
    totalTVA,
    totalTTC,
  };
}

export default function Devis() {
  const [selectedDevis, setSelectedDevis] = useState<DevisRow | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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

  const handleOpenDevis = (d: DevisRow) => {
    setSelectedDevis(d);
    setEmailTo(d.clients?.contact_email || "");

    const pdfData = buildPdfData(d);
    const dataUri = generateDevisPdf(pdfData, { download: false });
    setPdfUrl(dataUri);
  };

  const handleClose = () => {
    setPdfUrl(null);
    setSelectedDevis(null);
  };

  const handleDownload = () => {
    if (!selectedDevis) return;
    const pdfData = buildPdfData(selectedDevis);
    generateDevisPdf(pdfData, { download: true });
  };

  const handleSendEmail = () => {
    if (!emailTo) {
      toast.error("Veuillez saisir une adresse email");
      return;
    }
    // mailto fallback — opens email client with subject
    const subject = encodeURIComponent(`Devis ${selectedDevis?.numero_devis} - GreenLogistics`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver ci-joint notre devis ${selectedDevis?.numero_devis}.\n\nCordialement,\nL'équipe GreenLogistics`
    );
    window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`, "_blank");

    // Also download the PDF so it can be attached
    handleDownload();
    toast.success("Email ouvert — attachez le PDF téléchargé au message");
  };

  const fmt = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

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
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devis.map((d) => (
                    <TableRow
                      key={d.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => handleOpenDevis(d)}
                    >
                      <TableCell className="font-medium">{d.numero_devis}</TableCell>
                      <TableCell>{d.clients?.nom_entreprise || "—"}</TableCell>
                      <TableCell>{d.type_service}</TableCell>
                      <TableCell>{fmt(d.montant_ht)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(d.statut)}>{d.statut}</Badge>
                      </TableCell>
                      <TableCell>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Devis detail dialog */}
      <Dialog open={!!selectedDevis} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Devis {selectedDevis?.numero_devis}
              {selectedDevis && (
                <Badge variant={statusVariant(selectedDevis.statut)} className="ml-2">
                  {selectedDevis.statut}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* PDF Preview */}
          <div className="flex-1 min-h-0 border rounded-lg overflow-hidden bg-muted/30">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-[500px]" title="Aperçu du devis" />
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                Chargement...
              </div>
            )}
          </div>

          {/* Email section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="email-to">Envoyer par email au client</Label>
                <Input
                  id="email-to"
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="email@client.fr"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <FileDown className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
            <Button onClick={handleSendEmail} disabled={!emailTo}>
              <Mail className="h-4 w-4 mr-2" />
              Envoyer par email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
