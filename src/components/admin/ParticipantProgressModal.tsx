import React, { useState } from 'react';
import { X, CheckCircle, Circle, Calendar, Star, Target, Award, ChevronDown, ChevronRight } from 'lucide-react';
import { UserProgress, Task } from '../../firebase/firestore';

interface ParticipantProgressModalProps {
  participant: UserProgress;
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

const ParticipantProgressModal: React.FC<ParticipantProgressModalProps> = ({ 
  participant, 
  tasks, 
  isOpen, 
  onClose 
}) => {
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  
  if (!isOpen) return null;

  // Group tasks by day
  const tasksByDay: Record<number, Task[]> = {};
  tasks.forEach(task => {
    if (!tasksByDay[task.dayNumber]) {
      tasksByDay[task.dayNumber] = [];
    }
    tasksByDay[task.dayNumber].push(task);
  });

  // Get completed tasks for this participant
  const completedTaskIds = Object.keys(participant.progress || {}).filter(
    taskId => participant.progress[taskId]
  );

  // Calculate points for a specific day
  const getDayPoints = (dayNumber: number): number => {
    const dayTasks = tasksByDay[dayNumber] || [];
    return dayTasks.reduce((total, task) => {
      if (completedTaskIds.includes(task.id)) {
        return total + (participant.points?.[task.id] || task.points || 0);
      }
      return total;
    }, 0);
  };

  // Calculate progress for each day
  const getDayProgress = (dayNumber: number): { completed: number; total: number } => {
    const dayTasks = tasksByDay[dayNumber] || [];
    const completed = dayTasks.filter(task => 
      completedTaskIds.includes(task.id)
    ).length;
    return { completed, total: dayTasks.length };
  };

  // Get day status
  const getDayStatus = (dayNumber: number) => {
    const progress = getDayProgress(dayNumber);
    if (progress.total === 0) return 'not-started';
    if (progress.completed === progress.total) return 'completed';
    if (progress.completed > 0) return 'in-progress';
    return 'not-started';
  };

  // Get day status icon
  const getDayStatusIcon = (dayNumber: number) => {
    const status = getDayStatus(dayNumber);
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Target className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  // Get day status text
  const getDayStatusText = (dayNumber: number) => {
    const status = getDayStatus(dayNumber);
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  // Get day status class
  const getDayStatusClass = (dayNumber: number) => {
    const status = getDayStatus(dayNumber);
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  // Get day title
  const getDayTitle = (dayNumber: number) => {
    if (dayNumber === 0) return 'Trial Day';
    return `Day ${dayNumber}`;
  };

  // Toggle day expansion
  const toggleDayExpansion = (dayNumber: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  // Calculate overall progress
  const totalTasks = tasks.length;
  const completedTasks = completedTaskIds.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        />

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="absolute top-4 right-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {participant.name}'s Progress
                </h3>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-1">{participant.email}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="w-4 h-4 mr-1" />
                    <span>Rank: #{participant.rank || '-'}</span>
                    <Star className="w-4 h-4 ml-3 mr-1" />
                    <span>{participant.totalPoints || 0} points</span>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">Overall Progress</h4>
                    <span className="text-lg font-bold text-blue-600">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{completedTasks} of {totalTasks} tasks completed</span>
                  </div>
                </div>

                {/* Daily Progress */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Daily Progress</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 15 }, (_, i) => i).map(dayNumber => {
                      const progress = getDayProgress(dayNumber);
                      const dayPoints = getDayPoints(dayNumber);
                      const dayProgressPercentage = progress.total > 0 
                        ? Math.round((progress.completed / progress.total) * 100) 
                        : 0;
                      
                      const isExpanded = expandedDays[dayNumber];
                      const dayTasks = tasksByDay[dayNumber] || [];
                      
                      return (
                        <div 
                          key={dayNumber}
                          className={`rounded-xl p-4 border ${getDayStatusClass(dayNumber)} transition-all hover:shadow-md`}
                        >
                          <div 
                            className="cursor-pointer"
                            onClick={() => toggleDayExpansion(dayNumber)}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-bold text-lg">{getDayTitle(dayNumber)}</h5>
                                <p className="text-sm mt-1">{getDayStatusText(dayNumber)}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getDayStatusIcon(dayNumber)}
                                {dayTasks.length > 0 && (
                                  isExpanded ? 
                                  <ChevronDown className="w-5 h-5" /> : 
                                  <ChevronRight className="w-5 h-5" />
                                )}
                              </div>
                            </div>
                            
                            <div className="mb-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Tasks</span>
                                <div className="flex space-x-2">
                                  <span>{progress.completed}/{progress.total}</span>
                                  <span className="font-medium text-amber-600">({dayPoints} pts)</span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    dayProgressPercentage === 100 ? 'bg-green-500' : 
                                    dayProgressPercentage > 0 ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}
                                  style={{ width: `${dayProgressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-500 mt-2 flex justify-between">
                              <span>
                                {progress.total > 0 ? (
                                  `${dayProgressPercentage}% complete`
                                ) : (
                                  'No tasks available'
                                )}
                              </span>
                            </div>
                          </div>
                          
                          {/* Expanded task details */}
                          {isExpanded && dayTasks.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <h6 className="text-xs font-semibold text-gray-700 mb-2">Tasks:</h6>
                              <div className="space-y-2">
                                {dayTasks.map(task => {
                                  const isCompleted = completedTaskIds.includes(task.id);
                                  const taskPoints = isCompleted ? (participant.points?.[task.id] || task.points || 0) : 0;
                                  
                                  return (
                                    <div 
                                      key={task.id} 
                                      className={`flex items-center justify-between p-2 rounded-lg ${
                                        isCompleted ? 'bg-green-50' : 'bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-center">
                                        {isCompleted ? (
                                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-gray-300 mr-2" />
                                        )}
                                        <span className="text-sm">{task.title}</span>
                                      </div>
                                      <span className={`text-xs font-medium ${
                                        isCompleted ? 'text-amber-600' : 'text-gray-400'
                                      }`}>
                                        {taskPoints} pts
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantProgressModal;