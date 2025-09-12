import React, { useState, useEffect } from 'react';
import { subscribeToLeaderboard, LeaderboardEntry, getChallengeSettings, getAllTasks, calculateActualAvailableTasks } from '../../firebase/firestore';
import { Trophy, Crown, Medal, Award, User } from 'lucide-react';

interface LeaderboardProps {
  className?: string;
  maxEntries?: number;
  disableInternalScrolling?: boolean; // Add this prop
}



const Leaderboard: React.FC<LeaderboardProps> = ({ className = "", maxEntries = 10, disableInternalScrolling = false }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalAvailableTasks, setTotalAvailableTasks] = useState(0);

  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    const loadChallengeData = async () => {
      try {
        const [settings, allTasks] = await Promise.all([
          getChallengeSettings(),
          getAllTasks()
        ]);
        
        // Calculate total available tasks based on actual challenge structure
        if (settings && allTasks.length > 0) {
          const totalTasks = calculateActualAvailableTasks(settings, allTasks);
          setTotalAvailableTasks(totalTasks);
        }
      } catch (error) {
        console.error('Error loading challenge data:', error);
      }
    };

    loadChallengeData();

    const unsubscribe = subscribeToLeaderboard((data) => {
      // Apply global ranking rules locally to ensure consistency:
      // 1) totalPoints desc, 2) completedTasks desc, 3) name asc (case-insensitive)
      const normalized = data.map((d) => ({
        ...d,
        completedTasks:
          typeof d.completedTasks === 'number'
            ? d.completedTasks
            : Array.isArray((d as any).progress)
            ? ((d as any).progress as boolean[]).filter(Boolean).length
            : (typeof (d as any).progress === 'object' && (d as any).progress)
            ? Object.values((d as any).progress as Record<string, boolean>).filter(Boolean).length
            : 0,
      }));

      normalized.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.completedTasks !== a.completedTasks) return b.completedTasks - a.completedTasks;
        const an = (a.name || '').toString().toLowerCase();
        const bn = (b.name || '').toString().toLowerCase();
        return an.localeCompare(bn);
      });

      // Assign ranks with ties. Same rank for equal tuple; next rank is 1-based index.
      let last: { p: number; c: number; n: string } | null = null;
      let lastRank = 0;
      const ranked = normalized.map((entry, idx) => {
        const current = {
          p: entry.totalPoints,
          c: entry.completedTasks,
          n: (entry.name || '').toString().toLowerCase(),
        };
        const sameAsLast =
          last && last.p === current.p && last.c === current.c && last.n === current.n;
        const rank = sameAsLast ? lastRank : idx + 1;
        last = current;
        lastRank = rank;
        return { ...entry, rank } as LeaderboardEntry;
      });

      console.log('📊 Leaderboard computed rankings:', ranked.slice(0, maxEntries).map(e => ({ name: e.name, totalPoints: e.totalPoints, completedTasks: (e as any).completedTasks, rank: e.rank })));
      setLeaderboard(ranked.slice(0, maxEntries));
      setLoading(false);
    });

    return unsubscribe;
  }, [maxEntries]);


  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: Crown, color: 'text-yellow-500', bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600' };
      case 2:
        return { icon: Medal, color: 'text-gray-500', bg: 'bg-gradient-to-br from-gray-400 to-gray-600' };
      case 3:
        return { icon: Award, color: 'text-amber-500', bg: 'bg-gradient-to-br from-amber-400 to-amber-600' };
      default:
        return { icon: User, color: 'text-blue-500', bg: 'bg-gradient-to-br from-blue-500 to-indigo-600' };
    }
  };

  // (Removed old getCardStyle, now styling inline per rank)



  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-3 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-xl"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-xl"></div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-300 rounded-full h-1.5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">No Participants Yet</h4>
          <p className="text-gray-500 text-sm">Be the first to complete a task! 👑</p>
        </div>
      ) : (
        <div className={disableInternalScrolling ? "space-y-1" : "space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"}>
          {leaderboard.map((entry, index) => {
            const rankInfo = getRankIcon(entry.rank);
            const IconComponent = rankInfo.icon;
            const isTopThree = entry.rank <= 3;
            const isFirst = entry.rank === 1;
            const isSecond = entry.rank === 2;
            const isThird = entry.rank === 3;
            
            return (
              <div
                key={entry.userId}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] ${
                  isTopThree 
                    ? entry.rank === 1 
                      ? 'bg-gradient-to-r from-yellow-50/95 via-amber-50/90 to-yellow-50/95 border-yellow-300/70 shadow-yellow-200/60 hover:shadow-yellow-300/80'
                      : entry.rank === 2
                      ? 'bg-gradient-to-r from-gray-50/95 via-slate-50/90 to-gray-50/95 border-gray-300/70 shadow-gray-200/60 hover:shadow-gray-300/80'
                      : 'bg-gradient-to-r from-amber-50/95 via-orange-50/90 to-amber-50/95 border-amber-300/70 shadow-amber-200/60 hover:shadow-amber-300/80'
                    : 'bg-white/90 border-gray-200/60 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 hover:border-blue-300/60 hover:shadow-blue-200/40'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Animated background effects */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* Shimmer effect for top 3 */}
                  {isTopThree && (
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${
                      isFirst ? 'via-yellow-200/20' : 
                      isSecond ? 'via-gray-200/20' : 
                      'via-amber-200/20'
                    } to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out`} />
                  )}
                  
                  {/* Floating particles for #1 */}
                  {isFirst && (
                    <>
                      <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-amber-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }} />
                      <div className="absolute top-1/2 right-1/3 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping opacity-40" style={{ animationDelay: '1.5s' }} />
                    </>
                  )}
                  
                  {/* Subtle glow effect */}
                  <div className={`absolute -inset-0.5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    isFirst ? 'bg-gradient-to-r from-yellow-400/30 via-amber-400/40 to-yellow-400/30' :
                    isSecond ? 'bg-gradient-to-r from-gray-400/30 via-slate-400/40 to-gray-400/30' :
                    isThird ? 'bg-gradient-to-r from-amber-400/30 via-orange-400/40 to-amber-400/30' :
                    'bg-gradient-to-r from-blue-400/20 via-indigo-400/30 to-blue-400/20'
                  }`} />
                </div>

                <div className="p-3 relative">
                  <div className="flex items-center justify-between">
                    {/* Left side - Rank & Info */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Enhanced rank badge with animations */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all duration-500 ${rankInfo.bg} ${
                          isTopThree ? 'ring-2 ring-white/60 group-hover:ring-white/80 group-hover:scale-110' : 'group-hover:scale-105'
                        } ${isFirst ? 'animate-pulse' : ''}`}
                        style={{
                          background: isFirst 
                            ? 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)' 
                            : isSecond
                            ? 'linear-gradient(135deg, #6b7280, #4b5563, #374151)'
                            : isThird
                            ? 'linear-gradient(135deg, #f59e0b, #ea580c, #dc2626)'
                            : 'linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)'
                        }}
                      >
                        {isTopThree ? (
                          <IconComponent className={`w-4 h-4 ${isFirst ? 'animate-bounce' : ''}`} />
                        ) : (
                          <span className="text-xs font-bold">{entry.rank}</span>
                        )}
                      </div>

                      {/* User info with enhanced styling */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-bold text-sm leading-tight truncate transition-all duration-300 group-hover:scale-105 ${
                            isTopThree
                              ? entry.rank === 1 
                                ? "text-yellow-800 group-hover:text-yellow-900"
                                : entry.rank === 2
                                ? "text-gray-800 group-hover:text-gray-900"
                                : "text-amber-800 group-hover:text-amber-900"
                              : "text-gray-900 group-hover:text-blue-900"
                          }`}
                        >
                          {entry.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span
                            className={`text-xs font-semibold transition-all duration-300 group-hover:scale-105 ${
                              isTopThree 
                                ? entry.rank === 1
                                  ? "text-yellow-700 bg-gradient-to-r from-yellow-100 to-amber-100 px-2 py-1 rounded-lg shadow-sm"
                                  : entry.rank === 2
                                  ? "text-gray-700 bg-gradient-to-r from-gray-100 to-slate-100 px-2 py-1 rounded-lg shadow-sm"
                                  : "text-amber-700 bg-gradient-to-r from-amber-100 to-orange-100 px-2 py-1 rounded-lg shadow-sm"
                                : "text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-1 rounded-lg shadow-sm group-hover:from-blue-100 group-hover:to-indigo-100"
                            }`}
                          >
                            {entry.totalPoints} pts
                          </span>
                          <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                            {entry.completedTasks} tasks
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Enhanced progress indicator */}
                    <div className="flex items-center space-x-2">
                      {/* Animated progress circle with glow */}
                      <div className="relative w-10 h-10 group/progress">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                          <circle 
                            cx="20" 
                            cy="20" 
                            r="16" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            fill="none" 
                            className="text-gray-200" 
                          />
                          <circle 
                            cx="20" 
                            cy="20" 
                            r="16" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            fill="none" 
                            strokeDasharray={`${2 * Math.PI * 16}`} 
                            strokeDashoffset={`${2 * Math.PI * 16 * (1 - Math.min(entry.completedTasks / Math.max(totalAvailableTasks, 1), 1))}`} 
                            className={`transition-all duration-700 group-hover:drop-shadow-lg ${
                              isFirst ? 'text-yellow-500 drop-shadow-yellow-200' :
                              isSecond ? 'text-gray-500 drop-shadow-gray-200' :
                              isThird ? 'text-amber-500 drop-shadow-amber-200' :
                              'text-blue-500 drop-shadow-blue-200'
                            }`}
                            strokeLinecap="round" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                            {Math.round((entry.completedTasks / Math.max(totalAvailableTasks, 1)) * 100)}%
                          </span>
                        </div>
                        
                        {/* Pulsing ring for top 3 */}
                        {isTopThree && (
                          <div className={`absolute inset-0 rounded-full border-2 ${
                            isFirst ? 'border-yellow-300' :
                            isSecond ? 'border-gray-300' :
                            'border-amber-300'
                          } opacity-0 group-hover/progress:opacity-100 animate-ping`} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;