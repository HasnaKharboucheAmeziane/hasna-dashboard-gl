import type { DevisPdfData } from "@/utils/generateDevisPdf";

export interface DevisRow {
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

export const getDevisStatusLabel = (statut: string) =>
  statut === "brouillon" ? "à valider" : statut;

export const buildDevisPdfData = (d: DevisRow): DevisPdfData => {
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
};
