import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Pendiente Pago', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Pagado', color: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default function Registrations() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [filterTournament, setFilterTournament] = useState<string>('all');

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['registrations', filterTournament],
    queryFn: async () => {
      let query = supabase
        .from('registrations')
        .select(`
          *,
          teams (id, name, player1_name, player2_name),
          tournaments (id, title, category)
        `)
        .order('registered_at', { ascending: false });

      if (filterTournament !== 'all') {
        query = query.eq('tournament_id', filterTournament);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: tournaments } = useQuery({
    queryKey: ['tournaments-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, title')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status };
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      }
      const { error } = await supabase.from('registrations').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast.success('Estado actualizado');
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inscripciones</h2>
        <Select value={filterTournament} onValueChange={setFilterTournament}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por torneo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los torneos</SelectItem>
            {tournaments?.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Jugadores</TableHead>
                <TableHead>Torneo</TableHead>
                <TableHead>Fecha Inscripción</TableHead>
                <TableHead>Estado</TableHead>
                {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations?.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">{reg.teams?.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{reg.teams?.player1_name}</div>
                      <div>{reg.teams?.player2_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reg.tournaments?.title}</div>
                      <div className="text-sm text-muted-foreground">{reg.tournaments?.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(reg.registered_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusLabels[reg.status]?.color}`}>
                      {statusLabels[reg.status]?.label || reg.status}
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Select
                        value={reg.status}
                        onValueChange={(value) => updateStatusMutation.mutate({ id: reg.id, status: value })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([value, { label }]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {(!registrations || registrations.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay inscripciones registradas
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
