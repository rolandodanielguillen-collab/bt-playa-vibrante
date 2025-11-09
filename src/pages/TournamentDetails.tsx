import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Trophy, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Inscription from '@/components/Inscription';
import tournament1 from '@/assets/tournament-1.jpg';
import tournament2 from '@/assets/tournament-2.jpg';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Tournament data (in a real app, this would come from an API)
  const tournaments = [
    {
      id: 'torneo-apertura-2025',
      image: tournament1,
      title: t('tournaments.tournament1.title'),
      date: t('tournaments.tournament1.date'),
      location: 'Hernandarias, Paraguay',
      category: 'Pro',
      court: 'Cancha Principal BT Arena',
      cost: '200.000 Gs por pareja',
      categories: [
        { name: 'Amateur', description: 'Para jugadores principiantes e intermedios' },
        { name: 'Mixto', description: 'Parejas conformadas por hombre y mujer' },
        { name: 'Pro', description: 'Para jugadores avanzados y competitivos' }
      ],
      prizes: [
        { position: 'Campeones', prize: 'Trofeo + 500.000 Gs' },
        { position: 'Vice-campeones', prize: 'Trofeo + 300.000 Gs' },
        { position: '3er lugar', prize: 'Medalla + 150.000 Gs' }
      ]
    },
    {
      id: 'copa-verano-2025',
      image: tournament2,
      title: t('tournaments.tournament2.title'),
      date: t('tournaments.tournament2.date'),
      location: 'Hernandarias, Paraguay',
      category: 'Amateur',
      court: 'Cancha Principal BT Arena',
      cost: '150.000 Gs por pareja',
      categories: [
        { name: 'Amateur', description: 'Para jugadores principiantes e intermedios' },
        { name: 'Mixto', description: 'Parejas conformadas por hombre y mujer' }
      ],
      prizes: [
        { position: 'Campeones', prize: 'Trofeo + 400.000 Gs' },
        { position: 'Vice-campeones', prize: 'Trofeo + 250.000 Gs' }
      ]
    }
  ];

  const tournament = tournaments.find(t => t.id === id);

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('tournaments.notFound')}</h1>
          <Button onClick={() => navigate('/')}>
            {t('tournaments.backHome')}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('tournaments.back')}
          </Button>

          {/* Tournament Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div>
              <img 
                src={tournament.image} 
                alt={tournament.title}
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                {tournament.title}
              </h1>
              <div className="space-y-4 text-lg">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-3 h-5 w-5 text-primary" />
                  {tournament.date}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-3 h-5 w-5 text-primary" />
                  {tournament.location}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Trophy className="mr-3 h-5 w-5 text-primary" />
                  {tournament.court}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="mr-3 h-5 w-5 text-primary" />
                  {tournament.cost}
                </div>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <Card className="p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              {t('tournaments.details.categories')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tournament.categories.map((cat, index) => (
                <div key={index} className="p-6 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-bold mb-2 text-primary">{cat.name}</h3>
                  <p className="text-muted-foreground">{cat.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Prizes Section */}
          <Card className="p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              {t('tournaments.details.prizes')}
            </h2>
            <div className="space-y-4">
              {tournament.prizes.map((prize, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg"
                >
                  <span className="text-lg font-semibold text-foreground">{prize.position}</span>
                  <span className="text-lg font-bold text-primary">{prize.prize}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Inscription Form */}
          <div id="inscription-form">
            <Inscription tournamentId={id} tournamentName={tournament.title} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TournamentDetails;
