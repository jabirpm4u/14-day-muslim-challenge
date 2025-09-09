import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date | null;
  onTimeUp?: () => void;
  title?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  targetDate, 
  onTimeUp, 
  title = "Time Remaining",
  className = "" 
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!isExpired) {
          setIsExpired(true);
          onTimeUp?.();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsExpired(false);
    };

    calculateTimeLeft(); // Calculate immediately
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isExpired, onTimeUp]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const isActive = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 border border-islamic-light ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Clock className={`w-5 h-5 ${isExpired ? 'text-red-500' : 'text-islamic-primary'}`} />
          <h3 className={`font-semibold ${isExpired ? 'text-red-600' : 'text-islamic-dark'}`}>
            {title}
          </h3>
        </div>

        {!targetDate ? (
          <div className="text-gray-500 text-sm">
            Challenge not started
          </div>
        ) : isExpired ? (
          <div className="text-center">
            <div className="text-red-600 font-bold text-lg mb-2">
              Time's Up!
            </div>
            <Zap className="w-8 h-8 text-red-500 mx-auto animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {/* Days */}
            <div className="bg-islamic-light rounded-lg p-2">
              <div className="text-xl font-bold text-islamic-dark">
                {formatNumber(timeLeft.days)}
              </div>
              <div className="text-xs text-islamic-primary font-medium">
                Days
              </div>
            </div>

            {/* Hours */}
            <div className="bg-islamic-light rounded-lg p-2">
              <div className="text-xl font-bold text-islamic-dark">
                {formatNumber(timeLeft.hours)}
              </div>
              <div className="text-xs text-islamic-primary font-medium">
                Hours
              </div>
            </div>

            {/* Minutes */}
            <div className="bg-islamic-light rounded-lg p-2">
              <div className="text-xl font-bold text-islamic-dark">
                {formatNumber(timeLeft.minutes)}
              </div>
              <div className="text-xs text-islamic-primary font-medium">
                Minutes
              </div>
            </div>

            {/* Seconds */}
            <div className="bg-islamic-light rounded-lg p-2">
              <div className="text-xl font-bold text-islamic-dark animate-pulse">
                {formatNumber(timeLeft.seconds)}
              </div>
              <div className="text-xs text-islamic-primary font-medium">
                Seconds
              </div>
            </div>
          </div>
        )}

        {isActive && (
          <div className="mt-3 text-xs text-gray-600">
            Complete today's task before time runs out
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;