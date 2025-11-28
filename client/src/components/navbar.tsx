import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, User, LayoutDashboard, UserCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    return location.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getDashboardPath = () => {
    if (user?.role === "partner") return "/partner/dashboard";
    if (user?.role === "client") return "/client/dashboard";
    return "/get-started";
  };

  const getProfilePath = () => {
    if (user?.role === "partner") return "/partner/dashboard";
    if (user?.role === "client") return "/client/dashboard";
    return "/get-started";
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="h-[10vh] min-h-[60px] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-partner-from to-partner-to">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-partner-from to-partner-to bg-clip-text text-transparent">
              ERP Matcher
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 h-full">
            <Link 
              href="/" 
              className={`relative inline-block px-3 text-foreground hover:text-foreground transition-colors pb-1 ${
                isActive("/") ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-partner-from" : ""
              }`}
            >
              Home
            </Link>
            <Link 
              href="/pricing" 
              className={`relative inline-block px-3 text-foreground hover:text-foreground transition-colors pb-1 ${
                isActive("/pricing") ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-partner-from" : ""
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/get-started" 
              className={`relative inline-block px-3 text-foreground hover:text-foreground transition-colors pb-1 ${
                isActive("/get-started") ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-partner-from" : ""
              }`}
            >
              Get Started
            </Link>
          </div>

          {/* Auth Section - User Menu or Login/Signup */}
          <div className="flex items-center gap-3">
            {!isLoading && isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative rounded-full"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-partner-from to-partner-to text-white text-sm font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setLocation(getDashboardPath())}
                    className="cursor-pointer"
                    data-testid="menu-my-dashboard"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLocation(getProfilePath())}
                    className="cursor-pointer"
                    data-testid="menu-my-profile"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                    data-testid="menu-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="h-9 hidden sm:flex" data-testid="button-login">
                    Login
                  </Button>
                </Link>
                <Link href="/get-started?signup=true">
                  <Button className="h-9 bg-gradient-to-r from-partner-from to-partner-to text-white hover:opacity-90" data-testid="button-signup">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

