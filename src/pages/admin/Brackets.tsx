import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shuffle, Users, GitBranch } from 'lucide-react';

export default function Brackets() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTournament, setSelectedTournament] = useState<string>('');

  const { data: tournaments } = useQuery({
    queryKey: ['active-tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['registration_closed', 'in_progress'])
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: groups } = useQuery({
    queryKey: ['tournament-groups', selectedTournament],
    enabled: !!selectedTournament,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_teams (
            *,
            teams (id, name, player1_name, player2_name, ranking_points)
          )
        `)
        .eq('tournament_id', selectedTournament)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: registeredTeams } = useQuery({
    queryKey: ['registered-teams', selectedTournament],
    enabled: !!selectedTournament,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          teams (id, name, player1_name, player2_name, ranking_points)
        `)
        .eq('tournament_id', selectedTournament)
        .eq('status', 'confirmed');
      if (error) throw error;
      return data?.map(r => r.teams).filter(Boolean);
    },
  });

  const { data: matches } = useQuery({
    queryKey: ['tournament-matches', selectedTournament],
    enabled: !!selectedTournament,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey (name),
          team2:teams!matches_team2_id_fkey (name),
          winner:teams!matches_winner_team_id_fkey (name)
        `)
        .eq('tournament_id', selectedTournament)
        .order('match_number');
      if (error) throw error;
      return data;
    },
  });

  const generateGroupsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTournament || !registeredTeams?.length) return;

      // Sort teams by ranking
      const sortedTeams = [...registeredTeams].sort((a, b) => 
        (b?.ranking_points || 0) - (a?.ranking_points || 0)
      );

      // Determine number of groups (4 teams per group ideally)
      const numGroups = Math.ceil(sortedTeams.length / 4);
      const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, numGroups);

      // Create groups
      const groupInserts = groupNames.map((name, i) => ({
        tournament_id: selectedTournament,
        name: `Grupo ${name}`,
        display_order: i + 1,
      }));

      const { data: createdGroups, error: groupError } = await supabase
        .from('groups')
        .insert(groupInserts)
        .select();

      if (groupError) throw groupError;

      // Snake draft distribution for balanced groups
      const teamAssignments: { group_id: string; team_id: string; seed_position: number }[] = [];
      sortedTeams.forEach((team, index) => {
        const round = Math.floor(index / numGroups);
        const posInRound = index % numGroups;
        const groupIndex = round % 2 === 0 ? posInRound : numGroups - 1 - posInRound;
        
        teamAssignments.push({
          group_id: createdGroups[groupIndex].id,
          team_id: team!.id,
          seed_position: round + 1,
        });
      });

      const { error: teamError } = await supabase
        .from('group_teams')
        .insert(teamAssignments);

      if (teamError) throw teamError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-groups'] });
      toast.success('Grupos generados correctamente');
    },
    onError: (error) => toast.error(error.message),
  });

  const generateMatchesMutation = useMutation({
    mutationFn: async () => {
      if (!groups?.length) return;

      const matchInserts: any[] = [];
      let matchNumber = 1;

      // Generate group stage matches (round robin)
      for (const group of groups) {
        const teams = group.group_teams?.map(gt => gt.team_id) || [];
        
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            matchInserts.push({
              tournament_id: selectedTournament,
              group_id: group.id,
              team1_id: teams[i],
              team2_id: teams[j],
              round: 'group_stage',
              match_number: matchNumber++,
            });
          }
        }
      }

      const { error } = await supabase.from('matches').insert(matchInserts);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      toast.success('Partidos de fase de grupos generados');
    },
    onError: (error) => toast.error(error.message),
  });

  const selectedTournamentData = tournaments?.find(t => t.id === selectedTournament);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Llaves y Grupos</h2>
        <Select value={selectedTournament} onValueChange={setSelectedTournament}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleccionar torneo" />
          </SelectTrigger>
          <SelectContent>
            {tournaments?.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTournament && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipos Confirmados ({registeredTeams?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {registeredTeams?.map((team) => (
                  <Badge key={team?.id} variant="secondary" className="px-3 py-1">
                    {team?.name} ({team?.ranking_points} pts)
                  </Badge>
                ))}
                {(!registeredTeams || registeredTeams.length === 0) && (
                  <p className="text-muted-foreground">No hay equipos confirmados</p>
                )}
              </div>
              {isAdmin && registeredTeams && registeredTeams.length >= 4 && !groups?.length && (
                <Button
                  className="mt-4"
                  onClick={() => generateGroupsMutation.mutate()}
                  disabled={generateGroupsMutation.isPending}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Generar Grupos por Ranking
                </Button>
              )}
            </CardContent>
          </Card>

          {groups && groups.length > 0 && (
            <Tabs defaultValue="groups">
              <TabsList>
                <TabsTrigger value="groups">Fase de Grupos</TabsTrigger>
                <TabsTrigger value="matches">Partidos</TabsTrigger>
              </TabsList>

              <TabsContent value="groups" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {groups.map((group) => (
                    <Card key={group.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {group.group_teams
                            ?.sort((a, b) => b.points - a.points || (a.seed_position || 0) - (b.seed_position || 0))
                            .map((gt, index) => (
                              <div
                                key={gt.id}
                                className="flex justify-between items-center text-sm p-2 rounded bg-muted/50"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-muted-foreground w-4">
                                    {index + 1}
                                  </span>
                                  <span className="font-medium">{gt.teams?.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                  <span>{gt.matches_won}V-{gt.matches_lost}D</span>
                                  <span className="font-bold">{gt.points}pts</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {isAdmin && groups.length > 0 && (!matches || matches.length === 0) && (
                  <Button
                    onClick={() => generateMatchesMutation.mutate()}
                    disabled={generateMatchesMutation.isPending}
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Generar Partidos de Grupos
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="matches">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {matches?.filter(m => m.round === 'group_stage').map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">#{match.match_number}</span>
                            <div className="flex items-center gap-2">
                              <span className={match.winner_team_id === match.team1_id ? 'font-bold' : ''}>
                                {match.team1?.name || 'TBD'}
                              </span>
                              <span className="text-muted-foreground">vs</span>
                              <span className={match.winner_team_id === match.team2_id ? 'font-bold' : ''}>
                                {match.team2?.name || 'TBD'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {match.team1_score !== null && (
                              <span className="font-mono">
                                {match.team1_score} - {match.team2_score}
                              </span>
                            )}
                            <Badge variant={
                              match.status === 'completed' ? 'default' :
                              match.status === 'in_progress' ? 'secondary' : 'outline'
                            }>
                              {match.status === 'scheduled' ? 'Pendiente' :
                               match.status === 'in_progress' ? 'En Curso' :
                               match.status === 'completed' ? 'Finalizado' : match.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {(!matches || matches.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">
                          No hay partidos generados
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}

      {!selectedTournament && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Selecciona un torneo para gestionar grupos y llaves
          </CardContent>
        </Card>
      )}
    </div>
  );
}
