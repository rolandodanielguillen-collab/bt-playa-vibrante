import { useState, createContext, useContext, ReactNode } from 'react';

type Language = 'es' | 'pt';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    // Header
    'nav.home': 'Inicio',
    'nav.tournaments': 'Torneos',
    'nav.about': 'Nosotros',
    'nav.contact': 'Contacto',
    'nav.signup': 'Inscripción',
    'cta.signup': 'Inscribirme al torneo',
    
    // Hero
    'hero.title': 'Vive la pasión del Beach Tennis en Hernandarias',
    'hero.subtitle': 'Torneos, clases y diversión en cada partido.',
    'hero.cta.primary': 'Inscribirme al torneo',
    'hero.cta.secondary': 'Conocer más',
    
    // Services
    'services.title': 'Lo que ofrecemos',
    'services.tournaments.title': 'Organización de torneos',
    'services.tournaments.desc': 'Compite o disfruta los mejores eventos locales y regionales.',
    'services.classes.title': 'Clases de beach tennis',
    'services.classes.desc': 'Entrena con instructores certificados, desde principiantes hasta avanzados.',
    'services.rental.title': 'Alquiler de canchas',
    'services.rental.desc': 'Reservá tu espacio y disfrutá del deporte en un ambiente único.',
    'services.cta': 'Ver próximos torneos',
    
    // About
    'about.title': 'Sobre BT Hernandarias',
    'about.text': 'BT (Beach Tennis Hernandarias) es una organización dedicada a impulsar el crecimiento del beach tennis en la región de Hernandarias, Paraguay. Ofrecemos torneos competitivos, clases para todos los niveles y alquiler de canchas para entrenamiento o recreación. Nuestra misión es fomentar la pasión por el deporte y crear una comunidad activa y alegre alrededor del beach tennis.',
    
    // Tournaments
    'tournaments.title': 'Próximos Torneos y Eventos',
    'tournaments.filter.all': 'Todos',
    'tournaments.filter.amateur': 'Amateur',
    'tournaments.filter.mixed': 'Mixto',
    'tournaments.filter.pro': 'Profesional',
    'tournaments.1.title': 'Torneo Apertura 2025',
    'tournaments.1.date': '15 de Febrero, 2025',
    'tournaments.1.location': 'Hernandarias, Paraguay',
    'tournaments.2.title': 'Copa BT Mixto',
    'tournaments.2.date': '10 de Marzo, 2025',
    'tournaments.2.location': 'Hernandarias, Paraguay',
    'tournaments.3.title': 'Campeonato Regional',
    'tournaments.3.date': '25 de Abril, 2025',
    'tournaments.3.location': 'Hernandarias, Paraguay',
    'tournaments.cta': 'Inscribirme',
    
    // Inscription
    'inscription.title': '¡Sumate al próximo torneo!',
    'inscription.subtitle': 'Completá el formulario o contactanos directamente por WhatsApp',
    'inscription.form.name': 'Nombre completo',
    'inscription.form.email': 'Email',
    'inscription.form.phone': 'Teléfono',
    'inscription.form.category': 'Categoría',
    'inscription.form.category.amateur': 'Amateur',
    'inscription.form.category.mixed': 'Mixto',
    'inscription.form.category.pro': 'Profesional',
    'inscription.form.message': 'Mensaje (opcional)',
    'inscription.form.submit': 'Enviar inscripción',
    'inscription.whatsapp': 'Contactar por WhatsApp',
    
    // Contact
    'contact.title': 'Contacto',
    'contact.info': 'Información de Contacto',
    'contact.location': 'Hernandarias, Paraguay',
    'contact.phone': '+595 981 189 807',
    'contact.email': 'info@bt.com.py',
    'contact.hours': 'Horarios de atención',
    'contact.hours.value': 'Lunes a domingo: 07:00 - 22:00',
    'contact.whatsapp': 'Contactar por WhatsApp',
    
    // Footer
    'footer.quick': 'Enlaces rápidos',
    'footer.social': 'Síguenos',
    'footer.copyright': '© 2025 BT Hernandarias. Todos los derechos reservados.',
  },
  pt: {
    // Header
    'nav.home': 'Início',
    'nav.tournaments': 'Torneios',
    'nav.about': 'Sobre Nós',
    'nav.contact': 'Contato',
    'nav.signup': 'Inscrição',
    'cta.signup': 'Inscrever-me no torneio',
    
    // Hero
    'hero.title': 'Viva a paixão do Beach Tennis em Hernandarias',
    'hero.subtitle': 'Torneios, aulas e diversão em cada partida.',
    'hero.cta.primary': 'Inscrever-me no torneio',
    'hero.cta.secondary': 'Saber mais',
    
    // Services
    'services.title': 'O que oferecemos',
    'services.tournaments.title': 'Organização de torneios',
    'services.tournaments.desc': 'Compita ou desfrute dos melhores eventos locais e regionais.',
    'services.classes.title': 'Aulas de beach tennis',
    'services.classes.desc': 'Treine com instrutores certificados, de iniciantes a avançados.',
    'services.rental.title': 'Aluguel de quadras',
    'services.rental.desc': 'Reserve seu espaço e desfrute do esporte em um ambiente único.',
    'services.cta': 'Ver próximos torneios',
    
    // About
    'about.title': 'Sobre BT Hernandarias',
    'about.text': 'BT (Beach Tennis Hernandarias) é uma organização dedicada a impulsionar o crescimento do beach tennis na região de Hernandarias, Paraguai. Oferecemos torneios competitivos, aulas para todos os níveis e aluguel de quadras para treinamento ou recreação. Nossa missão é fomentar a paixão pelo esporte e criar uma comunidade ativa e alegre em torno do beach tennis.',
    
    // Tournaments
    'tournaments.title': 'Próximos Torneios e Eventos',
    'tournaments.filter.all': 'Todos',
    'tournaments.filter.amateur': 'Amador',
    'tournaments.filter.mixed': 'Misto',
    'tournaments.filter.pro': 'Profissional',
    'tournaments.1.title': 'Torneio Abertura 2025',
    'tournaments.1.date': '15 de Fevereiro, 2025',
    'tournaments.1.location': 'Hernandarias, Paraguai',
    'tournaments.2.title': 'Copa BT Misto',
    'tournaments.2.date': '10 de Março, 2025',
    'tournaments.2.location': 'Hernandarias, Paraguai',
    'tournaments.3.title': 'Campeonato Regional',
    'tournaments.3.date': '25 de Abril, 2025',
    'tournaments.3.location': 'Hernandarias, Paraguai',
    'tournaments.cta': 'Inscrever-me',
    
    // Inscription
    'inscription.title': 'Junte-se ao próximo torneio!',
    'inscription.subtitle': 'Preencha o formulário ou entre em contato diretamente pelo WhatsApp',
    'inscription.form.name': 'Nome completo',
    'inscription.form.email': 'Email',
    'inscription.form.phone': 'Telefone',
    'inscription.form.category': 'Categoria',
    'inscription.form.category.amateur': 'Amador',
    'inscription.form.category.mixed': 'Misto',
    'inscription.form.category.pro': 'Profissional',
    'inscription.form.message': 'Mensagem (opcional)',
    'inscription.form.submit': 'Enviar inscrição',
    'inscription.whatsapp': 'Contatar pelo WhatsApp',
    
    // Contact
    'contact.title': 'Contato',
    'contact.info': 'Informação de Contato',
    'contact.location': 'Hernandarias, Paraguai',
    'contact.phone': '+595 981 189 807',
    'contact.email': 'info@bt.com.py',
    'contact.hours': 'Horários de atendimento',
    'contact.hours.value': 'Segunda a domingo: 07:00 - 22:00',
    'contact.whatsapp': 'Contatar pelo WhatsApp',
    
    // Footer
    'footer.quick': 'Links rápidos',
    'footer.social': 'Siga-nos',
    'footer.copyright': '© 2025 BT Hernandarias. Todos os direitos reservados.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'pt' : 'es'));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.es] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
