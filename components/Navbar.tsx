
import React from 'react';
import { ClipboardList, BookOpen, Globe, LayoutDashboard, Compass } from 'lucide-react';
import { View } from '../types';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: View.MOCK_TEST, label: 'Home', icon: LayoutDashboard },
    { id: View.STUDY_MATERIAL, label: 'Vault', icon: BookOpen },
    { id: View.CURRENT_AFFAIRS, label: 'Global', icon: Globe },
  ];

  return (
    <div className="glass-panel rounded-full px-2 py-2 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 mx-auto max-w-[280px]">
      {navItems.map((item) => {
        const isActive = 
          currentView === item.id || 
          (item.id === View.MOCK_TEST && (currentView === View.LEVEL_SELECT || currentView === View.SCIENCE_SELECT || currentView === View.SET_SELECT || currentView === View.REVIEW));

        return (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className="relative flex-1 flex flex-col items-center justify-center group outline-none"
          >
            <div 
              className={`
                relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500
                ${isActive ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.6)] scale-110' : 'text-white/40 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon 
                size={isActive ? 22 : 20} 
                strokeWidth={isActive ? 2.5 : 2}
                className="transition-transform duration-300"
              />
            </div>
            {isActive && (
              <span className="absolute -bottom-8 text-[9px] font-bold uppercase tracking-widest text-indigo-400 opacity-0 animate-slide-up">
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Navbar;
