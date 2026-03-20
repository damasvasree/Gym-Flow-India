import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Check } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Goal, DietPreference } from '../types';
import { toast } from 'react-hot-toast';

export const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: 25,
    weight: 70,
    height: 175,
    goal: 'general_fitness' as Goal,
    dietPreference: 'veg' as DietPreference,
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        ...formData,
        onboarded: true
      });
      toast.success('Profile updated!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to save profile.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-2 mb-12 justify-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Zap className="text-black fill-black" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight">GymFlow <span className="text-emerald-400">IN</span></span>
        </div>

        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-emerald-500' : 'bg-white/10'}`} 
              />
            ))}
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight italic">
            {step === 1 && "Tell us about yourself"}
            {step === 2 && "What's your goal?"}
            {step === 3 && "Dietary preference"}
            {step === 4 && "Ready to transform?"}
          </h2>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {step === 1 && (
            <div className="space-y-6">
              <InputGroup label="Age" value={formData.age} onChange={(v) => setFormData({ ...formData, age: v })} min={15} max={80} unit="years" />
              <InputGroup label="Weight" value={formData.weight} onChange={(v) => setFormData({ ...formData, weight: v })} min={30} max={200} unit="kg" />
              <InputGroup label="Height" value={formData.height} onChange={(v) => setFormData({ ...formData, height: v })} min={100} max={250} unit="cm" />
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-4">
              <OptionCard 
                selected={formData.goal === 'weight_loss'} 
                onClick={() => setFormData({ ...formData, goal: 'weight_loss' })}
                title="Weight Loss"
                description="Burn fat and get lean"
              />
              <OptionCard 
                selected={formData.goal === 'muscle_gain'} 
                onClick={() => setFormData({ ...formData, goal: 'muscle_gain' })}
                title="Muscle Gain"
                description="Build strength and size"
              />
              <OptionCard 
                selected={formData.goal === 'general_fitness'} 
                onClick={() => setFormData({ ...formData, goal: 'general_fitness' })}
                title="General Fitness"
                description="Stay healthy and active"
              />
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 gap-4">
              <OptionCard 
                selected={formData.dietPreference === 'veg'} 
                onClick={() => setFormData({ ...formData, dietPreference: 'veg' })}
                title="Vegetarian"
                description="Plant-based Indian diet"
              />
              <OptionCard 
                selected={formData.dietPreference === 'non-veg'} 
                onClick={() => setFormData({ ...formData, dietPreference: 'non-veg' })}
                title="Non-Vegetarian"
                description="Includes chicken, eggs, fish"
              />
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400">
                <Check size={40} />
              </div>
              <p className="text-zinc-400 text-lg mb-8">We've customized your experience based on your profile. Let's get started with your first workout!</p>
            </div>
          )}

          <button 
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            {step === 4 ? "Enter Dashboard" : "Continue"}
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, min, max, unit }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-zinc-500">
      <span>{label}</span>
      <span className="text-white">{value} {unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
    />
  </div>
);

const OptionCard = ({ selected, onClick, title, description }: any) => (
  <button 
    onClick={onClick}
    className={`w-full p-6 rounded-3xl border-2 text-left transition-all ${selected ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'}`}
  >
    <div className="text-xl font-bold mb-1">{title}</div>
    <div className="text-sm opacity-70">{description}</div>
  </button>
);
