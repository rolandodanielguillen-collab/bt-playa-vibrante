import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, UserCheck, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RegisteredTeamsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId?: string;
}

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
            player2_name
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('registered_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!tournamentId,
  });

  const isPaid = (status: string) => status === 'confirmed' || status === 'paid';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Parejas Inscriptas
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Cargando inscripciones...
          </div>
        ) : registrations && registrations.length > 0 ? (
          <div className="divide-y divide-border">
            {registrations.map((reg) => {
              const paid = isPaid(reg.status);
              return (
                <div key={reg.id} className="py-4 grid grid-cols-2 gap-4">
                  {/* Jugador 1 */}
                  <div className="flex items-start gap-2">
                    <div className="relative">
                      <UserCheck className={`h-6 w-6 ${paid ? 'text-green-600' : 'text-gray-400'}`} />
                      {paid && (
                        <Check className="h-3 w-3 text-gray-600 absolute -right-1 -bottom-0.5" />
                      )}
                    </div>
                    <span className={`font-semibold uppercase text-sm leading-tight ${paid ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {reg.team?.player1_name}
                    </span>
                  </div>
                  
                  {/* Jugador 2 */}
                  <div className="flex items-start gap-2">
                    <div className="relative">
                      <UserCheck className={`h-6 w-6 ${paid ? 'text-green-600' : 'text-gray-400'}`} />
                      {paid && (
                        <Check className="h-3 w-3 text-gray-600 absolute -right-1 -bottom-0.5" />
                      )}
                    </div>
                    <span className={`font-semibold uppercase text-sm leading-tight ${paid ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {reg.team?.player2_name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No hay parejas inscriptas aún
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
