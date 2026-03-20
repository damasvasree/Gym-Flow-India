import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Flame, 
  Trophy, 
  Calendar, 
  Activity, 
  Dumbbell, 
  Utensils, 
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { UserProfile, Progress, Plan } from '../types';
import { generateRecommendation, savePlan } from '../services/fitnessService';
import { toast } from 'react-hot-toast';
import { cn } from '../utils/cn';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const data = [
  { day: 'Mon', calories: 450, weight: 72.5 },
  { day: 'Tue', calories: 520, weight: 72.3 },
  { day: 'Wed', calories: 380, weight: 72.4 },
  { day: 'Thu', calories: 610, weight: 72.2 },
  { day: 'Fri', calories: 490, weight: 72.1 },
  { day: 'Sat', calories: 750, weight: 71.9 },
  { day: 'Sun', calories: 300, weight: 72.0 },
];

export const Dashboard = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [latestPlan, setLatestPlan] = useState<Plan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatPlan = (plan: any): string => {
    if (typeof plan === 'string') return plan;
    if (!plan) return '';
    return JSON.stringify(plan, null, 2);
  };

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

        // Fetch Latest Plan
        const plansRef = collection(db, 'plans');
        const q = query(
          plansRef, 
          where('userId', '==', auth.currentUser.uid),
          orderBy('generatedAt', 'desc'),
          limit(1)
        );
        const plansSnap = await getDocs(q);
        if (!plansSnap.empty) {
          setLatestPlan(plansSnap.docs[0].data() as Plan);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGeneratePlan = async () => {
    if (!profile) return;
    setIsGenerating(true);
    try {
      const { workout, diet } = await generateRecommendation(profile);
      await savePlan(profile.uid, workout, diet);
      toast.success('New AI Plan Generated!');
      // Refresh plan
      const plansRef = collection(db, 'plans');
      const q = query(
        plansRef, 
        where('userId', '==', profile.uid),
        orderBy('generatedAt', 'desc'),
        limit(1)
      );
      const plansSnap = await getDocs(q);
      if (!plansSnap.empty) {
        setLatestPlan(plansSnap.docs[0].data() as Plan);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate AI plan');
    } finally {
      setIsGenerating(false);
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
            Namaste, <span className="text-emerald-400 italic">{profile?.displayName?.split(' ')[0]}</span>
          </h1>
          <p className="text-zinc-500 font-medium">Your fitness journey is looking <span className="text-white">strong</span> today.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Flame className="text-orange-500" size={18} />
            <span className="font-bold">{profile?.streak || 0} Day Streak</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500 text-black flex items-center gap-2 font-bold">
            <Trophy size={18} />
            <span>{profile?.points || 0} XP</span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Recipe 3: Hardware/Specialist Tool */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Activity} 
          label="Active Calories" 
          value="1,240" 
          unit="kcal" 
          trend="+12%" 
          color="emerald"
        />
        <StatCard 
          icon={Clock} 
          label="Workout Time" 
          value="45" 
          unit="mins" 
          trend="On Track" 
          color="blue"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Weight" 
          value={profile?.weight?.toString() || "72.5"} 
          unit="kg" 
          trend="-0.4kg" 
          color="orange"
        />
        <StatCard 
          icon={Zap} 
          label="Power Level" 
          value="Level 4" 
          unit="Pro" 
          trend="Next: 240XP" 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-emerald-400" size={20} />
                Weekly Activity
              </h3>
              <select className="bg-black border border-white/10 rounded-lg px-3 py-1 text-sm font-medium outline-none">
                <option>Calories</option>
                <option>Weight</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Plan Card */}
          <div className="p-8 rounded-[3rem] bg-zinc-900/50 border border-white/5 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-transform pointer-events-none">
              <Zap size={300} fill="currentColor" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">
                    Your AI <span className="text-emerald-400">Fitness Strategy</span>
                  </h3>
                  <p className="text-zinc-500 text-sm font-medium">Personalized protocol generated by Gemini AI</p>
                </div>
                <button 
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="bg-emerald-500 text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      {latestPlan ? 'Regenerate Plan' : 'Generate Protocol'}
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>

              {latestPlan ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 w-fit">
                      <Dumbbell size={18} className="text-emerald-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Workout Protocol</span>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-inner h-[500px] overflow-y-auto no-scrollbar custom-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formatPlan(latestPlan.workoutPlan)}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 w-fit">
                      <Utensils size={18} className="text-blue-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Dietary Strategy</span>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-inner h-[500px] overflow-y-auto no-scrollbar custom-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formatPlan(latestPlan.dietPlan)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/10 border-dashed text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 text-emerald-400">
                    <Zap size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">No active protocol found</h4>
                  <p className="text-zinc-500 max-w-md mx-auto mb-8">Let our AI analyze your profile and build a custom workout and diet strategy tailored to your goals.</p>
                  <button 
                    onClick={handleGeneratePlan}
                    disabled={isGenerating}
                    className="mx-auto bg-white text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-400 transition-all"
                  >
                    Generate Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Quick Log */}
          <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-emerald-400" />
              Quick Log
            </h3>
            <div className="space-y-3">
              <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Flame size={20} />
                  </div>
                  <span className="font-bold">Log Workout</span>
                </div>
                <ChevronRight size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
              </button>
              <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <TrendingUp size={20} />
                  </div>
                  <span className="font-bold">Log Weight</span>
                </div>
                <ChevronRight size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" />
              Next Session
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src="https://picsum.photos/seed/trainer1/100/100" 
                  alt="Trainer" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-sm">Rahul Sharma</div>
                  <div className="text-xs text-zinc-500">Power Yoga</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-emerald-400">Today, 6:00 PM</span>
                <span className="text-zinc-500">Cult Fit, Bangalore</span>
              </div>
            </div>
          </div>

          {/* Work Summary Widget */}
          <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-emerald-400" />
              Work Summary
            </h3>
            <div className="space-y-4">
              <SummaryItem label="Workouts Completed" value="12" total="20" color="emerald" />
              <SummaryItem label="AI Plans Generated" value={latestPlan ? "1" : "0"} total="5" color="blue" />
              <SummaryItem label="Trainer Sessions" value="3" total="10" color="orange" />
              <SummaryItem label="Profile Completion" value="85" total="100" color="purple" unit="%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, total, color, unit }: any) => {
  const colors: any = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  };

  const percentage = (parseInt(value) / parseInt(total)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
        <span className="text-zinc-500">{label}</span>
        <span className="text-white">{value}{unit || ''} / {total}{unit || ''}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, unit, trend, color }: any) => {
  const colors: any = {
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };

  return (
    <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors[color])}>
          <Icon size={20} />
        </div>
        <span className={cn("text-xs font-bold px-2 py-1 rounded-lg", colors[color])}>
          {trend}
        </span>
      </div>
      <div className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-white">{value}</span>
        <span className="text-zinc-500 font-bold text-sm">{unit}</span>
      </div>
    </div>
  );
};
