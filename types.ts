export interface NavItem {
  label: string;
  path: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  xp: number;
  level: number;
  streak: number;
  lastLoginDate: string; // ISO Date string
  completedLessons: string[]; // IDs of completed topics
  gameXp: Record<string, number>; // Tracks XP earned per mode_difficulty (e.g., 'ordering_easy': 50)
  unlockedAchievements: string[]; // IDs of unlocked achievements
  isAdmin?: boolean; // New Admin Flag
  lastIp?: string; // IP Address
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (user: User) => boolean;
}

export interface GameOption {
  val: string;
  isCorrect: boolean;
  id?: number; // Added for ordering game
}

export interface Question {
  text: string;
  options: GameOption[];
  type?: 'quiz' | 'ordering';
  orderingSequence?: number[]; // For ordering game
}

export type GameMode = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'powers' | 'roots' | 'mixed' | 'ordering' | 'combined';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'xp' | 'achievement';
  message: string;
}