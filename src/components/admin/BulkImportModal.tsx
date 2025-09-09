import React, { useState, useRef } from 'react';
import { bulkImportTasks, clearAllTasks } from '../../firebase/firestore';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  Trash2,
  Download
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [importMode, setImportMode] = useState<'strict' | 'skip' | 'replace'>('strict');
  const [results, setResults] = useState<{ success: number; failed: number; skipped?: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setJsonData(data);
        } catch (error) {
          alert('Invalid JSON file. Please check the format.');
          setSelectedFile(null);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid JSON file.');
    }
  };

  const handleImport = async () => {
    if (!jsonData || !jsonData.tasks) {
      alert('No valid task data found in the JSON file.');
      return;
    }

    try {
      setImporting(true);
      const options = {
        skipExisting: importMode === 'skip',
        replaceExisting: importMode === 'replace'
      };
      
      const importResults = await bulkImportTasks(jsonData, options);
      setResults(importResults);
      
      if (importResults.success > 0) {
        onSuccess(); // Refresh the tasks list in parent component
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
    }
  };

  const handleClearTasks = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL tasks in the database. This cannot be undone. Are you sure?')) {
      return;
    }

    if (!confirm('This is your final confirmation. ALL TASKS WILL BE DELETED. Continue?')) {
      return;
    }

    try {
      setClearing(true);
      console.log('User confirmed task deletion, starting clearAllTasks...');
      
      const deletedCount = await clearAllTasks();
      
      console.log(`Clear operation completed. Deleted ${deletedCount} tasks.`);
      
      // Show success message
      alert(`✅ Successfully deleted ${deletedCount} tasks from the database.`);
      
      // Force refresh the tasks list in parent component
      console.log('Calling onSuccess to refresh parent component...');
      onSuccess();
      
      // Also clear any local state that might be cached
      setResults(null);
      setJsonData(null);
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Clear error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`❌ Failed to clear tasks: ${errorMessage}\n\nPlease check the browser console for more details.`);
    } finally {
      setClearing(false);
    }
  };

  const downloadSampleJson = () => {
    const sampleData = {
      "tasks": [
        {
          "dayNumber": 0,
          "title": "Sample Trial Task",
          "description": "This is a sample task for the trial day. Participants use this to get familiar with the challenge format.",
          "points": 15,
          "category": "trial",
          "difficulty": "easy",
          "estimatedTime": "10 minutes",
          "tips": [
            "This is a sample tip",
            "Add helpful guidance here",
            "Keep tips concise and actionable"
          ],
          "isActive": true
        }
      ],
      "importMetadata": {
        "version": "1.0",
        "createdDate": new Date().toISOString().split('T')[0],
        "description": "Sample task import file",
        "totalTasks": 1
      }
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-tasks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-islamic-dark flex items-center space-x-2">
            <Upload className="w-5 h-5 text-islamic-primary" />
            <span>Bulk Import Tasks</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>1. Select a JSON file with task data in the correct format</li>
              <li>2. Choose how to handle existing tasks (below)</li>
              <li>3. Review the tasks that will be imported</li>
              <li>4. Click "Import Tasks" to add them to the database</li>
            </ul>
          </div>

          {/* Import Mode Selection */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-3">Handle Existing Tasks:</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="importMode"
                  value="strict"
                  checked={importMode === 'strict'}
                  onChange={(e) => setImportMode(e.target.value as 'strict' | 'skip' | 'replace')}
                  className="w-4 h-4 text-islamic-primary focus:ring-islamic-primary"
                />
                <div>
                  <span className="font-medium text-yellow-800">Strict Mode</span>
                  <p className="text-sm text-yellow-700">Fail if any day number already exists (safest)</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="importMode"
                  value="skip"
                  checked={importMode === 'skip'}
                  onChange={(e) => setImportMode(e.target.value as 'strict' | 'skip' | 'replace')}
                  className="w-4 h-4 text-islamic-primary focus:ring-islamic-primary"
                />
                <div>
                  <span className="font-medium text-yellow-800">Skip Existing</span>
                  <p className="text-sm text-yellow-700">Skip tasks for days that already exist</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={(e) => setImportMode(e.target.value as 'strict' | 'skip' | 'replace')}
                  className="w-4 h-4 text-islamic-primary focus:ring-islamic-primary"
                />
                <div>
                  <span className="font-medium text-yellow-800">Replace Existing</span>
                  <p className="text-sm text-yellow-700">Replace existing tasks with new ones (⚠️ destructive)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Download Sample */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Need a sample format?</span>
            <button
              onClick={downloadSampleJson}
              className="flex items-center space-x-2 px-3 py-2 text-islamic-primary hover:bg-islamic-light rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Sample JSON</span>
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select JSON File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-islamic-primary transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">
                {selectedFile ? selectedFile.name : 'Click to select or drag & drop a JSON file'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-islamic-light text-islamic-primary rounded-lg hover:bg-islamic-primary hover:text-white transition-colors"
              >
                Choose File
              </button>
            </div>
          </div>

          {/* Preview */}
          {jsonData && jsonData.tasks && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Preview: {jsonData.tasks.length} Tasks Found</h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {jsonData.tasks.slice(0, 5).map((task: any, index: number) => (
                  <div key={index} className="bg-white p-3 rounded border text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-islamic-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {task.dayNumber}
                      </span>
                      <span className="font-medium">{task.title}</span>
                      <span className="text-gray-500">({task.points} pts)</span>
                    </div>
                  </div>
                ))}
                {jsonData.tasks.length > 5 && (
                  <div className="text-center text-gray-500 text-sm">
                    ... and {jsonData.tasks.length - 5} more tasks
                  </div>
                )}
              </div>
              
              {jsonData.importMetadata && (
                <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                  <p><strong>Version:</strong> {jsonData.importMetadata.version}</p>
                  <p><strong>Description:</strong> {jsonData.importMetadata.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                {results.failed === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                <span>Import Results</span>
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Successful imports:</span>
                  <span className="text-blue-600 font-semibold">{results.success}</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed imports:</span>
                  <span className="text-red-600 font-semibold">{results.failed}</span>
                </div>
                {results.skipped !== undefined && results.skipped > 0 && (
                  <div className="flex justify-between">
                    <span>Skipped (already exist):</span>
                    <span className="text-yellow-600 font-semibold">{results.skipped}</span>
                  </div>
                )}
                
                {results.errors.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {results.errors.map((error, index) => (
                        <div key={index} className="text-red-700 text-xs bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Danger Zone</span>
            </h3>
            <p className="text-red-800 text-sm mb-3">
              This will permanently delete ALL tasks from the database. This action cannot be undone.
            </p>
            <button
              onClick={handleClearTasks}
              disabled={clearing}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{clearing ? 'Clearing...' : 'Clear All Tasks'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={importing || clearing}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!jsonData || importing || clearing}
            className="flex items-center space-x-2 px-4 py-2 bg-islamic-primary text-white hover:bg-islamic-secondary rounded-lg transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{importing ? 'Importing...' : 'Import Tasks'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;