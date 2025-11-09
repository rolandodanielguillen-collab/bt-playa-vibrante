import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Calendar } from 'lucide-react';
import tournament1 from '@/assets/tournament-1.jpg';
import tournament2 from '@/assets/tournament-2.jpg';

type TournamentStatus = 'ongoing' | 'upcoming' | 'completed';

const Tournaments = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const tournaments: Array<{
    id: string;
    image: string;
    title: string;
    date: string;
    location: string;
    category: string;
    status: TournamentStatus;
  }> = [
    {
      id: 'torneo-apertura-2025',
      image: tournament1,
      title: t('tournaments.tournament1.title'),
      date: t('tournaments.tournament1.date'),
      location: 'Hernandarias, Paraguay',
      category: 'pro',
      status: 'ongoing'
    },
    {
      id: 'copa-verano-2025',
      image: tournament2,
      title: t('tournaments.tournament2.title'),
      date: t('tournaments.tournament2.date'),
      location: 'Hernandarias, Paraguay',
      category: 'amateur',
      status: 'upcoming'
    },
  ];

  const filteredTournaments = filter === 'all' 
    ? tournaments 
    : tournaments.filter(t => t.category === filter);

  // Agrupar por estado
  const ongoingTournaments = filteredTournaments.filter(t => t.status === 'ongoing');
  const upcomingTournaments = filteredTournaments.filter(t => t.status === 'upcoming');
  const completedTournaments = filteredTournaments.filter(t => t.status === 'completed');

  const renderTournamentCard = (tournament: typeof tournaments[0]) => (
    <Card key={tournament.id} className="overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-56 overflow-hidden">
        <img
          src={tournament.image}
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
            {tournament.date}
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
            variant={filter === 'mixed' ? 'default' : 'outline'}
            onClick={() => setFilter('mixed')}
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

        {/* Torneos en Curso */}
        {ongoingTournaments.length > 0 && (
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">{t('tournaments.ongoing')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ongoingTournaments.map(renderTournamentCard)}
            </div>
          </div>
        )}

        {/* Próximos Torneos */}
        {upcomingTournaments.length > 0 && (
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">{t('tournaments.upcoming')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingTournaments.map(renderTournamentCard)}
            </div>
          </div>
        )}

        {/* Torneos Culminados */}
        {completedTournaments.length > 0 && (
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">{t('tournaments.completed')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedTournaments.map(renderTournamentCard)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Tournaments;
