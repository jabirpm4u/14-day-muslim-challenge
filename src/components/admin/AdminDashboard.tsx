import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  subscribeToParticipants, 
  resetParticipantProgress,
  deleteParticipant,
  subscribeToChallengeSettings,
  ChallengeSettings,
  UserProgress,
  getAllTasks,
  Task,
  checkAndStartChallenge
} from '../../firebase/firestore';
import AdminSettings from './AdminSettings';
import ChallengeManagement from './ChallengeManagement';
import Leaderboard from '../ui/Leaderboard';

import ParticipantProgressModal from './ParticipantProgressModal';
import ChallengeStopped from './ChallengeStopped';
import { 
  Users, 
  Trophy, 
  Calendar, 
  RefreshCw, 
  LogOut, 
  AlertCircle,
  TrendingUp,
  Settings,
  Play,
  Pause,
  Trash2,
  Eye,
  Target,
  Plus
} from 'lucide-react';

// Challenge Status Panel Component
const ChallengeStatusPanel: React.FC<{
  challengeSettings: ChallengeSettings | null;
  onStartChallenge: () => void;
}> = ({ challengeSettings, onStartChallenge }) => {
  
  if (!challengeSettings) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-6 h-6 text-islamic-primary" />
          <h3 className="text-lg font-bold text-islamic-dark">Challenge Status</h3>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Challenge Created</h4>
          <p className="text-gray-600 mb-4">Create your first challenge to get started</p>
          <button
            onClick={onStartChallenge}
            className="bg-islamic-primary hover:bg-islamic-secondary text-white py-2 px-4 rounded-lg 
                     flex items-center space-x-2 mx-auto transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Challenge</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-islamic-primary" />
        <h3 className="text-lg font-bold text-islamic-dark">Challenge Status</h3>
      </div>

      {/* Current Status */}
      <div className="space-y-4">
        <div className="bg-islamic-light rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`font-medium px-2 py-1 rounded-full text-xs ${
              challengeSettings?.isActive && !challengeSettings?.isPaused
                ? 'bg-green-100 text-green-800'
                : challengeSettings?.isPaused
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {challengeSettings?.isActive
                ? challengeSettings?.isPaused
                  ? 'Paused'
                  : 'Active'
                : 'Inactive'
              }
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Current Day:</span>
            <span className="font-medium text-islamic-dark">
              Day {challengeSettings?.currentDay || 0} {challengeSettings?.currentDay === 0 && challengeSettings?.trialEnabled ? '(Trial)' : ''}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Days:</span>
            <span className="font-medium text-islamic-dark">
              {challengeSettings?.challengeDays ? challengeSettings.challengeDays.length : 'Not set'}
            </span>
          </div>
          
          {challengeSettings?.scheduledStartDate && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Scheduled Start:</span>
              <span className="font-medium text-islamic-dark text-xs">
                {challengeSettings.scheduledStartDate.toDate().toLocaleDateString()}
              </span>
            </div>
          )}
          
          {challengeSettings?.startDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Actual Start:</span>
              <span className="font-medium text-islamic-dark text-xs">
                {challengeSettings.startDate.toDate().toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Challenge Configuration Display */}
        {challengeSettings?.isActive && (
          <div className="space-y-3">
            <h4 className="font-semibold text-islamic-dark text-sm">Configuration</h4>
            
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Trial Day:</span>
                <span className="text-xs font-medium text-gray-900">
                  {challengeSettings.trialEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Participants:</span>
                <span className="text-xs font-medium text-gray-900">
                  Active
                </span>
              </div>
            </div>

            {/* Challenge Schedule Preview */}
            {challengeSettings.challengeDays && challengeSettings.challengeDays.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-gray-700">Complete Schedule</h5>
                <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                  <div className="space-y-1">
                    {challengeSettings.challengeDays.map(day => {
                      const scheduledDate = day.scheduledDate?.toDate?.();
                      const isCurrentDay = day.dayNumber === challengeSettings.currentDay;
                      const isPastDay = day.dayNumber < challengeSettings.currentDay;
                      const isFutureDay = day.dayNumber > challengeSettings.currentDay;
                      
                      return (
                        <div 
                          key={day.dayNumber}
                          className={`flex justify-between text-xs p-2 rounded transition-colors ${
                            isCurrentDay 
                              ? 'bg-blue-100 text-blue-800 font-semibold border border-blue-200' 
                              : isPastDay
                              ? 'bg-green-50 text-green-700'
                              : isFutureDay
                              ? 'text-gray-600 hover:bg-gray-100'
                              : 'text-gray-600'
                          }`}
                        >
                          <span className="flex items-center space-x-1">
                            {isPastDay && <span className="text-green-500">✓</span>}
                            {isCurrentDay && <span className="text-blue-500">●</span>}
                            <span>Day {day.dayNumber}{day.dayNumber === 0 && challengeSettings.trialEnabled ? ' (Trial)' : ''}</span>
                          </span>
                          <span className="font-mono">{scheduledDate?.toLocaleDateString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Total: {challengeSettings.challengeDays.length} days
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-islamic-dark text-sm mb-3">Quick Actions</h4>
          <div className="space-y-2">
            {!challengeSettings?.isActive ? (
              <button
                onClick={onStartChallenge}
                className="w-full bg-islamic-primary hover:bg-islamic-secondary text-white py-2 px-3 rounded-lg 
                         flex items-center justify-center space-x-2 text-sm transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Configure Challenge</span>
              </button>
            ) : (
              <button
                onClick={onStartChallenge}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg 
                         flex items-center justify-center space-x-2 text-sm transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Challenge</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { userRole, signOut } = useAuth();
  const [participants, setParticipants] = useState<UserProgress[]>([]);
  const [challengeSettings, setChallengeSettings] = useState<ChallengeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [resettingUser, setResettingUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'participants' | 'tasks' | 'leaderboard'>('overview');
  const [selectedParticipant, setSelectedParticipant] = useState<UserProgress | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  // Check if challenge should start immediately when admin dashboard loads
  useEffect(() => {
    const checkAndStart = async () => {
      if (challengeSettings && !challengeSettings.isActive && challengeSettings.scheduledStartDate) {
        const now = new Date();
        const scheduledStart = challengeSettings.scheduledStartDate.toDate();
        
        // If scheduled time has passed, start the challenge
        if (now >= scheduledStart) {
          console.log('🚀 Admin Dashboard: Scheduled start time has passed, starting challenge...');
          try {
            await checkAndStartChallenge();
            // Refresh the page to show the updated state
            window.location.reload();
          } catch (error) {
            console.error('Error starting challenge from admin dashboard:', error);
          }
        }
      }
    };
    
    checkAndStart();
  }, [challengeSettings]);

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

    // Load all tasks for progress display
    const loadTasks = async () => {
      const tasks = await getAllTasks();
      setAllTasks(tasks);
    };
    loadTasks();

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

  const handleViewProgress = (participant: UserProgress) => {
    setSelectedParticipant(participant);
    setIsModalOpen(true);
  };

  // Calculate statistics
  const totalChallengeDays = challengeSettings?.challengeDays?.length || 0;
  const stats = {
    totalParticipants: participants.length,
    activeParticipants: participants.filter(p => p.completedTasks > 0).length,
    averageProgress: participants.length > 0 
      ? Math.round(participants.reduce((sum, p) => sum + p.completedTasks, 0) / participants.length)
      : 0,
    completedChallenges: participants.filter(p => p.completedTasks === totalChallengeDays).length
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

  // Show stopped challenge state if challenge is not active,
  // but allow navigating to Overview (where ChallengeManagement is) via state
  if (!challengeSettings?.isActive && challengeSettings && currentTab !== 'overview' && currentTab !== 'participants') {
    return (
      <ChallengeStopped
        challengeSettings={challengeSettings}
        participants={participants}
        onRestartChallenge={() => setCurrentTab('overview')}
        onViewSettings={() => setCurrentTab('overview')}
        onViewOverview={() => setCurrentTab('overview')}
        onViewLeaderboard={() => setCurrentTab('leaderboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-light to-white">
      {/* Progress Modal */}
      {selectedParticipant && (
        <ParticipantProgressModal
          participant={selectedParticipant}
          tasks={allTasks}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

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
                  onClick={() => setCurrentTab('participants')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                    currentTab === 'participants'
                      ? 'border-islamic-primary text-islamic-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Participants</span>
                </button>
                <button
                  onClick={() => setCurrentTab('tasks')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                    currentTab === 'tasks'
                      ? 'border-islamic-primary text-islamic-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Task Management</span>
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
        <div className={`grid grid-cols-1 gap-8 ${challengeSettings?.isActive ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
          {/* Main Content Area */}
          <div className={challengeSettings?.isActive ? 'lg:col-span-2' : 'lg:col-span-1'}>
            {currentTab === 'overview' && (
              <>
                {/* Challenge Management Section */}
                <div className="mb-8">
                  <ChallengeManagement />
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                        <p className="text-3xl font-bold text-islamic-dark">{stats.averageProgress}/{totalChallengeDays}</p>
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


              </>
            )}

            {currentTab === 'participants' && (
              <div className="bg-white rounded-xl shadow-lg border border-islamic-light">
                <div className="px-6 py-4 border-b border-islamic-light">
                  <h3 className="text-lg font-semibold text-islamic-dark">Participants Management</h3>
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
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-lg font-medium">No participants yet</p>
                            <p className="text-sm">Participants will appear here once they join the challenge</p>
                          </td>
                        </tr>
                      ) : (
                        participants.map((participant) => {
                          const progressPercentage = totalChallengeDays > 0 ? (participant.completedTasks / totalChallengeDays) * 100 : 0;
                          const isCompleted = participant.completedTasks === totalChallengeDays;
                          
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
                                    onClick={() => handleViewProgress(participant)}
                                    className="flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 
                                             text-blue-700 rounded-lg transition-colors duration-200 text-sm"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>View</span>
                                  </button>
                                  
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
            )}

            {currentTab === 'tasks' && (
              <AdminSettings />
            )}

            {currentTab === 'leaderboard' && (
              <Leaderboard className="w-full" />
            )}
          </div>

          {/* Challenge Status Sidebar - Only show when challenge is active */}
          {challengeSettings?.isActive && (
            <div className="lg:col-span-1">
              <ChallengeStatusPanel 
                challengeSettings={challengeSettings}
                onStartChallenge={() => setCurrentTab('overview')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;