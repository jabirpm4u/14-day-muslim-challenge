import React, { useState, useEffect } from 'react';
import { 
  getChallengeSettings, 
  stopChallenge,
  pauseChallenge,
  resumeChallenge,
  advanceToNextDay,
  goToPreviousDay,
  ChallengeSettings
} from '../../firebase/firestore';
import ChallengeCreator from './ChallengeCreator';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Target,
  Square
} from 'lucide-react';

const ChallengeManagement: React.FC = () => {
  const [settings, setSettings] = useState<ChallengeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading challenge management data...');
      setLoading(true);
      
      const challengeSettings = await getChallengeSettings();
      setSettings(challengeSettings);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStopChallenge = async () => {
    console.log('🛑 ADMIN: Stop challenge button clicked!');
    
    // Double confirmation for stopping challenge
    const firstConfirm = confirm(
      '⚠️ FIRST CONFIRMATION\n\nAre you sure you want to STOP the challenge?\n\nThis will:\n- Permanently deactivate ALL tasks\n- End the current challenge\n- Cannot be undone\n\nClick OK to proceed to second confirmation.'
    );
    
    if (!firstConfirm) {
      console.log('🛑 ADMIN: First confirmation cancelled');
      return;
    }
    
    const secondConfirm = confirm(
      '🛑 FINAL CONFIRMATION\n\nThis is your FINAL warning!\n\nStopping the challenge will:\n- End the challenge for ALL participants\n- Deactivate all tasks immediately\n- Require starting a new challenge to continue\n\nType "STOP CHALLENGE" in your mind and click OK to confirm, or Cancel to abort.'
    );
    
    if (!secondConfirm) {
      console.log('🛑 ADMIN: Second confirmation cancelled');
      return;
    }
    
    try {
      console.log('🛑 ADMIN: Starting to stop challenge...');
      setSaving(true);
      
      console.log('🛑 ADMIN: Calling stopChallenge function...');
      await stopChallenge();
      
      console.log('🛑 ADMIN: Challenge stopped, reloading data...');
      await loadData();
      
      console.log('🛑 ADMIN: Challenge stopped successfully!');
      alert('✅ Challenge stopped successfully!');
    } catch (error) {
      console.error('❌ ADMIN ERROR: Error stopping challenge:', error);
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
    if (!confirm('Are you sure you want to resume the challenge? This will reactivate tasks for the current day and continue from where it was paused.')) {
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
      await advanceToNextDay(settings.currentDay);
      await loadData();
      
      alert(`✅ Successfully advanced to Day ${(settings?.currentDay || 0) + 1}!`);
    } catch (error) {
      console.error('Error advancing day:', error);
      alert('❌ Error advancing day. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGoToPreviousDay = async () => {
    if (!settings || !confirm('ℹ️ Are you sure you want to go back to the previous day?\n\nThis will:\n- Move to the previous challenge day\n- Activate tasks for the previous day\n- Deactivate current day tasks')) {
      return;
    }
    
    try {
      setSaving(true);
      await goToPreviousDay(settings.currentDay);
      await loadData();
      
      alert(`✅ Successfully went back to Day ${(settings?.currentDay || 0) - 1}!`);
    } catch (error) {
      console.error('Error going back to previous day:', error);
      alert('❌ Error going back to previous day. Please try again.');
    } finally {
      setSaving(false);
    }
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

  // Show Challenge Creator if no challenge exists or challenge is not active
  if (!settings?.isActive) {
    return (
      <div className="space-y-6">
        <ChallengeCreator 
          challengeSettings={settings}
          onChallengeCreated={loadData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge Control Panel for Active Challenge */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-islamic-light">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-islamic-primary" />
          <h3 className="text-xl font-bold text-islamic-dark">
            Challenge Management
          </h3>
        </div>

        {/* Challenge Control Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Pause/Resume Button */}
          {!settings?.isPaused ? (
            <button
              onClick={handlePauseChallenge}
              disabled={saving}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg 
                       flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>{saving ? "Pausing..." : "Pause Challenge"}</span>
            </button>
          ) : (
            <button
              onClick={handleResumeChallenge}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg 
                       flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>{saving ? "Resuming..." : "Resume Challenge"}</span>
            </button>
          )}

          {/* Go to Previous Day - Only show when not paused and not on day 0 */}
          {!settings?.isPaused && settings?.currentDay > 0 && (
            <button
              onClick={handleGoToPreviousDay}
              disabled={saving || !settings?.isActive || settings?.isPaused || settings?.currentDay <= 0}
              className="bg-islamic-primary hover:bg-islamic-secondary text-white py-3 px-4 rounded-lg 
                       flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
              <span>
                {saving
                  ? "Going back..."
                  : `Go to Day ${(settings?.currentDay || 0) - 1}`}
              </span>
            </button>
          )}

          {/* Advance Day - Only show when not paused */}
          {!settings?.isPaused && (
            <button
              onClick={handleAdvanceDay}
              disabled={saving || !settings?.isActive || settings?.isPaused}
              className="bg-islamic-primary hover:bg-islamic-secondary text-white py-3 px-4 rounded-lg 
                       flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              <span>
                {saving
                  ? "Advancing..."
                  : `Advance to Day ${(settings?.currentDay || 0) + 1}`}
              </span>
            </button>
          )}

          {/* Stop Button */}
          <button
            onClick={() => {
              console.log("🛑 BUTTON: Stop button clicked directly!");
              handleStopChallenge();
            }}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg 
                     flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
          >
            <Square className="w-4 h-4" />
            <span>{saving ? "Stopping..." : "Stop Challenge"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeManagement;