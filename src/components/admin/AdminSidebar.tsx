import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  MapPin, 
  ClipboardList, 
  CreditCard, 
  Award, 
  GitBranch,
  LogOut,
  Tag,
  UserCheck
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Torneos', url: '/admin/tournaments', icon: Trophy },
  { title: 'Categorías', url: '/admin/categories', icon: Tag },
  { title: 'Jugadores', url: '/admin/players', icon: UserCheck },
  { title: 'Equipos', url: '/admin/teams', icon: Users },
  { title: 'Canchas', url: '/admin/courts', icon: MapPin },
  { title: 'Inscripciones', url: '/admin/registrations', icon: ClipboardList },
  { title: 'Pagos', url: '/admin/payments', icon: CreditCard },
  { title: 'Ranking', url: '/admin/ranking', icon: Award },
  { title: 'Llaves', url: '/admin/brackets', icon: GitBranch },
];

export function AdminSidebar() {
  const { signOut, user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          {!collapsed && <span className="font-bold text-lg">BT Admin</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent"
                      activeClassName="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {!collapsed && user && (
          <p className="text-xs text-muted-foreground mb-2 truncate">{user.email}</p>
        )}
        <Button 
          variant="outline" 
          size={collapsed ? "icon" : "default"}
          onClick={signOut}
          className="w-full"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Cerrar Sesión</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
