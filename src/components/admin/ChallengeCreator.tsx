import React, { useState, useEffect } from 'react';
import { 
  updateChallengeSettings,
  setScheduledDates,
  ChallengeSettings
} from '../../firebase/firestore';
import { 
  Calendar, 
  Play, 
  Save, 
  Clock,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ChallengeCreatorProps {
  challengeSettings: ChallengeSettings | null;
  onChallengeCreated: () => void;
}

const ChallengeCreator: React.FC<ChallengeCreatorProps> = ({ 
  challengeSettings, 
  onChallengeCreated 
}) => {
  const [saving, setSaving] = useState(false);
  const [totalDays, setTotalDays] = useState(14);
  const [trialEnabled, setTrialEnabled] = useState(true);
  const [scheduledStartDate, setScheduledStartDate] = useState('');
  const [step, setStep] = useState<'config' | 'schedule'>('config');

  useEffect(() => {
    if (challengeSettings) {
      setTotalDays(challengeSettings.challengeDays?.length || 14);
      setTrialEnabled(challengeSettings.trialEnabled || true);
      
      if (challengeSettings.scheduledStartDate) {
        const startDate = challengeSettings.scheduledStartDate.toDate();
        setScheduledStartDate(startDate.toISOString().slice(0, 16));
      }
    }
  }, [challengeSettings]);

  const handleSaveConfiguration = async () => {
    try {
      setSaving(true);
      
      await updateChallengeSettings({
        trialEnabled,
        challengeDays: [] // Will be generated based on totalDays and schedule
      });
      
      setStep('schedule');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetSchedule = async () => {
    if (!scheduledStartDate) {
      alert('Please select a start date and time');
      return;
    }
    
    const startDate = new Date(scheduledStartDate);
    
    if (startDate <= new Date()) {
      alert('Start date must be in the future');
      return;
    }
    
    // Show confirmation popup with challenge details
    const actualTotalDays = trialEnabled ? totalDays + 1 : totalDays;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + actualTotalDays);
    
    const confirmMessage = `Create Challenge with the following settings?

📅 Start Date: ${startDate.toLocaleDateString()}
⏰ Start Time: ${startDate.toLocaleTimeString()}
📊 Total Days: ${totalDays} challenge days
${trialEnabled ? '🔄 Trial Day: Enabled (Day 0)' : '❌ Trial Day: Disabled'}
⏱️ Total Duration: ${actualTotalDays} days
📅 End Date: ${endDate.toLocaleDateString()}

The challenge will be created and activated immediately.`;

    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Update challenge settings with proper configuration
      await updateChallengeSettings({
        isActive: true,
        isPaused: false,
        scheduledStartDate: startDate,
        startDate: startDate,
        endDate: endDate,
        currentDay: trialEnabled ? 0 : 1, // Start with trial day (day 0) if enabled, otherwise start from day 1
        trialEnabled: trialEnabled
      });
      
      // Generate and set the challenge days with the exact count
      await setScheduledDates(startDate, endDate, actualTotalDays);
      
      onChallengeCreated();
      
      alert('Challenge created successfully! It will start at the scheduled time.');
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Error creating challenge. Please try again.');
    } finally {
      setSaving(false);
    }
  };



  if (challengeSettings?.isActive) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenge Active</h3>
          <p className="text-gray-600">Your challenge is currently running</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-islamic-dark">Create New Challenge</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 'config' ? 'bg-islamic-primary text-white' : 'bg-green-500 text-white'
            }`}>
              1
            </div>
            <div className={`w-8 h-1 ${step === 'schedule' ? 'bg-green-500' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 'schedule' ? 'bg-islamic-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {step === 'config' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-6 h-6 text-islamic-primary" />
              <h4 className="text-lg font-semibold text-islamic-dark">Challenge Configuration</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Number of Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={totalDays}
                    onChange={(e) => setTotalDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 14 days for optimal engagement
                  </p>
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
                    Include Trial Day (Day 0)
                  </label>
                </div>
                {trialEnabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      Trial day allows participants to familiarize themselves with the challenge before it officially begins. 
                      It doesn't count toward the total challenge days.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Challenge Summary</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Days:</span>
                    <span className="font-medium">{totalDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trial Day:</span>
                    <span className="font-medium">{trialEnabled ? 'Yes (Day 0)' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Challenge:</span>
                    <span className="font-medium">
                      Day {trialEnabled ? '1' : '1'} - Day {totalDays}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-gray-600">Total Duration:</span>
                    <span className="font-medium">
                      {trialEnabled ? totalDays + 1 : totalDays} days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveConfiguration}
              disabled={saving}
              className="w-full bg-islamic-primary hover:bg-islamic-secondary text-white py-3 px-4 rounded-lg 
                       flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Configuration...' : 'Save & Continue'}</span>
            </button>
          </div>
        )}

        {step === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-islamic-primary" />
              <h4 className="text-lg font-semibold text-islamic-dark">Schedule Challenge</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledStartDate}
                    onChange={(e) => setScheduledStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Challenge will automatically start at this time
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-yellow-700 font-medium">Important Notes:</p>
                      <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                        <li>• Challenge goes live immediately after creation</li>
                        <li>• Tracking begins on the scheduled start date</li>
                        <li>• Dates are calculated automatically</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Schedule Preview</h5>
                {scheduledStartDate && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">
                        {new Date(scheduledStartDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium">
                        {new Date(scheduledStartDate).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">
                        {(() => {
                          const endDate = new Date(scheduledStartDate);
                          // Always show complete days - if trial enabled, add 1 extra day
                          const actualDuration = trialEnabled ? totalDays + 1 : totalDays;
                          endDate.setDate(endDate.getDate() + actualDuration);
                          return endDate.toLocaleDateString();
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {trialEnabled ? totalDays + 1 : totalDays} days
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('config')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg 
                         transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSetSchedule}
                disabled={saving || !scheduledStartDate}
                className="flex-1 bg-islamic-primary hover:bg-islamic-secondary text-white py-3 px-4 rounded-lg 
                         flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>{saving ? 'Creating Challenge...' : 'Create Challenge'}</span>
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default ChallengeCreator;