import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Star, Moon, Sparkles } from 'lucide-react';

const Login: React.FC = () => {
  const { signIn, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signIn();
      // Don't set loading to false here - let AuthContext handle it
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen h-[100dvh] flex items-center justify-center islamic-pattern">
      <div className="max-w-md w-full mx-4">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-islamic-primary via-islamic-accent to-islamic-secondary"></div>
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-islamic-primary to-islamic-secondary rounded-full flex items-center justify-center">
                  <Moon className="w-10 h-10 text-white" />
                </div>
                <Sparkles className="w-6 h-6 text-islamic-gold absolute -top-1 -right-1 animate-pulse-soft" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-islamic-dark mb-2">
              Focus Challenge
            </h1>
            <p className="text-islamic-primary font-medium mb-1">
              السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ
            </p>
            <p className="text-gray-600 text-sm">
              As-salāmu ʿalaykum wa-raḥmatu -llāhi wa-barakātuh
            </p>
          </div>

          {/* Description */}
          <div className="mb-8 space-y-3">
            <p className="text-gray-700 leading-relaxed">
              Join fellow Muslims in this beautiful Focus Challenge journey to strengthen 
              your Islamic identity and practice.
            </p>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-islamic-primary">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-current" />
                <span>Daily Challenges</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-current" />
                <span>Progress Tracking</span>
              </div>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || isSigningIn}
            className="w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-6 
                     flex items-center justify-center space-x-3 
                     hover:border-islamic-primary hover:shadow-lg 
                     transition-all duration-300 group disabled:opacity-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold text-gray-700 group-hover:text-islamic-primary transition-colors">
              {(loading || isSigningIn) ? 'Signing In...' : 'Continue with Google'}
            </span>
          </button>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              By signing in, you agree to participate in this blessed challenge 
              and help build a stronger Muslim community together.
            </p>
            
            <div className="mt-4 flex justify-center">
              <div className="text-islamic-gold text-lg font-arabic">
                بِسْمِ اللّهِ الرَّحْمـَنِ الرَّحِيم
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative text */}
        <div className="text-center mt-6">
          <p className="text-islamic-primary text-sm font-medium">
            "And whoever relies upon Allah - then He is sufficient for him"
          </p>
          <p className="text-islamic-secondary text-xs mt-1">
            Quran 65:3
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;