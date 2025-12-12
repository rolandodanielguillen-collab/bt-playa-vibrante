import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, UserCheck, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';

interface RegisteredTeamsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId?: string;
}

export const RegisteredTeamsModal = ({ open, onOpenChange, tournamentId }: RegisteredTeamsModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch tournament categories from the junction table
  const { data: tournamentCategories } = useQuery({
    queryKey: ['tournament-categories-names', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      const { data, error } = await supabase
        .from('tournament_categories')
        .select(`
          category_id,
          category:categories (
            id,
            name
          )
        `)
        .eq('tournament_id', tournamentId);
      
      if (error) throw error;
      return data?.map(tc => tc.category) || [];
    },
    enabled: open && !!tournamentId,
  });

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

  // Get categories - prefer from junction table, fallback to tournament.category
  const categories = useMemo(() => {
    if (tournamentCategories && tournamentCategories.length > 0) {
      return tournamentCategories.map(c => c?.name).filter(Boolean) as string[];
    }
    // Fallback to legacy category field
    if (!registrations) return [];
    const uniqueCategories = [...new Set(registrations.map(r => r.tournament?.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [tournamentCategories, registrations]);

  // Filter registrations by selected category
  const filteredRegistrations = useMemo(() => {
    if (!registrations) return [];
    if (selectedCategory === 'all') return registrations;
    return registrations.filter(r => r.tournament?.category === selectedCategory);
  }, [registrations, selectedCategory]);

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
          <div className="space-y-4">
            {/* Category filter - shows dropdown when multiple, badge when single */}
            {categories.length > 1 ? (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center">
                <Badge variant="secondary" className="text-base px-4 py-1">
                  {categories[0] || 'Sin categoría'}
                </Badge>
              </div>
            )}

            <div className="divide-y divide-border">
              {filteredRegistrations.map((reg) => {
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
