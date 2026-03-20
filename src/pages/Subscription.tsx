import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Zap, 
  Shield, 
  Star, 
  CreditCard, 
  ChevronRight,
  ArrowLeft,
  Trophy,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, MembershipType } from '../types';
import { toast } from 'react-hot-toast';

const PLANS = [
  {
    id: 'free' as MembershipType,
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Basic access for beginners',
    features: [
      'Basic Workout Library',
      'Community Access',
      'Progress Tracking',
      'Limited AI Plans'
    ],
    color: 'zinc',
    buttonText: 'Current Plan'
  },
  {
    id: 'pro' as MembershipType,
    name: 'Pro',
    price: '₹499',
    period: 'month',
    description: 'Advanced features for enthusiasts',
    features: [
      'Full Workout Library',
      'Unlimited AI Plans',
      'Trainer Chat Access',
      'Detailed Analytics',
      'Ad-free Experience'
    ],
    color: 'blue',
    buttonText: 'Upgrade to Pro'
  },
  {
    id: 'elite' as MembershipType,
    name: 'Elite',
    price: '₹1,299',
    period: 'month',
    description: 'The ultimate fitness experience',
    features: [
      'Personal Trainer Sessions',
      'Custom Diet Plans',
      'Priority Support',
      'Exclusive Workshops',
      'GymFlow Merchandise'
    ],
    color: 'emerald',
    buttonText: 'Go Elite'
  }
];

export const Subscription = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpgrade = async (planId: MembershipType) => {
    if (!auth.currentUser || !profile) return;
    if (profile.membershipType === planId) {
      toast.error('You are already on this plan!');
      return;
    }

    setIsUpdating(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        membershipType: planId
      });
      setProfile({ ...profile, membershipType: planId });
      toast.success(`Successfully upgraded to ${planId.toUpperCase()}!`);
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to upgrade membership.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-1 italic">Manage <span className="text-emerald-400">Subscription</span></h1>
          <p className="text-zinc-500 font-medium">Choose the plan that fits your fitness goals.</p>
        </div>
      </div>

      {/* Current Plan Status */}
      <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Shield size={150} className="text-emerald-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Star size={32} fill="currentColor" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Current Status</div>
              <h2 className="text-3xl font-black uppercase italic">GymFlow <span className="text-emerald-400">{profile?.membershipType || 'Free'}</span></h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Next Billing</div>
              <div className="font-bold">April 20, 2026</div>
            </div>
            <div className="w-px h-10 bg-white/10 hidden md:block" />
            <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 font-bold">
              Active
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <motion.div 
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col ${
              profile?.membershipType === plan.id 
                ? 'bg-emerald-500/5 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="mb-8">
              <div className={`text-xs font-black uppercase tracking-widest mb-4 ${
                plan.color === 'emerald' ? 'text-emerald-400' : 
                plan.color === 'blue' ? 'text-blue-400' : 'text-zinc-500'
              }`}>
                {plan.name} Plan
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-zinc-500 font-bold">/{plan.period}</span>
              </div>
              <p className="text-zinc-500 text-sm font-medium">{plan.description}</p>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    profile?.membershipType === plan.id ? 'bg-emerald-500 text-black' : 'bg-white/10 text-zinc-500'
                  }`}>
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-sm font-medium text-zinc-300">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleUpgrade(plan.id)}
              disabled={isUpdating || profile?.membershipType === plan.id}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${
                profile?.membershipType === plan.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' 
                  : 'bg-white text-black hover:bg-emerald-400'
              }`}
            >
              {profile?.membershipType === plan.id ? (
                <>
                  <Check size={18} />
                  Current Plan
                </>
              ) : (
                <>
                  {plan.buttonText}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Security Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Shield size={24} />
          </div>
          <div>
            <div className="font-bold">Secure Checkout</div>
            <div className="text-xs text-zinc-500">SSL encrypted payment processing</div>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="font-bold">Flexible Billing</div>
            <div className="text-xs text-zinc-500">Cancel or switch plans anytime</div>
          </div>
        </div>
      </div>
    </div>
  );
};
