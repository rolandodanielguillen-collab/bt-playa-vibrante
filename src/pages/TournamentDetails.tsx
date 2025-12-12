import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Trophy, DollarSign, Users, FileText, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage, LanguageProvider } from '@/hooks/useLanguage';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Inscription from '@/components/Inscription';
import { CategoriesModal } from '@/components/CategoriesModal';
import { RegisteredTeamsModal } from '@/components/RegisteredTeamsModal';
import { RulesModal } from '@/components/RulesModal';
import tournament1 from '@/assets/tournament-1.jpg';

const TournamentDetailsContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [registeredOpen, setRegisteredOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  // Fetch tournament from database
  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data.map(cat => ({
        name: cat.name,
        description: cat.description || ''
      }));
    },
  });

  const formatDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${format(start, 'd', { locale: es })} - ${format(end, 'd \'de\' MMMM, yyyy', { locale: es })}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' Gs';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Cargando torneo...</p>
        </div>
        <Footer />
      </div>
    );
  }

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
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
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
                src={tournament.image_url || tournament1} 
                alt={tournament.title}
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {tournament.title}
              </h1>
              <div className="space-y-4 text-base">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-3 h-5 w-5 text-primary" />
                  {formatDate(tournament.start_date, tournament.end_date)}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-3 h-5 w-5 text-primary" />
                  {tournament.location}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Trophy className="mr-3 h-5 w-5 text-primary" />
                  Categoría: {tournament.category}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="mr-3 h-5 w-5 text-primary" />
                  {formatCurrency(tournament.entry_fee)} por pareja
                </div>
              </div>
              {tournament.description && (
                <p className="mt-4 text-muted-foreground">{tournament.description}</p>
              )}
            </div>
          </div>

          {/* Tournament Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Categories Card */}
            <Card 
              className="hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
              onClick={() => setCategoriesOpen(true)}
            >
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="p-5 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{t('tournaments.details.categories')}</h3>
              </CardContent>
            </Card>

            {/* Inscriptos Card */}
            <Card 
              className="hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
              onClick={() => setRegisteredOpen(true)}
            >
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="p-5 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Inscriptos</h3>
              </CardContent>
            </Card>

            {/* Rules Card */}
            <Card 
              className="hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
              onClick={() => setRulesOpen(true)}
            >
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="p-5 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Reglamento</h3>
              </CardContent>
            </Card>

            {/* Brackets Card */}
            <Card 
              className="hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
              onClick={() => navigate(`/torneo/${id}/llaves`)}
            >
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="p-5 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                  <GitBranch className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Llaves</h3>
              </CardContent>
            </Card>
          </div>

          {/* Modals */}
          <CategoriesModal 
            open={categoriesOpen}
            onOpenChange={setCategoriesOpen}
            categories={categories}
            tournamentId={id}
          />
          <RegisteredTeamsModal 
            open={registeredOpen}
            onOpenChange={setRegisteredOpen}
            tournamentId={id}
          />
          <RulesModal 
            open={rulesOpen}
            onOpenChange={setRulesOpen}
          />

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

const TournamentDetails = () => {
  return (
    <TournamentDetailsContent />
  );
};

export default TournamentDetails;
