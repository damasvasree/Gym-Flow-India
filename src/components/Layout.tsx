import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Zap,
  Trophy
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../utils/cn';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const NavItem = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
      active 
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
        : "text-zinc-400 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {active && (
      <motion.div
        layoutId="active-pill"
        className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
      />
    )}
  </Link>
);

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const user = auth.currentUser;

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/workouts", icon: Dumbbell, label: "Workouts" },
    { to: "/bookings", icon: Calendar, label: "Bookings" },
    { to: "/trainers", icon: Users, label: "Trainers" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/subscription", icon: Zap, label: "Subscription" },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-black border-r border-white/5 p-6">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Zap className="text-black fill-black" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">GymFlow <span className="text-emerald-400">IN</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
          <NavItem to="/profile" icon={User} label="Profile" active={location.pathname === "/profile"} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-black border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Zap className="text-black fill-black" size={18} />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">GymFlow</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 z-40 bg-black pt-20 px-6"
          >
            <nav className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 text-2xl font-semibold text-zinc-400 hover:text-emerald-400"
                >
                  <item.icon size={28} />
                  {item.label}
                </Link>
              ))}
              <div className="pt-8 border-t border-white/5 space-y-4">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 text-2xl font-semibold text-zinc-400 hover:text-emerald-400"
                >
                  <User size={28} />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 text-2xl font-semibold text-red-400"
                >
                  <LogOut size={28} />
                  Logout
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      <Navbar />
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
