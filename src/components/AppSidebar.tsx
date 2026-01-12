import { 
  LayoutDashboard, 
  Building2, 
  User, 
  Users, 
  TrendingUp,
  Receipt,
  PiggyBank,
  FileSpreadsheet,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: LayoutDashboard,
    description: "Visão geral"
  },
  { 
    title: "Empresa", 
    url: "/empresa", 
    icon: Building2,
    description: "Finanças MEI"
  },
  { 
    title: "Pessoal", 
    url: "/pessoal", 
    icon: User,
    description: "Despesas pessoais"
  },
  { 
    title: "Clientes", 
    url: "/clientes", 
    icon: Users,
    description: "Fontes de receita"
  },
  { 
    title: "Recebimentos", 
    url: "/recebimentos", 
    icon: TrendingUp,
    description: "Entradas"
  },
  { 
    title: "Investimentos", 
    url: "/investimentos", 
    icon: PiggyBank,
    description: "Na empresa"
  },
  { 
    title: "DRE", 
    url: "/dre", 
    icon: FileSpreadsheet,
    description: "Resultado do exercício"
  },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 lg:hidden bg-card/95 backdrop-blur-sm border-b border-border h-14 flex items-center px-4">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Receipt className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-sm">Meu Financeiro</span>
        </div>
      </header>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar text-sidebar-foreground transition-transform duration-300 flex flex-col w-64",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 lg:h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Receipt className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm">Meu Financeiro</h1>
              <p className="text-xs text-sidebar-muted">Gestão MEI</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <li key={item.url}>
                  <NavLink
                    to={item.url}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground active:bg-sidebar-accent/70"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive ? "text-sidebar-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-sidebar-muted truncate">{item.description}</p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-sidebar-accent/50 rounded-lg p-3">
            <p className="text-xs text-sidebar-muted mb-2">
              Sistema de gestão financeira pessoal para MEI
            </p>
            <LogoutButton className="w-full justify-start" />
          </div>
        </div>
      </aside>
    </>
  );
}