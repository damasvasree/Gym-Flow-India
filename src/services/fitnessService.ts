import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  getDocFromServer,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile, Plan, Progress, Booking, Trainer } from '../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// User Profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Trainers
export async function getTrainers(): Promise<Trainer[]> {
  const path = 'trainers';
  try {
    const q = query(collection(db, 'trainers'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any as Trainer));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Bookings
export async function createBooking(booking: Booking) {
  const path = 'bookings';
  try {
    const docRef = doc(collection(db, 'bookings'));
    await setDoc(docRef, { ...booking, id: docRef.id });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// AI Recommendation Engine (Gemini-powered)
export async function generateRecommendation(user: UserProfile): Promise<{ workout: string; diet: string }> {
  try {
    const prompt = `Generate a personalized fitness plan for a user with the following profile:
    - Goal: ${user.goal}
    - Diet Preference: ${user.dietPreference}
    - Height: ${user.height} cm
    - Weight: ${user.weight} kg
    - Age: ${user.age}
    - Gender: ${user.gender}
    - Fitness Level: ${user.fitnessLevel}
    - Activity Level: ${user.activityLevel}
    
    Return the response in JSON format with two keys: "workout" and "diet".
    The "workout" should be a detailed weekly routine in Markdown format (using headers, lists, and bold text).
    The "diet" should be a detailed daily meal plan based on their preference in Markdown format (using headers, lists, and bold text).
    Make the Markdown clean and professional. Use Indian meal names for the diet if applicable.
    Keep the tone encouraging and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || '{"workout": "", "diet": ""}';
    const result = JSON.parse(text);
    
    const workout = typeof result.workout === 'string' 
      ? result.workout 
      : JSON.stringify(result.workout, null, 2);
      
    const diet = typeof result.diet === 'string' 
      ? result.diet 
      : JSON.stringify(result.diet, null, 2);

    return {
      workout: workout || "Balanced routine: 3x strength training, 2x yoga/flexibility, and moderate cardio 20 mins daily.",
      diet: diet || "Balanced diet: Lean proteins, whole grains, and plenty of vegetables."
    };
  } catch (error) {
    console.error("Error generating recommendation:", error);
    // Fallback to rule-based logic if Gemini fails
    let workout = "";
    let diet = "";

    const { goal, dietPreference } = user;

    if (goal === 'weight_loss') {
      workout = "High-Intensity Interval Training (HIIT) 3x a week, 30 mins cardio daily, and light strength training.";
      diet = dietPreference === 'veg' 
        ? "Focus on high-fiber Indian meals: Oats Upma, Moong Dal Chilla, Paneer Salad, and plenty of leafy greens. Limit Roti/Rice."
        : "Focus on high-protein lean meals: Grilled Chicken, Egg Whites, Fish Curry (light), and Sprouts Salad. Limit carbs.";
    } else if (goal === 'muscle_gain') {
      workout = "Heavy weight lifting 4-5x a week (Push/Pull/Legs split), progressive overload, and minimal cardio.";
      diet = dietPreference === 'veg'
        ? "High-calorie vegetarian: Paneer Bhurji, Soya Chunks, Greek Yogurt, Chickpea Curry (Chole), and extra servings of Rice/Roti."
        : "High-calorie non-veg: Chicken Breast, Whole Eggs, Mutton (once a week), and Whey Protein shakes with milk.";
    } else {
      workout = "Balanced routine: 3x strength training, 2x yoga/flexibility, and moderate cardio 20 mins daily.";
      diet = dietPreference === 'veg'
        ? "Balanced Indian diet: Dal, Roti, Sabzi, Curd, and seasonal fruits. Moderate portions."
        : "Balanced diet: Lean proteins, whole grains, and plenty of vegetables. Mix of veg and non-veg sources.";
    }

    return { workout, diet };
  }
}

export async function savePlan(userId: string, workoutPlan: string, dietPlan: string) {
  const path = 'plans';
  try {
    const docRef = doc(collection(db, 'plans'));
    await setDoc(docRef, {
      userId,
      workoutPlan,
      dietPlan,
      generatedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveProgress(progress: Omit<Progress, 'id'>) {
  const path = 'progress';
  try {
    const docRef = doc(collection(db, 'progress'));
    await setDoc(docRef, {
      ...progress,
      date: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getProgress(userId: string): Promise<Progress[]> {
  const path = 'progress';
  try {
    const q = query(
      collection(db, 'progress'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date
      } as Progress;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
