import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Star, CheckCircle, BookOpen, Heart } from 'lucide-react';

interface PreChallengeCountdownProps {
  scheduledStartDate: Date | null;
  onChallengeStart?: () => void;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const PreChallengeCountdown: React.FC<PreChallengeCountdownProps> = ({ 
  scheduledStartDate, 
  onChallengeStart,
  className = "" 
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!scheduledStartDate) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = scheduledStartDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!isExpired) {
          setIsExpired(true);
          onChallengeStart?.();
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
  }, [scheduledStartDate, isExpired, onChallengeStart]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  // const isActive = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  const preparationSteps = [
    {
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      title: "Set Your Intention",
      description: "Make a sincere intention (niyyah) for your Focus Challenge journey"
    },
    {
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      title: "Review the Guidelines",
      description: "Familiarize yourself with Islamic practices and daily tasks"
    },
    {
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      title: "Prepare Your Mind",
      description: "Get ready for a transformative spiritual experience"
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden ${className}`}>
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Clock className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 rounded-full blur-xl opacity-30 animate-pulse" />
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Focus Challenge
            </h1>
            <p className="text-xl text-slate-600 mb-2">
              {isExpired ? "Challenge Starting Now!" : "Starting Soon"}
            </p>
            {scheduledStartDate && (
              <p className="text-lg text-slate-500">
                {scheduledStartDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>

          {/* Countdown Timer */}
          {scheduledStartDate && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  {isExpired ? "Challenge is Starting!" : "Time Until Challenge Begins"}
                </h2>

                {isExpired ? (
                  <div className="text-center">
                    <div className="text-green-600 font-bold text-3xl mb-4 animate-pulse">
                      🎉 Let's Begin! 🎉
                    </div>
                    <p className="text-slate-600 text-lg">
                      The challenge is now active. Refresh the page to start your journey!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {/* Days */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200/50">
                      <div className="text-4xl font-bold text-blue-700 mb-2">
                        {formatNumber(timeLeft.days)}
                      </div>
                      <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                        Days
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 border border-purple-200/50">
                      <div className="text-4xl font-bold text-purple-700 mb-2">
                        {formatNumber(timeLeft.hours)}
                      </div>
                      <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                        Hours
                      </div>
                    </div>

                    {/* Minutes */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl p-6 border border-indigo-200/50">
                      <div className="text-4xl font-bold text-indigo-700 mb-2">
                        {formatNumber(timeLeft.minutes)}
                      </div>
                      <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                        Minutes
                      </div>
                    </div>

                    {/* Seconds */}
                    <div className="bg-gradient-to-br from-cyan-50 to-teal-100 rounded-2xl p-6 border border-cyan-200/50">
                      <div className="text-4xl font-bold text-cyan-700 mb-2 animate-pulse">
                        {formatNumber(timeLeft.seconds)}
                      </div>
                      <div className="text-sm font-semibold text-cyan-600 uppercase tracking-wide">
                        Seconds
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preparation Steps */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-8">
              While You Wait, Prepare Your Heart
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {preparationSteps.map((step, index) => (
                <div key={index} className="text-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    {step.icon}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Challenge Overview */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">What to Expect</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Focus Period</h4>
                  <p className="text-blue-100 text-sm">
                    Daily tasks to strengthen your Islamic identity
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Points & Rewards</h4>
                  <p className="text-blue-100 text-sm">
                    Earn points for completed tasks and compete on leaderboard
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Track Progress</h4>
                  <p className="text-blue-100 text-sm">
                    Monitor your daily progress and spiritual growth
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreChallengeCountdown;
