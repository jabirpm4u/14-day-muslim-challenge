import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getAvailableTasks,
  subscribeToUserProgress,
  subscribeToChallengeSettings,
  subscribeToParticipants,
  updateUserProgress,
  Task,
  ChallengeSettings,
  UserProgress,
  checkAndStartChallenge,
  calculateActualAvailableTasks,
} from "../../firebase/firestore";
import { UserRole } from "../../firebase/auth";
import Leaderboard from "../ui/Leaderboard";
import PreChallengeCountdown from "../ui/PreChallengeCountdown";
import ChallengeCompletion from "../ui/ChallengeCompletion";
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
  Pause,
  RotateCcw,
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
  ({
    task,
    isCompleted,
    isUnlocked,
    onToggle,
    isUpdating,
    onClick,
    sequenceNumber,
  }) => {
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
          task.id, // Use task ID as the unique key
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
            ? "bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-indigo-50/90 border-indigo-300/70 shadow-indigo-200/40 ring-2 ring-indigo-200/20 hover:ring-indigo-300/30"
            : isUnlocked
            ? "bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 border-blue-200/50 shadow-blue-100/30 hover:shadow-blue-200/50"
            : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200/50 opacity-60"
        } ${
          localJustCompleted
            ? "animate-pulse shadow-2xl shadow-indigo-300/60 ring-4 ring-indigo-200/40"
            : ""
        }`}
      >
        {/* Sophisticated background pattern with layered effects */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            localIsCompleted
              ? "bg-gradient-to-br from-indigo-100/20 via-blue-100/15 to-indigo-100/20"
              : "bg-gradient-to-br from-white/20 to-transparent"
          }`}
        />

        {/* Success shimmer effect for completed tasks */}
        {localIsCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-200/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        )}

        {/* Subtle success glow for completed tasks */}
        {localIsCompleted && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 via-indigo-400/30 to-blue-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}

        {/* Success pattern overlay for completed tasks */}
        {localIsCompleted && (
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-2 right-2 w-8 h-8 border-2 border-indigo-400 rounded-full" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-2 border-blue-400 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-400 rounded-full" />
          </div>
        )}

        <div className="p-3 relative">
          <div className="flex items-center justify-between">
            {/* Compact left side */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {/* Compact day icon with sophisticated treatment */}
              <div
                className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white text-[11px] md:text-xs font-bold shadow-lg transition-all duration-300 ${
                  task.dayNumber === 0
                    ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                    : localIsCompleted
                    ? "bg-gradient-to-br from-emerald-100 to-green-200 ring-2 ring-emerald-300/50 shadow-emerald-200/40 group-hover:shadow-emerald-300/60 group-hover:ring-emerald-400/60 group-hover:scale-105"
                    : isUnlocked
                    ? "bg-gradient-to-br from-indigo-500 to-violet-600"
                    : "bg-gradient-to-br from-gray-400 to-slate-500"
                }`}
              >
                {!isUnlocked ? (
                  <Lock className="w-3 h-3" />
                ) : localIsCompleted ? (
                  <CheckCircle className="w-4 h-4 text-blue-600 drop-shadow-sm" />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {getSequenceNumber(sequenceNumber)}
                  </span>
                )}
              </div>

              {/* Compact content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-bold text-sm leading-tight truncate transition-colors duration-300 ${
                    localIsCompleted
                      ? "text-indigo-800 group-hover:text-indigo-900"
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
                        ? "text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-full group-hover:bg-indigo-200/80 group-hover:text-indigo-700"
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
                aria-label={
                  localIsCompleted ? "Undo completion" : "Mark task complete"
                }
                title={localIsCompleted ? "Undo completion" : "Mark complete"}
                className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all duration-300 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  localIsUpdating
                    ? "bg-gray-400 text-white cursor-not-allowed shadow-lg"
                    : localIsCompleted
                    ? "bg-gradient-to-br from-emerald-100 to-green-200 text-blue-600 hover:shadow-emerald-200/60 shadow-lg focus:ring-emerald-400 hover:from-emerald-200 hover:to-green-300"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-blue-200/60 shadow-lg focus:ring-blue-400"
                } ${localJustCompleted ? "animate-bounce" : ""}`}
              >
                {localIsUpdating ? (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : localIsCompleted ? (
                  <RotateCcw className="w-4 h-4" />
                ) : (
                  <Target className="w-4 h-4" />
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
    return !(
      taskChanged ||
      completedChanged ||
      updatingChanged ||
      unlockedChanged
    );
  }
);

// Premium Header Component
const PremiumHeader: React.FC<{
  currentTab: string;
  totalPoints: number;
  challengeSettings: ChallengeSettings | null;
  onSignOut: () => void;
}> = ({ currentTab, totalPoints, challengeSettings, onSignOut }) => {
  const { isNinjaMode, originalAdminRole, exitNinjaMode } = useAuth();
  const getTabTitle = () => {
    switch (currentTab) {
      case "challenges":
        return "Daily Tasks"; // Keep constant, don't change with date selection
      case "leaderboard":
        return "Leaderboard";
      case "profile":
        return "My Profile";
      default:
        return "Focus Challenge";
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
    <div className="bg-gradient-to-r from-white/98 to-blue-50/98 backdrop-blur-xl shadow-sm border-b border-blue-100/30 sticky top-0 z-50">
      {/* Ninja Mode Banner */}
      {isNinjaMode && originalAdminRole && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🥷</span>
              <span className="text-sm font-medium">
                Ninja Mode: Viewing as participant | Admin:{" "}
                {originalAdminRole.name}
              </span>
            </div>
            <button
              onClick={exitNinjaMode}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Exit Ninja Mode
            </button>
          </div>
        </div>
      )}

      {/* Optimized Compact Header */}
      <div className="px-3 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - App branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              {getTabIcon()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {getTabTitle()}
              </h1>
            </div>
          </div>

          {/* Right side - Compact stats */}
          <div className="flex items-center space-x-2">
            {/* Compact Points Badge */}
            <div className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200/50">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-sm font-bold text-amber-700">
                {totalPoints.toLocaleString()}
              </span>
            </div>

            {/* Compact Day Badge */}
            {challengeSettings?.isActive && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-lg border border-blue-200/50">
                <span className="text-sm font-bold text-blue-700">
                  {challengeSettings.currentDay === 0 &&
                  challengeSettings.trialEnabled
                    ? "Trial"
                    : `D${challengeSettings.currentDay}`}
                </span>
              </div>
            )}

            {/* Compact Sign Out Button */}
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

// World-Class Calendar-Style Date Strip
const DateStrip: React.FC<{
  challengeSettings: ChallengeSettings | null;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  timeLeftDisplay?: string;
}> = ({ challengeSettings, selectedDate, onDateSelect, timeLeftDisplay }) => {
  // Generate available dates based on challenge schedule
  const getAvailableDates = () => {
    if (
      !challengeSettings?.challengeDays ||
      challengeSettings.challengeDays.length === 0
    ) {
      return [];
    }

    const today = new Date();
    const dates: Array<{
      date: Date;
      dayNumber: number;
      isScheduled: boolean;
      isLocked: boolean;
      isToday: boolean;
      isPast: boolean;
      isFuture: boolean;
    }> = [];

    // Get all challenge days and sort by day number
    const sortedChallengeDays = [...challengeSettings.challengeDays].sort(
      (a, b) => a.dayNumber - b.dayNumber
    );

    sortedChallengeDays.forEach((challengeDay) => {
      if (challengeDay.scheduledDate) {
        const scheduledDate = challengeDay.scheduledDate.toDate();
        const dayStart = new Date(scheduledDate);
        dayStart.setHours(0, 0, 0, 0);

        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);

        const isToday = dayStart.getTime() === todayStart.getTime();
        const isPast = dayStart.getTime() < todayStart.getTime();
        const isFuture = dayStart.getTime() > todayStart.getTime();
        const daysDiff = Math.floor(
          (todayStart.getTime() - dayStart.getTime()) / (24 * 60 * 60 * 1000)
        );

        // Show all dates but with different lock states
        const isLocked = daysDiff > 1 || isFuture; // More than 1 day ago or future = locked

        dates.push({
          date: dayStart,
          dayNumber: challengeDay.dayNumber,
          isScheduled: true,
          isLocked,
          isToday,
          isPast,
          isFuture,
        });
      }
    });

    return dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const availableDates = getAvailableDates();
  const today = new Date();

  const formatDayNumber = (date: Date) => {
    return date.getDate().toString();
  };

  const formatDayName = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-xl border-b border-blue-100/50 px-3 py-1.5">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="flex items-center space-x-1.5 min-w-max px-2">
          {availableDates.map((dateInfo) => {
            const isSelected =
              dateInfo.date.toDateString() === selectedDate.toDateString();
            const isToday = dateInfo.isToday;

            return (
              <button
                key={dateInfo.date.toDateString()}
                onClick={() =>
                  !dateInfo.isLocked && onDateSelect(dateInfo.date)
                }
                disabled={dateInfo.isLocked}
                className={`relative flex flex-col items-center px-2.5 py-1.5 rounded-lg transition-all duration-300 min-w-[50px] ${
                  dateInfo.isLocked
                    ? "opacity-50 cursor-not-allowed bg-gray-100/50"
                    : isSelected
                    ? "bg-gradient-to-b from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/50 transform scale-105"
                    : "hover:bg-white/60 hover:shadow-md transform hover:scale-105"
                }`}
              >
                {/* Lock icon for locked dates */}
                {dateInfo.isLocked && (
                  <Lock className="w-3 h-3 text-gray-400 absolute top-1 right-1" />
                )}

                {/* Day number */}
                <span
                  className={`text-base font-bold ${
                    dateInfo.isLocked
                      ? "text-gray-400"
                      : isSelected
                      ? "text-white"
                      : isToday
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {formatDayNumber(dateInfo.date)}
                </span>

                {/* Day name */}
                <span
                  className={`text-xs font-medium ${
                    dateInfo.isLocked
                      ? "text-gray-400"
                      : isSelected
                      ? "text-blue-100"
                      : isToday
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  {formatDayName(dateInfo.date)}
                </span>

                {/* Removed challenge day indicator for cleaner look */}

                {/* Today indicator dot */}
                {isToday && !isSelected && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Countdown timer for today only */}
      {timeLeftDisplay &&
        selectedDate.toDateString() === today.toDateString() &&
        challengeSettings?.isActive &&
        !challengeSettings?.isPaused && (
          <div className="flex items-center justify-center mt-2">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-1.5 rounded-full border border-orange-200/50 shadow-sm">
              <Clock className="w-3 h-3 text-orange-500" />
              <span className="text-xs font-semibold text-orange-700">
                {timeLeftDisplay} remaining
              </span>
            </div>
          </div>
        )}
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
  const [allParticipants, setAllParticipants] = useState<UserProgress[]>([]);
  const [dayEndsAt, setDayEndsAt] = useState<Date | null>(null);
  const [timeLeftDisplay, setTimeLeftDisplay] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Initialize with today's date, will be updated when challenge settings load
    return new Date();
  });

  // Calculate total available tasks based on actual challenge structure
  const totalChallengeDays = React.useMemo(() => {
    if (!challengeSettings || !tasks.length) return 0;
    return calculateActualAvailableTasks(challengeSettings, tasks);
  }, [challengeSettings, tasks]);

  // Check if challenge should start immediately when participant dashboard loads
  useEffect(() => {
    const checkAndStart = async () => {
      if (
        challengeSettings &&
        !challengeSettings.isActive &&
        challengeSettings.scheduledStartDate
      ) {
        const now = new Date();
        const scheduledStart = challengeSettings.scheduledStartDate.toDate();

        // If scheduled time has passed, start the challenge
        if (now >= scheduledStart) {
          console.log(
            "🚀 Participant Dashboard: Scheduled start time has passed, starting challenge..."
          );
          try {
            await checkAndStartChallenge();
            // Refresh the page to show the updated state
            window.location.reload();
          } catch (error) {
            console.error(
              "Error starting challenge from participant dashboard:",
              error
            );
          }
        }
      }
    };

    checkAndStart();
  }, [challengeSettings]);

  // Load participants for completion screen
  useEffect(() => {
    const unsubscribe = subscribeToParticipants((participants) => {
      setAllParticipants(participants);
    });
    return unsubscribe;
  }, []);

  // Inline countdown to end of current local day (00:00 – 23:59 criterion)
  useEffect(() => {
    const getNextMidnight = (): Date => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      return next;
    };

    const formatHMS = (ms: number): string => {
      if (ms <= 0) return "00:00:00";
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    const update = () => {
      const endsAt = dayEndsAt ?? getNextMidnight();
      if (!dayEndsAt) setDayEndsAt(endsAt);
      const now = new Date();
      const diff = endsAt.getTime() - now.getTime();
      setTimeLeftDisplay(formatHMS(diff));
      if (diff <= 0) {
        // Day rolled; schedule new midnight and refresh display
        const next = getNextMidnight();
        setDayEndsAt(next);
        setTimeLeftDisplay(formatHMS(next.getTime() - new Date().getTime()));
      }
    };

    // Only show/update when challenge is active and not paused
    if (challengeSettings?.isActive && !challengeSettings?.isPaused) {
      update();
      const id = window.setInterval(update, 1000);
      return () => window.clearInterval(id);
    }
  }, [challengeSettings, dayEndsAt]);

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

  // Update selectedDate when challenge settings change
  useEffect(() => {
    if (
      challengeSettings?.challengeDays &&
      challengeSettings.challengeDays.length > 0
    ) {
      // Find today's challenge day or the closest available day
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // First try to find today's scheduled day
      const todaysDay = challengeSettings.challengeDays.find((day) => {
        if (day.scheduledDate) {
          const scheduledDate = day.scheduledDate.toDate();
          const scheduledDateStart = new Date(scheduledDate);
          scheduledDateStart.setHours(0, 0, 0, 0);
          return scheduledDateStart.getTime() === today.getTime();
        }
        return false;
      });

      if (todaysDay && todaysDay.scheduledDate) {
        setSelectedDate(todaysDay.scheduledDate.toDate());
      } else {
        // If no exact match, find the current day based on currentDay
        const currentChallengeDay = challengeSettings.challengeDays.find(
          (day) => day.dayNumber === challengeSettings.currentDay
        );

        if (currentChallengeDay && currentChallengeDay.scheduledDate) {
          setSelectedDate(currentChallengeDay.scheduledDate.toDate());
        }
      }
    }
  }, [challengeSettings]);

  // Note: Auto-advance functionality disabled to prevent Firestore errors
  // Manual day advancement should be done through admin panel
  useEffect(() => {
    // This effect is intentionally minimal to avoid auto-advance issues
    if (!challengeSettings?.isActive) return;

    // Just log the current state without making changes
    console.log("Challenge state:", {
      currentDay: challengeSettings.currentDay,
      isActive: challengeSettings.isActive,
      isPaused: challengeSettings.isPaused,
    });
  }, [challengeSettings]);

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

      // Block updates when challenge is paused
      if (challengeSettings?.isPaused) {
        console.warn("Challenge is paused. Task updates are disabled.");
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
    if (
      !challengeSettings?.challengeDays ||
      challengeSettings.challengeDays.length === 0
    ) {
      // Fallback: calculate tracking date as today
      const today = new Date();
      return today.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    // Find the challenge day data
    const challengeDay = challengeSettings.challengeDays.find(
      (day) => day.dayNumber === dayNumber
    );
    if (challengeDay && challengeDay.trackingDate) {
      const trackingDate = challengeDay.trackingDate.toDate();
      return trackingDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    // Fallback for trial day or missing data
    if (dayNumber === 0) {
      return "Prep";
    }

    // Default fallback
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Check if challenge has actually started (not just scheduled)
  const hasChallengeStarted = (): boolean => {
    if (!challengeSettings) return false;
    if (!challengeSettings.isActive) return false;

    // If there's a scheduled start date, check if it has passed
    if (challengeSettings.scheduledStartDate) {
      const now = new Date();
      const scheduledStart = challengeSettings.scheduledStartDate.toDate();
      return now >= scheduledStart;
    }

    // If there's an actual start date, check if it has passed
    if (challengeSettings.startDate) {
      const now = new Date();
      const actualStart = challengeSettings.startDate.toDate();
      return now >= actualStart;
    }

    // If no dates are set but challenge is active, assume it has started
    return true;
  };

  // Check if a task is unlocked/editable for the selected date
  const isTaskUnlocked = (task: Task): boolean => {
    if (!challengeSettings) return false;
    if (!challengeSettings.isActive) return false;
    if (challengeSettings.isPaused) return false;
    if (!hasChallengeStarted()) return false;

    // Skip day 0 tasks if trial is disabled
    if (!challengeSettings.trialEnabled && task.dayNumber === 0) {
      return false;
    }

    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (todayStart.getTime() - selectedDateStart.getTime()) /
        (24 * 60 * 60 * 1000)
    );
    const isFuture = selectedDateStart.getTime() > todayStart.getTime();

    // Lock future dates and dates more than 1 day ago
    if (isFuture || daysDiff > 1) {
      return false;
    }

    // Find the challenge day that matches the selected date
    const matchingChallengeDay = challengeSettings.challengeDays?.find(
      (day) => {
        if (day.scheduledDate) {
          const scheduledDate = day.scheduledDate.toDate();
          const scheduledDateStart = new Date(scheduledDate);
          scheduledDateStart.setHours(0, 0, 0, 0);
          return scheduledDateStart.getTime() === selectedDateStart.getTime();
        }
        return false;
      }
    );

    if (!matchingChallengeDay) {
      return false;
    }

    // Allow editing only if within the allowed time range and day is unlocked in challenge
    return (
      task.dayNumber === matchingChallengeDay.dayNumber &&
      task.dayNumber <= challengeSettings.currentDay
    );
  };

  // Show tasks for selected date (always show all tasks, control editability separately)
  const getCurrentDayTasks = (): Task[] => {
    if (!challengeSettings) {
      console.log("No challenge settings");
      return [];
    }
    if (!challengeSettings.isActive) {
      console.log("Challenge not active");
      return [];
    }
    if (challengeSettings.isPaused) {
      console.log("Challenge paused");
      return [];
    }
    if (!hasChallengeStarted()) {
      console.log("Challenge not started");
      return [];
    }

    // Find the challenge day that matches the selected date
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);

    const matchingChallengeDay = challengeSettings.challengeDays?.find(
      (day) => {
        if (day.scheduledDate) {
          const scheduledDate = day.scheduledDate.toDate();
          const scheduledDateStart = new Date(scheduledDate);
          scheduledDateStart.setHours(0, 0, 0, 0);
          return scheduledDateStart.getTime() === selectedDateStart.getTime();
        }
        return false;
      }
    );

    if (!matchingChallengeDay) {
      console.log("No matching challenge day for selected date");
      return [];
    }

    const targetDay = matchingChallengeDay.dayNumber;

    console.log(
      "Target day for filtering:",
      targetDay,
      "for date:",
      selectedDate.toDateString()
    );

    const filteredTasks = tasks.filter((task) => {
      // Skip day 0 tasks if trial is disabled
      if (!challengeSettings.trialEnabled && task.dayNumber === 0) {
        return false;
      }

      return task.dayNumber === targetDay;
    });

    console.log(
      "Filtered tasks:",
      filteredTasks.length,
      "tasks for day",
      targetDay
    );

    return filteredTasks;
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
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          />
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

  // Challenge paused state - show paused scene and stop interactions
  if (challengeSettings?.isActive && challengeSettings.isPaused) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 relative">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Fixed paused header that stays at top during scroll */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 shadow-xl">
          <div className="flex items-center justify-center py-4 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Pause className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Challenge Paused</h2>
            </div>
          </div>
        </div>

        {/* Scrollable content area - entire screen scrolls now */}
        <div
          className="overflow-y-auto"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <div className="pb-6 px-4 py-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Pause className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse" />
              </div>

              <p className="text-lg text-slate-600 mb-6">
                The Focus Challenge is temporarily paused by the administrator.
                Task tracking is on hold.
              </p>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
                <h3 className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  While it's paused
                </h3>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="w-3 h-3 text-indigo-600" />
                    </div>
                    <span className="text-slate-700 font-medium">
                      Plan how you'll complete upcoming tasks
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BookOpen className="w-3 h-3 text-indigo-600" />
                    </div>
                    <span className="text-slate-700 font-medium">
                      Review previous days and reflect on your progress
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Star className="w-3 h-3 text-indigo-600" />
                    </div>
                    <span className="text-slate-700 font-medium">
                      Set new intentions for when the challenge resumes
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Full leaderboard section that scrolls with entire page */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                  Leaderboard
                </h3>
                <div className="bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
                  <span className="text-xs font-bold text-amber-700">Live</span>
                </div>
              </div>

              {/* Leaderboard without internal scrolling - now scrolls with entire page */}
              <div className="rounded-xl border border-white/40">
                <Leaderboard
                  className="shadow-none max-w-none"
                  maxEntries={50}
                  disableInternalScrolling={true}
                />
              </div>

              <p className="text-center text-sm text-slate-500 mt-4">
                Rankings are updated in real-time
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={signOut}
                className="bg-gradient-to-r from-slate-800 via-indigo-800 to-blue-800 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-indigo-200/40 transition-all duration-300 transform hover:scale-105"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Challenge active but not started yet - show waiting area
  if (challengeSettings?.isActive && !hasChallengeStarted()) {
    // Show pre-challenge countdown for active but not started challenge
    const scheduledStart =
      challengeSettings.scheduledStartDate?.toDate() ||
      challengeSettings.startDate?.toDate();

    return (
      <PreChallengeCountdown
        scheduledStartDate={scheduledStart}
        onChallengeStart={() => {
          // Refresh the page when challenge starts
          window.location.reload();
        }}
      />
    );
  }

  // Challenge inactive state - check if scheduled, completed, or truly inactive
  if (!challengeSettings?.isActive) {
    // Check if challenge is scheduled to start
    const isScheduled =
      challengeSettings?.scheduledStartDate &&
      new Date() < challengeSettings.scheduledStartDate.toDate();

    if (isScheduled) {
      // Show pre-challenge countdown
      return (
        <PreChallengeCountdown
          scheduledStartDate={challengeSettings.scheduledStartDate.toDate()}
          onChallengeStart={() => {
            // Refresh the page when challenge starts
            window.location.reload();
          }}
        />
      );
    }

    // Check if challenge has ended (has end date and it's passed)
    // For testing: also show completion if challenge is inactive and has participants
    const hasEnded =
      (challengeSettings?.endDate &&
        new Date() > challengeSettings.endDate.toDate()) ||
      (!challengeSettings?.isActive && allParticipants.length > 0);

    if (hasEnded && userProgress && challengeSettings) {
      // Convert UserRole to UserProgress format
      const userProgressData: UserProgress = {
        userId: userProgress.uid,
        name: userProgress.name,
        email: userProgress.email,
        progress: userProgress.progress,
        points: userProgress.points,
        totalPoints: userProgress.totalPoints,
        completedTasks: Object.values(userProgress.progress).filter(Boolean)
          .length,
        joinedAt: userProgress.joinedAt,
        rank: userProgress.rank,
      };

      // Show completion screen with results
      return (
        <ChallengeCompletion
          userProgress={userProgressData}
          allParticipants={allParticipants}
          challengeSettings={challengeSettings}
          totalTasks={totalChallengeDays}
          showAchievements={false}
        />
      );
    }

    // Show inactive state
    return (
      <div className="min-h-screen h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
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
              Challenge Inactive
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              The Focus Challenge is currently not active.
            </p>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-8">
              <h3 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                While you wait:
              </h3>
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
  const currentDayCompletedTasks = currentDayTasks.filter((task) => {
    return userProgress?.progress?.[task.id] === true;
  }).length;

  const progressPercentage =
    currentDayTasks.length > 0
      ? (currentDayCompletedTasks / currentDayTasks.length) * 100
      : 0;

  // Get current day info
  const getCurrentDayInfo = () => {
    const now = new Date();
    const gregorianDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const currentDay = challengeSettings?.currentDay ?? 1;

    return {
      currentDay: currentDay,
      isTrialDay: currentDay === 0 && challengeSettings?.trialEnabled,
      gregorianDate: gregorianDate,
    };
  };

  return (
    <div className="min-h-screen h-[100dvh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <PremiumHeader
          currentTab={currentTab}
          totalPoints={totalPoints}
          challengeSettings={challengeSettings}
          onSignOut={signOut}
        />

        {/* Date Strip - only show on challenges tab */}
        {currentTab === "challenges" && challengeSettings?.isActive && (
          <DateStrip
            challengeSettings={challengeSettings}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            timeLeftDisplay={timeLeftDisplay}
          />
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="pt-36 pb-24 min-h-[calc(100dvh-4.5rem)] overflow-y-auto">
        {currentTab === "challenges" && (
          <div className="px-3 pt-0 pb-3">
            {/* Beautiful Tasks Container */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-blue-100/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-indigo-50/30" />

              <div className="p-4 pt-4">
                {/* Scrollable content area including header and tasks */}
                <div
                  className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  style={{ maxHeight: "calc(100dvh - 240px)" }}
                >
                  {/* Compact Task Header - now inside scrollable area */}
                  <div className="mb-4 sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-2 -mx-4 px-4 border-b border-gray-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Target className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-800">
                            {(() => {
                              // Find the challenge day that matches the selected date
                              const selectedDateStart = new Date(selectedDate);
                              selectedDateStart.setHours(0, 0, 0, 0);

                              const matchingChallengeDay =
                                challengeSettings?.challengeDays?.find(
                                  (day) => {
                                    if (day.scheduledDate) {
                                      const scheduledDate =
                                        day.scheduledDate.toDate();
                                      const scheduledDateStart = new Date(
                                        scheduledDate
                                      );
                                      scheduledDateStart.setHours(0, 0, 0, 0);
                                      return (
                                        scheduledDateStart.getTime() ===
                                        selectedDateStart.getTime()
                                      );
                                    }
                                    return false;
                                  }
                                );

                              if (matchingChallengeDay) {
                                return matchingChallengeDay.dayNumber === 0 &&
                                  challengeSettings?.trialEnabled
                                  ? "Trial Day Tasks"
                                  : `Day ${matchingChallengeDay.dayNumber} Tasks`;
                              }

                              return "Tasks";
                            })()}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {currentDayCompletedTasks} of{" "}
                            {currentDayTasks.length} completed
                          </p>
                        </div>
                      </div>

                      {/* Compact Progress Circle */}
                      <div className="relative w-12 h-12">
                        <svg
                          className="w-12 h-12 transform -rotate-90"
                          viewBox="0 0 48 48"
                        >
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 20}`}
                            strokeDashoffset={`${
                              2 * Math.PI * 20 * (1 - progressPercentage / 100)
                            }`}
                            className="text-blue-500 transition-all duration-500"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task List */}
                  {tasksLoading ? (
                    <div className="space-y-3 pb-4">
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
                          : `Day ${challengeSettings?.currentDay} tasks loading...`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pb-4">
                      {getCurrentDayTasks()
                        .sort((a, b) => {
                          const ai =
                            (a as any).sortIndex ?? Number.MAX_SAFE_INTEGER;
                          const bi =
                            (b as any).sortIndex ?? Number.MAX_SAFE_INTEGER;
                          if (ai !== bi) return ai - bi;
                          return a.title.localeCompare(b.title);
                        })
                        .map((task, index) => {
                          // Use task-specific key for progress tracking (task ID + day number)
                          const taskKey = `${task.id}`;
                          const isCompleted =
                            userProgress?.progress?.[taskKey] === true;

                          const uniqueTaskKey = `${task.id}-${taskKey}`;
                          const isUpdating = updatingTask === uniqueTaskKey;
                          const isUnlocked = isTaskUnlocked(task);
                          const cardUniqueKey = `card-${task.id}-${
                            task.dayNumber
                          }-${task.title.replace(/\s+/g, "-")}-${
                            isCompleted ? "completed" : "incomplete"
                          }`;

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
                              trackingDate={getTrackingDateForDay(
                                task.dayNumber
                              )}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === "leaderboard" && (
          <div className="px-3 pb-3">
            {/* Leaderboard Container */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-blue-100/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-indigo-50/30" />

              <div className="p-4 relative">
                {/* Leaderboard Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h1 className="text-lg font-bold text-gray-800">
                          Leaderboard
                        </h1>
                        <p className="text-xs text-gray-500">
                          Live rankings updated in real-time
                        </p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-lg border border-amber-200/50">
                      <span className="text-xs font-bold text-amber-700">
                        Live
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scrollable Leaderboard */}
                <div
                  className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  style={{ maxHeight: "calc(100dvh - 280px)" }}
                >
                  <Leaderboard className="shadow-none" maxEntries={50} />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === "profile" && (
          <div className="px-3 pb-3">
            {/* Profile Container */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-blue-100/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-indigo-50/30" />

              <div className="p-4 relative">
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
                          {userRole?.name || "User"}
                        </h2>
                        <p className="text-indigo-100 text-sm mb-2">
                          {userRole?.email}
                        </p>

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
                            <span className="text-xs font-bold">
                              {totalPoints}
                            </span>
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
                            {getCurrentDayInfo().isTrialDay
                              ? "Trial Day"
                              : `Day ${getCurrentDayInfo().currentDay}`}{" "}
                            •{" "}
                            {new Date().toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="bg-blue-50 px-2 py-1 rounded-lg border border-blue-200/50">
                          <span className="text-xs font-bold text-blue-700">
                            {challengeSettings?.currentDay === 0
                              ? "Trial"
                              : `Day ${challengeSettings?.currentDay}`}
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
                          <div className="text-base font-bold text-amber-700">
                            {totalPoints}
                          </div>
                          <div className="text-xs text-amber-600">
                            Total Points
                          </div>
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
                          <div className="text-base font-bold text-blue-700">
                            {completedTasks}/{totalChallengeDays}
                          </div>
                          <div className="text-xs text-blue-600">
                            Overall Tasks
                          </div>
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
                  <span className="text-gray-400 text-2xl group-hover:text-gray-600 group-hover:scale-110 transition-all duration-200">
                    ×
                  </span>
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
                      Day {selectedTask.dayNumber || "Trial"}
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
