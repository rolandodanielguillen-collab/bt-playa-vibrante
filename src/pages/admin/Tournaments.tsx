import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  registration_open: { label: 'Inscripciones Abiertas', variant: 'default' },
  registration_closed: { label: 'Inscripciones Cerradas', variant: 'outline' },
  in_progress: { label: 'En Curso', variant: 'default' },
  completed: { label: 'Finalizado', variant: 'secondary' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

export default function Tournaments() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_teams: 16,
    entry_fee: 0,
    status: 'draft' as 'draft' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled',
  });

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('tournaments').insert({
        ...data,
        created_by: user!.id,
        registration_deadline: new Date(data.registration_deadline).toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success('Torneo creado correctamente');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase.from('tournaments').update({
        ...data,
        registration_deadline: data.registration_deadline 
          ? new Date(data.registration_deadline).toISOString() 
          : undefined,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success('Torneo actualizado');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tournaments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success('Torneo eliminado');
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      start_date: '',
      end_date: '',
      registration_deadline: '',
      max_teams: 16,
      entry_fee: 0,
      status: 'draft',
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (tournament: typeof tournaments[0]) => {
    setFormData({
      title: tournament.title,
      description: tournament.description || '',
      category: tournament.category,
      location: tournament.location,
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_deadline: tournament.registration_deadline.split('T')[0],
      max_teams: tournament.max_teams,
      entry_fee: Number(tournament.entry_fee),
      status: tournament.status,
    });
    setEditingId(tournament.id);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Torneos</h2>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" /> Nuevo Torneo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Torneo' : 'Nuevo Torneo'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Título</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Categoría</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ej: Masculino A, Mixto B"
                      required
                    />
                  </div>
                  <div>
                    <Label>Ubicación</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Fecha Inicio</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Fecha Fin</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Cierre Inscripciones</Label>
                    <Input
                      type="date"
                      value={formData.registration_deadline}
                      onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Máximo de Equipos</Label>
                    <Input
                      type="number"
                      value={formData.max_teams}
                      onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Costo Inscripción (₲)</Label>
                    <Input
                      type="number"
                      value={formData.entry_fee}
                      onChange={(e) => setFormData({ ...formData, entry_fee: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Equipos</TableHead>
                <TableHead>Estado</TableHead>
                {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments?.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell className="font-medium">{tournament.title}</TableCell>
                  <TableCell>{tournament.category}</TableCell>
                  <TableCell>
                    {format(new Date(tournament.start_date), 'dd MMM', { locale: es })} - {' '}
                    {format(new Date(tournament.end_date), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>{tournament.max_teams}</TableCell>
                  <TableCell>
                    <Badge variant={statusLabels[tournament.status]?.variant || 'default'}>
                      {statusLabels[tournament.status]?.label || tournament.status}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(tournament)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('¿Eliminar este torneo?')) {
                            deleteMutation.mutate(tournament.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {(!tournaments || tournaments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay torneos registrados
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
