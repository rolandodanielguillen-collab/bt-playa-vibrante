import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Award } from 'lucide-react';

export default function Ranking() {
  const { data: teams, isLoading } = useQuery({
    queryKey: ['ranking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('ranking_points', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-amber-50 border-amber-200';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ranking General</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teams?.slice(0, 3).map((team, index) => (
          <Card key={team.id} className={`${getRankStyle(index + 1)} border-2`}>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-2">
                {getRankIcon(index + 1)}
              </div>
              <div className="text-3xl font-bold mb-1">#{index + 1}</div>
              <h3 className="font-semibold text-lg">{team.name}</h3>
              <p className="text-sm text-muted-foreground">
                {team.player1_name} & {team.player2_name}
              </p>
              <div className="mt-4">
                <span className="text-2xl font-bold text-primary">{team.ranking_points}</span>
                <span className="text-sm text-muted-foreground ml-1">pts</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tabla Completa</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Pos.</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Jugadores</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead className="text-right">Puntos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams?.map((team, index) => (
                <TableRow key={team.id} className={index < 3 ? getRankStyle(index + 1) : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(index + 1)}
                      <span className="font-bold">{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{team.player1_name}</div>
                      <div className="text-muted-foreground">{team.player2_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{team.city || '-'}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-lg">{team.ranking_points}</span>
                  </TableCell>
                </TableRow>
              ))}
              {(!teams || teams.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay equipos en el ranking
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
