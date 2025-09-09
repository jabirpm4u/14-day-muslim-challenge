import React, { useState, useEffect } from 'react';
import { Task, createOrUpdateTask, deleteTask } from '../../firebase/firestore';
import {
  X,
  Save,
  Trash2,
  Plus,
  Minus,
  AlertTriangle,
  Info,
  Clock,
  Star,
  Target
} from 'lucide-react';

interface TaskEditorProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'create' | 'edit';
}

const TaskEditor: React.FC<TaskEditorProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  mode
}) => {
  // Form state
  const [formData, setFormData] = useState({
    dayNumber: 0,
    title: '',
    description: '',
    points: 20,
    category: 'social' as Task['category'],
    difficulty: 'medium' as Task['difficulty'],
    estimatedTime: '15 minutes',
    tips: ['']
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when task changes
  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        dayNumber: task.dayNumber,
        title: task.title,
        description: task.description,
        points: task.points,
        category: task.category,
        difficulty: task.difficulty,
        estimatedTime: task.estimatedTime,
        tips: task.tips && task.tips.length > 0 ? task.tips : ['']
      });
    } else {
      // Reset form for create mode
      setFormData({
        dayNumber: 0,
        title: '',
        description: '',
        points: 20,
        category: 'social',
        difficulty: 'medium',
        estimatedTime: '15 minutes',
        tips: ['']
      });
    }
    setErrors({});
  }, [task, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.points < 0 || formData.points > 100) {
      newErrors.points = 'Points must be between 0 and 100';
    }

    if (formData.dayNumber < 0 || formData.dayNumber > 14) {
      newErrors.dayNumber = 'Day number must be between 0 and 14';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const taskData: Omit<Task, 'id'> & { id?: string } = {
        ...formData,
        tips: formData.tips.filter(tip => tip.trim() !== ''),
        isActive: task?.isActive || false
      };

      if (mode === 'edit' && task?.id) {
        taskData.id = task.id;
      }

      await createOrUpdateTask(taskData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setErrors({ general: 'Failed to save task. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task?.id || !confirm('Are you sure you want to delete this task? This cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteTask(task.id);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
      setErrors({ general: 'Failed to delete task. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTip = () => {
    setFormData(prev => ({ ...prev, tips: [...prev.tips, ''] }));
  };

  const removeTip = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tips: prev.tips.filter((_, i) => i !== index)
    }));
  };

  const updateTip = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tips: prev.tips.map((tip, i) => i === index ? value : tip)
    }));
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-islamic-dark flex items-center space-x-2">
            <Target className="w-5 h-5 text-islamic-primary" />
            <span>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Error Display */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <span className="text-red-700">{errors.general}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day Number *
              </label>
              <input
                type="number"
                min="0"
                max="14"
                value={formData.dayNumber}
                onChange={(e) => handleInputChange('dayNumber', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent ${
                  errors.dayNumber ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.dayNumber && <p className="text-red-600 text-sm mt-1">{errors.dayNumber}</p>}
              <p className="text-gray-500 text-xs mt-1">0 = Trial Day, 1-14 = Challenge Days</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.points}
                onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent ${
                  errors.points ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.points && <p className="text-red-600 text-sm mt-1">{errors.points}</p>}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a clear, concise task title"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide detailed instructions and context for the task"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Category, Difficulty, Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as Task['category'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent"
              >
                <option value="trial">✨ Trial</option>
                <option value="worship">🕌 Worship</option>
                <option value="social">👥 Social</option>
                <option value="knowledge">📚 Knowledge</option>
                <option value="identity">❤️ Identity</option>
                <option value="final">👑 Final</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value as Task['difficulty'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Time
              </label>
              <input
                type="text"
                value={formData.estimatedTime}
                onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                placeholder="e.g., 15 minutes, 1 hour"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Tips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Helpful Tips (Optional)
              </label>
              <button
                type="button"
                onClick={addTip}
                className="flex items-center space-x-1 text-islamic-primary hover:text-islamic-secondary text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tip</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.tips.map((tip, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => updateTip(index, e.target.value)}
                    placeholder="Enter a helpful tip"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent"
                  />
                  {formData.tips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTip(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-islamic-light rounded-lg p-4">
            <h4 className="font-medium text-islamic-dark mb-3 flex items-center space-x-2">
              <Info className="w-4 h-4" />
              <span>Preview</span>
            </h4>
            <div className="bg-white rounded-lg p-4 border border-islamic-primary/20">
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 bg-islamic-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {formData.dayNumber}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{formData.title || 'Task Title'}</h5>
                  <p className="text-gray-600 text-sm mt-1">{formData.description || 'Task description will appear here'}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {getCategoryIcon(formData.category)} {formData.category}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(formData.difficulty)}`}>
                  {formData.difficulty}
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                  <Clock className="w-3 h-3" />
                  <span>{formData.estimatedTime}</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                  <Star className="w-3 h-3" />
                  <span>{formData.points} pts</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            {mode === 'edit' && (
              <button
                onClick={handleDelete}
                disabled={deleting || saving}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={saving || deleting}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || deleting}
              className="flex items-center space-x-2 px-4 py-2 bg-islamic-primary text-white hover:bg-islamic-secondary rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Task'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskEditor;