import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  subscribeToParticipants, 
  resetParticipantProgress,
  deleteParticipant,
  subscribeToChallengeSettings,
  ChallengeSettings,
  UserProgress 
} from '../../firebase/firestore';
import AdminSettings from './AdminSettings';
import Leaderboard from '../ui/Leaderboard';
import CountdownTimer from '../ui/CountdownTimer';
import { 
  Users, 
  Trophy, 
  Calendar, 
  RefreshCw, 
  LogOut, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Settings,
  Play,
  Pause,
  Trash2
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { userRole, signOut } = useAuth();
  const [participants, setParticipants] = useState<UserProgress[]>([]);
  const [challengeSettings, setChallengeSettings] = useState<ChallengeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [resettingUser, setResettingUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'settings' | 'leaderboard'>('overview');

  useEffect(() => {
    // Subscribe to participants data
    const unsubscribeParticipants = subscribeToParticipants((participantsData) => {
      setParticipants(participantsData);
      setLoading(false);
    });

    // Subscribe to challenge settings
    const unsubscribeSettings = subscribeToChallengeSettings((settings) => {
      setChallengeSettings(settings);
    });

    return () => {
      unsubscribeParticipants();
      unsubscribeSettings();
    };
  }, []);

  const handleResetProgress = async (userId: string, userName: string) => {
    const confirmReset = window.confirm(
      `Are you sure you want to reset ${userName}'s progress?\n\nThis will:\n• Delete all completed tasks\n• Reset total points to 0\n• Reset leaderboard rank\n\nThis action cannot be undone.`
    );
    
    if (!confirmReset) {
      return;
    }

    try {
      console.log(`🔒 Admin ${userRole?.name} initiating reset for user: ${userId} (${userName})`);
      setResettingUser(userId);
      
      await resetParticipantProgress(userId);
      
      console.log(`✅ Successfully reset progress for ${userName}`);
      alert(`✅ Success!\n\n${userName}'s progress has been reset successfully.\n\nAll tasks, points, and rank have been cleared.`);
      
    } catch (error) {
      console.error('❌ Error resetting progress:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      alert(`❌ Reset Failed!\n\nError resetting progress for ${userName}:\n\n${errorMessage}\n\nPlease try again or check your admin permissions.`);
    } finally {
      setResettingUser(null);
    }
  };

  const handleDeleteParticipant = async (userId: string, userName: string, userEmail: string) => {
    // First confirmation - Basic warning
    const firstConfirm = window.confirm(
      `⚠️ DANGER: Delete Participant Account\n\nYou are about to PERMANENTLY DELETE:\n• Name: ${userName}\n• Email: ${userEmail}\n\n⚠️ THIS ACTION CANNOT BE UNDONE\n\nThe participant will lose:\n• All progress and completed tasks\n• All points and rank\n• Their entire account\n\nAre you absolutely sure you want to continue?`
    );
    
    if (!firstConfirm) {
      return;
    }

    // Second confirmation - Type confirmation for extra safety
    const typeConfirmation = window.prompt(
      `🔒 FINAL CONFIRMATION\n\nTo permanently delete ${userName}'s account, please type:\n\nDELETE ${userName.toUpperCase()}\n\n(This confirms you understand this action is irreversible)\n\nType here:`
    );
    
    const expectedConfirmation = `DELETE ${userName.toUpperCase()}`;
    
    if (typeConfirmation !== expectedConfirmation) {
      if (typeConfirmation !== null) { // User didn't cancel
        alert(`❌ Confirmation failed\n\nYou typed: "${typeConfirmation}"\nExpected: "${expectedConfirmation}"\n\nDeletion cancelled for safety.`);
      }
      return;
    }

    try {
      console.log(`🔒 Admin ${userRole?.name} initiating deletion for user: ${userId} (${userName})`);
      setDeletingUser(userId);
      
      await deleteParticipant(userId);
      
      console.log(`✅ Successfully deleted participant: ${userName}`);
      alert(`✅ Deletion Complete!\n\n${userName}'s account has been permanently deleted.\n\nAll their data has been removed from the system.`);
      
    } catch (error) {
      console.error('❌ Error deleting participant:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      alert(`❌ Deletion Failed!\n\nError deleting ${userName}'s account:\n\n${errorMessage}\n\nPlease try again or check your admin permissions.`);
    } finally {
      setDeletingUser(null);
    }
  };

  // Calculate statistics
  const stats = {
    totalParticipants: participants.length,
    activeParticipants: participants.filter(p => p.completedTasks > 0).length,
    averageProgress: participants.length > 0 
      ? Math.round(participants.reduce((sum, p) => sum + p.completedTasks, 0) / participants.length)
      : 0,
    completedChallenges: participants.filter(p => p.completedTasks === 15).length // Updated to 15 (including trial day)
  };

  // Calculate next day deadline
  const getNextDayDeadline = (): Date | null => {
    if (!challengeSettings || !challengeSettings.isActive || !challengeSettings.startDate) {
      return null;
    }
    
    const startTime = challengeSettings.startDate.toDate();
    const hoursPerDay = challengeSettings.dayDuration;
    const currentDay = challengeSettings.currentDay;
    
    // Calculate deadline for current day
    const deadline = new Date(startTime.getTime() + (currentDay + 1) * hoursPerDay * 60 * 60 * 1000);
    return deadline;
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-light to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-islamic-primary mx-auto mb-4"></div>
          <p className="text-islamic-primary font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-light to-white">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-islamic-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-islamic-primary rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-islamic-dark">Admin Dashboard</h1>
                  <p className="text-islamic-primary">Welcome back, {userRole?.name}</p>
                </div>
                
                {/* Challenge Status Indicator */}
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${
                  challengeSettings?.isActive 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {challengeSettings?.isActive ? (
                    <><Play className="w-3 h-3" /><span>Active - Day {challengeSettings.currentDay}</span></>
                  ) : (
                    <><Pause className="w-3 h-3" /><span>Inactive</span></>
                  )}
                </div>
              </div>
              
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 
                         text-red-600 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setCurrentTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    currentTab === 'overview'
                      ? 'border-islamic-primary text-islamic-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setCurrentTab('settings')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                    currentTab === 'settings'
                      ? 'border-islamic-primary text-islamic-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => setCurrentTab('leaderboard')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                    currentTab === 'leaderboard'
                      ? 'border-islamic-primary text-islamic-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Leaderboard</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'overview' && (
          <>
            {/* Countdown Timer for Active Challenge */}
            {challengeSettings?.isActive && (
              <div className="mb-8">
                <CountdownTimer
                  targetDate={getNextDayDeadline()}
                  title={`Day ${challengeSettings.currentDay} Countdown`}
                  className="max-w-md mx-auto"
                />
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Participants</p>
                    <p className="text-3xl font-bold text-islamic-dark">{stats.totalParticipants}</p>
                  </div>
                  <Users className="w-12 h-12 text-islamic-primary" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Participants</p>
                    <p className="text-3xl font-bold text-islamic-dark">{stats.activeParticipants}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Average Progress</p>
                    <p className="text-3xl font-bold text-islamic-dark">{stats.averageProgress}/15</p>
                  </div>
                  <Calendar className="w-12 h-12 text-islamic-accent" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold text-islamic-dark">{stats.completedChallenges}</p>
                  </div>
                  <Trophy className="w-12 h-12 text-islamic-gold" />
                </div>
              </div>
            </div>

            {/* Charts and Participants List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Existing chart components */}
            </div>

            {/* Participants List */}
            <div className="bg-white rounded-xl shadow-lg border border-islamic-light">
              <div className="px-6 py-4 border-b border-islamic-light">
                <h3 className="text-lg font-semibold text-islamic-dark">Participants</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Monitor progress and manage participant accounts
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-islamic-light">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-islamic-dark uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-islamic-dark uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-islamic-dark uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-islamic-dark uppercase tracking-wider">
                        Completed Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-islamic-dark uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-islamic-dark uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {participants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-lg font-medium">No participants yet</p>
                          <p className="text-sm">Participants will appear here once they join the challenge</p>
                        </td>
                      </tr>
                    ) : (
                      participants.map((participant) => {
                        const progressPercentage = (participant.completedTasks / 15) * 100;
                        const isCompleted = participant.completedTasks === 15;
                        
                        return (
                          <tr key={participant.userId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {participant.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {participant.email}
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      isCompleted ? 'bg-blue-500' : 
                                      progressPercentage > 0 ? 'bg-islamic-accent' : 'bg-gray-300'
                                    }`}
                                    style={{ width: `${progressPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                                  {Math.round(progressPercentage)}%
                                </span>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-islamic-gold">
                                {participant.totalPoints || 0} pts
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">
                                  {participant.completedTasks}/15
                                </span>
                                {isCompleted && (
                                  <CheckCircle className="w-4 h-4 text-blue-500 ml-2" />
                                )}
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                isCompleted 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : participant.completedTasks > 0
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {isCompleted ? 'Completed' : 
                                 participant.completedTasks > 0 ? 'In Progress' : 'Not Started'}
                              </span>
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleResetProgress(participant.userId, participant.name)}
                                  disabled={resettingUser === participant.userId || deletingUser === participant.userId}
                                  className="flex items-center space-x-1 px-3 py-1 bg-yellow-50 hover:bg-yellow-100 
                                           text-yellow-700 rounded-lg transition-colors duration-200 text-sm
                                           disabled:opacity-50"
                                >
                                  <RefreshCw 
                                    className={`w-3 h-3 ${resettingUser === participant.userId ? 'animate-spin' : ''}`} 
                                  />
                                  <span>Reset</span>
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteParticipant(participant.userId, participant.name, participant.email)}
                                  disabled={resettingUser === participant.userId || deletingUser === participant.userId}
                                  className="flex items-center space-x-1 px-3 py-1 bg-red-50 hover:bg-red-100 
                                           text-red-600 rounded-lg transition-colors duration-200 text-sm
                                           disabled:opacity-50"
                                >
                                  <Trash2 
                                    className={`w-3 h-3 ${deletingUser === participant.userId ? 'animate-pulse' : ''}`} 
                                  />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {currentTab === 'settings' && (
          <AdminSettings />
        )}

        {currentTab === 'leaderboard' && (
          <Leaderboard className="max-w-4xl mx-auto" />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;