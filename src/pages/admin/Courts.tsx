import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function Courts() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    surface_type: 'sand',
    is_active: true,
  });

  const { data: courts, isLoading } = useQuery({
    queryKey: ['courts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('courts').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courts'] });
      toast.success('Cancha creada');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase.from('courts').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courts'] });
      toast.success('Cancha actualizada');
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      surface_type: 'sand',
      is_active: true,
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (court: typeof courts[0]) => {
    setFormData({
      name: court.name,
      description: court.description || '',
      location: court.location || '',
      surface_type: court.surface_type || 'sand',
      is_active: court.is_active,
    });
    setEditingId(court.id);
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

  const toggleActive = (court: typeof courts[0]) => {
    updateMutation.mutate({ id: court.id, data: { is_active: !court.is_active } });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Canchas</h2>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" /> Nueva Cancha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Cancha' : 'Nueva Cancha'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Cancha 1"
                    required
                  />
                </div>
                <div>
                  <Label>Ubicación</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej: Club Beach Tennis Asunción"
                  />
                </div>
                <div>
                  <Label>Tipo de Superficie</Label>
                  <Select
                    value={formData.surface_type}
                    onValueChange={(value) => setFormData({ ...formData, surface_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sand">Arena</SelectItem>
                      <SelectItem value="synthetic">Sintético</SelectItem>
                      <SelectItem value="grass">Césped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Activa</Label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courts?.map((court) => (
          <Card key={court.id} className={!court.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{court.name}</h3>
                </div>
                <Badge variant={court.is_active ? 'default' : 'secondary'}>
                  {court.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              {court.location && (
                <p className="text-sm text-muted-foreground mt-2">{court.location}</p>
              )}
              <p className="text-sm mt-1">
                Superficie: {court.surface_type === 'sand' ? 'Arena' : 
                             court.surface_type === 'synthetic' ? 'Sintético' : 'Césped'}
              </p>
              {court.description && (
                <p className="text-sm text-muted-foreground mt-2">{court.description}</p>
              )}
              {isAdmin && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(court)}>
                    <Edit className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(court)}
                  >
                    {court.is_active ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {(!courts || courts.length === 0) && (
          <p className="text-muted-foreground col-span-full text-center py-8">
            No hay canchas registradas
          </p>
        )}
      </div>
    </div>
  );
}
