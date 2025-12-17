import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, Achievement } from '../types';

// --- CONSTANTS ---
export const XP_LIMITS: Record<string, number> = {
  'theory_intro': 50,
  'theory_operations': 50,
  'theory_multiplication': 50,
  'theory_powers': 50,
  'theory_advanced': 50,
  'ordering_easy': 100, 'ordering_medium': 150, 'ordering_hard': 200,
  'addition_easy': 100, 'addition_medium': 150, 'addition_hard': 200,
  'subtraction_easy': 100, 'subtraction_medium': 150, 'subtraction_hard': 200,
  'multiplication_easy': 100, 'multiplication_medium': 150, 'multiplication_hard': 200,
  'division_easy': 100, 'division_medium': 150, 'division_hard': 200,
  'powers_easy': 100, 'powers_medium': 150, 'powers_hard': 200,
  'roots_easy': 100, 'roots_medium': 150, 'roots_hard': 200,
  'combined_easy': 100, 'combined_medium': 150, 'combined_hard': 200,
  'mixed_easy': 150, 'mixed_medium': 250, 'mixed_hard': 500,
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_steps', title: 'Lehen Urratsak', description: 'Lortu zure lehenengo 100 XP.', icon: 'footprint', xpReward: 50, condition: (u) => u.xp >= 100 },
  { id: 'streak_5', title: 'Beroketa', description: 'Lortu 5 eguneko bolada.', icon: 'local_fire_department', xpReward: 100, condition: (u) => u.streak >= 5 },
  { id: 'streak_10', title: 'Sutan!', description: 'Lortu 10 eguneko bolada.', icon: 'whatshot', xpReward: 300, condition: (u) => u.streak >= 10 },
  { id: 'level_5', title: 'Ikasle Aurreratua', description: 'Iritsi 5. Mailara.', icon: 'school', xpReward: 250, condition: (u) => u.level >= 5 },
  { id: 'level_10', title: 'Matematika Maisua', description: 'Iritsi 10. Mailara.', icon: 'military_tech', xpReward: 1000, condition: (u) => u.level >= 10 },
  { id: 'master_ordering', title: 'Ordenaren Zaindaria', description: 'Osatu Ordena (Hard).', icon: 'sort', xpReward: 400, condition: (u) => (u.gameXp['ordering_hard'] || 0) >= 200 },
  { id: 'power_master', title: 'Potentzia Handia', description: 'Osatu Berreketak (Hard).', icon: 'electric_bolt', xpReward: 500, condition: (u) => (u.gameXp['powers_hard'] || 0) >= 200 }
];

// --- HELPERS ---
const getIpAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP:", error);
    return "Unknown";
  }
};

const checkStreak = (user: User): User => {
  const now = new Date();
  const lastLogin = new Date(user.lastLoginDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const lastDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (today > lastDay) {
    if (today - lastDay === oneDay) {
      user.streak += 1;
    } else if (today - lastDay > oneDay) {
      user.streak = 1; // Reset streak if skipped a day
    }
    user.lastLoginDate = now.toISOString();
  }
  return user;
};

// --- AUTH SERVICES ---
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const ip = await getIpAddress();

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let userData = docSnap.data() as User;
      // Update streak on login
      const oldStreak = userData.streak;
      userData = checkStreak(userData);

      const updates: any = {
        streak: userData.streak,
        lastLoginDate: userData.lastLoginDate,
        lastIp: ip
      };

      if (oldStreak !== userData.streak || userData.lastLoginDate !== docSnap.data().lastLoginDate) {
        await updateDoc(docRef, updates);
      } else {
        // Just update IP if nothing else changed
        await updateDoc(docRef, { lastIp: ip });
      }
      return { ...userData, lastIp: ip };
    } else {
      throw new Error("Erabiltzailearen datuak ez dira aurkitu (User data not found).");
    }
  },

  // This creates a temporary account in Firebase
  loginAsGuest: async (): Promise<User> => {
    // For a real app, you might use signInAnonymously()
    const guestId = 'guest_' + Date.now();
    const guestUser: User = {
      uid: guestId,
      email: 'guest@zoa.eus',
      displayName: 'Gonbidatua',
      photoURL: `https://ui-avatars.com/api/?name=Guest&background=e2e8f0&color=64748b`,
      xp: 0, level: 1, streak: 0, lastLoginDate: new Date().toISOString(),
      completedLessons: [], gameXp: {}, unlockedAchievements: []
    };
    return guestUser;
  },

  register: async (email: string, password: string, name: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const ip = await getIpAddress();

    const newUser: User = {
      uid,
      email,
      displayName: name,
      photoURL: `https://ui-avatars.com/api/?name=${name}&background=136dec&color=fff`,
      xp: 0,
      level: 1,
      streak: 1,
      lastLoginDate: new Date().toISOString(),
      completedLessons: [],
      gameXp: {},
      unlockedAchievements: [],
      isAdmin: email === 'admin@zoa.eus', // Simple hardcoded check for first admin
      lastIp: ip
    };

    await setDoc(doc(db, "users", uid), newUser);
    return newUser;
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  // Helper to get current Auth user (wrapper)
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Fetch full profile from Firestore
  getUserProfile: async (uid: string): Promise<User | null> => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as User;
    return null;
  }
};

// --- DB SERVICES ---
export const dbService = {
  updateUserProgress: async (uid: string, xpAmount: number, categoryId: string): Promise<{ user: User, actualXpAdded: number, newAchievements: Achievement[] }> => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("User not found");

    const user = docSnap.data() as User;
    if (!user.gameXp) user.gameXp = {};
    if (!user.unlockedAchievements) user.unlockedAchievements = [];

    let actualXpAdded = 0;
    const currentCategoryXp = user.gameXp[categoryId] || 0;

    if (xpAmount >= 0) {
      const limit = XP_LIMITS[categoryId] || 9999;
      const availableXp = Math.max(0, limit - currentCategoryXp);
      actualXpAdded = Math.min(xpAmount, availableXp);

      if (actualXpAdded > 0) {
        user.xp += actualXpAdded;
        user.gameXp[categoryId] = currentCategoryXp + actualXpAdded;
        if (categoryId.startsWith('theory_') && !user.completedLessons.includes(categoryId)) {
          user.completedLessons.push(categoryId);
        }
      }
    } else {
      const penalty = Math.abs(xpAmount);
      const actualReduction = Math.min(penalty, currentCategoryXp);
      if (actualReduction > 0) {
        user.gameXp[categoryId] = currentCategoryXp - actualReduction;
        user.xp = Math.max(0, user.xp - actualReduction);
      }
      actualXpAdded = -actualReduction;
    }

    const newUnlocked: Achievement[] = [];
    if (actualXpAdded >= 0) {
      user.level = Math.floor(user.xp / 500) + 1;
      ACHIEVEMENTS.forEach(ach => {
        if (!user.unlockedAchievements.includes(ach.id)) {
          if (ach.condition(user)) {
            user.unlockedAchievements.push(ach.id);
            user.xp += ach.xpReward;
            user.level = Math.floor(user.xp / 500) + 1;
            newUnlocked.push(ach);
          }
        }
      });
    }

    await updateDoc(docRef, {
      xp: user.xp,
      level: user.level,
      gameXp: user.gameXp,
      completedLessons: user.completedLessons,
      unlockedAchievements: user.unlockedAchievements
    });

    return { user, actualXpAdded, newAchievements: newUnlocked };
  },

  updateProfile: async (uid: string, data: Partial<User>): Promise<User> => {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, data);
    const snap = await getDoc(docRef);
    return snap.data() as User;
  },

  getLeaderboard: async (): Promise<User[]> => {
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    return users;
  },

  // --- ADMIN FUNCTIONS ---
  getAllUsers: async (): Promise<User[]> => {
    const q = query(collection(db, "users"), orderBy("lastLoginDate", "desc"));
    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    return users;
  },

  kickUser: async (uid: string): Promise<void> => {
    // NOTE: Client SDK cannot delete Auth users directly (requires Admin SDK on backend).
    // We will delete their Firestore Data. When they try to fetch profile, it will fail and logout.
    await deleteDoc(doc(db, "users", uid));
  }
};