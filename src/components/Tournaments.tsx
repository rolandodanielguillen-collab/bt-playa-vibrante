import { useState } from 'react';
import { MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import tournament1 from '@/assets/tournament-1.jpg';
import tournament2 from '@/assets/tournament-2.jpg';
import aboutCourt from '@/assets/about-court.jpg';

const Tournaments = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  const tournaments = [
    {
      id: 1,
      image: tournament1,
      title: t('tournaments.1.title'),
      date: t('tournaments.1.date'),
      location: t('tournaments.1.location'),
      category: 'amateur',
    },
    {
      id: 2,
      image: tournament2,
      title: t('tournaments.2.title'),
      date: t('tournaments.2.date'),
      location: t('tournaments.2.location'),
      category: 'mixed',
    },
    {
      id: 3,
      image: aboutCourt,
      title: t('tournaments.3.title'),
      date: t('tournaments.3.date'),
      location: t('tournaments.3.location'),
      category: 'pro',
    },
  ];

  const filteredTournaments = filter === 'all' 
    ? tournaments 
    : tournaments.filter(t => t.category === filter);

  const handleWhatsAppSignup = () => {
    const phone = '595981189807';
    const message = encodeURIComponent('¡Hola! Me gustaría inscribirme en un torneo de beach tennis.');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <section id="tournaments" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">
          {t('tournaments.title')}
        </h2>
        
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            {t('tournaments.filter.all')}
          </Button>
          <Button
            variant={filter === 'amateur' ? 'default' : 'outline'}
            onClick={() => setFilter('amateur')}
          >
            {t('tournaments.filter.amateur')}
          </Button>
          <Button
            variant={filter === 'mixed' ? 'default' : 'outline'}
            onClick={() => setFilter('mixed')}
          >
            {t('tournaments.filter.mixed')}
          </Button>
          <Button
            variant={filter === 'pro' ? 'default' : 'outline'}
            onClick={() => setFilter('pro')}
          >
            {t('tournaments.filter.pro')}
          </Button>
        </div>

        {/* Tournament Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTournaments.map((tournament) => (
            <Card key={tournament.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={tournament.image}
                  alt={tournament.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  {tournament.category}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{tournament.title}</CardTitle>
                <CardDescription className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{tournament.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{tournament.location}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" onClick={handleWhatsAppSignup}>
                  {t('tournaments.cta')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tournaments;
