
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
  };
  preferences: {
    dopamineMode: boolean;
    weatherAutoSave: boolean;
  };
}