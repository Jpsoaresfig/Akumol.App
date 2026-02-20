// src/types/index.ts
export type PlanLevel = 'basic' | 'premium' | 'plus' | 'ultimate';
export type UserRole = 'user' | 'family_admin' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  plan: PlanLevel;
  role: UserRole;
  familyId?: string; // Para o plano familiar
  financialData: {
    hoursSaved: number;
    savingsRatio: number;
    totalInvested: number;
  };
  preferences: {
    dopamineMode: boolean; // Agente Dopamina
    weatherAutoSave: boolean; // Desafio Rainy Day
  };
}