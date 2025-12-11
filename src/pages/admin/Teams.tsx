import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Search, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function Teams() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    player1_name: '',
    player1_email: '',
    player2_name: '',
    player2_email: '',
    city: '',
    ranking_points: 0,
  });

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('ranking_points', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('teams').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipo creado');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase.from('teams').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Equipo actualizado');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      player1_name: '',
      player1_email: '',
      player2_name: '',
      player2_email: '',
      city: '',
      ranking_points: 0,
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (team: typeof teams[0]) => {
    setFormData({
      name: team.name,
      player1_name: team.player1_name,
      player1_email: team.player1_email,
      player2_name: team.player2_name,
      player2_email: team.player2_email,
      city: team.city || '',
      ranking_points: team.ranking_points,
    });
    setEditingId(team.id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredTeams = teams?.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.player1_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.player2_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Equipos / Jugadores</h2>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" /> Nuevo Equipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Equipo' : 'Nuevo Equipo'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nombre del Equipo</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Jugador 1 - Nombre</Label>
                    <Input
                      value={formData.player1_name}
                      onChange={(e) => setFormData({ ...formData, player1_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Jugador 1 - Email</Label>
                    <Input
                      type="email"
                      value={formData.player1_email}
                      onChange={(e) => setFormData({ ...formData, player1_email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Jugador 2 - Nombre</Label>
                    <Input
                      value={formData.player2_name}
                      onChange={(e) => setFormData({ ...formData, player2_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Jugador 2 - Email</Label>
                    <Input
                      type="email"
                      value={formData.player2_email}
                      onChange={(e) => setFormData({ ...formData, player2_email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ciudad</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Puntos Ranking</Label>
                    <Input
                      type="number"
                      value={formData.ranking_points}
                      onChange={(e) => setFormData({ ...formData, ranking_points: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, jugador o ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Jugadores</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead className="text-center">
                  <Trophy className="h-4 w-4 inline mr-1" /> Puntos
                </TableHead>
                {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams?.map((team, index) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{team.player1_name}</div>
                      <div>{team.player2_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{team.city || '-'}</TableCell>
                  <TableCell className="text-center font-bold">{team.ranking_points}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(team)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {(!filteredTeams || filteredTeams.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay equipos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
