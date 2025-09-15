import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  AlertCircle, 
  Bug,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navigation = [
  { name: 'Erros', href: '/', icon: AlertCircle },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Até a próxima!",
      });
    }
  };

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U';
    return user.user_metadata.full_name
      .split(' ')
      .map((name: string) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className={cn(
        'bg-gradient-to-b from-card to-muted/30 border-r border-border/50 backdrop-blur-sm transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Bug className="h-6 w-6 text-critical" />
              <span className="font-bold text-foreground">ErrorTracker</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon 
                  className={cn(
                    'flex-shrink-0 h-5 w-5',
                    !collapsed && 'mr-3'
                  )} 
                />
                {!collapsed && item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info and Footer */}
        <div className="p-4 border-t border-border/50 space-y-3">
          {!collapsed && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.user_metadata?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{user?.user_metadata?.username || 'username'}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            {!collapsed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            )}
            {collapsed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full p-2"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {!collapsed && (
            <p className="text-xs text-muted-foreground text-center">
              Sistema de Catalogação de Erros
            </p>
          )}
        </div>
      </div>
    </div>
  );
}