import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import logo from '@/assets/logo-bt.png';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      setMobileMenuOpen(false);
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
              setMobileMenuOpen(false);
            }}
            className="hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="Beach Tennis Hernandarias" className="h-16 w-auto" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-foreground hover:text-primary transition-colors"
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => scrollToSection('tournaments')}
              className="text-foreground hover:text-primary transition-colors"
            >
              {t('nav.tournaments')}
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-foreground hover:text-primary transition-colors"
            >
              {t('nav.about')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-foreground hover:text-primary transition-colors"
            >
              {t('nav.contact')}
            </button>
            <button
              onClick={() => scrollToSection('tournaments')}
              className="text-foreground hover:text-primary transition-colors"
            >
              {t('nav.signup')}
            </button>
          </nav>

          {/* CTA, Language Selector and User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {language === 'es' ? 'PT' : 'ES'}
            </button>
            <Button onClick={() => scrollToSection('tournaments')} size="lg">
              {t('cta.signup')}
            </Button>
            
            {/* User Icon */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>
                    Mi Perfil
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Panel Admin
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/auth')}>
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => scrollToSection('tournaments')}
              className="text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              {t('nav.tournaments')}
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              {t('nav.about')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              {t('nav.contact')}
            </button>
            <button
              onClick={() => scrollToSection('tournaments')}
              className="text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              {t('nav.signup')}
            </button>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={toggleLanguage}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {language === 'es' ? 'PT' : 'ES'}
              </button>
              <Button onClick={() => scrollToSection('tournaments')} className="flex-1">
                {t('cta.signup')}
              </Button>
            </div>
            
            {/* Mobile User Menu */}
            <div className="border-t border-border pt-4 mt-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => { navigate('/perfil'); setMobileMenuOpen(false); }} className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Mi Perfil
                  </Button>
                  {isAdmin && (
                    <Button variant="outline" onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }} className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Panel Admin
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full justify-start text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <Button onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }} className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
