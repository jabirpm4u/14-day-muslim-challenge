import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  Target,
  BarChart3,
  RefreshCw,
  Play,
  Settings,
  Award,
  Star,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { ChallengeSettings, UserProgress, getAllTasks, calculateActualAvailableTasks } from '../../firebase/firestore';

interface ChallengeStoppedProps {
  challengeSettings: ChallengeSettings;
  participants: UserProgress[];
  onRestartChallenge: () => void;
  onViewSettings: () => void;
  onViewOverview?: () => void;
  onViewLeaderboard?: () => void;
}

const ChallengeStopped: React.FC<ChallengeStoppedProps> = ({
  challengeSettings,
  participants,
  onRestartChallenge,
  onViewSettings,
  onViewOverview,
  onViewLeaderboard
}) => {

  const [totalAvailableTasks, setTotalAvailableTasks] = useState(0);



  useEffect(() => {
    const loadTasks = async () => {
      try {
        const allTasks = await getAllTasks();
        
        // Calculate total available tasks based on actual challenge structure
        if (challengeSettings && allTasks.length > 0) {
          const totalTasks = calculateActualAvailableTasks(challengeSettings, allTasks);
          setTotalAvailableTasks(totalTasks);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    loadTasks();
  }, [challengeSettings]);

  // Calculate statistics
  const totalParticipants = participants.length;
  const activeParticipants = participants.filter(p => p.completedTasks > 0).length;
  const averageProgress = participants.length > 0 
    ? Math.round(participants.reduce((sum, p) => sum + p.completedTasks, 0) / participants.length)
    : 0;
  const totalTasks = totalAvailableTasks;
  const completedChallenges = participants.filter(p => p.completedTasks === totalTasks).length;

  // Get top 3 participants
  const topParticipants = [...participants]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-orange-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-600/20 via-orange-600/20 to-yellow-600/20" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Top Navigation */}
        <div className="sticky top-0 z-20 mb-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={onViewOverview}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white hover:bg-white/10"
                title="Overview"
              >Overview</button>
              <button
                onClick={() => {
                  try { window.location.hash = '#start'; } catch {}
                  onViewSettings?.();
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border border-white/10"
                title="Settings"
              >Settings</button>
              <button
                onClick={onViewLeaderboard}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white hover:bg-white/10"
                title="Leaderboard"
              >Leaderboard</button>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-xs text-blue-200">
              <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Stopped</span>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-4 shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            Challenge Stopped
          </h1>
          <p className="text-xl text-orange-200 mb-2">The Focus Challenge has been ended</p>
          <p className="text-sm text-orange-300">
            {challengeSettings.endDate 
              ? `Stopped on ${challengeSettings.endDate.toDate().toLocaleDateString()}`
              : 'Challenge stopped by administrator'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
            <h3 className="text-2xl font-bold text-center text-white mb-6">Administrator Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => { try { window.location.hash = '#start'; } catch {} onRestartChallenge(); }}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 rounded-2xl 
                         flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Play className="w-6 h-6" />
                <span className="font-semibold text-lg">Start New Challenge</span>
              </button>
              
              <button
                onClick={() => { try { window.location.hash = '#start'; } catch {} onViewSettings(); }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-2xl 
                         flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Settings className="w-6 h-6" />
                <span className="font-semibold text-lg">View Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-center text-white mb-8">Challenge Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{totalParticipants}</div>
                <div className="text-sm text-orange-200">Total Participants</div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{activeParticipants}</div>
                <div className="text-sm text-orange-200">Active Participants</div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{averageProgress}/{totalTasks}</div>
                <div className="text-sm text-orange-200">Average Progress</div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{completedChallenges}</div>
                <div className="text-sm text-orange-200">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        {topParticipants.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h3 className="text-3xl font-bold text-white">Top Performers</h3>
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              
              <div className="space-y-4">
                {topParticipants.map((participant, index) => {
                  const rank = index + 1;
                  const isFirst = rank === 1;
                  const isSecond = rank === 2;
                  const isThird = rank === 3;
                  
                  return (
                    <div
                      key={participant.userId}
                      className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 ${
                        isFirst 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 shadow-lg' 
                          : isSecond
                          ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-2 border-gray-400/50 shadow-lg'
                          : isThird
                          ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-2 border-amber-600/50 shadow-lg'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        {isFirst && <Trophy className="w-8 h-8 text-yellow-400" />}
                        {isSecond && <Award className="w-8 h-8 text-gray-400" />}
                        {isThird && <Star className="w-8 h-8 text-amber-600" />}
                        {!isFirst && !isSecond && !isThird && (
                          <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-bold">
                            {rank}
                          </div>
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-lg ${
                          isFirst ? 'text-yellow-200' : isSecond ? 'text-gray-200' : isThird ? 'text-amber-200' : 'text-white'
                        }`}>
                          {participant.name || participant.userId || 'Anonymous'}
                        </div>
                        <div className="text-sm text-orange-200">
                          {Object.values(participant.progress).filter(Boolean).length}/{totalTasks} tasks completed
                        </div>
                      </div>
                      
                      {/* Points */}
                      <div className="flex-shrink-0 text-right">
                        <div className={`text-2xl font-bold ${
                          isFirst ? 'text-yellow-200' : isSecond ? 'text-gray-200' : isThird ? 'text-amber-200' : 'text-white'
                        }`}>
                          {participant.totalPoints}
                        </div>
                        <div className="text-xs text-orange-200">points</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Challenge Details */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-center text-white mb-6">Challenge Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-200">Start Date:</span>
                  </div>
                  <span className="text-white font-medium">
                    {challengeSettings.startDate 
                      ? challengeSettings.startDate.toDate().toLocaleDateString()
                      : 'Not started'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-200">End Date:</span>
                  </div>
                  <span className="text-white font-medium">
                    {challengeSettings.endDate 
                      ? challengeSettings.endDate.toDate().toLocaleDateString()
                      : 'Not set'
                    }
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-200">Total Days:</span>
                  </div>
                  <span className="text-white font-medium">{totalTasks}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-200">Completion Rate:</span>
                  </div>
                  <span className="text-white font-medium">
                    {totalParticipants > 0 ? Math.round((completedChallenges / totalParticipants) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 max-w-2xl mx-auto">
            <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-white mb-2">Challenge Management</h4>
            <p className="text-orange-200 mb-4">
              The challenge has been stopped. You can start a new challenge or modify settings as needed.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-orange-300">
              <RefreshCw className="w-4 h-4" />
              <span>Use the buttons above to manage the challenge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeStopped;
