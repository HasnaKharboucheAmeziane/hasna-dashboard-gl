import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { UserGuide } from "@/components/UserGuide";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Menu, Monitor } from "lucide-react";
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
          <header className="h-14 flex items-center justify-between gap-4 border-b px-4 bg-card">
            <div className="flex items-center gap-4 min-w-0">
              <MobileMenuButton />
              <Breadcrumb />
            </div>
            <UserGuide />
          </header>
          <main className="flex-1 p-4 md:p-6 animate-fade-in overflow-x-hidden">
            {children}
            <footer className="mt-10">
              <Alert className="border-primary/20 bg-primary/5 text-primary">
                <Monitor className="h-4 w-4 !text-primary" />
                <AlertDescription>
                  Ce dashboard est optimisé pour une utilisation sur ordinateur et n'a pas vocation à être exploité en version mobile pour le moment.
                </AlertDescription>
              </Alert>
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
