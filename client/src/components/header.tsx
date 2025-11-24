import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Menu, User, Settings, LogOut, Award, Gift } from "lucide-react";
import { useTheme } from "next-themes";
import RickshawWheel from "@/components/airbear-wheel";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function Header() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Rides", href: "/map", icon: "fas fa-map" },
    { name: "Bodega", href: "/bodega", icon: "fas fa-store" },
    { name: "Challenges", href: "/challenges", icon: "fas fa-trophy" },
    { name: "Rewards", href: "/rewards", icon: "fas fa-gift" },
    { name: "Impact", href: "/", icon: "fas fa-leaf", scrollTo: "eco" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      return false; // Handle anchor links separately
    }
    return location === href;
  };

  return (
    <motion.header 
      className="relative z-50 glass-morphism border-b border-emerald-200/20 sticky top-0"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo with Spinning Wheel */}
          <Link to="/">
            <motion.div 
              className="flex items-center space-x-3 group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="link-logo"
            >
              <img
                src="/airbear-mascot.png"
                alt="AirBear mascot"
                className="w-10 h-10 rounded-full object-cover animate-neon-glow"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  console.warn('AirBear mascot image failed to load');
                }}
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-lime-500 to-amber-500 bg-clip-text text-transparent text-sm">
                  AirBear
                </h1>
                <p className="text-xs text-emerald-600 font-semibold animate-shimmer">Eco rides so rare! <span className="text-xs text-orange-500 font-bold">Powered by C4V Batteries ⚡</span></p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href}>
                <motion.a
                  className={`text-foreground/80 hover:text-primary transition-colors hover-lift flex items-center space-x-2 ${
                    isActive(item.href) ? "text-primary font-medium" : ""
                  }`}
                  whileHover={{ y: -2 }}
                  data-testid={`link-nav-${item.name.toLowerCase()}`}
                  onClick={(e) => {
                    if ('scrollTo' in item) {
                      e.preventDefault();
                      const element = document.getElementById((item as any).scrollTo);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  <i className={`${item.icon} text-sm`}></i>
                  <span>{item.name}</span>
                </motion.a>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="hover-lift"
              data-testid="button-theme-toggle"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Authentication */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover-lift" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.username || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-morphism" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link to="/dashboard">
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/challenges">
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-challenges">
                      <Award className="mr-2 h-4 w-4" />
                      Eco Challenges
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/rewards">
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-rewards">
                      <Gift className="mr-2 h-4 w-4" />
                      Rewards
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem 
                    className="cursor-pointer" 
                    data-testid="menu-settings"
                    onClick={() => {
                      // Settings functionality placeholder
                      alert('Settings page coming soon!');
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive" 
                    onClick={logout}
                    data-testid="menu-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/auth">
                  <Button 
                    variant="ghost" 
                    className="text-primary border border-primary/30 hover:bg-primary/10 hover-lift ripple-effect"
                    data-testid="button-sign-in"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button 
                    className="eco-gradient text-white hover-lift animate-pulse-glow ripple-effect"
                    data-testid="button-get-started"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden hover-lift"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass-morphism w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-4">
                    {navigation.map((item) => (
                      <Link key={item.name} to={item.href}>
                        <motion.a
                          className={`flex items-center space-x-3 text-foreground/80 hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted ${
                            isActive(item.href) ? "text-primary bg-primary/10 font-medium" : ""
                          }`}
                          onClick={(e) => {
                            setMobileMenuOpen(false);
                            if ('scrollTo' in item) {
                              e.preventDefault();
                              setTimeout(() => {
                                const element = document.getElementById((item as any).scrollTo);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                }
                              }, 300);
                            }
                          }}
                          whileTap={{ scale: 0.95 }}
                          data-testid={`mobile-link-${item.name.toLowerCase()}`}
                        >
                          <i className={`${item.icon} text-lg`}></i>
                          <span className="text-lg">{item.name}</span>
                        </motion.a>
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Auth */}
                  {!user && (
                    <div className="flex flex-col space-y-3 pt-6 border-t">
                      <Link to="/auth">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid="mobile-button-sign-in"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth?mode=signup">
                        <Button 
                          className="w-full eco-gradient text-white"
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid="mobile-button-get-started"
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Mobile User Menu */}
                  {user && (
                    <div className="flex flex-col space-y-3 pt-6 border-t">
                      <div className="flex items-center space-x-3 p-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatarUrl || ""} alt={user.username || ""} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>

                      <Link to="/dashboard">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid="mobile-button-dashboard"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>

                      <Link to="/challenges">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid="mobile-button-challenges"
                        >
                          <Award className="mr-2 h-4 w-4" />
                          Eco Challenges
                        </Button>
                      </Link>

                      <Link to="/rewards">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid="mobile-button-rewards"
                        >
                          <Gift className="mr-2 h-4 w-4" />
                          Rewards
                        </Button>
                      </Link>

                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        data-testid="mobile-button-logout"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
