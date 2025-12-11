import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, ClipboardList, CreditCard, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [tournaments, teams, registrations, payments, courts] = await Promise.all([
        supabase.from('tournaments').select('id, status', { count: 'exact' }),
        supabase.from('teams').select('id', { count: 'exact' }),
        supabase.from('registrations').select('id, status', { count: 'exact' }),
        supabase.from('payments').select('id, status, amount'),
        supabase.from('courts').select('id', { count: 'exact' }),
      ]);

      const activeTournaments = tournaments.data?.filter(t => 
        t.status === 'in_progress' || t.status === 'registration_open'
      ).length || 0;
      
      const pendingPayments = payments.data?.filter(p => p.status === 'pending').length || 0;
      const totalRevenue = payments.data?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        totalTournaments: tournaments.count || 0,
        activeTournaments,
        totalTeams: teams.count || 0,
        totalRegistrations: registrations.count || 0,
        pendingPayments,
        totalRevenue,
        totalCourts: courts.count || 0,
      };
    },
  });

  const { data: recentRegistrations } = useQuery({
    queryKey: ['recent-registrations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('registrations')
        .select(`
          id,
          status,
          registered_at,
          teams (name),
          tournaments (title)
        `)
        .order('registered_at', { ascending: false })
        .limit(5);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Torneos Activos', value: stats?.activeTournaments, icon: Trophy, color: 'text-green-600' },
    { title: 'Equipos Registrados', value: stats?.totalTeams, icon: Users, color: 'text-blue-600' },
    { title: 'Inscripciones', value: stats?.totalRegistrations, icon: ClipboardList, color: 'text-purple-600' },
    { title: 'Pagos Pendientes', value: stats?.pendingPayments, icon: CreditCard, color: 'text-orange-600' },
    { title: 'Canchas', value: stats?.totalCourts, icon: MapPin, color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              ₲ {stats?.totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">De pagos completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inscripciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRegistrations?.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{reg.teams?.name}</span>
                    <span className="text-muted-foreground"> - {reg.tournaments?.title}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    reg.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    reg.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reg.status}
                  </span>
                </div>
              ))}
              {(!recentRegistrations || recentRegistrations.length === 0) && (
                <p className="text-muted-foreground text-sm">No hay inscripciones recientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
