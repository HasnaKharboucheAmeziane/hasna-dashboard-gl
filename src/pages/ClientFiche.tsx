import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building2, Mail, Tag, TrendingUp, Clock, Plus, Phone, RefreshCw, FileText, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const noteTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  appel: { label: "Appel", icon: Phone, color: "bg-blue-500/10 text-blue-500" },
  relance: { label: "Relance", icon: RefreshCw, color: "bg-orange-500/10 text-orange-500" },
  "compte-rendu": { label: "Compte-rendu", icon: FileText, color: "bg-green-500/10 text-green-500" },
  autre: { label: "Autre", icon: MessageSquare, color: "bg-muted text-muted-foreground" },
};

export default function ClientFiche() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("appel");

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["client_notes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_notes")
        .select("*")
        .eq("client_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("client_notes").insert({
        client_id: id!,
        contenu: newNote,
        type_note: noteType,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_notes", id] });
      setNewNote("");
      toast.success("Note ajoutée");
    },
    onError: () => toast.error("Erreur lors de l'ajout de la note"),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground text-sm py-8 text-center">Chargement...</p>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground text-sm py-8 text-center">Client introuvable</p>
      </DashboardLayout>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/clients">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{client.nom_entreprise}</h1>
            <p className="text-muted-foreground text-sm">Fiche client</p>
          </div>
        </div>

        {/* Infos client */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Mail className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{client.contact_email}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Tag className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium capitalize">{client.type_client}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">CA Annuel</p>
                <p className="text-sm font-medium">{(client.ca_annuel || 0).toLocaleString("fr-FR")} €</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Statut</p>
                <Badge variant={client.statut === "actif" ? "default" : "secondary"}>{client.statut}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <p>Créé le : {formatDate(client.created_at)}</p>
          <p>Mis à jour le : {formatDate(client.updated_at)}</p>
        </div>

        {/* Notes internes */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" /> Notes internes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulaire ajout */}
            <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/30">
              <div className="flex gap-3">
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appel">📞 Appel</SelectItem>
                    <SelectItem value="relance">🔄 Relance</SelectItem>
                    <SelectItem value="compte-rendu">📄 Compte-rendu</SelectItem>
                    <SelectItem value="autre">💬 Autre</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => addNote.mutate()}
                  disabled={!newNote.trim() || addNote.isPending}
                  size="sm"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </div>
              <Textarea
                placeholder="Saisir une note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
            </div>

            {/* Liste des notes */}
            {notes.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">Aucune note pour ce client</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => {
                  const cfg = noteTypeConfig[note.type_note] || noteTypeConfig.autre;
                  const Icon = cfg.icon;
                  return (
                    <div key={note.id} className="flex gap-3 p-3 rounded-lg border border-border/50">
                      <div className={`p-2 rounded-lg shrink-0 h-fit ${cfg.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{cfg.label}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(note.created_at)}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.contenu}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
