import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Shield, Users, Trophy, Play, CheckCircle2 } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user profile
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || 'GymFlow User',
          email: user.email,
          photoURL: user.photoURL,
          role: 'user',
          membershipType: 'free',
          points: 0,
          streak: 0,
          createdAt: new Date().toISOString()
        });
        toast.success('Welcome to GymFlow India!');
        navigate('/onboarding');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log('User cancelled the sign-in popup.');
        return;
      }
      console.error('Auth error:', error);
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-400">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Zap className="text-black fill-black" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight">GymFlow <span className="text-emerald-400">IN</span></span>
        </div>
        <button 
          onClick={handleLogin}
          disabled={isLoading}
          className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-emerald-400 transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? 'Connecting...' : 'Get Started'}
        </button>
      </nav>

      {/* Hero Section - Recipe 2: Editorial/Magazine Hero */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center">
        {/* Background Accents */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Zap size={14} />
            Smart Fitness Ecosystem
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.85] tracking-tighter uppercase mb-8">
            Evolve <br />
            <span className="text-emerald-400 italic">Faster.</span>
          </h1>
          
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Personalized Indian diet plans, AI-driven workouts, and expert trainer bookings. 
            The only fitness app built for the modern Indian lifestyle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleLogin}
              className="group relative px-8 py-4 rounded-2xl bg-emerald-500 text-black font-bold text-lg flex items-center gap-2 overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              Start Your Journey
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
              <Play size={20} fill="currentColor" />
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 w-full max-w-4xl"
        >
          {[
            { label: 'Active Users', value: '50k+' },
            { label: 'Expert Trainers', value: '200+' },
            { label: 'Workouts', value: '1000+' },
            { label: 'Success Rate', value: '98%' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features - Indian Context */}
      <section className="py-32 px-6 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Shield}
              title="Indian Diet Planner"
              description="Veg and Non-Veg plans featuring Paneer, Dal, Chicken Tikka, and local favorites. Calorie-tracked for your goals."
            />
            <FeatureCard 
              icon={Zap}
              title="AI Workout Engine"
              description="Smart routines that adapt to your progress. From home yoga to heavy gym sessions, we've got you covered."
            />
            <FeatureCard 
              icon={Users}
              title="Expert Coaching"
              description="Book personal sessions with India's top certified fitness trainers. Real-time feedback and motivation."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 italic">Choose Your <span className="text-emerald-400">Power.</span></h2>
          <p className="text-zinc-400">Transparent pricing for every fitness level.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard 
            tier="Starter"
            price="₹0"
            features={['Basic Workouts', 'Standard Diet Plan', 'Community Access']}
          />
          <PricingCard 
            tier="Pro"
            price="₹499"
            featured
            features={['AI Personalized Plans', 'Advanced Analytics', 'Priority Support', 'Video Library']}
          />
          <PricingCard 
            tier="Elite"
            price="₹1,299"
            features={['Personal Trainer Booking', 'Custom Diet Consultation', 'Elite Badges', 'Offline Gym Access']}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-zinc-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Zap size={20} className="text-emerald-500" />
          <span className="text-white font-bold">GymFlow India</span>
        </div>
        <p>© 2026 GymFlow India. All rights reserved. Built for the Indian Fitness Revolution.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group">
    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <p className="text-zinc-400 leading-relaxed">{description}</p>
  </div>
);

const PricingCard = ({ tier, price, features, featured }: any) => (
  <div className={`p-10 rounded-[2.5rem] border ${featured ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-white/5 border-white/10 text-white'} transition-all duration-300 hover:scale-105`}>
    <div className="text-xs uppercase tracking-[0.2em] font-black mb-4 opacity-70">{tier}</div>
    <div className="text-5xl font-black mb-8">{price}<span className="text-lg opacity-70">/mo</span></div>
    <ul className="space-y-4 mb-10">
      {features.map((f: string, i: number) => (
        <li key={i} className="flex items-center gap-3 font-medium">
          <CheckCircle2 size={18} className={featured ? 'text-black' : 'text-emerald-400'} />
          {f}
        </li>
      ))}
    </ul>
    <button className={`w-full py-4 rounded-2xl font-bold transition-all ${featured ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-emerald-400'}`}>
      Select Plan
    </button>
  </div>
);
