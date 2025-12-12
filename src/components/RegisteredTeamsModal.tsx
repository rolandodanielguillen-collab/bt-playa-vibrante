import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface RegisteredTeamsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId?: string;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending_payment: { label: 'Pendiente', variant: 'outline' },
  paid: { label: 'Pagado', variant: 'secondary' },
  confirmed: { label: 'Confirmado', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

export const RegisteredTeamsModal = ({ open, onOpenChange, tournamentId }: RegisteredTeamsModalProps) => {
  const { data: registrations, isLoading } = useQuery({
    queryKey: ['registrations-public', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          status,
          registered_at,
          team:teams (
            id,
            name,
            player1_name,
            player2_name,
            city
          ),
          tournament:tournaments (
            id,
            category
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('registered_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!tournamentId,
  });

  // Agrupar por categoría del torneo
  const tournamentCategory = registrations?.[0]?.tournament?.category || 'Sin categoría';
  
  // Separar por estado
  const confirmedTeams = registrations?.filter(r => r.status === 'confirmed' || r.status === 'paid') || [];
  const pendingTeams = registrations?.filter(r => r.status === 'pending_payment') || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Parejas Inscriptas
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Cargando inscripciones...
          </div>
        ) : registrations && registrations.length > 0 ? (
          <div className="space-y-6">
            {/* Categoría del torneo */}
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {tournamentCategory}
              </Badge>
            </div>

            {/* Parejas confirmadas/pagadas */}
            {confirmedTeams.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3 text-primary border-b pb-2 flex items-center gap-2">
                  Parejas Confirmadas
                  <Badge variant="default">{confirmedTeams.length}</Badge>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-primary/10">
                        <th className="border border-border p-3 text-left font-bold w-12">#</th>
                        <th className="border border-border p-3 text-left font-bold">Jugador 1</th>
                        <th className="border border-border p-3 text-left font-bold">Jugador 2</th>
                        <th className="border border-border p-3 text-left font-bold">Ciudad</th>
                        <th className="border border-border p-3 text-left font-bold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedTeams.map((reg, index) => (
                        <tr 
                          key={reg.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="border border-border p-3 font-semibold text-primary">
                            {index + 1}
                          </td>
                          <td className="border border-border p-3">
                            {reg.team?.player1_name}
                          </td>
                          <td className="border border-border p-3">
                            {reg.team?.player2_name}
                          </td>
                          <td className="border border-border p-3 text-sm">
                            {reg.team?.city || '-'}
                          </td>
                          <td className="border border-border p-3">
                            <Badge variant={statusLabels[reg.status]?.variant || 'outline'}>
                              {statusLabels[reg.status]?.label || reg.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Parejas pendientes de pago */}
            {pendingTeams.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3 text-muted-foreground border-b pb-2 flex items-center gap-2">
                  Pendientes de Pago
                  <Badge variant="outline">{pendingTeams.length}</Badge>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left font-bold w-12">#</th>
                        <th className="border border-border p-3 text-left font-bold">Jugador 1</th>
                        <th className="border border-border p-3 text-left font-bold">Jugador 2</th>
                        <th className="border border-border p-3 text-left font-bold">Ciudad</th>
                        <th className="border border-border p-3 text-left font-bold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTeams.map((reg, index) => (
                        <tr 
                          key={reg.id}
                          className="hover:bg-muted/50 transition-colors opacity-70"
                        >
                          <td className="border border-border p-3 font-semibold text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="border border-border p-3">
                            {reg.team?.player1_name}
                          </td>
                          <td className="border border-border p-3">
                            {reg.team?.player2_name}
                          </td>
                          <td className="border border-border p-3 text-sm">
                            {reg.team?.city || '-'}
                          </td>
                          <td className="border border-border p-3">
                            <Badge variant="outline">
                              Pendiente
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No hay parejas inscriptas aún
          </div>
        )}

        <div className="text-sm text-muted-foreground mt-4 flex justify-between">
          <p><strong>Total inscriptos:</strong> {registrations?.length || 0}</p>
          <p><strong>Confirmados:</strong> {confirmedTeams.length}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
