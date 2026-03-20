import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Zap, 
  Flame, 
  TrendingUp, 
  Award, 
  Star,
  ChevronRight,
  Search
} from 'lucide-react';

const MOCK_LEADERBOARD = [
  { id: 1, name: 'Arjun Mehra', points: 12450, streak: 45, level: 12, photo: 'https://picsum.photos/seed/user1/100/100' },
  { id: 2, name: 'Sanya Gupta', points: 11200, streak: 32, level: 11, photo: 'https://picsum.photos/seed/user2/100/100' },
  { id: 3, name: 'Vikram Singh', points: 10800, streak: 28, level: 10, photo: 'https://picsum.photos/seed/user3/100/100' },
  { id: 4, name: 'Riya Kapoor', points: 9500, streak: 15, level: 9, photo: 'https://picsum.photos/seed/user4/100/100' },
  { id: 5, name: 'Karan Johar', points: 8900, streak: 12, level: 8, photo: 'https://picsum.photos/seed/user5/100/100' },
  { id: 6, name: 'Pooja Hegde', points: 8200, streak: 10, level: 8, photo: 'https://picsum.photos/seed/user6/100/100' },
  { id: 7, name: 'Rahul Dravid', points: 7500, streak: 8, level: 7, photo: 'https://picsum.photos/seed/user7/100/100' },
];

export const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('Global');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">The <span className="text-emerald-400 italic">Arena</span></h1>
          <p className="text-zinc-500 font-medium">Compete with the best. Climb the ranks. Earn your glory.</p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
          {['Global', 'Friends', 'Local'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === tab ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-10">
        {/* 2nd Place */}
        <PodiumCard 
          rank={2} 
          user={MOCK_LEADERBOARD[1]} 
          height="h-48" 
          color="zinc-400" 
          delay={0.2}
        />
        {/* 1st Place */}
        <PodiumCard 
          rank={1} 
          user={MOCK_LEADERBOARD[0]} 
          height="h-64" 
          color="emerald-400" 
          delay={0}
          featured
        />
        {/* 3rd Place */}
        <PodiumCard 
          rank={3} 
          user={MOCK_LEADERBOARD[2]} 
          height="h-40" 
          color="orange-400" 
          delay={0.4}
        />
      </div>

      {/* Leaderboard List */}
      <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5">
        <div className="grid grid-cols-12 gap-4 mb-6 px-6 text-xs font-black uppercase tracking-widest text-zinc-500">
          <div className="col-span-1">Rank</div>
          <div className="col-span-6">Athlete</div>
          <div className="col-span-2 text-center">Streak</div>
          <div className="col-span-3 text-right">Total XP</div>
        </div>
        
        <div className="space-y-3">
          {MOCK_LEADERBOARD.slice(3).map((user, i) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="grid grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <div className="col-span-1 font-black text-zinc-500 text-lg">#{user.id}</div>
              <div className="col-span-6 flex items-center gap-4">
                <img src={user.photo} alt="" className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <div className="font-bold group-hover:text-emerald-400 transition-colors">{user.name}</div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Level {user.level}</div>
                </div>
              </div>
              <div className="col-span-2 text-center flex items-center justify-center gap-1 font-bold text-orange-400">
                <Flame size={16} />
                {user.streak}
              </div>
              <div className="col-span-3 text-right font-black text-white text-lg">
                {user.points.toLocaleString()} <span className="text-emerald-400 text-xs uppercase tracking-widest">XP</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PodiumCard = ({ rank, user, height, color, delay, featured }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    className="flex flex-col items-center"
  >
    <div className="relative mb-6">
      <img 
        src={user.photo} 
        alt="" 
        className={`w-24 h-24 rounded-[2rem] object-cover border-4 ${featured ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'border-white/10'}`} 
      />
      <div className={`absolute -bottom-3 -right-3 w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-lg ${featured ? 'bg-emerald-500' : 'bg-zinc-400'}`}>
        {rank}
      </div>
    </div>
    
    <div className="text-center mb-6">
      <div className="font-black text-xl mb-1">{user.name}</div>
      <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Level {user.level}</div>
    </div>

    <div className={`w-full ${height} rounded-t-[2.5rem] bg-zinc-900/50 border-t border-x border-white/10 flex flex-col items-center justify-center gap-2`}>
      <div className="text-2xl font-black text-white">{user.points.toLocaleString()}</div>
      <div className="text-xs font-black uppercase tracking-widest text-emerald-400">Total XP</div>
    </div>
  </motion.div>
);
