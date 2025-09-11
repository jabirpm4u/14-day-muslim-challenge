import React from 'react';
import { Trophy, BookOpen, Users } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white/10 backdrop-blur rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 inline-flex items-center rounded-br-2xl">
            <span className="text-xs font-bold tracking-widest">STARTS TOMORROW</span>
          </div>

          <div className="px-6 pt-4 pb-6">
            <p className="text-center text-sm text-blue-100 mb-2">Ready to Transform Your Life with Sunnah?</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-3">FOCUS <span className="block text-3xl md:text-4xl mt-2">CHALLENGE</span></h1>
            <div className="mx-auto w-max bg-blue-700 px-4 py-1 rounded-lg mb-5 text-sm font-semibold">7-Day Transformation challenge</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-3 border border-white/10">
                <Users className="w-4 h-4 text-blue-200" />
                <span className="text-blue-100 text-sm">Worship & Salah</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-3 border border-white/10">
                <Users className="w-4 h-4 text-blue-200" />
                <span className="text-blue-100 text-sm">Character & Deeds</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-3 border border-white/10">
                <BookOpen className="w-4 h-4 text-blue-200" />
                <span className="text-blue-100 text-sm">Knowledge & Reminders</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-3 border border-white/10">
                <Users className="w-4 h-4 text-blue-200" />
                <span className="text-blue-100 text-sm">Family & Identity</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-xl px-4 py-2 border border-white/20">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-semibold">Daily leaderboard + winner announcement!</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 text-blue-200 text-sm">#FocusChallenge</div>
      </div>
    </div>
  );
};

export default Landing;


