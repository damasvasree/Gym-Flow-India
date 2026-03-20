export type UserRole = 'user' | 'admin' | 'trainer';
export type Goal = 'weight_loss' | 'muscle_gain' | 'general_fitness';
export type DietPreference = 'veg' | 'non-veg';
export type MembershipType = 'free' | 'pro' | 'elite';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: Goal;
  dietPreference?: DietPreference;
  membershipType?: MembershipType;
  gender?: 'male' | 'female' | 'other';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very_active';
  points?: number;
  streak?: number;
  role: UserRole;
}

export interface Trainer {
  uid: string;
  name: string;
  specialization: string;
  experience?: number;
  rating?: number;
  bio?: string;
  photoURL?: string;
  availability?: string[];
}

export interface Booking {
  id?: string;
  userId: string;
  trainerId: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  type?: 'personal' | 'class';
}

export interface Progress {
  id?: string;
  userId: string;
  date: string;
  weight?: number;
  caloriesBurned?: number;
  workoutCompleted?: boolean;
}

export interface Plan {
  id?: string;
  userId: string;
  workoutPlan: string;
  dietPlan: string;
  generatedAt: any;
}
