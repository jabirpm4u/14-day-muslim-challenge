import React, { useState } from 'react';
import { Task, reorderTasks, updateTaskPoints } from '../../firebase/firestore';
import {
  X,
  Save,
  RotateCcw,
  Star,
  ArrowUp,
  ArrowDown,
  AlertTriangle
} from 'lucide-react';

interface BulkTaskManagerProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const BulkTaskManager: React.FC<BulkTaskManagerProps> = ({
  tasks,
  isOpen,
  onClose,
  onSave
}) => {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'reorder' | 'points'>('reorder');
  const [bulkPoints, setBulkPoints] = useState(20);

  React.useEffect(() => {
    if (isOpen) {
      setTaskList([...tasks].sort((a, b) => a.dayNumber - b.dayNumber));
    }
  }, [isOpen, tasks]);

  const moveTask = (index: number, direction: 'up' | 'down') => {
    const newList = [...taskList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
    setTaskList(newList);
  };

  const resetOrder = () => {
    setTaskList([...tasks].sort((a, b) => a.dayNumber - b.dayNumber));
  };

  const handleSaveReorder = async () => {
    try {
      setSaving(true);
      const updates = taskList.map((task, index) => ({
        id: task.id,
        dayNumber: index === 0 ? 0 : index // Keep first as trial day (0), others as 1, 2, 3...
      }));
      
      await reorderTasks(updates);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error reordering tasks:', error);
      alert('Error reordering tasks. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePoints = async () => {
    try {
      setSaving(true);
      const promises = taskList.map(task => 
        updateTaskPoints(task.id, task.points)
      );
      
      await Promise.all(promises);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating points:', error);
      alert('Error updating points. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateTaskPointsLocal = (taskId: string, points: number) => {
    setTaskList(prev => prev.map(task => 
      task.id === taskId ? { ...task, points } : task
    ));
  };

  const applyBulkPoints = () => {
    setTaskList(prev => prev.map(task => ({ ...task, points: bulkPoints })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-islamic-dark">
            Bulk Task Management
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setMode('reorder')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'reorder'
                  ? 'bg-islamic-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reorder Tasks
            </button>
            <button
              onClick={() => setMode('points')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'points'
                  ? 'bg-islamic-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Manage Points
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'reorder' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Drag to Reorder Tasks
                </h3>
                <button
                  onClick={resetOrder}
                  className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-yellow-700 text-sm">
                    <p>Reordering will update day numbers (0 for trial, 1-14 for challenge days).</p>
                    <p>The first task will always be Day 0 (Trial Day).</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {taskList.map((task, index) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-purple-500' : 'bg-islamic-primary'
                      }`}>
                        {index === 0 ? 'T' : index}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600 truncate max-w-md">{task.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveTask(index, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveTask(index, 'down')}
                        disabled={index === taskList.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'points' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage Task Points
                </h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={bulkPoints}
                    onChange={(e) => setBulkPoints(parseInt(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={applyBulkPoints}
                    className="px-3 py-1 bg-islamic-light text-islamic-primary rounded text-sm hover:bg-islamic-primary hover:text-white transition-colors"
                  >
                    Apply to All
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {taskList.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        task.dayNumber === 0 ? 'bg-purple-500' : 'bg-islamic-primary'
                      }`}>
                        {task.dayNumber === 0 ? 'T' : task.dayNumber}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.category} • {task.difficulty}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={task.points}
                          onChange={(e) => updateTaskPointsLocal(task.id, parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                        />
                        <span className="text-sm text-gray-500">pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={mode === 'reorder' ? handleSaveReorder : handleSavePoints}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-islamic-primary text-white hover:bg-islamic-secondary rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkTaskManager;