import React, { useState, useEffect, useRef } from 'react';
import { 
  getChallengeSettings, 
  updateChallengeSettings,
  startChallenge,
  stopChallenge,
  pauseChallenge,
  resumeChallenge,
  advanceToNextDay,
  getAllTasks,
  forceReloadTasks,
  ChallengeSettings,
  Task
} from '../../firebase/firestore';
import TaskEditor from './TaskEditor';
import BulkTaskManager from './BulkTaskManager';
import BulkImportModal from './BulkImportModal';
import { 
  Settings, 
  Play, 
  Pause, 
  SkipForward, 
  Save, 
  Plus,
  Edit3,
  Clock,
  Target,
  AlertTriangle,
  Search,
  Filter,
  SortAsc,
  Eye,
  Settings2,
  Upload
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<ChallengeSettings | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [dayDuration, setDayDuration] = useState(24);
  const [trialEnabled, setTrialEnabled] = useState(true);
  
  // Task management states
  const [taskEditorOpen, setTaskEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'dayNumber' | 'title' | 'points'>('dayNumber');
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [bulkManagerOpen, setBulkManagerOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  
  // Ref for schedule container to enable auto-scroll
  const scheduleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading admin data...');
      setLoading(true);
      
      const [challengeSettings, challengeTasks] = await Promise.all([
        getChallengeSettings(),
        getAllTasks()
      ]);
      
      console.log(`Loaded ${challengeTasks.length} tasks from database`);
      
      setSettings(challengeSettings);
      setTasks(challengeTasks);
      
      if (challengeSettings) {
        setDayDuration(challengeSettings.dayDuration);
        setTrialEnabled(challengeSettings.trialEnabled);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async () => {
    try {
      setSaving(true);
      console.log('Admin: Starting challenge...');
      
      await startChallenge();
      
      console.log('Admin: Challenge started, reloading data...');
      await loadData();
      
      alert('Challenge started successfully!');
    } catch (error) {
      console.error('Admin: Error starting challenge:', error);
      
      let errorMessage = 'Error starting challenge. Please try again.';
      
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        // Provide more specific error messages
        if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please check your admin privileges.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'Firestore quota exceeded. Please try again later.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleStopChallenge = async () => {
    // Double confirmation for stopping challenge
    const firstConfirm = confirm(
      '⚠️ FIRST CONFIRMATION\n\nAre you sure you want to STOP the challenge?\n\nThis will:\n- Permanently deactivate ALL tasks\n- End the current challenge\n- Cannot be undone\n\nClick OK to proceed to second confirmation.'
    );
    
    if (!firstConfirm) {
      return;
    }
    
    const secondConfirm = confirm(
      '🛑 FINAL CONFIRMATION\n\nThis is your FINAL warning!\n\nStopping the challenge will:\n- End the challenge for ALL participants\n- Deactivate all tasks immediately\n- Require starting a new challenge to continue\n\nType "STOP CHALLENGE" in your mind and click OK to confirm, or Cancel to abort.'
    );
    
    if (!secondConfirm) {
      return;
    }
    
    try {
      setSaving(true);
      await stopChallenge();
      await loadData();
      alert('✅ Challenge stopped successfully!');
    } catch (error) {
      console.error('Error stopping challenge:', error);
      alert('❌ Error stopping challenge. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePauseChallenge = async () => {
    if (!confirm('Are you sure you want to pause the challenge? This will temporarily deactivate all tasks.')) {
      return;
    }
    
    try {
      setSaving(true);
      await pauseChallenge();
      await loadData();
      alert('Challenge paused successfully!');
    } catch (error) {
      console.error('Error pausing challenge:', error);
      alert('Error pausing challenge. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeChallenge = async () => {
    if (!confirm('Are you sure you want to resume the challenge? This will recalculate remaining days and reactivate tasks.')) {
      return;
    }
    
    try {
      setSaving(true);
      await resumeChallenge();
      await loadData();
      alert('Challenge resumed successfully!');
    } catch (error) {
      console.error('Error resuming challenge:', error);
      alert('Error resuming challenge. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdvanceDay = async () => {
    if (!settings || !confirm('ℹ️ Are you sure you want to advance to the next day?\n\nThis will:\n- Move to the next challenge day\n- Activate new tasks for participants\n- Deactivate current day tasks')) {
      return;
    }
    
    try {
      setSaving(true);
      const nextDay = (settings.currentDay || 0) + 1;
      await advanceToNextDay(settings.currentDay);
      await loadData();
      
      // Auto-scroll to the new current day in schedule
      setTimeout(() => {
        if (scheduleContainerRef.current) {
          const dayElement = scheduleContainerRef.current.querySelector(`[data-day="${nextDay}"]`);
          if (dayElement) {
            dayElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center'
            });
          }
        }
      }, 500); // Delay to allow data reload
      
      alert(`✅ Successfully advanced to Day ${nextDay}!`);
    } catch (error) {
      console.error('Error advancing day:', error);
      alert('❌ Error advancing day. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await updateChallengeSettings({
        dayDuration,
        trialEnabled
      });
      await loadData();
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Task management functions
  const handleCreateTask = () => {
    setSelectedTask(null);
    setEditorMode('create');
    setTaskEditorOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditorMode('edit');
    setTaskEditorOpen(true);
  };

  const handleTaskSaved = async () => {
    console.log('Task operation completed, refreshing task list...');
    
    // Use force reload to bypass any caching issues
    try {
      setLoading(true);
      const freshTasks = await forceReloadTasks();
      setTasks(freshTasks);
      console.log(`Refreshed task list: ${freshTasks.length} tasks loaded`);
    } catch (error) {
      console.error('Error force refreshing tasks:', error);
      // Fallback to regular reload
      await loadData();
    } finally {
      setLoading(false);
    }
    
    console.log('Task list refreshed');
  };

  const handleCloseEditor = () => {
    setTaskEditorOpen(false);
    setSelectedTask(null);
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dayNumber':
          return a.dayNumber - b.dayNumber;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'points':
          return b.points - a.points;
        default:
          return 0;
      }
    });

  const getCategoryIcon = (category: string) => {
    const icons = {
      trial: '✨',
      worship: '🕌',
      social: '👥',
      knowledge: '📚',
      identity: '❤️',
      final: '👑'
    };
    return icons[category as keyof typeof icons] || '🎯';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'text-purple-600 bg-purple-100',
      medium: 'text-yellow-600 bg-yellow-100',
      hard: 'text-red-600 bg-red-100'
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };


  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge Control */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-islamic-primary" />
          <h3 className="text-xl font-bold text-islamic-dark">Challenge Control</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Challenge Status */}
          <div className="space-y-4">
            <h4 className="font-semibold text-islamic-dark">Current Status</h4>
            <div className="bg-islamic-light rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Challenge Status:</span>
                <span className={`font-medium ${
                  settings?.isActive && !settings?.isPaused
                    ? 'text-blue-600'
                    : settings?.isPaused
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {settings?.isActive
                    ? settings?.isPaused
                      ? 'Paused'
                      : 'Active'
                    : 'Inactive'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Day:</span>
                <span className="font-medium text-islamic-dark">
                  Day {settings?.currentDay || 0} {settings?.currentDay === 0 ? '(Trial)' : ''}
                </span>
              </div>
              {settings?.challengeDays && settings.challengeDays.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-2 flex items-center justify-between">
                    <span>Challenge Schedule:</span>
                    <span className="text-gray-400">({settings.challengeDays.length} days total)</span>
                  </div>
                  <div 
                    ref={scheduleContainerRef}
                    className="text-xs space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded"
                  >
                    {settings.challengeDays.map(day => {
                      const scheduledDate = day.scheduledDate?.toDate?.();
                      const trackingDate = day.trackingDate?.toDate?.();
                      const isCurrentDay = day.dayNumber === settings.currentDay;
                      return (
                        <div 
                          key={day.dayNumber} 
                          data-day={day.dayNumber}
                          className={`flex justify-between p-2 rounded transition-all duration-200 ${
                            isCurrentDay 
                              ? 'bg-blue-100 border border-blue-300 font-bold text-blue-800 shadow-sm' 
                              : day.isActive 
                              ? 'bg-green-50 text-green-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className={isCurrentDay ? 'font-bold' : ''}>
                            Day {day.dayNumber}{day.dayNumber === 0 ? ' (Trial)' : ''}: {scheduledDate?.toLocaleDateString()}
                            {isCurrentDay && ' ⬅️ CURRENT'}
                          </span>
                          <span className="text-gray-500 text-xs">
                            (Tracks: {trackingDate?.toLocaleDateString()})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Participants:</span>
                <span className="font-medium text-islamic-dark">
                  {/* This would be populated from participant count */}
                  Active
                </span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-2">
              {!settings?.isActive ? (
                <button
                  onClick={handleStartChallenge}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg 
                           flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>{saving ? 'Starting...' : 'Start Challenge'}</span>
                </button>
              ) : (
                <>
                  {/* Pause/Resume Button */}
                  {!settings?.isPaused ? (
                    <button
                      onClick={handlePauseChallenge}
                      disabled={saving}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg 
                               flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Pause className="w-4 h-4" />
                      <span>{saving ? 'Pausing...' : 'Pause Challenge'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleResumeChallenge}
                      disabled={saving}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg 
                               flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      <span>{saving ? 'Resuming...' : 'Resume Challenge'}</span>
                    </button>
                  )}
                  
                  {/* Stop Button */}
                  <button
                    onClick={handleStopChallenge}
                    disabled={saving}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg 
                             flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Pause className="w-4 h-4" />
                    <span>{saving ? 'Stopping...' : 'Stop Challenge'}</span>
                  </button>
                  
                  {/* Advance Day - Only show when not paused */}
                  {!settings?.isPaused && (
                    <button
                      onClick={handleAdvanceDay}
                      disabled={saving || !settings?.isActive || settings?.isPaused}
                      className="w-full bg-islamic-primary hover:bg-islamic-secondary text-white py-2 px-4 rounded-lg 
                               flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <SkipForward className="w-4 h-4" />
                      <span>{saving ? 'Advancing...' : `Advance to Day ${(settings?.currentDay || 0) + 1}`}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Challenge Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold text-islamic-dark">Settings</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day Duration (hours)
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={dayDuration}
                    onChange={(e) => setDayDuration(parseInt(e.target.value))}
                    disabled={settings?.isActive} // Disable when challenge is active
                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent ${
                      settings?.isActive ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                {settings?.isActive && (
                  <p className="mt-1 text-xs text-gray-500">
                    Day duration can only be changed when challenge is stopped or not started
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="trialEnabled"
                  checked={trialEnabled}
                  onChange={(e) => setTrialEnabled(e.target.checked)}
                  className="w-4 h-4 text-islamic-primary focus:ring-islamic-primary border-gray-300 rounded"
                />
                <label htmlFor="trialEnabled" className="text-sm font-medium text-gray-700">
                  Enable Trial Day (Day 0)
                </label>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving || settings?.isActive} // Disable when challenge is active
                className={`w-full bg-islamic-primary hover:bg-islamic-secondary text-white py-2 px-4 rounded-lg 
                         flex items-center justify-center space-x-2 disabled:opacity-50 ${
                          settings?.isActive ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''
                         }`}
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
              {settings?.isActive && (
                <p className="mt-1 text-xs text-gray-500">
                  Settings can only be changed when challenge is stopped or not started
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Task Management */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-islamic-primary" />
            <h3 className="text-xl font-bold text-islamic-dark">Task Management</h3>
            <span className="px-2 py-1 bg-islamic-light text-islamic-primary rounded-full text-sm font-medium">
              {tasks.length} tasks
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setBulkImportOpen(true)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg 
                       flex items-center space-x-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Import</span>
            </button>
            <button
              onClick={() => setBulkManagerOpen(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg 
                       flex items-center space-x-2 transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              <span>Bulk Edit</span>
            </button>
            <button
              onClick={handleCreateTask}
              className="bg-islamic-primary hover:bg-islamic-secondary text-white py-2 px-4 rounded-lg 
                       flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="trial">✨ Trial</option>
              <option value="worship">🕌 Worship</option>
              <option value="social">👥 Social</option>
              <option value="knowledge">📚 Knowledge</option>
              <option value="identity">❤️ Identity</option>
              <option value="final">👑 Final</option>
            </select>
          </div>

          <div className="relative">
            <SortAsc className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dayNumber' | 'title' | 'points')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent appearance-none"
            >
              <option value="dayNumber">Sort by Day</option>
              <option value="title">Sort by Title</option>
              <option value="points">Sort by Points</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid gap-4">
          {filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h4>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Get started by creating your first task'}
              </p>
              {(!searchTerm && filterCategory === 'all') && (
                <button
                  onClick={handleCreateTask}
                  className="bg-islamic-primary hover:bg-islamic-secondary text-white py-2 px-4 rounded-lg 
                           flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Task</span>
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      task.dayNumber === 0 ? 'bg-purple-500' : 'bg-islamic-primary'
                    }`}>
                      {task.dayNumber === 0 ? 'T' : task.dayNumber}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {task.title}
                        </h4>
                        {task.isActive && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getCategoryIcon(task.category)} {task.category}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </span>
                        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimatedTime}</span>
                        </span>
                        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                          <span className="text-yellow-500">⭐</span>
                          <span>{task.points} pts</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setShowPreview(showPreview === task.id ? null : task.id)}
                      className="p-2 text-gray-400 hover:text-islamic-primary hover:bg-islamic-light rounded-lg transition-colors"
                      title="Preview task"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-2 text-gray-400 hover:text-islamic-primary hover:bg-islamic-light rounded-lg transition-colors"
                      title="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Task Preview */}
                {showPreview === task.id && task.tips && task.tips.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Tips:</h5>
                    <ul className="space-y-1">
                      {task.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <span className="text-islamic-primary mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Warning Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Starting the challenge will activate the trial day (Day 0)</li>
              <li>• Advancing days will deactivate previous day tasks and activate next day</li>
              <li>• Stopping the challenge will reset all progress and deactivate all tasks</li>
              <li>• Changes to day duration only affect future days</li>
              <li>• Task editing is available - click the edit button on any task</li>
              <li>• Use search and filters to quickly find specific tasks</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Task Editor Modal */}
      <TaskEditor
        task={selectedTask}
        isOpen={taskEditorOpen}
        onClose={handleCloseEditor}
        onSave={handleTaskSaved}
        mode={editorMode}
      />
      
      {/* Bulk Task Manager */}
      <BulkTaskManager
        tasks={tasks}
        isOpen={bulkManagerOpen}
        onClose={() => setBulkManagerOpen(false)}
        onSave={handleTaskSaved}
      />
      
      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onSuccess={handleTaskSaved}
      />
    </div>
  );
};

export default AdminSettings;