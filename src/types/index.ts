export type PlanLevel = 'basic' | 'premium' | 'plus' | 'ultimate';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  plan: PlanLevel;
  role: 'user' | 'admin';
  createdAt: Date;
  savingsRatio: number; 
  hoursSaved: number;   
}

export interface AgentStatus {
  id: string;
  name: string;
  isActive: boolean;
  lastIntervention?: string;
}