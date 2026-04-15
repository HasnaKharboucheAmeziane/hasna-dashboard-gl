import jsPDF from "jspdf";

export interface DevisPdfData {
  numeroDevis: string;
  date: string;
  clientNom: string;
  clientEmail: string;
  typeService: string;
  zone: string;
  poids: number;
  nbColis: number;
  prixUnitaire: number;
  optionsDetail: { nom: string; prix: number }[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
}

const GREEN = [46, 125, 50] as const;
const DARK = [33, 33, 33] as const;
const GRAY = [117, 117, 117] as const;
const LIGHT_BG = [245, 245, 245] as const;
const WHITE = [255, 255, 255] as const;

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function generateDevisPdf(data: DevisPdfData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 20;

  // ===== PAGE 1 =====

  // Header - Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...GREEN);
  doc.text("GreenLogistics", margin, y);

  // DEVIS title
  doc.setFontSize(28);
  doc.setTextColor(...DARK);
  doc.text("DEVIS", W - margin, y, { align: "right" });

  y += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("La logistique responsable", margin, y);

  // Devis number & date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(`N° ${data.numeroDevis}`, W - margin, y - 2, { align: "right" });
  y += 5;
  doc.text(`Date: ${data.date}`, W - margin, y - 2, { align: "right" });
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Validité: 30 jours", W - margin, y - 2, { align: "right" });

  // Company info
  y += 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("12 Rue de la Logistique", margin, y); y += 3.5;
  doc.text("69007 Lyon, France", margin, y); y += 3.5;
  doc.text("04 78 90 45 67", margin, y); y += 3.5;
  doc.text("commercial@greenlogistics.fr", margin, y); y += 3.5;
  doc.text("SIRET: 987 654 321 00045", margin, y);

  // Green separator line
  y += 6;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(1);
  doc.line(margin, y, W - margin, y);

  // CLIENT & FOURNISSEUR blocks
  y += 10;
  const colW = contentW / 2 - 5;

  // CLIENT
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...GREEN);
  doc.text("CLIENT", margin, y);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 1.5, margin + 30, y + 1.5);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(data.clientNom, margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(data.clientEmail, margin, y);

  // FOURNISSEUR
  const fX = margin + colW + 10;
  let fY = y - 13;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...GREEN);
  doc.text("FOURNISSEUR", fX, fY);
  doc.line(fX, fY + 1.5, fX + 40, fY + 1.5);

  fY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("GreenLogistics SAS", fX, fY);
  fY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("12 Rue de la Logistique", fX, fY); fY += 4;
  doc.text("69007 Lyon", fX, fY); fY += 4;
  doc.text("commercial@greenlogistics.fr", fX, fY); fY += 4;
  doc.text("04 78 90 45 67", fX, fY);

  // Objet du devis
  y += 14;
  doc.setFillColor(245, 250, 245);
  doc.roundedRect(margin, y - 4, contentW, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(`Objet du devis : ${data.typeService} - ${data.zone}`, margin + 4, y + 3);

  // Table header
  y += 18;
  doc.setFillColor(...GREEN);
  doc.rect(margin, y - 5, contentW, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text("Description", margin + 3, y);
  doc.text("Quantité", margin + 85, y);
  doc.text("Prix unitaire", margin + 110, y);
  doc.text("Total HT", margin + contentW - 20, y);

  // Table row - Transport
  y += 8;
  doc.setFillColor(...LIGHT_BG);
  doc.rect(margin, y - 5, contentW, 14, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(`${data.typeService} - ${data.zone}`, margin + 3, y);
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`Poids: ${data.poids} kg`, margin + 3, y + 5);
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(String(data.nbColis), margin + 90, y + 2);
  doc.text(`${fmt(data.prixUnitaire)} €`, margin + 110, y + 2);
  doc.text(`${fmt(data.prixUnitaire * data.nbColis)} €`, margin + contentW - 20, y + 2);

  y += 14;

  // Options rows
  if (data.optionsDetail.length > 0) {
    for (const opt of data.optionsDetail) {
      doc.setFillColor(...WHITE);
      doc.rect(margin, y - 5, contentW, 8, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(opt.nom, margin + 3, y);
      doc.text("1", margin + 90, y);
      doc.text(`${fmt(opt.prix)} €`, margin + 110, y);
      doc.text(`${fmt(opt.prix)} €`, margin + contentW - 20, y);
      y += 8;
    }
  }

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);

  // Totals
  y += 10;
  const totX = margin + 100;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Total HT :", totX, y);
  doc.text(`${fmt(data.totalHT)} €`, W - margin, y, { align: "right" });

  y += 7;
  doc.text("TVA (20%) :", totX, y);
  doc.text(`${fmt(data.totalTVA)} €`, W - margin, y, { align: "right" });

  y += 4;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.8);
  doc.line(totX, y, W - margin, y);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...GREEN);
  doc.text("Total TTC :", totX, y);
  doc.text(`${fmt(data.totalTTC)} €`, W - margin, y, { align: "right" });

  // ===== PAGE 2 =====
  doc.addPage();
  y = 20;

  // Engagement écologique box
  doc.setFillColor(240, 248, 240);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentW, 42, 3, 3, "FD");

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...GREEN);
  doc.text("Notre engagement écologique", margin + 8, y);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("100% VERT", margin + contentW - 30, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  const ecoItems = [
    "Flotte 100% véhicules électriques",
    "Emballages recyclables et biodégradables",
    "Compensation carbone automatique incluse",
    "Optimisation des tournées pour réduire les km parcourus",
  ];
  for (const item of ecoItems) {
    doc.text(`✓  ${item}`, margin + 8, y);
    y += 5.5;
  }

  // Conditions générales
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text("Conditions générales", margin, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  const conditions = [
    "Validité du devis : 30 jours à compter de la date d'émission",
    "Conditions de paiement : 30 jours à réception de facture",
    "Modalités de livraison : Selon planning convenu",
    "Assurance : Tous nos envois sont assurés selon la valeur déclarée",
    "Suivi en temps réel : Accès à notre plateforme de tracking",
    "Service client : Disponible du lundi au vendredi, 8h-18h",
  ];
  for (const cond of conditions) {
    doc.text(`•  ${cond}`, margin + 4, y);
    y += 6;
  }

  // Signature boxes
  y += 12;
  const boxW = contentW / 2 - 5;
  const boxH = 35;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, boxW, boxH, 2, 2, "S");
  doc.roundedRect(margin + boxW + 10, y, boxW, boxH, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text("Signature GreenLogistics", margin + 4, y + 7);
  doc.text("Signature Client (Bon pour accord)", margin + boxW + 14, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Date : ___________", margin + 4, y + 16);
  doc.text("Signature :", margin + 4, y + 23);
  doc.text("Date : ___________", margin + boxW + 14, y + 16);
  doc.text("Signature :", margin + boxW + 14, y + 23);

  // Footer
  y = 270;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, W - margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text("GreenLogistics SAS - Capital social: 100 000€ - RCS Lyon B 987 654 321", W / 2, y, { align: "center" });
  y += 3.5;
  doc.text("TVA intracommunautaire: FR98987654321 - APE: 4941A", W / 2, y, { align: "center" });
  y += 3.5;
  doc.text("www.greenlogistics.fr - contact@greenlogistics.fr", W / 2, y, { align: "center" });

  // Download or return blob
  if (options?.download !== false) {
    doc.save(`${data.numeroDevis}.pdf`);
  }
  return doc.output("blob");
}
