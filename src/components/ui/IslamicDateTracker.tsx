import React, { useState, useEffect } from 'react';
import { Moon, Sun, Calendar, Clock } from 'lucide-react';

interface IslamicDateTrackerProps {
  className?: string;
}

interface DateInfo {
  hijriDate: string;
  englishDate: string;
  nextMagrib: Date | null;
  isNewDay: boolean;
}

const IslamicDateTracker: React.FC<IslamicDateTrackerProps> = ({ className = '' }) => {
  const [dateInfo, setDateInfo] = useState<DateInfo>({
    hijriDate: '',
    englishDate: '',
    nextMagrib: null,
    isNewDay: false
  });
  const [timeToMagrib, setTimeToMagrib] = useState<string>('');

  // Function to get Hijri date (simplified approximation)
  const getHijriDate = (gregorianDate: Date): string => {
    // This is a simplified calculation. In a real app, use a proper Islamic calendar library
    const hijriEpoch = new Date(622, 6, 16); // July 16, 622 CE (approximate start of Hijri calendar)
    const daysDiff = Math.floor((gregorianDate.getTime() - hijriEpoch.getTime()) / (1000 * 60 * 60 * 24));
    const hijriYear = Math.floor(daysDiff / 354.37) + 1; // Approximate lunar year length
    const dayInYear = daysDiff % 354;
    const hijriMonth = Math.floor(dayInYear / 29.53) + 1; // Approximate lunar month length
    const hijriDay = Math.floor(dayInYear % 29.53) + 1;

    const monthNames = [
      'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
      'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
      'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];

    const monthName = monthNames[Math.min(hijriMonth - 1, 11)] || monthNames[0];
    return `${hijriDay} ${monthName} ${hijriYear} AH`;
  };

  // Function to estimate Maghrib time (simplified)
  const getMagribTime = (date: Date): Date => {
    // This is a very simplified estimation. In a real app, use proper prayer time calculation
    // For now, we'll assume Maghrib is around sunset time (varies by location and season)
    const maghrib = new Date(date);
    maghrib.setHours(18, 0, 0, 0); // Simplified: 6 PM as default
    
    // If it's already past Maghrib today, get tomorrow's Maghrib
    if (date.getTime() > maghrib.getTime()) {
      maghrib.setDate(maghrib.getDate() + 1);
    }
    
    return maghrib;
  };

  // Function to calculate time remaining to Maghrib
  const calculateTimeToMagrib = (maghribTime: Date): string => {
    const now = new Date();
    const timeDiff = maghribTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return 'Next Maghrib';
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Function to check if it's a new Islamic day
  const checkNewIslamicDay = (lastMaghrib: Date): boolean => {
    const now = new Date();
    return now.getTime() > lastMaghrib.getTime();
  };

  useEffect(() => {
    const updateDateInfo = () => {
      const now = new Date();
      const hijriDate = getHijriDate(now);
      const englishDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const nextMagrib = getMagribTime(now);
      const isNewDay = checkNewIslamicDay(nextMagrib);
      
      setDateInfo({
        hijriDate,
        englishDate,
        nextMagrib,
        isNewDay
      });
      
      setTimeToMagrib(calculateTimeToMagrib(nextMagrib));
    };

    updateDateInfo();
    const interval = setInterval(updateDateInfo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-gradient-to-r from-islamic-primary to-islamic-secondary text-white rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Moon className="w-5 h-5 text-islamic-gold" />
          <h3 className="font-semibold text-lg">Islamic Day Tracker</h3>
        </div>
        <div className="text-islamic-gold text-sm font-medium">
          Maghrib to Maghrib
        </div>
      </div>

      <div className="space-y-3">
        {/* Hijri Date */}
        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="w-4 h-4 text-islamic-gold" />
            <span className="text-sm font-medium text-islamic-gold">Hijri Date (Maghrib to Maghrib)</span>
          </div>
          <div className="text-white font-semibold text-lg font-arabic">
            {dateInfo.hijriDate}
          </div>
          <div className="text-xs text-islamic-light mt-1">
            Islamic day begins at Maghrib prayer
          </div>
        </div>

        {/* English Date */}
        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Sun className="w-4 h-4 text-islamic-gold" />
            <span className="text-sm font-medium text-islamic-gold">Gregorian Date (Maghrib to Maghrib)</span>
          </div>
          <div className="text-white font-semibold">
            {dateInfo.englishDate}
          </div>
          <div className="text-xs text-islamic-light mt-1">
            Tasks tracked from sunset to sunset
          </div>
        </div>

        {/* Next Maghrib Countdown */}
        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-islamic-gold" />
              <span className="text-sm font-medium text-islamic-gold">Next Maghrib</span>
            </div>
            <div className="text-white font-bold">
              {timeToMagrib}
            </div>
          </div>
          {dateInfo.nextMagrib && (
            <div className="text-xs text-islamic-light mt-1">
              {dateInfo.nextMagrib.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </div>
          )}
        </div>

        {/* New Islamic Day Indicator */}
        {dateInfo.isNewDay && (
          <div className="bg-islamic-gold bg-opacity-20 border border-islamic-gold rounded-lg p-2 text-center">
            <div className="text-islamic-gold text-sm font-semibold">
              🌙 New Islamic Day Has Begun!
            </div>
            <div className="text-xs text-islamic-light mt-1">
              Tasks are tracked from Maghrib to Maghrib
            </div>
          </div>
        )}
      </div>

      {/* Islamic Day Explanation */}
      <div className="mt-4 text-xs text-islamic-light text-center">
        <p>Islamic days begin and end at Maghrib prayer time</p>
        <p className="font-arabic mt-1">من المغرب إلى المغرب</p>
      </div>
    </div>
  );
};

export default IslamicDateTracker;