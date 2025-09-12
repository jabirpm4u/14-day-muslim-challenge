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
      console.log('📊 Leaderboard component received data:', {
        totalEntries: data.length,
        maxEntries,
        entriesShown: data.slice(0, maxEntries).length,
        entries: data.map(d => ({ name: d.name, points: d.totalPoints, rank: d.rank }))
      });
      setLeaderboard(data.slice(0, maxEntries));
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

  const getCardStyle = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-br from-yellow-50/90 via-yellow-50/80 to-amber-50/90 border-2 border-yellow-300/70 shadow-yellow-200/40 ring-2 ring-yellow-200/20 hover:ring-yellow-300/30';
    } else if (rank === 2) {
      return 'bg-gradient-to-br from-gray-50/90 via-slate-50/80 to-gray-50/90 border-2 border-gray-300/70 shadow-gray-200/40 ring-2 ring-gray-200/20 hover:ring-gray-300/30';
    } else if (rank === 3) {
      return 'bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-amber-50/90 border-2 border-amber-300/70 shadow-amber-200/40 ring-2 ring-amber-200/20 hover:ring-amber-300/30';
    } else {
      return 'bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 border border-blue-200/50 shadow-blue-100/30 hover:shadow-blue-200/50';
    }
  };



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
        <div className="text-center py-12">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <Trophy className="w-10 h-10 text-gray-400" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl blur-xl opacity-30 animate-pulse" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-3">No Participants Yet</h4>
          <p className="text-gray-500 mb-2">Be the first to complete a task and claim the crown! 👑</p>
          <p className="text-sm text-gray-400">Check console for debugging information</p>
        </div>
      ) : (
        <div className={disableInternalScrolling ? "space-y-3" : "space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"}>
          {leaderboard.map((entry) => {
            const rankInfo = getRankIcon(entry.rank);
            const IconComponent = rankInfo.icon;
            
            return (
              <div
                key={entry.userId}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] touch-manipulation ${getCardStyle(entry.rank)}`}
              >
                {/* Sophisticated background pattern with layered effects */}
                <div className={`absolute inset-0 transition-all duration-500 ${
                  entry.rank <= 3 
                    ? entry.rank === 1 
                      ? "bg-gradient-to-br from-yellow-100/20 via-yellow-100/15 to-amber-100/20" 
                      : entry.rank === 2
                      ? "bg-gradient-to-br from-gray-100/20 via-slate-100/15 to-gray-100/20"
                      : "bg-gradient-to-br from-amber-100/20 via-orange-100/15 to-amber-100/20"
                    : "bg-gradient-to-br from-white/20 to-transparent"
                }`} />
                
                {/* Success shimmer effect for top 3 */}
                {entry.rank <= 3 && (
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${
                    entry.rank === 1 ? 'via-yellow-200/10' : 
                    entry.rank === 2 ? 'via-gray-200/10' : 
                    'via-amber-200/10'
                  } to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out`} />
                )}
                
                {/* Subtle glow for top 3 */}
                {entry.rank <= 3 && (
                  <div className={`absolute -inset-0.5 ${
                    entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400/20 via-yellow-400/30 to-amber-400/20' :
                    entry.rank === 2 ? 'bg-gradient-to-r from-gray-400/20 via-gray-400/30 to-slate-400/20' :
                    'bg-gradient-to-r from-amber-400/20 via-orange-400/30 to-amber-400/20'
                  } rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                )}
                
                {/* Success pattern overlay for top 3 */}
                {entry.rank <= 3 && (
                  <div className="absolute inset-0 opacity-5">
                    <div className={`absolute top-2 right-2 w-8 h-8 border-2 ${
                      entry.rank === 1 ? 'border-yellow-400' :
                      entry.rank === 2 ? 'border-gray-400' :
                      'border-amber-400'
                    } rounded-full`} />
                    <div className={`absolute bottom-2 left-2 w-6 h-6 border-2 ${
                      entry.rank === 1 ? 'border-yellow-400' :
                      entry.rank === 2 ? 'border-gray-400' :
                      'border-amber-400'
                    } rounded-full`} />
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 ${
                      entry.rank === 1 ? 'border-yellow-400' :
                      entry.rank === 2 ? 'border-gray-400' :
                      'border-amber-400'
                    } rounded-full`} />
                  </div>
                )}
                
                <div className="p-3 relative">
                  <div className="flex items-center justify-between">
                    {/* Compact left side */}
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {/* Compact rank icon with sophisticated treatment */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all duration-300 ${rankInfo.bg} ${
                          entry.rank <= 3 ? 'ring-2 ring-white/60 shadow-lg group-hover:shadow-xl group-hover:ring-white/80 group-hover:scale-105' : ''
                        }`}
                      >
                        <span className="text-xs font-bold">{entry.rank}</span>
                      </div>

                      {/* Compact content */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-bold text-sm leading-tight truncate transition-colors duration-300 ${
                            entry.rank <= 3
                              ? entry.rank === 1 
                                ? "text-yellow-800 group-hover:text-yellow-900"
                                : entry.rank === 2
                                ? "text-gray-800 group-hover:text-gray-900"
                                : "text-amber-800 group-hover:text-amber-900"
                              : "text-gray-900"
                          }`}
                        >
                          {entry.name}
                        </h3>

                        {/* Enhanced points display with sophisticated treatment */}
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span
                            className={`text-xs font-semibold transition-all duration-300 ${
                              entry.rank <= 3 
                                ? entry.rank === 1
                                  ? "text-yellow-600 bg-yellow-100/60 px-2 py-0.5 rounded-full group-hover:bg-yellow-200/80 group-hover:text-yellow-700"
                                  : entry.rank === 2
                                  ? "text-gray-600 bg-gray-100/60 px-2 py-0.5 rounded-full group-hover:bg-gray-200/80 group-hover:text-gray-700"
                                  : "text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded-full group-hover:bg-amber-200/80 group-hover:text-amber-700"
                                : "text-blue-600"
                            }`}
                          >
                            {entry.totalPoints} pts
                          </span>
                          <span className="text-xs text-gray-500">
                            {entry.completedTasks}/{totalAvailableTasks} tasks
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compact status indicator */}
                    <div className="flex items-center space-x-1">
                      {entry.rank <= 3 && (
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            entry.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                            entry.rank === 2 ? 'bg-gray-100 text-gray-600' :
                            'bg-amber-100 text-amber-600'
                          } group-hover:scale-105`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                      )}
                      {entry.rank > 3 && (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-105">
                          <span className="text-xs font-bold">#{entry.rank}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar matching task card style */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600' :
                          entry.rank === 2 ? 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600' :
                          entry.rank === 3 ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600' :
                          'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600'
                        }`}
                        style={{ width: `${Math.min((entry.completedTasks / 15) * 100, 100)}%` }}
                      />
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