
export type PlanLevel = 'basic' | 'premium' | 'plus' | 'ultimate';
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  plan: PlanLevel;
  role: 'user' | 'family_admin' | 'admin';
  financialData: {
    hoursSaved: number;
    savingsRatio: number;
    totalInvested: number;
    balance: number;
  };
  preferences: {
    dopamineMode: boolean;
    weatherAutoSave: boolean;
  };
}

// Adicione ao src/types/index.ts
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