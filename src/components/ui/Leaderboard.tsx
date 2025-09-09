import React, { useState, useEffect } from 'react';
import { subscribeToLeaderboard, LeaderboardEntry } from '../../firebase/firestore';
import { Trophy, Star, Zap, Crown, Medal, Award, Flame, Target, User } from 'lucide-react';

interface LeaderboardProps {
  className?: string;
  maxEntries?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ className = "", maxEntries = 10 }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        return { icon: Target, color: 'text-blue-500', bg: 'bg-gradient-to-br from-blue-500 to-indigo-600' };
    }
  };

  const getCardStyle = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-50 border-2 border-yellow-300/50 shadow-2xl shadow-yellow-200/30 transform hover:scale-[1.02]';
    } else if (rank === 2) {
      return 'bg-gradient-to-br from-gray-50 via-slate-100 to-gray-50 border-2 border-gray-300/50 shadow-xl shadow-gray-200/30 transform hover:scale-[1.01]';
    } else if (rank === 3) {
      return 'bg-gradient-to-br from-amber-50 via-orange-100 to-amber-50 border-2 border-amber-300/50 shadow-xl shadow-amber-200/30 transform hover:scale-[1.01]';
    } else {
      return `bg-gradient-to-br from-white via-blue-50/30 to-white border border-gray-200/50 shadow-lg hover:shadow-xl transform hover:scale-[1.005] transition-all duration-300`;
    }
  };



  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-islamic-primary to-islamic-secondary p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Leaderboard</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
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
          <div className="space-y-4">
          {/* All Participants List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">All Participants</h3>
              <div className="flex items-center space-x-2 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200/50">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">{leaderboard.length}</span>
              </div>
            </div>
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                Debug: Showing {leaderboard.length} participants (max: {maxEntries})
              </div>
            )}
            
            <div className="space-y-3">
              {leaderboard.map((entry) => {
                const rankInfo = getRankIcon(entry.rank);
                const IconComponent = rankInfo.icon;
                
                return (
              <div
                key={entry.userId}
                    className={`p-4 rounded-2xl transition-all duration-300 ${getCardStyle(entry.rank)}`}
              >
                    <div className="flex items-center space-x-3">
                    {/* Rank Icon */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${rankInfo.bg}`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                          <span className="text-xs font-bold text-gray-700">#{entry.rank}</span>
                    </div>
                        {entry.rank <= 3 && (
                          <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Star className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-base text-gray-900 truncate">
                            {entry.name}
                          </h4>
                          {entry.rank <= 3 && (
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                              entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                              entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {entry.rank === 1 ? '👑 CHAMPION' : entry.rank === 2 ? '🥈 RUNNER-UP' : '🥉 THIRD'}
                            </div>
                          )}
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-lg">
                            <Zap className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-bold text-blue-700">{entry.completedTasks}/15</span>
                        </div>
                          
                          <div className="flex items-center space-x-1 bg-amber-100 px-2 py-1 rounded-lg">
                            <Flame className="w-3 h-3 text-amber-600" />
                            <span className="text-xs font-bold text-amber-700">{entry.totalPoints} pts</span>
                      </div>

                          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-lg">
                            <Target className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-bold text-green-700">{Math.round((entry.completedTasks / 15) * 100)}%</span>
                    </div>
                  </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600' :
                              entry.rank === 2 ? 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600' :
                              entry.rank === 3 ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600' :
                              'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600'
                        }`}
                        style={{ width: `${(entry.completedTasks / 15) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
          </div>
        
        {/* Motivational Footer */}
          <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-2xl border border-indigo-200/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 to-purple-100/20" />
            <div className="relative text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Star className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-indigo-700">Keep Striving for Excellence!</span>
                <Star className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-sm text-indigo-600 font-medium italic mb-1">
                "And whoever strives only strives for [the benefit of] himself"
              </p>
              <p className="text-xs text-indigo-500">
                Quran 29:6
              </p>
            </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Leaderboard;