
export type PlanLevel = 'basic' | 'premium' | 'plus' | 'ultimate';
export interface UserProfile {
  photoURL: string | undefined;
  uid: string;
  email: string;
  displayName: string;
  plan: PlanLevel;
  bio: string;
  role: 'user' | 'family_admin' | 'admin';
  financialData: {
    hoursSaved: number;
    savingsRatio: number;
    totalInvested: number;
    balance: number;
    

    history?: {
      yesterday?: number;
      lastWeek?: number;
      lastMonth?: number;
      sixMonths?: number;
      lastYear?: number;
  };
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