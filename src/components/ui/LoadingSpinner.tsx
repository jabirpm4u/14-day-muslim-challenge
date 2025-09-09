import React from 'react';
import { Moon, Sparkles } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-islamic-light to-white islamic-pattern">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-islamic-primary to-islamic-secondary rounded-full flex items-center justify-center mx-auto animate-pulse-soft">
            <Moon className="w-10 h-10 text-white" />
          </div>
          <Sparkles className="w-6 h-6 text-islamic-gold absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Loading Spinner */}
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-primary mx-auto"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-islamic-dark">
            Loading your Islamic journey...
          </h3>
          <p className="text-sm text-islamic-primary">
            بِسْمِ اللّهِ الرَّحْمـَنِ الرَّحِيم
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-1 mt-6">
          <div className="w-2 h-2 bg-islamic-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-islamic-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-islamic-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;