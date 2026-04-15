import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calculator, Save, Package, MapPin, Weight, Settings, CheckCircle2 } from "lucide-react";
import { generateDevisPdf } from "@/utils/generateDevisPdf";

const TVA_RATE = 0.20;

interface Tarif {
  id: string;
  type_service: string;
  montant_ht: number;
  options: {
    zone?: string;
    poids_min_kg?: string | number;
    poids_max_kg?: string | number;
    prix_par_kg_supplementaire?: string | number;
  } | null;
}

interface Option {
  id: string;
  code_option: string;
  nom_option: string;
  description: string;
  prix_ht: number;
  type_facturation: string;
}

interface Client {
  id: string;
  nom_entreprise: string;
}

export default function Simulateur() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [typeService, setTypeService] = useState("");
  const [zone, setZone] = useState("");
  const [poids, setPoids] = useState("");
  const [nbColis, setNbColis] = useState("1");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [clientId, setClientId] = useState("");
  

  const { data: tarifs } = useQuery({
    queryKey: ["tarifs-grille"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tarifs").select("*");
      if (error) throw error;
      return data as Tarif[];
    },
  });

  const { data: options } = useQuery({
    queryKey: ["options-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("options").select("*").order("nom_option");
      if (error) throw error;
      return data as Option[];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, nom_entreprise").order("nom_entreprise");
      if (error) throw error;
      return data as Client[];
    },
  });

  const services = useMemo(() => {
    if (!tarifs) return [];
    return [...new Set(tarifs.map((t) => t.type_service))].sort();
  }, [tarifs]);

  const zones = useMemo(() => {
    if (!tarifs || !typeService) return [];
    return [...new Set(tarifs.filter((t) => t.type_service === typeService).map((t) => t.options?.zone).filter(Boolean))].sort() as string[];
  }, [tarifs, typeService]);

  const selectedClient = useMemo(() => {
    if (!clientId || !clients) return null;
    return clients.find((c) => c.id === clientId) || null;
  }, [clientId, clients]);

  const selectedOptionDetails = useMemo(() => {
    if (!options || selectedOptions.length === 0) return [];
    return options.filter((o) => selectedOptions.includes(o.code_option));
  }, [options, selectedOptions]);

  const matchedTarif = useMemo(() => {
    if (!tarifs || !typeService || !zone || !poids) return null;
    const p = parseFloat(poids);
    if (isNaN(p)) return null;
    return tarifs.find((t) => {
      if (t.type_service !== typeService) return false;
      if (t.options?.zone !== zone) return false;
      const min = parseFloat(String(t.options?.poids_min_kg ?? 0));
      const max = parseFloat(String(t.options?.poids_max_kg ?? 0));
      return p >= min && p <= max;
    }) || null;
  }, [tarifs, typeService, zone, poids]);

  const calculation = useMemo(() => {
    if (!matchedTarif) return null;
    const p = parseFloat(poids);
    const colis = parseInt(nbColis) || 1;
    const basePrix = matchedTarif.montant_ht;
    const prixKgSup = parseFloat(String(matchedTarif.options?.prix_par_kg_supplementaire ?? 0));
    const poidsMin = parseFloat(String(matchedTarif.options?.poids_min_kg ?? 0));
    const kgSup = Math.max(0, p - poidsMin);
    const prixTransport = basePrix + kgSup * prixKgSup;

    let prixOptions = 0;
    const optionsDetail: { nom: string; prix: number }[] = [];
    if (options) {
      for (const opt of options) {
        if (selectedOptions.includes(opt.code_option)) {
          const multi = opt.type_facturation === "Par colis" ? colis : 1;
          const prix = opt.prix_ht * multi;
          prixOptions += prix;
          optionsDetail.push({ nom: opt.nom_option, prix });
        }
      }
    }

    const totalHT = prixTransport * colis + prixOptions;
    const totalTTC = totalHT * (1 + TVA_RATE);

    return { prixTransport, prixOptions, optionsDetail, totalHT, totalTTC, colis };
  }, [matchedTarif, poids, nbColis, selectedOptions, options]);

  const saveDevis = useMutation({
    mutationFn: async () => {
      if (!clientId) throw new Error("Sélectionnez un client");
      if (!calculation) throw new Error("Calculez d'abord le tarif");

      const { count } = await supabase.from("devis").select("*", { count: "exact", head: true });
      const num = (count || 0) + 1;
      const numero = `DEV-${String(num).padStart(4, "0")}`;

      const optionsData = {
        zone,
        poids: parseFloat(poids),
        nb_colis: parseInt(nbColis),
        options_selectionnees: selectedOptions,
        detail_calcul: {
          prix_transport_unitaire: calculation.prixTransport,
          prix_options: calculation.prixOptions,
          options_detail: calculation.optionsDetail,
        },
      };

      const { error } = await supabase.from("devis").insert({
        numero_devis: numero,
        id_client: clientId,
        type_service: typeService,
        montant_ht: calculation.totalHT,
        statut: "brouillon",
        options: optionsData,
      });
      if (error) throw error;
      return numero;
    },
    onSuccess: (numero) => {
      queryClient.invalidateQueries({ queryKey: ["devis"] });
      toast.success(`Devis ${numero} enregistré avec succès`);
      navigate("/devis");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const formatEUR = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" /> Simulateur de devis
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Calculez un tarif en temps réel et enregistrez-le en devis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" /> Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={clientId} onValueChange={(v) => { setClientId(v); }}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                  <SelectContent>
                    {clients?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nom_entreprise}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Service & Zone */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Service & Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de service</Label>
                  <Select value={typeService} onValueChange={(v) => { setTypeService(v); setZone(""); }}>
                    <SelectTrigger><SelectValue placeholder="Choisir un service" /></SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zone géographique</Label>
                  <Select value={zone} onValueChange={(v) => { setZone(v); }} disabled={!typeService}>
                    <SelectTrigger><SelectValue placeholder="Choisir une zone" /></SelectTrigger>
                    <SelectContent>
                      {zones.map((z) => (
                        <SelectItem key={z} value={z}>{z}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Poids & Colis */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Weight className="h-4 w-4" /> Poids & Quantité
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Poids total (kg)</Label>
                  <Input type="number" min="0" step="0.1" value={poids} onChange={(e) => { setPoids(e.target.value); }} placeholder="Ex: 12.5" />
                </div>
                <div className="space-y-2">
                  <Label>Nombre de colis</Label>
                  <Input type="number" min="1" value={nbColis} onChange={(e) => { setNbColis(e.target.value); }} placeholder="1" />
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Options supplémentaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options?.map((opt) => (
                    <label key={opt.code_option} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 cursor-pointer transition-colors">
                      <Checkbox
                        checked={selectedOptions.includes(opt.code_option)}
                        onCheckedChange={(checked) => {
                          setSelectedOptions((prev) =>
                            checked ? [...prev, opt.code_option] : prev.filter((o) => o !== opt.code_option)
                          );
                         
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{opt.nom_option}</span>
                          <Badge variant="outline" className="text-xs shrink-0">{formatEUR(opt.prix_ht)}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                        <p className="text-xs text-muted-foreground italic">{opt.type_facturation}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary - always visible, progressive */}
          <div className="space-y-6">
            <Card className="border-primary/30 sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progressive display of selections */}
                <div className="space-y-2 text-sm">
                  {selectedClient ? (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Client</span>
                      <span className="font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        {selectedClient.nom_entreprise}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Client</span>
                      <span className="text-xs text-muted-foreground italic">Non sélectionné</span>
                    </div>
                  )}

                  {typeService ? (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        {typeService}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Service</span>
                      <span className="text-xs text-muted-foreground italic">Non sélectionné</span>
                    </div>
                  )}

                  {zone ? (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Zone</span>
                      <span className="font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        {zone}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Zone</span>
                      <span className="text-xs text-muted-foreground italic">Non sélectionnée</span>
                    </div>
                  )}

                  {poids ? (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Poids</span>
                      <span className="font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        {poids} kg
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Poids</span>
                      <span className="text-xs text-muted-foreground italic">Non renseigné</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Colis</span>
                    <span className="font-medium">×{parseInt(nbColis) || 1}</span>
                  </div>

                  {selectedOptionDetails.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <p className="text-xs text-muted-foreground font-medium">Options sélectionnées :</p>
                      {selectedOptionDetails.map((o) => (
                        <div key={o.code_option} className="flex justify-between pl-2">
                          <span className="text-muted-foreground text-xs">{o.nom_option}</span>
                          <span className="text-xs">{formatEUR(o.prix_ht)}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <Separator />

                {/* Real-time totals */}
                {calculation ? (
                  <>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transport ({calculation.colis} colis)</span>
                        <span>{formatEUR(calculation.prixTransport * calculation.colis)}</span>
                      </div>
                      {calculation.optionsDetail.length > 0 && calculation.optionsDetail.map((o, i) => (
                        <div key={i} className="flex justify-between pl-2">
                          <span className="text-muted-foreground text-xs">{o.nom}</span>
                          <span className="text-xs">{formatEUR(o.prix)}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total HT</span>
                        <span className="text-primary">{formatEUR(calculation.totalHT)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>TVA (20%)</span>
                        <span>{formatEUR(calculation.totalTTC - calculation.totalHT)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total TTC</span>
                        <span className="text-primary">{formatEUR(calculation.totalTTC)}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-4"
                      size="lg"
                      onClick={() => saveDevis.mutate()}
                      disabled={!clientId || saveDevis.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveDevis.isPending ? "Enregistrement..." : "Valider en devis"}
                    </Button>
                    {!clientId && (
                      <p className="text-xs text-destructive text-center">Sélectionnez un client pour valider</p>
                    )}
                  </>
                ) : typeService && zone && poids ? (
                  <p className="text-sm text-destructive text-center py-2">
                    Aucun tarif trouvé pour ce poids ({poids} kg) dans cette zone. Vérifiez la tranche de poids.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Renseignez service, zone et poids pour voir le tarif
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
