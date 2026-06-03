import { LayoutDashboard, Users, FileText, DollarSign, LogOut, Settings, Calculator } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Simulateur", url: "/simulateur", icon: Calculator },
  { title: "Devis", url: "/devis", icon: FileText },
  { title: "Tarifs", url: "/tarifs", icon: DollarSign },
  { title: "Administration", url: "/admin", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-5">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-sm">GL</span>
              </div>
              <span className="font-semibold text-sidebar-foreground text-lg">GreenLogistics</span>
            </div>
          )}
          {collapsed && (
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center mx-auto">
              <span className="text-sidebar-primary-foreground font-bold text-sm">GL</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-xs tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem className="mt-2">
                <SidebarMenuButton onClick={handleLogout} className="hover:bg-sidebar-accent/50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Déconnexion</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
