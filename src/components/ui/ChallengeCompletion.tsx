import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Crown, 
  Medal, 
  Sparkles,
  CheckCircle,
  TrendingUp,
  Heart,
  Flame
} from 'lucide-react';
import { UserProgress, ChallengeSettings } from '../../firebase/firestore';

interface ChallengeCompletionProps {
  userProgress: UserProgress;
  allParticipants: UserProgress[];
  challengeSettings: ChallengeSettings;
  totalTasks: number;
  showAchievements?: boolean; // optional: hide achievements when not needed
}

const ChallengeCompletion: React.FC<ChallengeCompletionProps> = ({
  userProgress,
  allParticipants,
  challengeSettings,
  totalTasks,
  showAchievements = true
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentRank, setCurrentRank] = useState(0);

  // Calculate user's rank
  useEffect(() => {
    const sortedParticipants = [...allParticipants].sort((a, b) => b.totalPoints - a.totalPoints);
    const rank = sortedParticipants.findIndex(p => p.userId === userProgress.userId) + 1;
    setCurrentRank(rank);
  }, [allParticipants, userProgress.userId]);

  // Trigger celebration animation
  useEffect(() => {
    setShowCelebration(true);
    const timer = setTimeout(() => setShowCelebration(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate achievements
  const completedTasks = Object.values(userProgress.progress).filter(Boolean).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isPerfect = completionRate === 100;
  const isTopTen = currentRank <= 10;

  // Get rank badge
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: Crown, color: 'text-yellow-500', bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', text: 'Champion' };
    if (rank === 2) return { icon: Medal, color: 'text-gray-400', bg: 'bg-gradient-to-br from-gray-300 to-gray-500', text: 'Runner-up' };
    if (rank === 3) return { icon: Award, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-400 to-amber-600', text: 'Third Place' };
    if (rank <= 10) return { icon: Star, color: 'text-blue-500', bg: 'bg-gradient-to-br from-blue-400 to-blue-600', text: 'Top 10' };
    return { icon: Target, color: 'text-green-500', bg: 'bg-gradient-to-br from-green-400 to-green-600', text: 'Participant' };
  };

  const rankBadge = getRankBadge(currentRank);
  const RankIcon = rankBadge.icon;

  // Get achievement badges
  const achievements = [
    { 
      icon: CheckCircle, 
      title: 'Task Master', 
      description: `${completedTasks}/${totalTasks} tasks completed`,
      unlocked: completedTasks > 0,
      color: 'text-green-500',
      bgColor: 'bg-gradient-to-br from-green-400 to-green-600'
    },
    { 
      icon: Trophy, 
      title: 'Perfect Score', 
      description: 'Completed all tasks',
      unlocked: isPerfect,
      color: 'text-yellow-500',
      bgColor: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
    },
    { 
      icon: Crown, 
      title: 'Top Performer', 
      description: 'Ranked in top 10',
      unlocked: isTopTen,
      color: 'text-purple-500',
      bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600'
    },
    { 
      icon: Flame, 
      title: 'Consistent', 
      description: '80%+ completion rate',
      unlocked: completionRate >= 80,
      color: 'text-orange-500',
      bgColor: 'bg-gradient-to-br from-orange-400 to-orange-600'
    },
    { 
      icon: Star, 
      title: 'Dedicated', 
      description: '50%+ completion rate',
      unlocked: completionRate >= 50,
      color: 'text-blue-500',
      bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600'
    },
    { 
      icon: Heart, 
      title: 'Participant', 
      description: 'Joined the challenge',
      unlocked: completedTasks >= 0,
      color: 'text-pink-500',
      bgColor: 'bg-gradient-to-br from-pink-400 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20" />
        {showCelebration && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-2xl">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            Challenge Complete!
          </h1>
          <p className="text-xl text-blue-200 mb-2">Congratulations on completing the Focus Challenge</p>
          <p className="text-sm text-blue-300">
            {challengeSettings.endDate 
              ? `Completed on ${challengeSettings.endDate.toDate().toLocaleDateString()}`
              : 'Challenge completed successfully'
            }
          </p>
        </div>

        {/* Main Results Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            {/* Rank Display */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 ${rankBadge.bg} rounded-full mb-4 shadow-xl`}>
                <RankIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Rank #{currentRank}
              </h2>
              <p className="text-xl text-blue-200 mb-4">{rankBadge.text}</p>
              
              {/* Score Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-3 mx-auto">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{userProgress.totalPoints}</div>
                  <div className="text-sm text-blue-200">Total Points</div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-3 mx-auto">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{completedTasks}/{totalTasks}</div>
                  <div className="text-sm text-blue-200">Tasks Completed</div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-3 mx-auto">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{Math.round(completionRate)}%</div>
                  <div className="text-sm text-blue-200">Completion Rate</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {showAchievements && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-center text-white mb-6">Your Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div
                        key={index}
                        className={`bg-white/5 rounded-2xl p-6 border transition-all duration-300 transform hover:scale-105 ${
                          achievement.unlocked 
                            ? 'border-white/30 shadow-lg hover:shadow-xl' 
                            : 'border-white/10 opacity-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                            achievement.unlocked ? achievement.bgColor : 'bg-white/5'
                          }`}>
                            <Icon className={`w-8 h-8 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          <div className={`font-bold text-lg mb-2 ${
                            achievement.unlocked ? 'text-white' : 'text-gray-400'
                          }`}>
                            {achievement.title}
                          </div>
                          <div className={`text-sm ${
                            achievement.unlocked ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {achievement.description}
                          </div>
                          {achievement.unlocked && (
                            <div className="mt-3">
                              <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Final Leaderboard */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h3 className="text-3xl font-bold text-white">Final Leaderboard</h3>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            
            {/* Header removed for ultra-clean layout */}
            
            <div className="space-y-2">
              {allParticipants
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .slice(0, 10)
                .map((participant, index) => {
                  const isCurrentUser = participant.userId === userProgress.userId;
                  const rank = index + 1;
                  const completedTasks = Object.values(participant.progress).filter(Boolean).length;
                  
                  return (
                    <div
                      key={participant.userId}
                      className={`grid grid-cols-9 gap-3 items-center p-3 rounded-2xl transition-all duration-300 ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 shadow-lg' 
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {/* Rank */}
                      <div className="col-span-1 text-center">
                        {rank === 1 && <Crown className="w-6 h-6 text-yellow-400 mx-auto" />}
                        {rank === 2 && <Medal className="w-6 h-6 text-gray-400 mx-auto" />}
                        {rank === 3 && <Award className="w-6 h-6 text-amber-600 mx-auto" />}
                        {rank > 3 && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto ${
                            isCurrentUser ? 'bg-yellow-400 text-slate-900' : 'bg-white/20 text-white'
                          }`}>
                            {rank}
                          </div>
                        )}
                      </div>
                      
                      {/* User Info (with compact done/total inline) */}
                      <div className="col-span-7">
                        <div className={`font-semibold truncate ${
                          isCurrentUser ? 'text-yellow-200' : 'text-white'
                        }`}>
                          {participant.name || participant.userId || 'Anonymous'}
                          {isCurrentUser && <span className="ml-2 text-yellow-400">(You)</span>}
                        </div>
                        <div className="mt-0.5 text-[11px] text-blue-200 inline-flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="tabular-nums">{completedTasks}/{totalTasks}</span>
                        </div>
                      </div>
                      
                      {/* Points */}
                      <div className="col-span-1 text-center">
                        <div className={`text-base font-bold ${
                          isCurrentUser ? 'text-yellow-200' : 'text-white'
                        }`}>
                          {participant.totalPoints}
                        </div>
                        <div className="text-[10px] text-blue-200">points</div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {allParticipants.length > 10 && (
              <div className="text-center mt-6">
                <p className="text-blue-200 text-sm">
                  Showing top 10 of {allParticipants.length} participants
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 max-w-2xl mx-auto">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-white mb-2">Thank You for Participating!</h4>
            <p className="text-blue-200 mb-4">
              Your dedication to the Focus Challenge has been inspiring. 
              Keep up the great work in your journey of self-improvement.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-300">
              <Sparkles className="w-4 h-4" />
              <span>May Allah bless your efforts and grant you success</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCompletion;
