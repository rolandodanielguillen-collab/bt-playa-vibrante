import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import tournament1 from '@/assets/tournament-1.jpg';

const Tournaments = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  // Fetch tournaments from database
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['registration_open', 'registration_closed', 'in_progress', 'completed'])
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Map database status to display status
  const getDisplayStatus = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'ongoing';
      case 'registration_open':
      case 'registration_closed':
        return 'upcoming';
      case 'completed':
        return 'completed';
      default:
        return 'upcoming';
    }
  };

  const filteredTournaments = filter === 'all' 
    ? tournaments 
    : tournaments.filter(t => t.category.toLowerCase() === filter);

  // Agrupar por estado
  const ongoingTournaments = filteredTournaments.filter(t => getDisplayStatus(t.status) === 'ongoing');
  const upcomingTournaments = filteredTournaments.filter(t => getDisplayStatus(t.status) === 'upcoming');
  const completedTournaments = filteredTournaments.filter(t => getDisplayStatus(t.status) === 'completed');

  const formatDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${format(start, 'd', { locale: es })} - ${format(end, 'd \'de\' MMMM, yyyy', { locale: es })}`;
  };

  const renderTournamentCard = (tournament: typeof tournaments[0]) => (
    <Card key={tournament.id} className="overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-56 overflow-hidden">
        <img
          src={tournament.image_url || tournament1}
          alt={tournament.title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-semibold uppercase text-xs">
          {tournament.category}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-4">{tournament.title}</h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            {formatDate(tournament.start_date, tournament.end_date)}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            {tournament.location}
          </div>
        </div>
        <Button 
          size="lg" 
          className="w-full"
          onClick={() => navigate(`/torneo/${tournament.id}`)}
        >
          {t('tournaments.viewDetails')}
        </Button>
      </div>
    </Card>
  );

  const renderCompletedTournamentCard = (tournament: typeof tournaments[0]) => (
    <Card key={tournament.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-32 overflow-hidden">
        <img
          src={tournament.image_url || tournament1}
          alt={tournament.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-muted text-muted-foreground px-2 py-1 rounded-full font-semibold uppercase text-[10px]">
          {tournament.category}
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-lg font-bold mb-3 line-clamp-2">{tournament.title}</h4>
        <div className="space-y-1 mb-4">
          <div className="flex items-center text-muted-foreground text-sm">
            <Calendar className="mr-1.5 h-3 w-3" />
            <span className="text-xs">{formatDate(tournament.start_date, tournament.end_date)}</span>
          </div>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="mr-1.5 h-3 w-3" />
            <span className="text-xs">{tournament.location}</span>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          className="w-full"
          onClick={() => navigate(`/torneo/${tournament.id}`)}
        >
          {t('tournaments.viewDetails')}
        </Button>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <section id="tournaments" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Cargando torneos...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tournaments" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('tournaments.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('tournaments.subtitle')}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            {t('tournaments.all')}
          </Button>
          <Button
            variant={filter === 'amateur' ? 'default' : 'outline'}
            onClick={() => setFilter('amateur')}
          >
            {t('tournaments.amateur')}
          </Button>
          <Button
            variant={filter === 'mixto' ? 'default' : 'outline'}
            onClick={() => setFilter('mixto')}
          >
            {t('tournaments.mixed')}
          </Button>
          <Button
            variant={filter === 'pro' ? 'default' : 'outline'}
            onClick={() => setFilter('pro')}
          >
            {t('tournaments.pro')}
          </Button>
        </div>

        {/* Tres columnas: En Curso, Próximos, Culminados */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna 1: Torneos en Curso */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center pb-4 border-b-2 border-primary">
              {t('tournaments.ongoing')}
            </h3>
            <div className="space-y-6">
              {ongoingTournaments.length > 0 ? (
                ongoingTournaments.map(renderTournamentCard)
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay torneos en curso
                </p>
              )}
            </div>
          </div>

          {/* Columna 2: Próximos Torneos */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center pb-4 border-b-2 border-primary">
              {t('tournaments.upcoming')}
            </h3>
            <div className="space-y-6">
              {upcomingTournaments.length > 0 ? (
                upcomingTournaments.map(renderTournamentCard)
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay próximos torneos
                </p>
              )}
            </div>
          </div>

          {/* Columna 3: Torneos Culminados */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center pb-4 border-b-2 border-primary">
              {t('tournaments.completed')}
            </h3>
            <div className="space-y-4">
              {completedTournaments.length > 0 ? (
                completedTournaments.map(renderCompletedTournamentCard)
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay torneos culminados
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tournaments;
