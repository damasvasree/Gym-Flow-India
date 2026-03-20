import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  User,
  Zap
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { Booking, Trainer } from '../types';

export const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trainers, setTrainers] = useState<Record<string, Trainer>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bookingsData);

      // Fetch trainer info for each unique trainerId
      const trainerIds = [...new Set(bookingsData.map(b => b.trainerId))];
      const trainerMap: Record<string, Trainer> = { ...trainers };
      
      for (const id of trainerIds) {
        if (!trainerMap[id]) {
          const trainersRef = collection(db, 'trainers');
          const tQuery = query(trainersRef, where('uid', '==', id));
          const tSnap = await getDocs(tQuery);
          if (!tSnap.empty) {
            trainerMap[id] = tSnap.docs[0].data() as Trainer;
          }
        }
      }
      setTrainers(trainerMap);
      setIsLoading(false);
    }, (error) => {
      console.error('Bookings listener error:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const upcoming = bookings.filter(b => new Date(b.date) >= new Date() && b.status !== 'cancelled');
  const past = bookings.filter(b => new Date(b.date) < new Date() || b.status === 'cancelled');

  return (
    <div className="space-y-10 pb-10">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">My <span className="text-emerald-400 italic">Sessions</span></h1>
        <p className="text-zinc-500 font-medium">Manage your personal training and group class bookings.</p>
      </div>

      {/* Upcoming Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-tight italic flex items-center gap-2">
          <Calendar className="text-emerald-400" size={20} />
          Upcoming Sessions
        </h2>
        
        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcoming.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                trainer={trainers[booking.trainerId]} 
              />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-600 mb-4">
              <Calendar size={32} />
            </div>
            <p className="text-zinc-500 font-bold">No upcoming sessions. Time to book one!</p>
          </div>
        )}
      </section>

      {/* Past Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-tight italic flex items-center gap-2">
          <Clock className="text-zinc-500" size={20} />
          Session History
        </h2>
        
        <div className="space-y-3">
          {past.map((booking) => (
            <div 
              key={booking.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <User size={20} />
                </div>
                <div>
                  <div className="font-bold">{trainers[booking.trainerId]?.name || 'Expert Trainer'}</div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{booking.date} • {booking.timeSlot}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {booking.status}
                </span>
                <ChevronRight size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const BookingCard = ({ booking, trainer }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="p-6 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
      <Zap size={100} className="text-emerald-400" />
    </div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Date & Time</div>
            <div className="font-bold text-white">{booking.date} at {booking.timeSlot}</div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-emerald-500 text-black' : 'bg-orange-500 text-black'}`}>
          {booking.status}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
        <div className="flex items-center gap-4">
          <img src={trainer?.photoURL || 'https://picsum.photos/seed/trainer/100/100'} alt="" className="w-12 h-12 rounded-xl object-cover" />
          <div>
            <div className="font-bold">{trainer?.name || 'Expert Trainer'}</div>
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{trainer?.specialization || 'Fitness Coach'}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all">
          Reschedule
        </button>
        <button className="flex-1 py-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 font-bold text-sm hover:bg-red-400/20 transition-all">
          Cancel
        </button>
      </div>
    </div>
  </motion.div>
);
