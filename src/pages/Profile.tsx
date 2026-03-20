import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Settings, 
  CreditCard, 
  Shield, 
  ChevronRight, 
  Zap, 
  Trophy,
  Activity,
  LogOut,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, Progress } from '../types';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { getProgress } from '../services/fitnessService';

export const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [logs, setLogs] = useState<Progress[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      try {
        // Fetch Profile
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
        }

        // Fetch Logs if needed
        if (activeTab === 'activity') {
          const activityLogs = await getProgress(auth.currentUser.uid);
          setLogs(activityLogs);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !auth.currentUser) return;
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { ...profile });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (profile) {
          setProfile({ ...profile, photoURL: base64String });
          toast.success('Photo uploaded! Save changes to persist.');
        }
      };
      reader.readAsDataURL(file);
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
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Profile Header */}
      <div className="relative p-8 rounded-[3rem] bg-zinc-900/50 border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Zap size={200} className="text-emerald-400" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <img 
              src={profile?.photoURL || 'https://picsum.photos/seed/user/200/200'} 
              alt="Profile" 
              className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-emerald-500/20 group-hover:border-emerald-500 transition-all duration-500"
            />
            <label className="absolute bottom-0 right-0 p-2 rounded-xl bg-emerald-500 text-black shadow-lg hover:scale-110 transition-transform cursor-pointer">
              <Camera size={18} />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2 italic">{profile?.displayName}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
                {profile?.membershipType || 'Free'} Member
              </div>
              <div className="px-3 py-1 rounded-lg bg-white/5 text-zinc-400 text-xs font-black uppercase tracking-widest border border-white/10">
                Level 4 Athlete
              </div>
              <div className="px-3 py-1 rounded-lg bg-white/5 text-zinc-400 text-xs font-black uppercase tracking-widest border border-white/10">
                {profile?.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Settings Navigation */}
        <div className="space-y-3">
          <SettingsNavItem 
            icon={User} 
            label="Personal Info" 
            active={activeTab === 'personal'} 
            onClick={() => setActiveTab('personal')}
          />
          <SettingsNavItem 
            icon={Shield} 
            label="Security" 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')}
          />
          <SettingsNavItem 
            icon={CreditCard} 
            label="Membership" 
            active={activeTab === 'membership'} 
            onClick={() => setActiveTab('membership')}
          />
          <SettingsNavItem 
            icon={Activity} 
            label="Activity Logs" 
            active={activeTab === 'activity'} 
            onClick={() => setActiveTab('activity')}
          />
          <button 
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl text-red-400 hover:bg-red-400/5 transition-all flex items-center gap-3 font-bold"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {activeTab === 'personal' && (
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold uppercase tracking-tight italic">Personal <span className="text-emerald-400">Details</span></h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-emerald-400 font-bold text-sm hover:underline"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Full Name</label>
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={profile?.displayName || ''}
                      onChange={(e) => setProfile(p => p ? { ...p, displayName: e.target.value } : null)}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Email Address</label>
                    <input 
                      type="email" 
                      disabled
                      value={profile?.email || ''}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Age</label>
                    <input 
                      type="number" 
                      disabled={!isEditing}
                      value={profile?.age || ''}
                      onChange={(e) => setProfile(p => p ? { ...p, age: parseInt(e.target.value) } : null)}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Weight (kg)</label>
                    <input 
                      type="number" 
                      disabled={!isEditing}
                      value={profile?.weight || ''}
                      onChange={(e) => setProfile(p => p ? { ...p, weight: parseInt(e.target.value) } : null)}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {isEditing && (
                  <button 
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all"
                  >
                    Save Changes
                    <CheckCircle2 size={20} />
                  </button>
                )}
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase tracking-tight italic">Security <span className="text-emerald-400">Settings</span></h2>
                <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  Secure
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <SecurityCard 
                  icon={Mail} 
                  title="Google Authentication" 
                  subtitle={`Connected via ${profile?.email}`}
                  status="Connected"
                  color="emerald"
                />
                <SecurityCard 
                  icon={Shield} 
                  title="Two-Factor Authentication" 
                  subtitle="Add an extra layer of security"
                  status="Enable"
                  color="blue"
                  isButton
                />
                <SecurityCard 
                  icon={Zap} 
                  title="Account Privacy" 
                  subtitle="Manage who can see your activity"
                  status="Manage"
                  color="orange"
                  isButton
                />
              </div>
            </div>
          )}

          {activeTab === 'membership' && (
            <div className="space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-emerald-500 text-black relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                  <Trophy size={120} fill="currentColor" />
                </div>
                <div className="relative z-10">
                  <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Current Membership</div>
                  <h3 className="text-3xl font-black uppercase mb-6 italic">GymFlow <span className="text-white">{profile?.membershipType || 'Free'}</span></h3>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="px-4 py-2 rounded-xl bg-black text-white text-sm font-bold">
                      Active Plan
                    </div>
                    <div className="text-sm font-bold">
                      {profile?.membershipType === 'elite' ? '₹1,299 / month' : profile?.membershipType === 'pro' ? '₹499 / month' : 'Free'}
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/subscription')}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-100 transition-all flex items-center gap-2"
                  >
                    Manage Subscription
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Billing Cycle</div>
                  <div className="font-bold">Monthly</div>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Payment Method</div>
                  <div className="flex items-center gap-2 font-bold">
                    <CreditCard size={16} />
                    •••• 4242
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-tight italic">Plan <span className="text-emerald-400">Benefits</span></h3>
                <ul className="space-y-3">
                  {['Full Workout Library', 'Unlimited AI Plans', 'Trainer Chat Access', 'Detailed Analytics'].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-tight italic">Activity <span className="text-emerald-400">Logs</span></h2>
              
              {logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${log.workoutCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-500'}`}>
                          <Activity size={24} />
                        </div>
                        <div>
                          <div className="font-bold">{new Date(log.date).toLocaleDateString()}</div>
                          <div className="text-xs text-zinc-500">
                            {log.workoutCompleted ? 'Workout Completed' : 'Rest Day'} • {log.weight}kg
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-400">+{log.caloriesBurned || 0}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Calories</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-zinc-600">
                    <Activity size={32} />
                  </div>
                  <p className="text-zinc-500 font-bold">No activity logs found yet.</p>
                  <button 
                    onClick={() => navigate('/workouts')}
                    className="mt-4 text-emerald-400 font-bold text-sm hover:underline"
                  >
                    Start your first workout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsNavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full p-4 rounded-2xl transition-all flex items-center justify-between group relative overflow-hidden ${active ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
  >
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"
      />
    )}
    <div className="flex items-center gap-3 font-bold">
      <Icon size={20} className={active ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-white transition-colors'} />
      {label}
    </div>
    <ChevronRight size={18} className={`transition-transform group-hover:translate-x-1 ${active ? 'text-emerald-400' : 'text-zinc-600'}`} />
  </button>
);

const SecurityCard = ({ icon: Icon, title, subtitle, status, color, isButton }: any) => {
  const colorClasses: any = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  };

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <div className="font-bold text-white">{title}</div>
          <div className="text-xs text-zinc-500">{subtitle}</div>
        </div>
      </div>
      {isButton ? (
        <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          {status}
        </button>
      ) : (
        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${colorClasses[color]}`}>
          {status}
        </div>
      )}
    </div>
  );
};
