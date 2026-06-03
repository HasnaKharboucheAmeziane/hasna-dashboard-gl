import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="shrink-0 hover:bg-accent md:hidden"
      aria-label="Ouvrir le menu"
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-4 border-b px-4 bg-card">
            <MobileMenuButton />
            <Breadcrumb />
          </header>
          <main className="flex-1 p-4 md:p-6 animate-fade-in overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
