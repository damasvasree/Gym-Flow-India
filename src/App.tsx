import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { Trainers } from './pages/Trainers';
import { Workouts } from './pages/Workouts';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { Bookings } from './pages/Bookings';
import { Subscription } from './pages/Subscription';
import { Layout } from './components/Layout';
import { Toaster } from 'react-hot-toast';

const AuthGuard = ({ children, requireOnboarding = true }: { children: React.ReactNode, requireOnboarding?: boolean }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setIsOnboarded(userSnap.data().onboarded || false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireOnboarding && !isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={
          <AuthGuard requireOnboarding={false}>
            <Onboarding />
          </AuthGuard>
        } />
        <Route path="/dashboard" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        <Route path="/trainers" element={
          <AuthGuard>
            <Trainers />
          </AuthGuard>
        } />
        <Route path="/workouts" element={
          <AuthGuard>
            <Workouts />
          </AuthGuard>
        } />
        <Route path="/profile" element={
          <AuthGuard>
            <Profile />
          </AuthGuard>
        } />
        <Route path="/leaderboard" element={
          <AuthGuard>
            <Leaderboard />
          </AuthGuard>
        } />
        <Route path="/bookings" element={
          <AuthGuard>
            <Bookings />
          </AuthGuard>
        } />
        <Route path="/subscription" element={
          <AuthGuard>
            <Subscription />
          </AuthGuard>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
