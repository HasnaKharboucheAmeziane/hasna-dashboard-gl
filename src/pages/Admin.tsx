import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { HelpBubble } from "@/components/HelpBubble";

type Client = Tables<"clients">;
type Devis = Tables<"devis">;
type Tarif = Tables<"tarifs">;

type ClientPayload = Pick<Client, "nom_entreprise" | "contact_email" | "type_client" | "statut" | "ca_annuel">;
type DevisPayload = Pick<Devis, "numero_devis" | "id_client" | "statut" | "montant_ht" | "type_service">;
type TarifPayload = Pick<Tarif, "numero_devis" | "id_client" | "statut" | "montant_ht" | "type_service">;

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: string;
  helper: string;
  icon: typeof Building2;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{helper}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function SiteStepCard({
  title,
  count,
  helper,
  icon: Icon,
}: {
  title: string;
  count: string;
  helper: string;
  icon: typeof Building2;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="mt-1">{helper}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{count}</div>
      </CardContent>
    </Card>
  );
}

function ClientForm({
  client,
  onSave,
  onCancel,
}: {
  client?: Client | null;
  onSave: (data: ClientPayload) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ClientPayload>({
    nom_entreprise: client?.nom_entreprise ?? "",
    contact_email: client?.contact_email ?? "",
    type_client: client?.type_client ?? "prospect",
    statut: client?.statut ?? "actif",
    ca_annuel: Number(client?.ca_annuel ?? 0),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client-name">Nom entreprise</Label>
        <Input
          id="client-name"
          value={form.nom_entreprise}
          onChange={(e) => setForm((current) => ({ ...current, nom_entreprise: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-email">Email contact</Label>
        <Input
          id="client-email"
          type="email"
          value={form.contact_email}
          onChange={(e) => setForm((current) => ({ ...current, contact_email: e.target.value }))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Type client</Label>
          <Select value={form.type_client} onValueChange={(value) => setForm((current) => ({ ...current, type_client: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="partenaire">Partenaire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={form.statut} onValueChange={(value) => setForm((current) => ({ ...current, statut: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-turnover">CA annuel (€)</Label>
        <Input
          id="client-turnover"
          type="number"
          value={form.ca_annuel}
          onChange={(e) => setForm((current) => ({ ...current, ca_annuel: Number(e.target.value) || 0 }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={() => onSave(form)}>{client ? "Modifier" : "Créer"}</Button>
      </div>
    </div>
  );
}

function DevisForm({
  devis,
  clients,
  onSave,
  onCancel,
}: {
  devis?: Devis | null;
  clients: Client[];
  onSave: (data: DevisPayload) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<DevisPayload>({
    numero_devis: devis?.numero_devis ?? "",
    id_client: devis?.id_client ?? "",
    statut: devis?.statut ?? "brouillon",
    montant_ht: Number(devis?.montant_ht ?? 0),
    type_service: devis?.type_service ?? "",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="devis-number">N° devis</Label>
        <Input
          id="devis-number"
          value={form.numero_devis}
          onChange={(e) => setForm((current) => ({ ...current, numero_devis: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Client</Label>
        <Select value={form.id_client} onValueChange={(value) => setForm((current) => ({ ...current, id_client: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.nom_entreprise}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="devis-service">Type de service</Label>
          <Input
            id="devis-service"
            value={form.type_service}
            onChange={(e) => setForm((current) => ({ ...current, type_service: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={form.statut} onValueChange={(value) => setForm((current) => ({ ...current, statut: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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
        <Label htmlFor="devis-amount">Montant HT (€)</Label>
        <Input
          id="devis-amount"
          type="number"
          value={form.montant_ht}
          onChange={(e) => setForm((current) => ({ ...current, montant_ht: Number(e.target.value) || 0 }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={() => onSave(form)}>{devis ? "Modifier" : "Créer"}</Button>
      </div>
    </div>
  );
}

function TarifForm({
  tarif,
  clients,
  onSave,
  onCancel,
}: {
  tarif?: Tarif | null;
  clients: Client[];
  onSave: (data: TarifPayload) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TarifPayload>({
    numero_devis: tarif?.numero_devis ?? "",
    id_client: tarif?.id_client ?? "",
    statut: tarif?.statut ?? "actif",
    montant_ht: Number(tarif?.montant_ht ?? 0),
    type_service: tarif?.type_service ?? "",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tarif-reference">Référence</Label>
        <Input
          id="tarif-reference"
          value={form.numero_devis}
          onChange={(e) => setForm((current) => ({ ...current, numero_devis: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Client</Label>
        <Select value={form.id_client} onValueChange={(value) => setForm((current) => ({ ...current, id_client: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.nom_entreprise}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tarif-service">Type de service</Label>
          <Input
            id="tarif-service"
            value={form.type_service}
            onChange={(e) => setForm((current) => ({ ...current, type_service: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={form.statut} onValueChange={(value) => setForm((current) => ({ ...current, statut: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tarif-amount">Montant HT (€)</Label>
        <Input
          id="tarif-amount"
          type="number"
          value={form.montant_ht}
          onChange={(e) => setForm((current) => ({ ...current, montant_ht: Number(e.target.value) || 0 }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={() => onSave(form)}>{tarif ? "Modifier" : "Créer"}</Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null);
  const [editingTarif, setEditingTarif] = useState<Tarif | null>(null);
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
      const { data, error } = await supabase.from("devis").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: tarifs = [] } = useQuery({
    queryKey: ["tarifs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tarifs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const clientNameById = useMemo(() => new Map(clients.map((client) => [client.id, client.nom_entreprise])), [clients]);
  const activeClients = clients.filter((client) => client.statut === "actif").length;
  const devisInProgress = devis.filter((item) => item.statut === "en cours").length;
  const activeTarifs = tarifs.filter((item) => item.statut === "actif").length;
  const totalRevenue = devis.reduce((sum, item) => sum + Number(item.montant_ht ?? 0), 0);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["clients"] }),
      queryClient.invalidateQueries({ queryKey: ["devis"] }),
      queryClient.invalidateQueries({ queryKey: ["tarifs"] }),
    ]);
  };

  const saveClient = useMutation({
    mutationFn: async (data: ClientPayload) => {
      if (editingClient?.id) {
        const { error } = await supabase.from("clients").update(data).eq("id", editingClient.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("clients").insert(data);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast({ title: editingClient?.id ? "Client modifié" : "Client créé" });
      await invalidateAll();
      setShowClientDialog(false);
      setEditingClient(null);
    },
    onError: (error: Error) => toast({ title: "Erreur", description: error.message, variant: "destructive" }),
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast({ title: "Client supprimé" });
      await invalidateAll();
    },
    onError: (error: Error) => toast({ title: "Erreur", description: error.message, variant: "destructive" }),
  });

  const saveDevis = useMutation({
    mutationFn: async (data: DevisPayload) => {
      if (editingDevis?.id) {
        const { error } = await supabase.from("devis").update(data).eq("id", editingDevis.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("devis").insert(data);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast({ title: editingDevis?.id ? "Devis modifié" : "Devis créé" });
      await invalidateAll();
      setShowDevisDialog(false);
      setEditingDevis(null);
    },
    onError: (error: Error) => toast({ title: "Erreur", description: error.message, variant: "destructive" }),
  });

  const deleteDevis = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("devis").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast({ title: "Devis supprimé" });
      await invalidateAll();
    },
    onError: (error: Error) => toast({ title: "Erreur", description: error.message, variant: "destructive" }),
  });

  const saveTarif = useMutation({
    mutationFn: async (data: TarifPayload) => {
      if (editingTarif?.id) {
        const { error } = await supabase.from("tarifs").update(data).eq("id", editingTarif.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("tarifs").insert(data);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast({ title: editingTarif?.id ? "Tarif modifié" : "Tarif créé" });
      await invalidateAll();
      setShowTarifDialog(false);
      setEditingTarif(null);
    },
    onError: (error: Error) => toast({ title: "Erreur", description: error.message, variant: "destructive" }),
  });

  const deleteTarif = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tarifs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast({ title: "Tarif supprimé" });
      await invalidateAll();
    },
    onError: (error: Error) => toast({ title: "Erreur", description: error.message, variant: "destructive" }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="border-border/50 bg-card">
          <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <Badge variant="secondary" className="w-fit">Administration du site</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
                  Centre de gestion GreenLogistics
                  <HelpBubble title="Espace administration" side="bottom">
                    C'est ici que vous <strong>créez, modifiez et supprimez</strong> les clients, devis et tarifs.
                    <br /><br />
                    Utilisez les <strong>onglets</strong> ci-dessous pour basculer entre les différentes ressources, et les boutons <em>« Nouveau … »</em> pour ajouter une entrée.
                  </HelpBubble>
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  Pilotez les données commerciales, surveillez les étapes clés du cycle client et intervenez rapidement sur chaque contenu métier du site.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => { setEditingClient(null); setShowClientDialog(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau client
              </Button>
              <Button variant="outline" onClick={() => { setEditingDevis(null); setShowDevisDialog(true); }}>
                <FileText className="mr-2 h-4 w-4" />
                Nouveau devis
              </Button>
              <Button variant="outline" onClick={() => { setEditingTarif(null); setShowTarifDialog(true); }}>
                <CircleDollarSign className="mr-2 h-4 w-4" />
                Nouveau tarif
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Clients actifs" value={activeClients.toString()} helper={`${clients.length} fiches clients au total`} icon={Users} />
          <MetricCard title="Devis en cours" value={devisInProgress.toString()} helper={`${devis.length} devis enregistrés`} icon={ClipboardList} />
          <MetricCard title="Tarifs actifs" value={activeTarifs.toString()} helper={`${tarifs.length} références tarifaires`} icon={Settings2} />
          <MetricCard title="Montant total devis" value={`${totalRevenue.toLocaleString("fr-FR")} €`} helper="Cumul des montants HT saisis" icon={CircleDollarSign} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SiteStepCard title="Étape 1 · Acquisition" count={`${clients.filter((client) => client.type_client === "prospect").length} prospects`} helper="Suivi des entreprises à convertir" icon={Building2} />
          <SiteStepCard title="Étape 2 · Chiffrage" count={`${devisInProgress} devis ouverts`} helper="Opportunités à finaliser ou relancer" icon={FileText} />
          <SiteStepCard title="Étape 3 · Tarification" count={`${activeTarifs} tarifs actifs`} helper="Références prêtes à l’usage commercial" icon={CircleDollarSign} />
        </div>

        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="devis">Devis</TabsTrigger>
            <TabsTrigger value="tarifs">Tarifs</TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <Card className="border-border/50">
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Gestion des clients</CardTitle>
                  <CardDescription>Créez, modifiez et nettoyez la base des comptes suivis par l’équipe commerciale.</CardDescription>
                </div>
                <Dialog open={showClientDialog} onOpenChange={(open) => { setShowClientDialog(open); if (!open) setEditingClient(null); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingClient(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingClient ? "Modifier le client" : "Nouveau client"}</DialogTitle>
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
                  <p className="py-6 text-center text-sm text-muted-foreground">Aucun client enregistré pour le moment.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entreprise</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>CA annuel</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.nom_entreprise}</TableCell>
                          <TableCell>{client.contact_email}</TableCell>
                          <TableCell>{client.type_client}</TableCell>
                          <TableCell>{Number(client.ca_annuel ?? 0).toLocaleString("fr-FR")} €</TableCell>
                          <TableCell><Badge variant={client.statut === "actif" ? "default" : "secondary"}>{client.statut}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingClient(client); setShowClientDialog(true); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteClient.mutate(client.id)}>
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

          <TabsContent value="devis">
            <Card className="border-border/50">
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Gestion des devis</CardTitle>
                  <CardDescription>Centralisez les offres commerciales et suivez leur avancement depuis l’admin.</CardDescription>
                </div>
                <Dialog open={showDevisDialog} onOpenChange={(open) => { setShowDevisDialog(open); if (!open) setEditingDevis(null); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingDevis(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau devis
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingDevis ? "Modifier le devis" : "Nouveau devis"}</DialogTitle>
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
                  <p className="py-6 text-center text-sm text-muted-foreground">Aucun devis enregistré pour le moment.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° devis</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Montant HT</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devis.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.numero_devis}</TableCell>
                          <TableCell>{clientNameById.get(item.id_client) ?? "—"}</TableCell>
                          <TableCell>{item.type_service}</TableCell>
                          <TableCell>{Number(item.montant_ht ?? 0).toLocaleString("fr-FR")} €</TableCell>
                          <TableCell><Badge variant={item.statut === "accepté" ? "default" : "secondary"}>{item.statut}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingDevis(item); setShowDevisDialog(true); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteDevis.mutate(item.id)}>
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

          <TabsContent value="tarifs">
            <Card className="border-border/50">
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Gestion des tarifs</CardTitle>
                  <CardDescription>Maintenez les références tarifaires à jour pour fiabiliser la création des propositions commerciales.</CardDescription>
                </div>
                <Dialog open={showTarifDialog} onOpenChange={(open) => { setShowTarifDialog(open); if (!open) setEditingTarif(null); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingTarif(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau tarif
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTarif ? "Modifier le tarif" : "Nouveau tarif"}</DialogTitle>
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
                  <p className="py-6 text-center text-sm text-muted-foreground">Aucun tarif enregistré pour le moment.</p>
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
                      {tarifs.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.numero_devis}</TableCell>
                          <TableCell>{clientNameById.get(item.id_client) ?? "—"}</TableCell>
                          <TableCell>{item.type_service}</TableCell>
                          <TableCell>{Number(item.montant_ht ?? 0).toLocaleString("fr-FR")} €</TableCell>
                          <TableCell><Badge variant={item.statut === "actif" ? "default" : "secondary"}>{item.statut}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingTarif(item); setShowTarifDialog(true); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTarif.mutate(item.id)}>
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
