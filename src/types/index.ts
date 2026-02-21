export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  plan: 'basic' | 'premium' | 'plus' | 'ultimate';
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