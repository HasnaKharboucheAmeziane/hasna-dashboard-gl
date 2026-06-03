import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Breadcrumb } from "@/components/Breadcrumb";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-4 border-b px-4 bg-card">
            <SidebarTrigger />
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
