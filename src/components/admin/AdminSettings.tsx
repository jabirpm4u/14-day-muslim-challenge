import React, { useState, useEffect } from "react";
import {
  getAllTasks,
  forceReloadTasks,
  Task,
} from "../../firebase/firestore";
import TaskEditor from "./TaskEditor";
import BulkTaskManager from "./BulkTaskManager";
import BulkImportModal from "./BulkImportModal";

import {
  Plus,
  Edit3,
  Target,
  AlertTriangle,
  Search,
  Filter,
  SortAsc,
  Eye,
  Settings2,
  Upload,
  Clock,
} from "lucide-react";

const AdminSettings: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Task management states
  const [taskEditorOpen, setTaskEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"dayNumber" | "title" | "points">(
    "dayNumber"
  );
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [bulkManagerOpen, setBulkManagerOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log("Loading task data...");
      setLoading(true);

      const challengeTasks = await getAllTasks();
      console.log(`Loaded ${challengeTasks.length} tasks from database`);

      setTasks(challengeTasks);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Challenge management functions moved to ChallengeManagement component

  // Task management functions
  const handleCreateTask = () => {
    setSelectedTask(null);
    setEditorMode("create");
    setTaskEditorOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditorMode("edit");
    setTaskEditorOpen(true);
  };

  const handleTaskSaved = async () => {
    console.log("Task operation completed, refreshing task list...");

    // Use force reload to bypass any caching issues
    try {
      setLoading(true);
      const freshTasks = await forceReloadTasks();
      setTasks(freshTasks);
      console.log(`Refreshed task list: ${freshTasks.length} tasks loaded`);
    } catch (error) {
      console.error("Error force refreshing tasks:", error);
      // Fallback to regular reload
      await loadData();
    } finally {
      setLoading(false);
    }

    console.log("Task list refreshed");
  };

  const handleCloseEditor = () => {
    setTaskEditorOpen(false);
    setSelectedTask(null);
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || task.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dayNumber":
          return a.dayNumber - b.dayNumber;
        case "title":
          return a.title.localeCompare(b.title);
        case "points":
          return b.points - a.points;
        default:
          return 0;
      }
    });

  const getCategoryIcon = (category: string) => {
    const icons = {
      trial: "✨",
      worship: "🕌",
      social: "👥",
      knowledge: "📚",
      identity: "❤️",
      final: "👑",
    };
    return icons[category as keyof typeof icons] || "🎯";
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "text-purple-600 bg-purple-100",
      medium: "text-yellow-600 bg-yellow-100",
      hard: "text-red-600 bg-red-100",
    };
    return (
      colors[difficulty as keyof typeof colors] || "text-gray-600 bg-gray-100"
    );
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

  // AdminSettings now only handles Task Management
  // Challenge creation/management is handled by ChallengeManagement component

  return (
    <div className="space-y-6">

      {/* Enhanced Task Management */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-islamic-primary" />
            <h3 className="text-xl font-bold text-islamic-dark">
              Task Management
            </h3>
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
              onChange={(e) =>
                setSortBy(e.target.value as "dayNumber" | "title" | "points")
              }
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
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No tasks found
              </h4>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first task"}
              </p>
              {!searchTerm && filterCategory === "all" && (
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
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        task.dayNumber === 0
                          ? "bg-purple-500"
                          : "bg-islamic-primary"
                      }`}
                    >
                      {task.dayNumber === 0 ? "T" : task.dayNumber}
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
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                            task.difficulty
                          )}`}
                        >
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
                      onClick={() =>
                        setShowPreview(showPreview === task.id ? null : task.id)
                      }
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
                {showPreview === task.id &&
                  task.tips &&
                  task.tips.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-2">Tips:</h5>
                      <ul className="space-y-1">
                        {task.tips.map((tip, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 flex items-start space-x-2"
                          >
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
            <h4 className="font-medium text-yellow-800 mb-1">
              Important Notes
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • Starting the challenge will activate the trial day (Day 0)
              </li>
              <li>
                • Advancing days will deactivate previous day tasks and activate
                next day
              </li>
              <li>
                • Stopping the challenge will reset all progress and deactivate
                all tasks
              </li>
              <li>• Changes to day duration only affect future days</li>
              <li>
                • Task editing is available - click the edit button on any task
              </li>
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
