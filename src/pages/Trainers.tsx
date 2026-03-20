import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Star, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Search,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { Trainer, Booking } from '../types';
import { toast } from 'react-hot-toast';

const MOCK_TRAINERS: Trainer[] = [
  {
    uid: 't1',
    name: 'Rahul Sharma',
    specialization: 'Bodybuilding & Strength',
    experience: 8,
    rating: 4.9,
    bio: 'Certified master trainer with focus on progressive overload and Indian nutrition.',
    photoURL: 'https://picsum.photos/seed/trainer1/400/400',
    availability: ['06:00 AM', '07:00 AM', '06:00 PM', '07:00 PM']
  },
  {
    uid: 't2',
    name: 'Priya Patel',
    specialization: 'Yoga & Flexibility',
    experience: 6,
    rating: 4.8,
    bio: 'Specialized in Hatha Yoga and mindfulness. Helping you find balance and strength.',
    photoURL: 'https://picsum.photos/seed/trainer2/400/400',
    availability: ['05:00 AM', '08:00 AM', '05:00 PM', '08:00 PM']
  },
  {
    uid: 't3',
    name: 'Arjun Das',
    specialization: 'HIIT & Fat Loss',
    experience: 5,
    rating: 4.7,
    bio: 'High energy coach focused on burning fat and building endurance.',
    photoURL: 'https://picsum.photos/seed/trainer3/400/400',
    availability: ['07:00 AM', '09:00 AM', '04:00 PM', '06:00 PM']
  }
];

export const Trainers = () => {
  const [trainers, setTrainers] = useState<Trainer[]>(MOCK_TRAINERS);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const handleBook = async () => {
    if (!auth.currentUser || !selectedTrainer || !selectedSlot) return;
    
    setIsBooking(true);
    try {
      const booking: Booking = {
        userId: auth.currentUser.uid,
        trainerId: selectedTrainer.uid,
        date: new Date().toISOString().split('T')[0], // Today for demo
        timeSlot: selectedSlot,
        status: 'pending',
        type: 'personal'
      };
      
      await addDoc(collection(db, 'bookings'), booking);
      toast.success(`Session booked with ${selectedTrainer.name}!`);
      setSelectedTrainer(null);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book session.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Expert <span className="text-emerald-400 italic">Coaches</span></h1>
          <p className="text-zinc-500 font-medium">Book a session with India's top certified fitness professionals.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search specialization..." 
            className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-emerald-500 transition-all w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trainers.map((trainer) => (
          <motion.div 
            key={trainer.uid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group p-6 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={120} className="text-emerald-400" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={trainer.photoURL} 
                  alt={trainer.name} 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10 group-hover:border-emerald-500/50 transition-all"
                />
                <div>
                  <h3 className="text-xl font-bold mb-1">{trainer.name}</h3>
                  <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                    <Star size={14} fill="currentColor" />
                    {trainer.rating}
                    <span className="text-zinc-500 font-medium ml-1">({trainer.experience} yrs exp)</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Specialization</div>
                <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                  {trainer.specialization}
                </div>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-2">
                {trainer.bio}
              </p>

              <button 
                onClick={() => setSelectedTrainer(trainer)}
                className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                Book Session
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 relative"
          >
            <button 
              onClick={() => setSelectedTrainer(null)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <Users size={24} />
            </button>

            <h2 className="text-2xl font-black uppercase mb-6 italic">Select <span className="text-emerald-400">Time Slot</span></h2>
            
            <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
              <img src={selectedTrainer.photoURL} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <div className="font-bold">{selectedTrainer.name}</div>
                <div className="text-xs text-zinc-500">{selectedTrainer.specialization}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {selectedTrainer.availability?.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${selectedSlot === slot ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'}`}
                >
                  <Clock size={16} />
                  {slot}
                </button>
              ))}
            </div>

            <button 
              onClick={handleBook}
              disabled={!selectedSlot || isBooking}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              {isBooking ? 'Booking...' : 'Confirm Session'}
              <CheckCircle2 size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
