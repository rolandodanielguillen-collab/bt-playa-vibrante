import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';

const Inscription = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.category) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }

    // WhatsApp message
    const phone = '595981189807';
    const message = encodeURIComponent(
      `*Nueva Inscripción - BT Hernandarias*\n\n` +
      `*Nombre:* ${formData.name}\n` +
      `*Email:* ${formData.email}\n` +
      `*Teléfono:* ${formData.phone}\n` +
      `*Categoría:* ${formData.category}\n` +
      `${formData.message ? `*Mensaje:* ${formData.message}` : ''}`
    );
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success('¡Redirigiendo a WhatsApp!');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: '',
      message: '',
    });
  };

  const handleWhatsAppDirect = () => {
    const phone = '595981189807';
    const message = encodeURIComponent('¡Hola! Me gustaría más información sobre inscripciones a torneos.');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <section id="inscription" className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('inscription.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('inscription.subtitle')}
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl shadow-lg border">
            <div>
              <Input
                type="text"
                placeholder={t('inscription.form.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder={t('inscription.form.email')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Input
                type="tel"
                placeholder={t('inscription.form.phone')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('inscription.form.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amateur">{t('inscription.form.category.amateur')}</SelectItem>
                  <SelectItem value="mixed">{t('inscription.form.category.mixed')}</SelectItem>
                  <SelectItem value="pro">{t('inscription.form.category.pro')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Textarea
                placeholder={t('inscription.form.message')}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
              />
            </div>

            <Button type="submit" size="lg" className="w-full text-lg">
              {t('inscription.form.submit')}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">o</p>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWhatsAppDirect}
              className="w-full border-2 border-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              {t('inscription.whatsapp')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Inscription;
