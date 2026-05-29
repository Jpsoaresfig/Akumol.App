
export type PlanLevel = 'basic' | 'premium' | 'plus' | 'ultimate';

export interface UserProfile {
  photoURL: string | undefined;
  uid: string;
  email: string;
  displayName: string;
  plan: PlanLevel;
  bio: string;
  role: 'user' | 'admin';
  onboardingComplete?: boolean;
  financialData: {
    hoursSaved: number;
    savingsRatio: number;
    totalInvested: number;
    balance: number;
    monthlyExpenses: number;
    salary?: number;
  };
  preferences: {
    dopamineMode: boolean;
  };
  purchasedCourses?: string[]; // Array of course IDs purchased by the user
}

export interface SupportTicket {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'error' | 'suggestion' | 'question';
  message: string;
  status: 'open' | 'resolved';
  createdAt: Date;
}

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  plan: string;
  color: string;
  path: string;
  icon: string;
  needs: string[];
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  pandaVideoUrl: string; // Full embed URL from Panda Video dashboard
  isFree: boolean;
  order: number;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: number; // Price in cents (e.g., 2990 for R$29.90)
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  instructorBio?: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string; // Panda Video embed URL for trailer/preview
  modules: CourseModule[];
  tags: string[];
  totalLessons: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const AGENTS_INFO: AgentInfo[] = [
  { id: 'sentinela', name: 'Sentinela', description: 'O filtro de 72h contra compras por impulso.', plan: 'Basic', color: 'bg-indigo-600', path: '/agentes/sentinela', icon: 'ShieldCheck', needs: [] },
  { id: 'sombra', name: 'Sombra', description: 'Exterminador de taxas e assinaturas inúteis.', plan: 'Premium', color: 'bg-red-500', path: '/agentes/sombra', icon: 'Zap', needs: ['firestore'] },
  { id: 'radar', name: 'Radar', description: 'Stacking automático de milhas e cashbacks.', plan: 'Premium', color: 'bg-orange-500', path: '/agentes/radar', icon: 'Target', needs: ['gemini', 'google_search'] },
  { id: 'dopamina', name: 'Dopamina', description: 'Bloqueio de gastos por humor e estresse.', plan: 'Plus', color: 'bg-pink-500', path: '/agentes/dopamina', icon: 'HeartPulse', needs: [] },
  { id: 'arquiteto', name: 'Arquiteto', description: 'Converte economia em tempo de aposentadoria.', plan: 'Plus', color: 'bg-emerald-500', path: '/agentes/arquiteto', icon: 'Brain', needs: ['firestore'] },
  { id: 'resiliencia', name: 'Resiliência', description: 'Cofres invisíveis para blindagem familiar.', plan: 'Ultimate', color: 'bg-amber-500', path: '/agentes/resiliencia', icon: 'Users', needs: [] },
];