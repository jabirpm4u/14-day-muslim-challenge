import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getAvailableTasks,
  subscribeToUserProgress,
  subscribeToChallengeSettings,
  updateUserProgress,
  Task,
  ChallengeSettings,
} from "../../firebase/firestore";
import { UserRole } from "../../firebase/auth";
import Leaderboard from "../ui/Leaderboard";
import { 
  CheckCircle,
  Trophy,
  Star,
  LogOut,
  Clock,
  Moon,
  Lock,
  User,
  Home,
  Award,
  BookOpen,
  Target,
  CalendarDays
} from "lucide-react";

// Ultra-Compact Task Card for mobile-first design with complete isolation
const CompactTaskCard: React.FC<{
  task: Task;
  isCompleted: boolean;
  isUnlocked: boolean;
  onToggle: (
    taskId: string,
    dayKey: string,
    completed: boolean,
    points: number
  ) => void;
  isUpdating: boolean;
  onClick: () => void;
  sequenceNumber: number;
  trackingDate: string;
}> = React.memo(
  ({ task, isCompleted, isUnlocked, onToggle, isUpdating, onClick, sequenceNumber, trackingDate }) => {
    // Create a unique instance ID for this specific card to prevent cross-card interference
    const [instanceId] = useState(
      () =>
        `${task.id}-${task.dayNumber}-${Math.random()
          .toString(36)
          .substr(2, 9)}`
    );

    // Local state completely isolated to this card instance
    const [localJustCompleted, setLocalJustCompleted] = useState(false);
    const [localIsCompleted, setLocalIsCompleted] = useState(isCompleted);
    const [localIsUpdating, setLocalIsUpdating] = useState(isUpdating);

    // Only sync external state changes for THIS specific card
    useEffect(() => {
      setLocalIsCompleted(isCompleted);
    }, [isCompleted]);

    useEffect(() => {
      setLocalIsUpdating(isUpdating);
    }, [isUpdating]);

    // Cleanup effect to reset local updating state when external state changes
    useEffect(() => {
      if (!isUpdating && localIsUpdating) {
        setLocalIsUpdating(false);
      }
    }, [isUpdating, localIsUpdating, instanceId]);

    const handleToggleClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Prevent action if already updating
        if (localIsUpdating) {
          return;
        }

        // Set local updating state immediately to prevent multiple clicks
        setLocalIsUpdating(true);

        // Only update local celebration state if this card is not completed
        if (!localIsCompleted) {
          setLocalJustCompleted(true);

          // Clear celebration effect after animation (only for this card)
          setTimeout(() => {
            setLocalJustCompleted(false);
          }, 1000);
        }

        // Call parent handler
        
        onToggle(
          task.id,
          task.id, // Use task.id as the key instead of dayNumber
          !localIsCompleted,
          task.points
        );
      },
      [
        task.id,
        task.dayNumber,
        task.points,
        localIsCompleted,
        localIsUpdating,
        onToggle,
        instanceId,
      ]
    );

    const getSequenceNumber = useCallback((index: number) => {
      return (index + 1).toString();
    }, []);

    return (
      <div
        onClick={onClick}
        className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] touch-manipulation ${
          localIsCompleted
            ? "bg-gradient-to-br from-purple-50/90 via-violet-50/80 to-indigo-50/90 border-purple-300/70 shadow-purple-200/40 ring-2 ring-purple-200/20 hover:ring-purple-300/30"
            : isUnlocked
            ? "bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 border-blue-200/50 shadow-blue-100/30 hover:shadow-blue-200/50"
            : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200/50 opacity-60"
        } ${localJustCompleted ? "animate-pulse shadow-2xl shadow-purple-300/60 ring-4 ring-purple-200/40" : ""}`}
      >
        {/* Sophisticated background pattern with layered effects */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          localIsCompleted 
            ? "bg-gradient-to-br from-purple-100/20 via-violet-100/15 to-indigo-100/20" 
            : "bg-gradient-to-br from-white/20 to-transparent"
        }`} />
        
        {/* Success shimmer effect for completed tasks */}
        {localIsCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        )}
        
        {/* Subtle success glow for completed tasks */}
        {localIsCompleted && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400/20 via-violet-400/30 to-indigo-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        {/* Success pattern overlay for completed tasks */}
        {localIsCompleted && (
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-2 right-2 w-8 h-8 border-2 border-purple-400 rounded-full" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-2 border-violet-400 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-400 rounded-full" />
          </div>
        )}
        
        <div className="p-3 relative">
          <div className="flex items-center justify-between">
            {/* Compact left side */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {/* Compact day icon with sophisticated treatment */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all duration-300 ${
                  task.dayNumber === 0
                    ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                    : localIsCompleted
                    ? "bg-gradient-to-br from-blue-400 to-indigo-500 ring-2 ring-blue-200/60 shadow-blue-200/50 group-hover:shadow-blue-300/60 group-hover:ring-blue-300/80 group-hover:scale-105"
                    : isUnlocked
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                    : "bg-gradient-to-br from-gray-400 to-slate-500"
                }`}
              >
                {!isUnlocked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <span className="text-xs font-bold">{getSequenceNumber(sequenceNumber)}</span>
                )}
              </div>

              {/* Compact content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-bold text-sm leading-tight truncate transition-colors duration-300 ${
                    localIsCompleted
                      ? "text-purple-800 group-hover:text-purple-900"
                      : isUnlocked
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {task.title}
                </h3>

                {/* Enhanced points display with sophisticated purple treatment */}
                <div className="flex items-center space-x-2 mt-0.5">
                  <span
                    className={`text-xs font-semibold transition-all duration-300 ${
                      localIsCompleted 
                        ? "text-purple-600 bg-purple-100/60 px-2 py-0.5 rounded-full group-hover:bg-purple-200/80 group-hover:text-purple-700" 
                        : "text-amber-600"
                    }`}
                  >
                    {localIsCompleted
                      ? `✓ +${task.points} pts`
                      : `${task.points} pts`}
                  </span>
                </div>
              </div>
            </div>

            {/* Compact action button */}
            {isUnlocked && (
              <button
                onClick={handleToggleClick}
                disabled={localIsUpdating}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 touch-manipulation ${
                  localIsUpdating
                    ? "bg-gray-400 text-white cursor-not-allowed shadow-lg"
                    : localIsCompleted
                    ? "bg-transparent text-purple-600 hover:scale-105"
                    : "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-blue-200/50 shadow-lg"
                } ${localJustCompleted ? "animate-bounce" : ""}`}
              >
                {localIsUpdating ? (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : localIsCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Target className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Strict comparison to prevent unnecessary re-renders
    const taskChanged =
      prevProps.task.id !== nextProps.task.id ||
      prevProps.task.dayNumber !== nextProps.task.dayNumber ||
      prevProps.task.title !== nextProps.task.title ||
      prevProps.task.points !== nextProps.task.points;
    const completedChanged = prevProps.isCompleted !== nextProps.isCompleted;
    const updatingChanged = prevProps.isUpdating !== nextProps.isUpdating;
    const unlockedChanged = prevProps.isUnlocked !== nextProps.isUnlocked;

    // Only re-render if something actually changed for this specific card
    return !(taskChanged || completedChanged || updatingChanged || unlockedChanged);
  }
);

// Premium Header Component
const PremiumHeader: React.FC<{
  currentTab: string;
  totalPoints: number;
  challengeSettings: ChallengeSettings | null;
  onSignOut: () => void;
}> = ({ 
  currentTab, 
  totalPoints, 
  challengeSettings, 
  onSignOut 
}) => {


  const getTabTitle = () => {
    switch (currentTab) {
      case "challenges":
        return "Daily Tasks";
      case "leaderboard":
        return "Leaderboard";
      case "profile":
        return "My Profile";
      default:
        return "14-Day Challenge";
    }
  };

  const getTabIcon = () => {
    switch (currentTab) {
      case "challenges":
        return <Home className="w-5 h-5 text-white" />;
      case "leaderboard":
        return <Trophy className="w-5 h-5 text-white" />;
      case "profile":
        return <User className="w-5 h-5 text-white" />;
      default:
        return <Moon className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-white/20 sticky top-0 z-50">
      {/* Main Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              {getTabIcon()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {getTabTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/50">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-700">{totalPoints}</span>
            </div>
            {challengeSettings?.isActive && (
              <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/50">
                <span className="text-sm font-bold text-blue-700">
                  {challengeSettings.currentDay === 0 ? 'Trial Day' : `Day ${challengeSettings.currentDay}`}
                </span>
              </div>
            )}
            <button
              onClick={onSignOut}
              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

// Premium Navigation Footer
const NavigationFooter: React.FC<{
  currentTab: string;
  onTabChange: (tab: string) => void;
}> = ({ currentTab, onTabChange }) => {
  const navItems = [
    {
      id: "challenges",
      icon: Home,
      label: "Tasks",
      color: "from-blue-500 to-indigo-600",
      glowColor: "shadow-blue-200/50",
    },
    {
      id: "leaderboard",
      icon: Trophy,
      label: "Board",
      color: "from-amber-500 to-orange-600",
      glowColor: "shadow-amber-200/50",
    },
    {
      id: "profile",
      icon: User,
      label: "Profile",
      color: "from-indigo-500 to-purple-600",
      glowColor: "shadow-purple-200/50",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-xl">
        <div className="px-3 py-2">
          <div className="flex justify-center">
            <div className="flex items-center bg-gray-50 rounded-2xl p-1 shadow-md">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`relative flex flex-col items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive ? `shadow-md ${item.glowColor}` : ""
                    }`}
                  >
                    {isActive && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-xl shadow-md`}
                      />
                    )}

                      <IconComponent
                      className={`w-5 h-5 transition-all duration-200 relative z-10 ${
                          isActive ? "text-white" : "text-gray-400"
                        }`}
                      />

                    <span
                      className={`text-xs font-medium mt-0.5 transition-all duration-200 relative z-10 ${
                        isActive ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParticipantDashboard: React.FC = () => {
  const { user, userRole, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userProgress, setUserProgress] = useState<UserRole | null>(null);
  const [challengeSettings, setChallengeSettings] =
    useState<ChallengeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<
    "challenges" | "leaderboard" | "profile"
  >("challenges");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Load tasks based on challenge settings
  useEffect(() => {
    const loadTasks = async () => {
      if (challengeSettings !== null) {
        setTasksLoading(true);
        const tasksData = await getAvailableTasks(challengeSettings);

        // Debug: Check for duplicate day numbers
        const dayNumbers = tasksData.map((t) => t.dayNumber);
        const duplicateDays = dayNumbers.filter(
          (day, index) => dayNumbers.indexOf(day) !== index
        );
        if (duplicateDays.length > 0) {
          console.warn("⚠️ Duplicate day numbers found:", duplicateDays);
          console.log(
            "Tasks with duplicate days:",
            tasksData.filter((t) => duplicateDays.includes(t.dayNumber))
          );
        }

        setTasks(tasksData);
        setTasksLoading(false);
      }
    };

    loadTasks();
  }, [challengeSettings]);

  useEffect(() => {
    if (user) {
      // Subscribe to user progress changes
      const unsubscribeProgress = subscribeToUserProgress(
        user.uid,
        (userData) => {
          setUserProgress(userData);
          setLoading(false);
        }
      );

      // Subscribe to challenge settings
      const unsubscribeSettings = subscribeToChallengeSettings((settings) => {
        setChallengeSettings(settings);
      });

      return () => {
        unsubscribeProgress();
        unsubscribeSettings();
      };
    }
  }, [user]);

  const handleTaskToggle = useCallback(
    async (
      taskId: string,
      dayKey: string,
      completed: boolean,
      taskPoints: number = 0
    ) => {
      if (!user) {
        console.error("No user found for task toggle");
        return;
      }

      const uniqueTaskKey = `${taskId}-${dayKey}`;

      // Prevent multiple simultaneous updates for the same task
      if (updatingTask === uniqueTaskKey) {
        return;
      }

      try {
        // Set updating state ONLY for this specific task
        setUpdatingTask(uniqueTaskKey);

        // Update in Firebase
        await updateUserProgress(user.uid, dayKey, completed, taskPoints);
      } catch (error) {
        console.error(`Error updating task ${uniqueTaskKey}:`, error);
        alert("Error updating task. Please try again.");
      } finally {
        // Clear updating state ONLY for this specific task after a short delay
        setTimeout(() => {
          setUpdatingTask((prev) => (prev === uniqueTaskKey ? null : prev));
        }, 100);
      }
    },
    [user, updatingTask]
  );

  // Get tracking date for a specific day
  const getTrackingDateForDay = (dayNumber: number): string => {
    if (!challengeSettings?.challengeDays || challengeSettings.challengeDays.length === 0) {
      // Fallback: calculate tracking date as yesterday
      const today = new Date();
      const trackingDate = new Date(today.getTime() - (24 * 60 * 60 * 1000));
      return trackingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    // Find the challenge day data
    const challengeDay = challengeSettings.challengeDays.find(day => day.dayNumber === dayNumber);
    if (challengeDay && challengeDay.trackingDate) {
      const trackingDate = challengeDay.trackingDate.toDate();
      return trackingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    // Fallback for trial day or missing data
    if (dayNumber === 0) {
      return 'Prep';
    }
    
    // Default fallback
    const today = new Date();
    const trackingDate = new Date(today.getTime() - (24 * 60 * 60 * 1000));
    return trackingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if a task is unlocked/available
  const isTaskUnlocked = (task: Task): boolean => {
    if (!challengeSettings) return false;
    if (!challengeSettings.isActive) return false;
    if (task.dayNumber === 0) return true;
    return task.dayNumber <= challengeSettings.currentDay;
  };

  // Filter tasks to show only current day's tasks
  const getCurrentDayTasks = (): Task[] => {
    if (!challengeSettings) return [];
    if (!challengeSettings.isActive) return [];
    
    // Show trial day (day 0) if current day is 0, otherwise show current day tasks
    const targetDay = challengeSettings.currentDay === 0 ? 0 : challengeSettings.currentDay;
    return tasks.filter(task => task.dayNumber === targetDay);
  };


  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
        {/* Enhanced animated background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-6 h-6 bg-blue-400/30 rounded-full animate-float shadow-lg"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-1/3 right-1/3 w-4 h-4 bg-indigo-400/40 rounded-full animate-float shadow-lg"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-purple-400/30 rounded-full animate-float shadow-lg"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/2 right-1/4 w-3 h-3 bg-cyan-400/40 rounded-full animate-float shadow-lg"
            style={{ animationDelay: "3s" }}
          />
        </div>

        <div className="text-center relative z-10">
          {/* Premium loading spinner */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl animate-pulse" />
            
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-200/30" />

            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
            <div
              className="absolute inset-2 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            />
            <div
              className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"
              style={{ animationDuration: "2s" }}
            />

            {/* Center glow */}
            <div className="absolute inset-6 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
              <Moon className="w-8 h-8 text-white relative z-10" />
            </div>
          </div>

          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Preparing Your Journey
          </h3>
          <p className="text-slate-600 mb-8 max-w-md text-lg">
            Setting up your personalized challenge experience...
          </p>

          {/* Enhanced animated dots */}
          <div className="flex items-center justify-center space-x-3">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce shadow-lg" />
            <div
              className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Challenge inactive state
  if (!challengeSettings?.isActive) {
    return (
      <div className="min-h-screen h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
          <div className="text-center max-w-lg">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Clock className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full blur-xl opacity-30 animate-pulse" />
            </div>
            
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
              Challenge Paused
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              The 14-Day Proud Muslim Challenge is currently not active.
            </p>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-8">
              <h3 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">While you wait:</h3>
              <ul className="space-y-4 text-left">
                <li className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-violet-600" />
                  </div>
                  <span className="text-slate-700 text-lg font-medium">
                    Prepare your intention (niyyah)
                  </span>
                </li>
                <li className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-violet-600" />
                  </div>
                  <span className="text-slate-700 text-lg font-medium">
                    Review Islamic practices
                  </span>
                </li>
                <li className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-violet-600" />
                  </div>
                  <span className="text-slate-700 text-lg font-medium">
                    Set your goals for the challenge
                  </span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={signOut}
              className="bg-gradient-to-r from-rose-500 via-red-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-rose-200/50 transition-all duration-300 transform hover:scale-105"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completedTasks = userProgress
    ? Object.values(userProgress.progress).filter(Boolean).length
    : 0;
  const totalPoints = userProgress?.totalPoints || 0;
  
  // Calculate progress based on current day tasks
  const currentDayTasks = getCurrentDayTasks();
  const currentDayCompletedTasks = currentDayTasks.filter(task => {
    return userProgress?.progress?.[task.id] === true;
  }).length;
  
  const progressPercentage = currentDayTasks.length > 0 
    ? (currentDayCompletedTasks / currentDayTasks.length) * 100 
    : 0;

  // Get current day info
  const getCurrentDayInfo = () => {
    const now = new Date();
    const gregorianDate = now.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
    
    const currentDay = challengeSettings?.currentDay ?? 1;
    
    return {
      currentDay: currentDay,
      isTrialDay: currentDay === 0,
      gregorianDate: gregorianDate
    };
  };

  return (
    <div className="min-h-screen h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
                </div>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <PremiumHeader
          currentTab={currentTab}
          totalPoints={totalPoints}
          challengeSettings={challengeSettings}
          onSignOut={signOut}
        />
      </div>

      {/* Scrollable Content Area */}
      <div className="pt-18 pb-20 min-h-[calc(100dvh-4.5rem)] overflow-y-auto">
          {currentTab === "challenges" && (
            <div className="px-3 pt-0 pb-3">
              {/* Optimized Tasks Container */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

                <div className="p-4 pt-4">
                    {/* Day Tracking Card - Only for Challenges Tab */}
                    <div className="mb-2 mt-1">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-2 shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10" />
                        <div className="relative text-white text-center flex items-center justify-center space-x-2">
                          <CalendarDays className="w-4 h-4 text-white" />
                          <div className="text-xs font-bold text-white">
                            Tracking: {getTrackingDateForDay(getCurrentDayInfo().currentDay)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Task List Header with Progress */}
                    <div className="mb-4 pb-3 border-b border-gray-200/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {getCurrentDayInfo().isTrialDay ? 'Trial Day Tasks' : `Day ${getCurrentDayInfo().currentDay} Tasks`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {currentDayCompletedTasks} of {currentDayTasks.length} completed
                          </p>
                  </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                          <span className="text-sm font-bold text-blue-600">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </div>

                  {tasksLoading ? (
                      <div className="space-y-3">
                        {[...Array(6)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-3 h-16">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-xl" />
                                <div className="flex-1 space-y-1">
                                  <div className="h-3 bg-gray-300 rounded w-3/4" />
                                  <div className="h-2 bg-gray-300 rounded w-1/2" />
                </div>
                                <div className="w-8 h-8 bg-gray-300 rounded-xl" />
                  </div>
              </div>
                        </div>
                      ))}
                    </div>
                    ) : getCurrentDayTasks().length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-base font-bold text-gray-700 mb-1">
                          No Tasks Today
                      </h4>
                        <p className="text-sm text-gray-500">
                          {challengeSettings?.currentDay === 0 
                            ? "Trial day tasks coming soon"
                            : `Day ${challengeSettings?.currentDay} tasks loading...`
                          }
                      </p>
                    </div>
                  ) : (
                    <div
                        className="space-y-3 overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                        style={{ maxHeight: "calc(100dvh - 280px)" }}
                      >
                      {getCurrentDayTasks().map((task, index) => {
                        // Fix: Use task.id as the key instead of dayNumber
                        const taskKey = task.id;
                        const isCompleted = userProgress?.progress?.[taskKey] === true;
                        
                        const uniqueTaskKey = `${task.id}-${taskKey}`;
                        const isUpdating = updatingTask === uniqueTaskKey;
                        const isUnlocked = isTaskUnlocked(task);
                        const cardUniqueKey = `card-${task.id}-${
                          task.dayNumber
                        }-${task.title.replace(/\s+/g, "-")}-${isCompleted ? 'completed' : 'incomplete'}`;

                        return (
                          <CompactTaskCard
                            key={cardUniqueKey}
                            task={task}
                            isCompleted={isCompleted}
                            isUnlocked={isUnlocked}
                            onToggle={handleTaskToggle}
                            isUpdating={isUpdating}
                            onClick={() => handleTaskClick(task)}
                            sequenceNumber={index}
                            trackingDate={getTrackingDateForDay(task.dayNumber)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentTab === "leaderboard" && (
            <div className="px-3 py-3">
              {/* Leaderboard Container */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                
                <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 180px)" }}>
                  <Leaderboard className="shadow-none" maxEntries={50} />
                </div>
              </div>
            </div>
          )}

          {currentTab === "profile" && (
            <div className="px-3 py-3">
              {/* Profile Container */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                
                <div className="p-4">
                    <div className="space-y-4">
                      {/* Compact Profile Header */}
                      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10" />
                        
                        <div className="relative flex items-center space-x-4">
                          {/* Profile Avatar */}
                          <div className="relative">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                              <User className="w-8 h-8 text-white" />
                    </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg" />
                          </div>
                          
                          {/* User Info */}
                    <div className="flex-1">
                            <h2 className="text-lg font-bold mb-1">
                              {userRole?.name || 'User'}
                      </h2>
                            <p className="text-indigo-100 text-sm mb-2">{userRole?.email}</p>
                            
                            {/* Stats Row */}
                            <div className="flex space-x-3">
                              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                                <Award className="w-3 h-3" />
                                <span className="text-xs font-bold">
                                  #{userProgress?.rank || "-"}
                          </span>
                        </div>
                              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                                <Star className="w-3 h-3" />
                                <span className="text-xs font-bold">{totalPoints}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                      {/* Yesterday's Progress Card */}
                      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30" />
                        
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-base font-bold text-gray-900">
                                Today's Progress
                              </h3>
                              <p className="text-xs text-gray-500">
                                {getCurrentDayInfo().isTrialDay ? 'Trial Day' : `Day ${getCurrentDayInfo().currentDay}`} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="bg-blue-50 px-2 py-1 rounded-lg border border-blue-200/50">
                              <span className="text-xs font-bold text-blue-700">
                                {challengeSettings?.currentDay === 0 ? 'Trial' : `Day ${challengeSettings?.currentDay}`}
                              </span>
                            </div>
                          </div>
                          
                          {/* Compact progress bar */}
                          <div className="relative mb-3">
                            <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                            <div className="absolute -top-0.5 right-0 bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                              {Math.round(progressPercentage)}%
                  </div>
                </div>
                          
                          {/* Progress Stats */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600 mb-0.5">
                                {currentDayCompletedTasks}
                              </div>
                              <div className="text-xs text-gray-600">Completed</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-600 mb-0.5">
                                {currentDayTasks.length - currentDayCompletedTasks}
                              </div>
                              <div className="text-xs text-gray-600">Remaining</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Achievement Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Total Points Card */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200/50 shadow-md">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                              <Star className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-base font-bold text-amber-700">{totalPoints}</div>
                              <div className="text-xs text-amber-600">Total Points</div>
                            </div>
                          </div>
                        </div>

                        {/* Overall Progress Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200/50 shadow-md">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                              <Target className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-base font-bold text-blue-700">{completedTasks}/15</div>
                              <div className="text-xs text-blue-600">Overall Tasks</div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 safe-area-pb">
        <NavigationFooter
          currentTab={currentTab}
          onTabChange={(tab) =>
            setCurrentTab(tab as "challenges" | "leaderboard" | "profile")
          }
        />
      </div>

      {/* Premium Task Detail Modal */}
      {isTaskModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-white/50 relative">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="font-bold text-xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {selectedTask.title}
                </h2>
                </div>
                <button
                  onClick={() => setIsTaskModalOpen(false)}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
                >
                  <span className="text-gray-400 text-2xl group-hover:text-gray-600 group-hover:scale-110 transition-all duration-200">×</span>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-slate-700 leading-relaxed text-lg mb-4">
                {selectedTask.description}
              </p>
                
                {/* Task info badges */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-2xl border border-blue-200/50">
                    <span className="text-sm font-bold text-blue-700">
                      Day {selectedTask.dayNumber || 'Trial'}
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-2xl border border-amber-200/50">
                    <span className="text-sm font-bold text-amber-700">
                      {selectedTask.points} points
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedTask.tips && selectedTask.tips.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50 shadow-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-lg bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      Pro Tips
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    {selectedTask.tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">
                          {tip}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantDashboard;

