import { create } from 'zustand';
import { OrgType, Role } from '../app/types';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  org: OrgType;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Real Auth Methods
  setUser: (user: User | null) => void;
  setOrg: (org: OrgType) => void;
  setRole: (role: Role) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  org: 'education',
  role: 'admin',
  isAuthenticated: false,
  isLoading: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setOrg: (org) => set({ org }),
  
  setRole: (role) => set({ role }),
  
  updateUser: (updates) => set((state) => ({ 
    user: state.user ? { ...state.user, ...updates } : null 
  })),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));

// Setup auth listener outside of the store to sync state
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();
  
  if (session?.user) {
    try {
      // In a real app, we would fetch the profile here from the 'profiles' table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, role, org_type')
        .eq('id', session.user.id)
        .single();

      if (!error && profile) {
        store.setRole(profile.role as Role);
        store.setOrg(profile.org_type as OrgType);
      }
      
      store.setUser({
        id: session.user.id,
        email: session.user.email || '',
        name: profile?.full_name || session.user.user_metadata?.full_name || 'User',
      });
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // Fallback if profiles table is missing
      store.setUser({
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || 'User',
      });
    }
  } else {
    store.setUser(null);
  }
});
