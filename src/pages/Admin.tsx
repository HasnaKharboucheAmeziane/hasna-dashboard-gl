import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

// ─── Client Form ───
function ClientForm({ client, onSave, onCancel }: {
  client?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    nom_entreprise: client?.nom_entreprise || "",
    contact_email: client?.contact_email || "",
    type_client: client?.type_client || "prospect",
    statut: client?.statut || "actif",
    ca_annuel: client?.ca_annuel?.toString() || "0",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nom entreprise</Label>
        <Input value={form.nom_entreprise} onChange={e => setForm({ ...form, nom_entreprise: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Email contact</Label>
        <Input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type client</Label>
          <Select value={form.type_client} onValueChange={v => setForm({ ...form, type_client: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="partenaire">Partenaire</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={form.statut} onValueChange={v => setForm({ ...form, statut: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>CA Annuel (€)</Label>
        <Input type="number" value={form.ca_annuel} onChange={e => setForm({ ...form, ca_annuel: e.target.value })} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={() => onSave({ ...form, ca_annuel: parseFloat(form.ca_annuel) || 0 })}>
          {client ? "Modifier" : "Créer"}
        </Button>
      </div>
    </div>
  );
}

// ─── Devis Form ───
function DevisForm({ devis, clients, onSave, onCancel }: {
  devis?: any;
  clients: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    numero_devis: devis?.numero_devis || "",
    id_client: devis?.id_client || "",
    statut: devis?.statut || "brouillon",
    montant_ht: devis?.montant_ht?.toString() || "0",
    type_service: devis?.type_service || "",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>N° Devis</Label>
        <Input value={form.numero_devis} onChange={e => setForm({ ...form, numero_devis: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Client</Label>
        <Select value={form.id_client} onValueChange={v => setForm({ ...form, id_client: v })}>
          <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
          <SelectContent>
            {clients.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nom_entreprise}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type de service</Label>
          <Input value={form.type_service} onChange={e => setForm({ ...form, type_service: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={form.statut} onValueChange={v => setForm({ ...form, statut: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="en cours">En cours</SelectItem>
              <SelectItem value="accepté">Accepté</SelectItem>
              <SelectItem value="refusé">Refusé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Montant HT (€)</Label>
        <Input type="number" value={form.montant_ht} onChange={e => setForm({ ...form, montant_ht: e.target.value })} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={() => onSave({ ...form, montant_ht: parseFloat(form.montant_ht) || 0 })}>
          {devis ? "Modifier" : "Créer"}
        </Button>
      </div>
    </div>
  );
}

// ─── Tarif Form ───
function TarifForm({ tarif, clients, onSave, onCancel }: {
  tarif?: any;
  clients: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    numero_devis: tarif?.numero_devis || "",
    id_client: tarif?.id_client || "",
    statut: tarif?.statut || "actif",
    montant_ht: tarif?.montant_ht?.toString() || "0",
    type_service: tarif?.type_service || "",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Référence</Label>
        <Input value={form.numero_devis} onChange={e => setForm({ ...form, numero_devis: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Client</Label>
        <Select value={form.id_client} onValueChange={v => setForm({ ...form, id_client: v })}>
          <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
          <SelectContent>
            {clients.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nom_entreprise}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type de service</Label>
          <Input value={form.type_service} onChange={e => setForm({ ...form, type_service: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={form.statut} onValueChange={v => setForm({ ...form, statut: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Montant HT (€)</Label>
        <Input type="number" value={form.montant_ht} onChange={e => setForm({ ...form, montant_ht: e.target.value })} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={() => onSave({ ...form, montant_ht: parseFloat(form.montant_ht) || 0 })}>
          {tarif ? "Modifier" : "Créer"}
        </Button>
      </div>
    </div>
  );
}

// ─── Admin Page ───
export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingClient, setEditingClient] = useState<any>(null);
  const [editingDevis, setEditingDevis] = useState<any>(null);
  const [editingTarif, setEditingTarif] = useState<any>(null);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showDevisDialog, setShowDevisDialog] = useState(false);
  const [showTarifDialog, setShowTarifDialog] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: devis = [] } = useQuery({
    queryKey: ["devis"],
    queryFn: async () => {
      const { data, error } = await supabase.from("devis").select("*, clients(nom_entreprise)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: tarifs = [] } = useQuery({
    queryKey: ["tarifs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tarifs").select("*, clients(nom_entreprise)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["clients"] });
    queryClient.invalidateQueries({ queryKey: ["devis"] });
    queryClient.invalidateQueries({ queryKey: ["tarifs"] });
  };

  // ── Client mutations ──
  const saveClient = useMutation({
    mutationFn: async (data: any) => {
      if (editingClient?.id) {
        const { error } = await supabase.from("clients").update(data).eq("id", editingClient.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clients").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editingClient?.id ? "Client modifié" : "Client créé" });
      invalidateAll();
      setShowClientDialog(false);
      setEditingClient(null);
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Client supprimé" }); invalidateAll(); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  // ── Devis mutations ──
  const saveDevis = useMutation({
    mutationFn: async (data: any) => {
      if (editingDevis?.id) {
        const { error } = await supabase.from("devis").update(data).eq("id", editingDevis.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("devis").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editingDevis?.id ? "Devis modifié" : "Devis créé" });
      invalidateAll();
      setShowDevisDialog(false);
      setEditingDevis(null);
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteDevis = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("devis").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Devis supprimé" }); invalidateAll(); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  // ── Tarif mutations ──
  const saveTarif = useMutation({
    mutationFn: async (data: any) => {
      if (editingTarif?.id) {
        const { error } = await supabase.from("tarifs").update(data).eq("id", editingTarif.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tarifs").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editingTarif?.id ? "Tarif modifié" : "Tarif créé" });
      invalidateAll();
      setShowTarifDialog(false);
      setEditingTarif(null);
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteTarif = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tarifs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Tarif supprimé" }); invalidateAll(); },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Administration</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérer les clients, devis et tarifs</p>
        </div>

        <Tabs defaultValue="clients">
          <TabsList>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="devis">Devis</TabsTrigger>
            <TabsTrigger value="tarifs">Tarifs</TabsTrigger>
          </TabsList>

          {/* ── Clients Tab ── */}
          <TabsContent value="clients">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Gestion des clients</CardTitle>
                <Dialog open={showClientDialog} onOpenChange={(open) => { setShowClientDialog(open); if (!open) setEditingClient(null); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingClient(null)}>
                      <Plus className="h-4 w-4 mr-1" /> Nouveau client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingClient?.id ? "Modifier le client" : "Nouveau client"}</DialogTitle>
                    </DialogHeader>
                    <ClientForm
                      client={editingClient}
                      onSave={(data) => saveClient.mutate(data)}
                      onCancel={() => { setShowClientDialog(false); setEditingClient(null); }}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {!clients.length ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">Aucun client</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entreprise</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>CA Annuel</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.nom_entreprise}</TableCell>
                          <TableCell>{c.contact_email}</TableCell>
                          <TableCell>{c.type_client}</TableCell>
                          <TableCell>{(c.ca_annuel || 0).toLocaleString("fr-FR")} €</TableCell>
                          <TableCell><Badge variant={c.statut === "actif" ? "default" : "secondary"}>{c.statut}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingClient(c); setShowClientDialog(true); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteClient.mutate(c.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Devis Tab ── */}
          <TabsContent value="devis">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Gestion des devis</CardTitle>
                <Dialog open={showDevisDialog} onOpenChange={(open) => { setShowDevisDialog(open); if (!open) setEditingDevis(null); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingDevis(null)}>
                      <Plus className="h-4 w-4 mr-1" /> Nouveau devis
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingDevis?.id ? "Modifier le devis" : "Nouveau devis"}</DialogTitle>
                    </DialogHeader>
                    <DevisForm
                      devis={editingDevis}
                      clients={clients}
                      onSave={(data) => saveDevis.mutate(data)}
                      onCancel={() => { setShowDevisDialog(false); setEditingDevis(null); }}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {!devis.length ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">Aucun devis</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Devis</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Montant HT</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devis.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">{d.numero_devis}</TableCell>
                          <TableCell>{(d.clients as any)?.nom_entreprise || "—"}</TableCell>
                          <TableCell>{d.type_service}</TableCell>
                          <TableCell>{d.montant_ht.toLocaleString("fr-FR")} €</TableCell>
                          <TableCell><Badge variant={d.statut === "accepté" ? "default" : "secondary"}>{d.statut}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingDevis(d); setShowDevisDialog(true); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteDevis.mutate(d.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tarifs Tab ── */}
          <TabsContent value="tarifs">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Gestion des tarifs</CardTitle>
                <Dialog open={showTarifDialog} onOpenChange={(open) => { setShowTarifDialog(open); if (!open) setEditingTarif(null); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingTarif(null)}>
                      <Plus className="h-4 w-4 mr-1" /> Nouveau tarif
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTarif?.id ? "Modifier le tarif" : "Nouveau tarif"}</DialogTitle>
                    </DialogHeader>
                    <TarifForm
                      tarif={editingTarif}
                      clients={clients}
                      onSave={(data) => saveTarif.mutate(data)}
                      onCancel={() => { setShowTarifDialog(false); setEditingTarif(null); }}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {!tarifs.length ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">Aucun tarif</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Montant HT</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tarifs.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.numero_devis}</TableCell>
                          <TableCell>{(t.clients as any)?.nom_entreprise || "—"}</TableCell>
                          <TableCell>{t.type_service}</TableCell>
                          <TableCell>{t.montant_ht.toLocaleString("fr-FR")} €</TableCell>
                          <TableCell><Badge variant={t.statut === "actif" ? "default" : "secondary"}>{t.statut}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingTarif(t); setShowTarifDialog(true); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTarif.mutate(t.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
