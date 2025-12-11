import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  FileText, 
  Trophy, 
  Users, 
  Clock,
  MessageCircle,
  ExternalLink,
  Save,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  document_number: string | null;
  birth_date: string | null;
  city: string | null;
  gender: string | null;
  whatsapp_group: string | null;
}

interface Registration {
  id: string;
  status: string;
  registered_at: string;
  tournaments: {
    id: string;
    title: string;
    start_date: string;
    location: string;
  };
  teams: {
    id: string;
    name: string;
    player1_name: string;
    player2_name: string;
  };
}

interface TournamentHistoryItem {
  id: string;
  partner_name: string | null;
  stage_reached: string;
  final_position: number | null;
  points_earned: number;
  tournaments: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    location: string;
    category: string;
  };
}

export default function Profile() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user?.id
  });

  const { data: pendingRegistrations } = useQuery({
    queryKey: ["pending-registrations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          id,
          status,
          registered_at,
          tournaments(id, title, start_date, location),
          teams(id, name, player1_name, player2_name)
        `)
        .eq("registered_by", user.id)
        .in("status", ["pending_payment", "paid"])
        .order("registered_at", { ascending: false });
      if (error) throw error;
      return data as Registration[];
    },
    enabled: !!user?.id
  });

  const { data: tournamentHistory } = useQuery({
    queryKey: ["tournament-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("tournament_history")
        .select(`
          id,
          partner_name,
          stage_reached,
          final_position,
          points_earned,
          tournaments(id, title, start_date, end_date, location, category)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TournamentHistoryItem[];
    },
    enabled: !!user?.id
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      if (!user?.id) throw new Error("No user");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          document_number: data.document_number,
          birth_date: data.birth_date,
          city: data.city,
          gender: data.gender
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil actualizado correctamente");
      setIsEditing(false);
    },
    onError: () => toast.error("Error al actualizar el perfil")
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente de Pago</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Pago Recibido</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Confirmado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStageLabel = (stage: string) => {
    const stages: Record<string, string> = {
      groups: "Fase de Grupos",
      round_of_16: "Octavos de Final",
      quarter_finals: "Cuartos de Final",
      semi_finals: "Semifinales",
      finals: "Final",
      champion: "Campeón"
    };
    return stages[stage] || stage;
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) return null;

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{profile?.full_name || "Sin nombre"}</h1>
                  <p className="text-muted-foreground">{profile?.email}</p>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant={isEditing ? "default" : "outline"} 
                      size="sm"
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? "Guardar" : "Editar Perfil"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
              <TabsTrigger value="inscriptions">Inscripciones</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="community">Comunidad</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Datos Personales</CardTitle>
                  <CardDescription>
                    {isEditing ? "Actualiza tu información personal" : "Tu información personal"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">
                        <User className="h-4 w-4 inline mr-2" />
                        Nombre Completo
                      </Label>
                      {isEditing ? (
                        <Input
                          id="full_name"
                          value={formData.full_name || ""}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm py-2">{profile?.full_name || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email
                      </Label>
                      <p className="text-sm py-2 text-muted-foreground">{profile?.email}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Teléfono
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone || ""}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm py-2">{profile?.phone || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document_number">
                        <FileText className="h-4 w-4 inline mr-2" />
                        Documento
                      </Label>
                      {isEditing ? (
                        <Input
                          id="document_number"
                          value={formData.document_number || ""}
                          onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm py-2">{profile?.document_number || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birth_date">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Fecha de Nacimiento
                      </Label>
                      {isEditing ? (
                        <Input
                          id="birth_date"
                          type="date"
                          value={formData.birth_date || ""}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm py-2">
                          {profile?.birth_date 
                            ? format(new Date(profile.birth_date), "dd/MM/yyyy") 
                            : "-"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Ciudad
                      </Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          value={formData.city || ""}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm py-2">{profile?.city || "-"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Género</Label>
                      {isEditing ? (
                        <Select
                          value={formData.gender || ""}
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="femenino">Femenino</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm py-2 capitalize">{profile?.gender || "-"}</p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSave}>Guardar Cambios</Button>
                      <Button variant="outline" onClick={() => {
                        setFormData(profile || {});
                        setIsEditing(false);
                      }}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inscriptions Tab */}
            <TabsContent value="inscriptions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Inscripciones Pendientes
                  </CardTitle>
                  <CardDescription>
                    Torneos en los que estás inscrito o pendiente de confirmación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRegistrations && pendingRegistrations.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRegistrations.map((reg) => (
                        <div key={reg.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{reg.tournaments?.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {reg.tournaments?.location}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {reg.tournaments?.start_date && format(new Date(reg.tournaments.start_date), "dd/MM/yyyy")}
                              </p>
                            </div>
                            {getStatusBadge(reg.status)}
                          </div>
                          <Separator className="my-3" />
                          <div className="text-sm">
                            <p className="font-medium">Equipo: {reg.teams?.name}</p>
                            <p className="text-muted-foreground">
                              <Users className="h-3 w-3 inline mr-1" />
                              {reg.teams?.player1_name} & {reg.teams?.player2_name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No tenés inscripciones pendientes
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Historial de Torneos
                  </CardTitle>
                  <CardDescription>
                    Todos los torneos en los que has participado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tournamentHistory && tournamentHistory.length > 0 ? (
                    <div className="space-y-4">
                      {tournamentHistory.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{item.tournaments?.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {item.tournaments?.category}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {getStageLabel(item.stage_reached)}
                            </Badge>
                          </div>
                          <Separator className="my-3" />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Partner</p>
                              <p className="font-medium">{item.partner_name || "-"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Posición</p>
                              <p className="font-medium">
                                {item.final_position ? `#${item.final_position}` : "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Puntos</p>
                              <p className="font-medium">{item.points_earned}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Fecha</p>
                              <p className="font-medium">
                                {item.tournaments?.start_date && 
                                  format(new Date(item.tournaments.start_date), "MMM yyyy", { locale: es })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Aún no has participado en ningún torneo
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comunidad
                  </CardTitle>
                  <CardDescription>
                    Únete a nuestra comunidad de Beach Tennis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-6 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <h3 className="text-lg font-semibold mb-2">Grupo de WhatsApp</h3>
                    <p className="text-muted-foreground mb-4">
                      Únete a nuestro grupo para estar al día con los torneos, 
                      encontrar partners y compartir con la comunidad.
                    </p>
                    <Button asChild className="bg-green-600 hover:bg-green-700">
                      <a 
                        href="https://chat.whatsapp.com/your-group-link" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Unirse al Grupo
                      </a>
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Buscar Partner</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        ¿Buscas compañero para el próximo torneo?
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Próximamente
                      </Button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Ranking General</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Consulta tu posición en el ranking
                      </p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/ranking")}>
                        Ver Ranking
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
