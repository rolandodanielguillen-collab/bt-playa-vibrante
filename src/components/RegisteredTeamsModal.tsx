import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RegisteredTeamsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId?: string;
}

export const RegisteredTeamsModal = ({ open, onOpenChange, tournamentId }: RegisteredTeamsModalProps) => {
  const { data: registrations, isLoading } = useQuery({
    queryKey: ['registrations', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          status,
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
        .in('status', ['paid', 'confirmed']);
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!tournamentId,
  });

  // Agrupar por categoría
  const groupedByCategory = registrations?.reduce((acc, reg) => {
    const category = reg.tournament?.category || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(reg);
    return acc;
  }, {} as Record<string, typeof registrations>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
            {Object.entries(groupedByCategory || {}).map(([category, teams]) => (
              <div key={category}>
                <h3 className="text-lg font-bold mb-3 text-primary border-b pb-2">
                  {category}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-primary/10">
                        <th className="border border-border p-3 text-left font-bold">#</th>
                        <th className="border border-border p-3 text-left font-bold">Equipo</th>
                        <th className="border border-border p-3 text-left font-bold">Jugador 1</th>
                        <th className="border border-border p-3 text-left font-bold">Jugador 2</th>
                        <th className="border border-border p-3 text-left font-bold">Ciudad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams?.map((reg, index) => (
                        <tr 
                          key={reg.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="border border-border p-3 font-semibold text-primary">
                            {index + 1}
                          </td>
                          <td className="border border-border p-3 font-medium">
                            {reg.team?.name}
                          </td>
                          <td className="border border-border p-3 text-sm">
                            {reg.team?.player1_name}
                          </td>
                          <td className="border border-border p-3 text-sm">
                            {reg.team?.player2_name}
                          </td>
                          <td className="border border-border p-3 text-sm">
                            {reg.team?.city || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No hay parejas inscriptas aún
          </div>
        )}

        <div className="text-sm text-muted-foreground mt-4">
          <p><strong>Total de parejas:</strong> {registrations?.length || 0}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
