import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Category {
  id: string;
  name: string;
}

interface Player {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  document_number: string | null;
  birth_date: string | null;
  gender: string | null;
  city: string | null;
  category_id: string | null;
  ranking_points: number;
  created_at: string;
  categories?: Category | null;
}

export default function Players() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    document_number: "",
    birth_date: "",
    gender: "",
    city: "",
    category_id: "",
    ranking_points: "0"
  });

  const { data: players, isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*, categories(id, name)")
        .order("full_name");
      if (error) throw error;
      return data as Player[];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as Category[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("players").insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        document_number: data.document_number || null,
        birth_date: data.birth_date || null,
        gender: data.gender || null,
        city: data.city || null,
        category_id: data.category_id || null,
        ranking_points: parseInt(data.ranking_points) || 0
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast.success("Jugador creado exitosamente");
      resetForm();
    },
    onError: () => toast.error("Error al crear el jugador")
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("players")
        .update({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || null,
          document_number: data.document_number || null,
          birth_date: data.birth_date || null,
          gender: data.gender || null,
          city: data.city || null,
          category_id: data.category_id || null,
          ranking_points: parseInt(data.ranking_points) || 0
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast.success("Jugador actualizado exitosamente");
      resetForm();
    },
    onError: () => toast.error("Error al actualizar el jugador")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("players").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast.success("Jugador eliminado exitosamente");
    },
    onError: () => toast.error("Error al eliminar el jugador")
  });

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      document_number: "",
      birth_date: "",
      gender: "",
      city: "",
      category_id: "",
      ranking_points: "0"
    });
    setEditingPlayer(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      full_name: player.full_name,
      email: player.email,
      phone: player.phone || "",
      document_number: player.document_number || "",
      birth_date: player.birth_date || "",
      gender: player.gender || "",
      city: player.city || "",
      category_id: player.category_id || "",
      ranking_points: player.ranking_points.toString()
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlayer) {
      updateMutation.mutate({ id: editingPlayer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredPlayers = players?.filter(
    (player) =>
      player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.document_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Jugadores</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Jugador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPlayer ? "Editar Jugador" : "Nuevo Jugador"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nombre Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="document_number">Documento</Label>
                  <Input
                    id="document_number"
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Género</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category_id">Categoría</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ranking_points">Puntos Ranking</Label>
                  <Input
                    id="ranking_points"
                    type="number"
                    value={formData.ranking_points}
                    onChange={(e) => setFormData({ ...formData, ranking_points: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPlayer ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Jugadores</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar jugadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Puntos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers?.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.full_name}</TableCell>
                    <TableCell>{player.email}</TableCell>
                    <TableCell>{player.phone || "-"}</TableCell>
                    <TableCell>{player.categories?.name || "-"}</TableCell>
                    <TableCell>{player.city || "-"}</TableCell>
                    <TableCell>{player.ranking_points}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(player)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(player.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPlayers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No hay jugadores registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
