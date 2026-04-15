import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeNames: Record<string, string> = {
  "": "Tableau de bord",
  clients: "Clients",
  devis: "Devis",
  tarifs: "Tarifs",
  admin: "Administration",
};

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
        <span>Accueil</span>
      </Link>
      {pathSegments.map((segment, index) => {
        const path = "/" + pathSegments.slice(0, index + 1).join("/");
        const name = routeNames[segment] || segment;
        const isLast = index === pathSegments.length - 1;

        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="text-foreground font-medium">{name}</span>
            ) : (
              <Link to={path} className="hover:text-foreground transition-colors">
                {name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
