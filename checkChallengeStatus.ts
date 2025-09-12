import { getChallengeSettings } from './src/firebase/firestore';

async function checkChallengeStatus() {
  try {
    const settings = await getChallengeSettings();
    console.log('Current Challenge Settings:');
    console.log(JSON.stringify(settings, null, 2));
    
    if (settings) {
      console.log('\nKey Properties:');
      console.log('- isActive:', settings.isActive);
      console.log('- isPaused:', settings.isPaused);
      console.log('- currentDay:', settings.currentDay);
      console.log('- trialEnabled:', settings.trialEnabled);
      console.log('- challengeDays length:', settings.challengeDays?.length || 0);
    } else {
      console.log('No challenge settings found');
    }
  } catch (error) {
    console.error('Error checking challenge status:', error);
  }
}

checkChallengeStatus();