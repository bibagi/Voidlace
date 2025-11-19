export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'editor' | 'admin';
  avatar?: string;
  createdAt: string;
  avatarFrame?: AvatarFrame;
  bio?: string;
  telegram?: string;
  discord?: string;
  website?: string;
  isPremium?: boolean;
  premiumUntil?: string;
}

export interface AvatarFrame {
  enabled: boolean;
  color: string;
  animation: 'spin' | 'pulse' | 'glow' | 'none';
  thickness: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
