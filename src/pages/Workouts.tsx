import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Flame, 
  Dumbbell, 
  Zap, 
  ChevronRight, 
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveProgress, updateUserProfile } from '../services/fitnessService';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const CATEGORIES = ['All', 'Weight Loss', 'Muscle Gain', 'Yoga', 'HIIT', 'Strength'];

const WORKOUTS = [
  {
    id: 1,
    title: 'Full Body HIIT Blast',
    category: 'HIIT',
    duration: '25 mins',
    calories: '350 kcal',
    level: 'Intermediate',
    image: 'https://picsum.photos/seed/workout1/800/600'
  },
  {
    id: 2,
    title: 'Power Yoga Flow',
    category: 'Yoga',
    duration: '45 mins',
    calories: '220 kcal',
    level: 'Beginner',
    image: 'https://picsum.photos/seed/workout2/800/600'
  },
  {
    id: 3,
    title: 'Heavy Leg Day',
    category: 'Muscle Gain',
    duration: '60 mins',
    calories: '500 kcal',
    level: 'Advanced',
    image: 'https://picsum.photos/seed/workout3/800/600'
  },
  {
    id: 4,
    title: 'Core Crusher',
    category: 'Strength',
    duration: '15 mins',
    calories: '150 kcal',
    level: 'Beginner',
    image: 'https://picsum.photos/seed/workout4/800/600'
  },
  {
    id: 5,
    title: 'Upper Body Pump',
    category: 'Muscle Gain',
    duration: '50 mins',
    calories: '420 kcal',
    level: 'Intermediate',
    image: 'https://picsum.photos/seed/workout5/800/600'
  },
  {
    id: 6,
    title: 'Sun Salutations',
    category: 'Yoga',
    duration: '30 mins',
    calories: '180 kcal',
    level: 'Beginner',
    image: 'https://picsum.photos/seed/workout6/800/600'
  }
];

export const Workouts = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  const filteredWorkouts = WORKOUTS.filter(w => 
    (activeCategory === 'All' || w.category === activeCategory) &&
    w.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartWorkout = (workout: any) => {
    setSelectedWorkout(workout);
    toast.success(`Starting ${workout.title}... Get ready!`);
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleVideoUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  useEffect(() => {
    if (uploadProgress >= 100 && isUploading) {
      setIsUploading(false);
      toast.success("Workout video uploaded successfully! (Simulated)");
    }
  }, [uploadProgress, isUploading]);

  return (
    <div className="space-y-8 pb-10">
      
      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full p-8 rounded-[2.5rem] bg-zinc-900 border border-white/10 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
              <Zap size={40} />
            </div>
            <h3 className="text-2xl font-black uppercase italic">Uploading <span className="text-emerald-400">Workout</span></h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                <span>Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <p className="text-zinc-500 text-sm">Processing your high-quality fitness content...</p>
          </div>
        </div>
      )}
      
      {/* Video Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedWorkout(null)}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-4xl aspect-video bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
          >
            <button 
              onClick={() => setSelectedWorkout(null)}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-emerald-500 hover:text-black transition-all"
            >
              <CheckCircle2 size={24} />
            </button>
            
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 bg-black relative group">
                <iframe 
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/ml6cT4AZdqI?autoplay=1&mute=0`}
                  title="Workout Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6 bg-zinc-900 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold italic text-emerald-400">{selectedWorkout.title}</h3>
                  <p className="text-sm text-zinc-500">{selectedWorkout.duration} • {selectedWorkout.calories} • {selectedWorkout.level}</p>
                </div>
                <button 
                  onClick={async () => {
                    if (auth.currentUser) {
                      const calories = parseInt(selectedWorkout.calories.split(' ')[0]);
                      await saveProgress({
                        userId: auth.currentUser.uid,
                        caloriesBurned: calories,
                        workoutCompleted: true,
                        date: new Date().toISOString()
                      });
                      
                      // Update user points
                      const userRef = doc(db, 'users', auth.currentUser.uid);
                      const userSnap = await getDoc(userRef);
                      if (userSnap.exists()) {
                        const currentPoints = userSnap.data().points || 0;
                        await updateUserProfile(auth.currentUser.uid, {
                          points: currentPoints + 50
                        });
                      }
                    }
                    toast.success("Workout completed! +50 XP");
                    setSelectedWorkout(null);
                  }}
                  className="px-6 py-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all"
                >
                  Finish Workout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Workout <span className="text-emerald-400 italic">Library</span></h1>
          <p className="text-zinc-500 font-medium">Choose your challenge. From beginner yoga to pro bodybuilding.</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={handleVideoUpload}
            className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Zap size={18} fill="currentColor" />
            Upload Workout
          </button>
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
            <input 
            type="text" 
            placeholder="Search workouts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-black border border-white/10 outline-none focus:border-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all border ${
                activeCategory === cat 
                  ? 'bg-emerald-500 text-black border-emerald-500' 
                  : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout) => (
            <motion.div 
              key={workout.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group rounded-[2.5rem] bg-zinc-900/50 border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={workout.image} 
                  alt={workout.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                  <div className="px-3 py-1 rounded-lg bg-emerald-500 text-black text-xs font-black uppercase tracking-widest">
                    {workout.level}
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <Clock size={14} />
                      {workout.duration}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <Flame size={14} className="text-orange-500" />
                      {workout.calories}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleStartWorkout(workout)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    <Play size={28} fill="currentColor" />
                  </div>
                </button>
              </div>

              <div className="p-8">
                <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">{workout.category}</div>
                <h3 className="text-2xl font-bold mb-6 italic">{workout.title}</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <img 
                        key={i} 
                        src={`https://picsum.photos/seed/user${i}/100/100`} 
                        alt="" 
                        className="w-8 h-8 rounded-full border-2 border-zinc-900 object-cover"
                      />
                    ))}
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                      +12
                    </div>
                  </div>
                  <button 
                    onClick={() => handleStartWorkout(workout)}
                    className="text-emerald-400 font-bold flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Start Now
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-600">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-white italic">No workouts found</h3>
            <p className="text-zinc-500">Try adjusting your search or category filters.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="text-emerald-400 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
