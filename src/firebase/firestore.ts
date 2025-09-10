import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { UserRole } from './auth';

// Debounce leaderboard updates to avoid too frequent updates
let leaderboardUpdateTimeout: NodeJS.Timeout | null = null;

// Debounced leaderboard update function
const debouncedUpdateLeaderboard = () => {
  if (leaderboardUpdateTimeout) {
    clearTimeout(leaderboardUpdateTimeout);
  }
  
  leaderboardUpdateTimeout = setTimeout(async () => {
    try {
      await updateLeaderboard();
    } catch (error) {
      console.warn('Debounced leaderboard update failed:', error);
    }
  }, 2000); // Wait 2 seconds before updating
};

export interface Task {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  points: number;
  isActive: boolean;
  category: 'trial' | 'worship' | 'social' | 'knowledge' | 'identity' | 'final';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string; // e.g., "5 minutes", "30 minutes"
  tips?: string[]; // Optional tips for completing the task
}

export interface ChallengeDay {
  dayNumber: number;
  scheduledDate: any; // Firebase timestamp for when this day should be active
  trackingDate: any; // Firebase timestamp for yesterday (what we're tracking)
  isActive: boolean;
  isCompleted: boolean;
  activatedAt?: any; // When this day was actually activated
}

export interface ChallengeSettings {
  id: string;
  isActive: boolean; // Whether challenge is currently running
  isPaused: boolean; // Whether challenge is paused
  startDate: any; // Firebase timestamp
  currentDay: number; // Current active day (0 = trial, 1-14 = actual days)
  dayDuration: number; // Duration of each day in hours (default 24)
  trialEnabled: boolean; // Whether trial day is enabled
  challengeDays: ChallengeDay[]; // Array of all 15 days with their dates
  pausedAt?: any; // When challenge was paused
  resumedAt?: any; // When challenge was last resumed
  createdAt: any;
  updatedAt: any;
}

export interface UserProgress {
  userId: string;
  name: string;
  email: string;
  progress: Record<string, boolean>;
  points: Record<string, number>; // New: Points earned for each day
  totalPoints: number; // New: Total points earned
  completedTasks: number;
  joinedAt: any;
  rank: number; // New: Current leaderboard rank
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  email: string;
  totalPoints: number;
  completedTasks: number;
  rank: number;
  lastUpdated: any;
}

// Enhanced tasks for the 14-day challenge with better categorization
export const defaultTasks: Omit<Task, 'id'>[] = [
  {
    dayNumber: 0,
    title: "Trial Day - Prepare Your Heart",
    description: "Today is your preparation day. Set your intention (niyyah) for the 14-day journey ahead. Read about the challenge and prepare mentally and spiritually.",
    points: 10,
    isActive: false,
    category: 'trial',
    difficulty: 'easy',
    estimatedTime: '10 minutes',
    tips: ['Make a sincere intention (niyyah)', 'Read about Islamic practices', 'Prepare your mindset for the journey']
  },
  {
    dayNumber: 1,
    title: "Greet Fellow Muslims",
    description: "Greet at least 10 Muslims with 'As-salamu alaykum' today and respond with 'Wa alaykumu s-salam' when greeted.",
    points: 20,
    isActive: false,
    category: 'social',
    difficulty: 'easy',
    estimatedTime: 'Throughout the day',
    tips: ['Smile when greeting', 'Make eye contact', 'Be the first to greet']
  },
  {
    dayNumber: 2,
    title: "Fajr Prayer in Congregation",
    description: "Pray Fajr Salah in Jama'ah (congregation) at the mosque or with family.",
    points: 30,
    isActive: false,
    category: 'worship',
    difficulty: 'medium',
    estimatedTime: '30 minutes',
    tips: ['Set multiple alarms', 'Sleep early the night before', 'Make wudu before sleeping']
  },
  {
    dayNumber: 3,
    title: "Share Islamic Knowledge",
    description: "Share a Hadith, Qur'an ayah, or give a brief Islamic reminder to someone today.",
    points: 25,
    isActive: false,
    category: 'knowledge',
    difficulty: 'medium',
    estimatedTime: '15 minutes',
    tips: ['Choose something you understand well', 'Share with wisdom and kindness', 'Use appropriate timing']
  },
  {
    dayNumber: 4,
    title: "Use Islamic Phrases",
    description: "Consciously use 'JazakAllahu Khair', 'Insha'Allah', 'MashAllah', 'SubhanAllah' at least 10 times today.",
    points: 15,
    isActive: false,
    category: 'identity',
    difficulty: 'easy',
    estimatedTime: 'Throughout the day',
    tips: ['Be mindful of your speech', 'Use them sincerely', 'Explain meanings when asked']
  },
  {
    dayNumber: 5,
    title: "Maintain Islamic Identity",
    description: "Maintain visible Islamic identity: dress modestly, use natural fragrance, maintain Islamic appearance.",
    points: 20,
    isActive: false,
    category: 'identity',
    difficulty: 'easy',
    estimatedTime: 'All day',
    tips: ['Choose modest clothing', 'Use miswak or maintain oral hygiene', 'Apply natural fragrance']
  },
  {
    dayNumber: 6,
    title: "Dhikr and Remembrance",
    description: "Engage in dhikr (remembrance of Allah) for at least 15 minutes. Recite Tasbih, Tahmid, or read Quran.",
    points: 25,
    isActive: false,
    category: 'worship',
    difficulty: 'easy',
    estimatedTime: '15 minutes',
    tips: ['Use prayer beads if available', 'Find a quiet place', 'Focus on meaning']
  },
  {
    dayNumber: 7,
    title: "Help Someone in Need",
    description: "Perform an act of kindness or help someone today, following the Sunnah of helping others.",
    points: 30,
    isActive: false,
    category: 'social',
    difficulty: 'medium',
    estimatedTime: 'Varies',
    tips: ['Look for opportunities around you', 'Help with sincerity', 'No act of kindness is too small']
  },
  {
    dayNumber: 8,
    title: "Learn New Islamic Knowledge",
    description: "Learn something new about Islam today - read a hadith, learn a dua, or study an Islamic topic.",
    points: 25,
    isActive: false,
    category: 'knowledge',
    difficulty: 'medium',
    estimatedTime: '20 minutes',
    tips: ['Use authentic sources', 'Take notes', 'Share what you learn']
  },
  {
    dayNumber: 9,
    title: "Practice Patience and Forgiveness",
    description: "Consciously practice patience (Sabr) in difficult situations and forgive someone who wronged you.",
    points: 35,
    isActive: false,
    category: 'identity',
    difficulty: 'hard',
    estimatedTime: 'Throughout the day',
    tips: ['Remember Allah when angry', 'Take deep breaths', 'Remember the reward of patience']
  },
  {
    dayNumber: 10,
    title: "Night Prayer (Tahajjud)",
    description: "Wake up for Tahajjud prayer and pray at least 2 rakats during the last third of the night.",
    points: 40,
    isActive: false,
    category: 'worship',
    difficulty: 'hard',
    estimatedTime: '20 minutes',
    tips: ['Calculate last third of night', 'Make sincere dua', 'Start with 2 rakats']
  },
  {
    dayNumber: 11,
    title: "Give Charity (Sadaqah)",
    description: "Give charity today, whether money, food, or any form of help to those in need.",
    points: 30,
    isActive: false,
    category: 'social',
    difficulty: 'medium',
    estimatedTime: '10 minutes',
    tips: ['Give according to your ability', 'Give privately when possible', 'Smile is also charity']
  },
  {
    dayNumber: 12,
    title: "Family and Community Connection",
    description: "Strengthen ties with family or Muslim community. Visit, call, or spend quality time together.",
    points: 25,
    isActive: false,
    category: 'social',
    difficulty: 'easy',
    estimatedTime: '1 hour',
    tips: ['Be fully present', 'Listen actively', 'Express gratitude']
  },
  {
    dayNumber: 13,
    title: "Reflect and Seek Forgiveness",
    description: "Spend time in self-reflection, seek Allah's forgiveness (Istighfar), and plan for continued improvement.",
    points: 30,
    isActive: false,
    category: 'worship',
    difficulty: 'medium',
    estimatedTime: '30 minutes',
    tips: ['Find a quiet place', 'Be sincere in repentance', 'Make plans for the future']
  },
  {
    dayNumber: 14,
    title: "Complete the Challenge - Future Commitment",
    description: "Complete your final reflection and make a commitment to continue practicing what you've learned.",
    points: 50,
    isActive: false,
    category: 'final',
    difficulty: 'medium',
    estimatedTime: '45 minutes',
    tips: ['Write down your experiences', 'Set future goals', 'Thank Allah for guidance']
  }
];

// Initialize default tasks in Firestore
export const initializeDefaultTasks = async (): Promise<void> => {
  try {
    console.log('Initializing default tasks...');
    
    const batch = writeBatch(db);
    
    for (const task of defaultTasks) {
      const taskRef = doc(collection(db, 'tasks'));
      const taskData = { ...task, id: taskRef.id };
      console.log('Adding task:', taskData.title);
      batch.set(taskRef, taskData);
    }
    
    await batch.commit();
    console.log('Default tasks initialized successfully');
  } catch (error) {
    console.error('Detailed error initializing default tasks:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

// Get tasks filtered by challenge state and user access
export const getAvailableTasks = async (challengeSettings?: ChallengeSettings | null): Promise<Task[]> => {
  try {
    const tasksQuery = query(collection(db, 'tasks'), orderBy('dayNumber'));
    const snapshot = await getDocs(tasksQuery);
    
    if (snapshot.empty) {
      await initializeDefaultTasks();
      return getAvailableTasks(challengeSettings);
    }
    
    const allTasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Task));
    
    // If no challenge settings or challenge is inactive, return empty array
    if (!challengeSettings || !challengeSettings.isActive) {
      return [];
    }
    
    // Filter tasks based on current challenge progress
    return allTasks.filter(task => {
      // Trial day (Day 0) is always available when challenge is active
      if (task.dayNumber === 0) return true;
      
      // Regular days are available up to current day
      return task.dayNumber <= challengeSettings.currentDay;
    });
  } catch (error) {
    console.error('Error getting available tasks:', error);
    return [];
  }
};

// Get all tasks (for admin purposes)
export const getAllTasks = async (autoInitialize: boolean = false): Promise<Task[]> => {
  try {
    console.log('Getting all tasks from database...');
    const tasksQuery = query(collection(db, 'tasks'), orderBy('dayNumber'));
    const snapshot = await getDocs(tasksQuery);
    
    console.log(`Found ${snapshot.docs.length} tasks in database`);
    
    if (snapshot.empty) {
      console.log('No tasks found in database');
      if (autoInitialize) {
        console.log('Auto-initializing default tasks...');
        await initializeDefaultTasks();
        return getAllTasks(false); // Prevent infinite recursion
      }
      return [];
    }
    
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Task));
    
    console.log('Tasks loaded:', tasks.map(t => `Day ${t.dayNumber}: ${t.title}`));
    return tasks;
  } catch (error) {
    console.error('Error getting all tasks:', error);
    return [];
  }
};

// Subscribe to tasks changes
export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const tasksQuery = query(collection(db, 'tasks'), orderBy('dayNumber'));
  
  return onSnapshot(tasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Task));
    callback(tasks);
  });
};

// Get all participants (users with role 'participant')
export const getParticipants = async (): Promise<UserProgress[]> => {
  try {
    const usersQuery = query(
      collection(db, 'users'), 
      where('role', '==', 'participant')
    );
    const snapshot = await getDocs(usersQuery);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as UserRole;
      const completedTasks = Object.values(data.progress).filter(Boolean).length;
      
      return {
        userId: doc.id,
        name: data.name,
        email: data.email,
        progress: data.progress,
        points: data.points || {},
        totalPoints: data.totalPoints || 0,
        completedTasks,
        joinedAt: data.joinedAt,
        rank: data.rank || 0
      };
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    return [];
  }
};

// Subscribe to participants changes
export const subscribeToParticipants = (callback: (participants: UserProgress[]) => void) => {
  const usersQuery = query(
    collection(db, 'users'), 
    where('role', '==', 'participant')
  );
  
  return onSnapshot(usersQuery, (snapshot) => {
    const participants = snapshot.docs.map(doc => {
      const data = doc.data() as UserRole;
      // Safely handle progress field
      const progress = data.progress || {};
      const completedTasks = Object.values(progress).filter(Boolean).length;
      
      return {
        userId: doc.id,
        name: data.name,
        email: data.email,
        progress: progress,
        points: data.points || {},
        totalPoints: data.totalPoints || 0,
        completedTasks,
        joinedAt: data.joinedAt,
        rank: data.rank || 0
      };
    });
    callback(participants);
  });
};

// Update user progress with points
export const updateUserProgress = async (
  userId: string, 
  day: string, 
  completed: boolean,
  points: number = 0
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    const userData = userDoc.data() as UserRole;
    const currentPoints = userData.points || {};
    const currentTotalPoints = userData.totalPoints || 0;
    
    let newTotalPoints = currentTotalPoints;
    
    if (completed) {
      // Add points if task is completed
      currentPoints[day] = points;
      newTotalPoints = currentTotalPoints + points;
    } else {
      // Remove points if task is uncompleted
      const previousPoints = currentPoints[day] || 0;
      newTotalPoints = currentTotalPoints - previousPoints;
      currentPoints[day] = 0;
    }
    
    await updateDoc(userRef, {
      [`progress.${day}`]: completed,
      points: currentPoints,
      totalPoints: Math.max(0, newTotalPoints),
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ User progress updated: ${day} = ${completed ? 'completed' : 'incomplete'}, points: ${points}`);
    
    // Update leaderboard after progress update (debounced, non-blocking)
    debouncedUpdateLeaderboard();
    
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

// Reset participant progress
export const resetParticipantProgress = async (userId: string): Promise<void> => {
  try {
    console.log(`🔄 Starting reset for user: ${userId}`);
    
    // Verify user exists first
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User ${userId} not found`);
    }
    
    const userData = userDoc.data() as UserRole;
    console.log(`📋 Current user data:`, {
      name: userData.name,
      role: userData.role,
      completedTasks: Object.values(userData.progress || {}).filter(Boolean).length,
      totalPoints: userData.totalPoints || 0
    });
    
    // Create fresh progress and points objects
    const initialProgress: Record<string, boolean> = {};
    const initialPoints: Record<string, number> = {};
    
    // Initialize all days (0-14)
    for (let i = 0; i <= 14; i++) {
      initialProgress[`day${i}`] = false;
      initialPoints[`day${i}`] = 0;
    }
    
    console.log('📝 Updating user document with reset data...');
    
    // Reset all progress and points
    await updateDoc(userRef, {
      progress: initialProgress,
      points: initialPoints,
      totalPoints: 0,
      rank: 0,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Successfully reset progress for user: ${userId}`);
    
    // Update leaderboard after reset
    console.log('🏆 Updating leaderboard after reset...');
    await updateLeaderboard();
    
    console.log('🎉 Reset operation completed successfully');
  } catch (error) {
    console.error('❌ Error resetting participant progress:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        throw new Error('Insufficient permissions to reset user progress. Please ensure you are logged in as an admin.');
      } else if (error.message.includes('not found')) {
        throw new Error('User not found. They may have been deleted or the ID is incorrect.');
      } else {
        throw new Error(`Reset failed: ${error.message}`);
      }
    } else {
      throw new Error('Unknown error occurred during reset operation.');
    }
  }
};

// Delete participant permanently
export const deleteParticipant = async (userId: string): Promise<void> => {
  try {
    console.log(`🗑️ Starting deletion for user: ${userId}`);
    
    // Verify user exists first
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as UserRole;
    
    // Verify user is a participant (safety check)
    if (userData.role !== 'participant') {
      throw new Error('Can only delete participants, not admin users');
    }
    
    console.log(`🔍 Deleting participant: ${userData.name} (${userData.email})`);
    
    // Delete the user document
    await deleteDoc(userRef);
    
    console.log(`✅ Successfully deleted participant: ${userData.name}`);
    
    // Update leaderboard after deletion
    console.log('🏆 Updating leaderboard after deletion...');
    await updateLeaderboard();
    
    console.log('🎉 Deletion operation completed successfully');
  } catch (error) {
    console.error('❌ Error deleting participant:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        throw new Error('Insufficient permissions to delete participant. Please ensure you are logged in as an admin.');
      } else if (error.message.includes('not found')) {
        throw new Error('Participant not found. They may have already been deleted or the ID is incorrect.');
      } else if (error.message.includes('admin')) {
        throw new Error('Cannot delete admin users for security reasons.');
      } else {
        throw new Error(`Deletion failed: ${error.message}`);
      }
    } else {
      throw new Error('Unknown error occurred during deletion operation.');
    }
  }
};

// Enhanced Create or update task function
export const createOrUpdateTask = async (task: Omit<Task, 'id'> & { id?: string }): Promise<void> => {
  try {
    console.log('Creating/updating task:', task.title);
    
    if (task.id) {
      // Update existing task
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        dayNumber: task.dayNumber,
        title: task.title,
        description: task.description,
        points: task.points,
        category: task.category,
        difficulty: task.difficulty,
        estimatedTime: task.estimatedTime,
        tips: task.tips || [],
        updatedAt: serverTimestamp()
      });
      console.log('Task updated successfully:', task.title);
    } else {
      // Create new task
      const taskRef = doc(collection(db, 'tasks'));
      const newTask = {
        ...task,
        id: taskRef.id,
        isActive: false, // New tasks start as inactive
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(taskRef, newTask);
      console.log('Task created successfully:', task.title);
    }
  } catch (error) {
    console.error('Error creating/updating task:', error);
    throw error;
  }
};

// Delete task function
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    console.log('Deleting task:', taskId);
    const taskRef = doc(db, 'tasks', taskId);
    
    // Check if task exists
    const taskDoc = await getDoc(taskRef);
    if (!taskDoc.exists()) {
      throw new Error('Task not found');
    }
    
    // Note: In a real app, you might want to soft delete or check if task is in use
    await deleteDoc(taskRef);
    console.log('Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Bulk update task points
export const updateTaskPoints = async (taskId: string, points: number): Promise<void> => {
  try {
    console.log('Updating task points:', taskId, points);
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      points: points,
      updatedAt: serverTimestamp()
    });
    console.log('Task points updated successfully');
  } catch (error) {
    console.error('Error updating task points:', error);
    throw error;
  }
};

// Reorder tasks by day number
export const reorderTasks = async (taskUpdates: { id: string, dayNumber: number }[]): Promise<void> => {
  try {
    console.log('Reordering tasks:', taskUpdates.length, 'tasks');
    const batch = writeBatch(db);
    
    taskUpdates.forEach(({ id, dayNumber }) => {
      const taskRef = doc(db, 'tasks', id);
      batch.update(taskRef, {
        dayNumber: dayNumber,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log('Tasks reordered successfully');
  } catch (error) {
    console.error('Error reordering tasks:', error);
    throw error;
  }
};

// Get user progress
export const getUserProgress = async (userId: string): Promise<UserRole | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserRole;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
};

// Challenge Settings Functions

// Helper function to generate challenge days with proper date tracking
const generateChallengeDays = (startDate: Date, dayDuration: number): ChallengeDay[] => {
  const days: ChallengeDay[] = [];
  
  // Generate all 15 days (0-14)
  for (let dayNumber = 0; dayNumber <= 14; dayNumber++) {
    const scheduledDate = new Date(startDate.getTime() + (dayNumber * dayDuration * 60 * 60 * 1000));
    
    // Tracking date is the day before the scheduled date (yesterday's tracking)
    const trackingDate = new Date(scheduledDate.getTime() - (24 * 60 * 60 * 1000));
    
    days.push({
      dayNumber,
      scheduledDate: Timestamp.fromDate(scheduledDate),
      trackingDate: Timestamp.fromDate(trackingDate),
      isActive: dayNumber === 0, // Only trial day starts active
      isCompleted: false
    });
  }
  
  return days;
};

// Helper function to calculate current day based on elapsed time
const calculateCurrentDay = (startDate: Date, dayDuration: number, isPaused: boolean, pausedAt?: Date): number => {
  if (isPaused && pausedAt) {
    // If paused, calculate based on time until pause
    const elapsed = pausedAt.getTime() - startDate.getTime();
    const daysPassed = Math.floor(elapsed / (dayDuration * 60 * 60 * 1000));
    return Math.min(Math.max(daysPassed, 0), 14);
  }
  
  // Calculate based on current time
  const now = new Date();
  const elapsed = now.getTime() - startDate.getTime();
  const daysPassed = Math.floor(elapsed / (dayDuration * 60 * 60 * 1000));
  return Math.min(Math.max(daysPassed, 0), 14);
};

// Helper function to recalculate remaining days when resuming
const recalculateChallengeDays = (originalDays: ChallengeDay[], pausedDay: number, resumeDate: Date, dayDuration: number): ChallengeDay[] => {
  const updatedDays = [...originalDays];
  
  // Update remaining days starting from the paused day
  for (let i = pausedDay; i <= 14; i++) {
    const dayOffset = i - pausedDay;
    const newScheduledDate = new Date(resumeDate.getTime() + (dayOffset * dayDuration * 60 * 60 * 1000));
    const newTrackingDate = new Date(newScheduledDate.getTime() - (24 * 60 * 60 * 1000));
    
    updatedDays[i] = {
      ...updatedDays[i],
      scheduledDate: Timestamp.fromDate(newScheduledDate),
      trackingDate: Timestamp.fromDate(newTrackingDate)
    };
  }
  
  return updatedDays;
};

// Initialize challenge settings with default values
export const initializeChallengeSettings = async (): Promise<ChallengeSettings> => {
  try {
    console.log('Initializing challenge settings...');
    
    const settingsRef = doc(db, 'settings', 'challenge');
    const now = new Date();
    const challengeDays = generateChallengeDays(now, 24);
    
    const defaultSettings: ChallengeSettings = {
      id: 'challenge',
      isActive: false,
      isPaused: false,
      startDate: null,
      currentDay: 0,
      dayDuration: 24, // 24 hours
      trialEnabled: true,
      challengeDays,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(settingsRef, defaultSettings);
    console.log('Challenge settings initialized successfully');
    
    return defaultSettings;
  } catch (error) {
    console.error('Error initializing challenge settings:', error);
    throw error;
  }
};

// Get challenge settings
export const getChallengeSettings = async (): Promise<ChallengeSettings | null> => {
  try {
    console.log('Getting challenge settings...');
    
    const settingsRef = doc(db, 'settings', 'challenge');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      console.log('Challenge settings found');
      return settingsDoc.data() as ChallengeSettings;
    }
    
    // Create default settings if none exist
    console.log('No challenge settings found, creating default...');
    return await initializeChallengeSettings();
  } catch (error) {
    console.error('Error getting challenge settings:', error);
    return null;
  }
};

// Update challenge settings
export const updateChallengeSettings = async (settings: Partial<ChallengeSettings>): Promise<void> => {
  try {
    console.log('Updating challenge settings:', settings);
    
    const settingsRef = doc(db, 'settings', 'challenge');
    
    // Check if document exists first
    const currentDoc = await getDoc(settingsRef);
    
    if (!currentDoc.exists()) {
      console.log('Challenge settings document does not exist, creating it...');
      const defaultSettings: ChallengeSettings = {
        id: 'challenge',
        isActive: false,
        isPaused: false,
        startDate: null,
        currentDay: 0,
        dayDuration: 24,
        trialEnabled: true,
        challengeDays: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...settings
      };
      await setDoc(settingsRef, defaultSettings);
    } else {
      console.log('Updating existing challenge settings...');
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
    }
    
    console.log('Challenge settings updated successfully');
  } catch (error) {
    console.error('Detailed error updating challenge settings:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

// Start challenge with automatic date generation
export const startChallenge = async (): Promise<void> => {
  try {
    console.log('Starting challenge with automatic date tracking...');
    
    // First ensure default tasks exist
    const tasksQuery = query(collection(db, 'tasks'));
    const tasksSnapshot = await getDocs(tasksQuery);
    
    if (tasksSnapshot.empty) {
      console.log('No tasks found, initializing default tasks...');
      await initializeDefaultTasks();
    }
    
    // Generate challenge dates starting from now
    const startDate = new Date();
    const challengeDays = generateChallengeDays(startDate, 24); // 24 hours per day
    
    console.log('Generated challenge schedule:');
    challengeDays.forEach(day => {
      const scheduledDate = day.scheduledDate.toDate();
      const trackingDate = day.trackingDate.toDate();
      console.log(`Day ${day.dayNumber}: Scheduled ${scheduledDate.toLocaleDateString()} (Tracking ${trackingDate.toLocaleDateString()})`);
    });
    
    // Update challenge settings
    const settings: Partial<ChallengeSettings> = {
      isActive: true,
      isPaused: false,
      startDate: Timestamp.fromDate(startDate),
      currentDay: 0, // Start with trial day
      challengeDays,
      pausedAt: null,
      resumedAt: null
    };
    
    console.log('Updating challenge settings...');
    await updateChallengeSettings(settings);
    
    // Activate trial day task (day 0)
    const trialTasksQuery = query(collection(db, 'tasks'), where('dayNumber', '==', 0));
    const trialTasksSnapshot = await getDocs(trialTasksQuery);
    
    console.log('Found trial tasks:', trialTasksSnapshot.size);
    
    if (!trialTasksSnapshot.empty) {
      const batch = writeBatch(db);
      trialTasksSnapshot.docs.forEach(taskDoc => {
        console.log('Activating task:', taskDoc.data().title);
        batch.update(taskDoc.ref, { isActive: true });
      });
      await batch.commit();
      console.log('Trial day tasks activated successfully');
    } else {
      console.warn('No trial day tasks found to activate');
    }
    
    console.log('Challenge started successfully with 14-day schedule!');
  } catch (error) {
    console.error('Detailed error starting challenge:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

// Stop challenge
export const stopChallenge = async (): Promise<void> => {
  try {
    console.log('Stopping challenge...');
    
    const settings: Partial<ChallengeSettings> = {
      isActive: false,
      isPaused: false,
      currentDay: 0,
      pausedAt: null,
      resumedAt: null
    };
    
    console.log('Updating challenge settings to inactive...');
    await updateChallengeSettings(settings);
    
    // Deactivate all tasks
    const tasksQuery = query(collection(db, 'tasks'));
    const tasksSnapshot = await getDocs(tasksQuery);
    
    console.log('Found tasks to deactivate:', tasksSnapshot.size);
    
    if (!tasksSnapshot.empty) {
      const batch = writeBatch(db);
      tasksSnapshot.docs.forEach(taskDoc => {
        batch.update(taskDoc.ref, { isActive: false });
      });
      await batch.commit();
      console.log('All tasks deactivated successfully');
    }
    
    console.log('Challenge stopped successfully!');
  } catch (error) {
    console.error('Detailed error stopping challenge:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

// Pause challenge
export const pauseChallenge = async (): Promise<void> => {
  try {
    console.log('Pausing challenge...');
    
    const settings: Partial<ChallengeSettings> = {
      isPaused: true,
      pausedAt: serverTimestamp()
    };
    
    console.log('Updating challenge settings to paused...');
    await updateChallengeSettings(settings);
    
    // Deactivate all tasks (pause acts like stop for now)
    const tasksQuery = query(collection(db, 'tasks'));
    const tasksSnapshot = await getDocs(tasksQuery);
    
    console.log('Found tasks to deactivate during pause:', tasksSnapshot.size);
    
    if (!tasksSnapshot.empty) {
      const batch = writeBatch(db);
      tasksSnapshot.docs.forEach(taskDoc => {
        batch.update(taskDoc.ref, { isActive: false });
      });
      await batch.commit();
      console.log('All tasks deactivated for pause');
    }
    
    console.log('Challenge paused successfully!');
  } catch (error) {
    console.error('Error pausing challenge:', error);
    throw error;
  }
};

// Resume challenge with recalculated dates
export const resumeChallenge = async (): Promise<void> => {
  try {
    console.log('Resuming challenge...');
    
    // Get current settings to calculate where we left off
    const currentSettings = await getChallengeSettings();
    if (!currentSettings || !currentSettings.isPaused || !currentSettings.pausedAt) {
      throw new Error('Challenge is not currently paused');
    }
    
    const resumeDate = new Date();
    const pausedAt = currentSettings.pausedAt.toDate();
    const startDate = currentSettings.startDate.toDate();
    
    // Calculate which day we were on when paused
    const pausedDay = calculateCurrentDay(startDate, currentSettings.dayDuration, true, pausedAt);
    
    // Recalculate remaining challenge days from resume point
    const updatedChallengeDays = recalculateChallengeDays(
      currentSettings.challengeDays,
      pausedDay,
      resumeDate,
      currentSettings.dayDuration
    );
    
    console.log('Recalculated challenge schedule from resume:');
    updatedChallengeDays.slice(pausedDay).forEach(day => {
      const scheduledDate = day.scheduledDate.toDate();
      const trackingDate = day.trackingDate.toDate();
      console.log(`Day ${day.dayNumber}: Scheduled ${scheduledDate.toLocaleDateString()} (Tracking ${trackingDate.toLocaleDateString()})`);
    });
    
    const settings: Partial<ChallengeSettings> = {
      isPaused: false,
      resumedAt: serverTimestamp(),
      currentDay: Math.max(pausedDay, 0), // Resume from paused day or trial
      challengeDays: updatedChallengeDays
    };
    
    console.log(`Resuming challenge from Day ${pausedDay}...`);
    await updateChallengeSettings(settings);
    
    // Activate current day tasks
    const currentDayTasks = query(collection(db, 'tasks'), where('dayNumber', '==', Math.max(pausedDay, 0)));
    const currentTasksSnapshot = await getDocs(currentDayTasks);
    
    if (!currentTasksSnapshot.empty) {
      const batch = writeBatch(db);
      currentTasksSnapshot.docs.forEach(taskDoc => {
        console.log('Reactivating task:', taskDoc.data().title);
        batch.update(taskDoc.ref, { isActive: true });
      });
      await batch.commit();
      console.log(`Day ${pausedDay} tasks reactivated successfully`);
    }
    
    console.log('Challenge resumed successfully!');
  } catch (error) {
    console.error('Error resuming challenge:', error);
    throw error;
  }
};

// Advance to next day
export const advanceToNextDay = async (currentDay: number): Promise<void> => {
  try {
    const nextDay = currentDay + 1;
    
    // Deactivate current day tasks
    if (currentDay >= 0) {
      const currentTasksQuery = query(collection(db, 'tasks'), where('dayNumber', '==', currentDay));
      const currentTasksSnapshot = await getDocs(currentTasksQuery);
      
      const batch = writeBatch(db);
      currentTasksSnapshot.docs.forEach(taskDoc => {
        batch.update(taskDoc.ref, { isActive: false });
      });
      await batch.commit();
    }
    
    // Activate next day tasks (if within range)
    if (nextDay <= 14) {
      const nextTasksQuery = query(collection(db, 'tasks'), where('dayNumber', '==', nextDay));
      const nextTasksSnapshot = await getDocs(nextTasksQuery);
      
      const batch = writeBatch(db);
      nextTasksSnapshot.docs.forEach(taskDoc => {
        batch.update(taskDoc.ref, { isActive: true });
      });
      await batch.commit();
      
      // Update challenge settings
      await updateChallengeSettings({ currentDay: nextDay });
    } else {
      // Challenge completed, stop it
      await stopChallenge();
    }
  } catch (error) {
    console.error('Error advancing to next day:', error);
    throw error;
  }
};

// Subscribe to challenge settings
export const subscribeToChallengeSettings = (callback: (settings: ChallengeSettings | null) => void) => {
  const settingsRef = doc(db, 'settings', 'challenge');
  
  return onSnapshot(settingsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as ChallengeSettings);
    } else {
      callback(null);
    }
  });
};

// Leaderboard Functions

// Calculate and update leaderboard
export const updateLeaderboard = async (): Promise<void> => {
  try {
    const participants = await getParticipants();
    
    if (participants.length === 0) {
      console.log('No participants found, skipping leaderboard update');
      return;
    }
    
    // Sort by total points, then by completed tasks
    const sortedParticipants = participants.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.completedTasks - a.completedTasks;
    });
    
    // Only update if there are changes in ranking
    const needsUpdate = sortedParticipants.some((participant, index) => {
      const expectedRank = index + 1;
      return participant.rank !== expectedRank;
    });
    
    if (!needsUpdate) {
      console.log('No ranking changes detected, skipping leaderboard update');
      return;
    }
    
    // Update ranks in smaller batches to avoid conflicts
    const batchSize = 10;
    for (let i = 0; i < sortedParticipants.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchParticipants = sortedParticipants.slice(i, i + batchSize);
      
      batchParticipants.forEach((participant, batchIndex) => {
        const userRef = doc(db, 'users', participant.userId);
        const globalIndex = i + batchIndex;
        batch.update(userRef, { 
          rank: globalIndex + 1,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log(`Updated leaderboard batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sortedParticipants.length / batchSize)}`);
    }
    
    console.log('Leaderboard updated successfully');
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    // Don't throw the error to prevent blocking user progress updates
    console.warn('Leaderboard update failed, but user progress was saved');
  }
};

// Get leaderboard
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'participant'),
      orderBy('totalPoints', 'desc'),
      orderBy('completedTasks', 'desc')
    );
    const snapshot = await getDocs(usersQuery);
    
    return snapshot.docs.map((doc, index) => {
      const data = doc.data() as UserRole;
      return {
        userId: doc.id,
        name: data.name,
        email: data.email,
        totalPoints: data.totalPoints || 0,
        completedTasks: Object.values(data.progress).filter(Boolean).length,
        rank: index + 1,
        lastUpdated: data.updatedAt || data.joinedAt
      };
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

// Subscribe to leaderboard
export const subscribeToLeaderboard = (callback: (leaderboard: LeaderboardEntry[]) => void) => {
  const usersQuery = query(
    collection(db, 'users'),
    where('role', '==', 'participant')
  );
  
  return onSnapshot(usersQuery, async (snapshot) => {
    console.log('🔍 subscribeToLeaderboard: Snapshot received', {
      docsCount: snapshot.docs.length,
      isEmpty: snapshot.empty
    });
    
    const participants = snapshot.docs.map(doc => {
      const data = doc.data() as UserRole;
      console.log('📝 Processing user:', {
        id: doc.id,
        name: data.name,
        role: data.role,
        progressKeys: Object.keys(data.progress || {}),
        totalPoints: data.totalPoints
      });      
      
      const progress = data.progress || {};
      const completedTasks = Object.values(progress).filter(Boolean).length;
      
      return {
        userId: doc.id,
        name: data.name,
        email: data.email,
        totalPoints: data.totalPoints || 0,
        completedTasks,
        rank: 0, // Will be assigned based on sorted order
        lastUpdated: data.updatedAt || data.joinedAt
      };
    });
    

    // Sort by total points, then by completed tasks
    const sortedParticipants = participants.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.completedTasks - a.completedTasks;
    });
    
    // Assign ranks based on sorted order
    const rankedParticipants = sortedParticipants.map((participant, index) => ({
      ...participant,
      rank: index + 1
    }));
    
    console.log('🏆 Leaderboard data:', {
      totalParticipants: rankedParticipants.length,
      topParticipants: rankedParticipants.slice(0, 3).map(p => ({ name: p.name, points: p.totalPoints, rank: p.rank }))
    });
    
    callback(rankedParticipants);
  });
};

// Subscribe to user progress changes
export const subscribeToUserProgress = (
  userId: string, 
  callback: (user: UserRole | null) => void
) => {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserRole);
    } else {
      callback(null);
    }
  });
};

// Bulk import tasks from JSON
export const bulkImportTasks = async (tasksData: {
  tasks: Omit<Task, 'id'>[];
  importMetadata?: any;
}, options: {
  skipExisting?: boolean;
  replaceExisting?: boolean;
} = {}): Promise<{ success: number; failed: number; skipped: number; errors: string[] }> => {
  console.log('Starting bulk import of tasks...');
  
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[]
  };

  try {
    // Process tasks in batches to avoid overwhelming Firestore
    const batchSize = 10;
    const tasks = tasksData.tasks;
    
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      const batchPromises = batch.map(async (taskData) => {
        try {
          // Check if task with same dayNumber already exists
          const existingQuery = query(
            collection(db, 'tasks'),
            where('dayNumber', '==', taskData.dayNumber)
          );
          const existingDocs = await getDocs(existingQuery);
          
          if (!existingDocs.empty) {
            const existingTask = existingDocs.docs[0].data() as Task;
            
            if (options.skipExisting) {
              results.skipped++;
              console.log(`⏭️ Skipped day ${taskData.dayNumber}: "${taskData.title}" (existing: "${existingTask.title}")`);
              return;
            } else if (options.replaceExisting) {
              // Delete existing task and create new one
              await deleteDoc(existingDocs.docs[0].ref);
              console.log(`🔄 Replacing day ${taskData.dayNumber}: "${existingTask.title}" -> "${taskData.title}"`);
            } else {
              throw new Error(
                `Task for day ${taskData.dayNumber} already exists: "${existingTask.title}". ` +
                `Cannot import "${taskData.title}". Use skip or replace option to handle duplicates.`
              );
            }
          }

          // Create the task
          await createOrUpdateTask(taskData);
          results.success++;
          console.log(`✅ Imported task for day ${taskData.dayNumber}: ${taskData.title}`);
        } catch (error) {
          results.failed++;
          const errorMsg = `Failed to import task "${taskData.title}" (Day ${taskData.dayNumber}): ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      });
      
      // Wait for current batch to complete before processing next batch
      await Promise.all(batchPromises);
      
      // Small delay between batches to be respectful to Firestore
      if (i + batchSize < tasks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`Bulk import completed: ${results.success} successful, ${results.failed} failed, ${results.skipped} skipped`);
    return results;
    
  } catch (error) {
    console.error('Error during bulk import:', error);
    throw new Error(`Bulk import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Clear all existing tasks (use with caution!)
export const clearAllTasks = async (): Promise<number> => {
  console.warn('⚠️ Clearing all tasks from database...');
  
  try {
    // First, get all tasks
    const tasksQuery = query(collection(db, 'tasks'));
    const snapshot = await getDocs(tasksQuery);
    
    console.log(`Found ${snapshot.docs.length} tasks to delete`);
    
    if (snapshot.empty) {
      console.log('No tasks to delete');
      return 0;
    }
    
    // Log the tasks we're about to delete for debugging
    snapshot.docs.forEach(doc => {
      const data = doc.data() as Task;
      console.log(`Will delete: Day ${data.dayNumber} - ${data.title} (ID: ${doc.id})`);
    });
    
    // Use batch operations for better reliability
    const batchSize = 10;
    let deletedCount = 0;
    
    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchDocs = snapshot.docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        console.log(`Adding to batch delete: ${doc.id}`);
        batch.delete(doc.ref);
      });
      
      console.log(`Committing batch ${Math.floor(i / batchSize) + 1} with ${batchDocs.length} deletions...`);
      await batch.commit();
      deletedCount += batchDocs.length;
      
      console.log(`✅ Deleted batch ${Math.floor(i / batchSize) + 1}: ${batchDocs.length} tasks`);
      
      // Small delay between batches
      if (i + batchSize < snapshot.docs.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Verify deletion by checking if any tasks remain
    const verifyQuery = query(collection(db, 'tasks'));
    const verifySnapshot = await getDocs(verifyQuery);
    
    if (verifySnapshot.empty) {
      console.log(`✅ Verification successful: All tasks deleted. Total: ${deletedCount}`);
    } else {
      console.warn(`⚠️ Warning: ${verifySnapshot.docs.length} tasks still remain after deletion!`);
      verifySnapshot.docs.forEach(doc => {
        const data = doc.data() as Task;
        console.warn(`Remaining task: Day ${data.dayNumber} - ${data.title} (ID: ${doc.id})`);
      });
    }
    
    console.log(`✅ Successfully deleted ${deletedCount} tasks`);
    return deletedCount;
  } catch (error) {
    console.error('Detailed error clearing tasks:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to clear tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Force fresh reload of tasks (bypasses any caching)
export const forceReloadTasks = async (): Promise<Task[]> => {
  try {
    console.log('Force reloading tasks from database...');
    
    // Use a fresh query without cache
    const tasksQuery = query(collection(db, 'tasks'), orderBy('dayNumber'));
    const snapshot = await getDocs(tasksQuery);
    
    console.log(`Force reload found ${snapshot.docs.length} tasks`);
    
    if (snapshot.empty) {
      console.log('Database is empty after force reload');
      return [];
    }
    
    const tasks = snapshot.docs.map(doc => {
      const data = doc.data() as Task;
      console.log(`Found task: Day ${data.dayNumber} - ${data.title} (ID: ${doc.id})`);
      return {
        ...data,
        id: doc.id
      } as Task;
    });
    
    return tasks;
  } catch (error) {
    console.error('Error force reloading tasks:', error);
    return [];
  }
};
// Helper function to get task summary by day number
export const getTasksSummary = async (): Promise<{ dayNumber: number; title: string; id: string }[]> => {
  try {
    const tasksQuery = query(collection(db, 'tasks'), orderBy('dayNumber'));
    const snapshot = await getDocs(tasksQuery);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as Task;
      return {
        dayNumber: data.dayNumber,
        title: data.title,
        id: doc.id
      };
    });
  } catch (error) {
    console.error('Error getting tasks summary:', error);
    return [];
  }
};

export default db;