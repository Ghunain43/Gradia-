import React from 'react';
import {
  Compass,
  BookOpen,
  Calculator,
  Sparkles,
  Timer,
  Plus,
  Settings as SettingsIcon,
  Sun,
  Moon,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'courses' | 'rescue' | 'study' | 'focus';
  setActiveTab: (tab: 'dashboard' | 'courses' | 'rescue' | 'study' | 'focus') => void;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  onOpenSettings,
}) => {
  const { settings, updateSettings } = useAcademic();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        
        {/* Zone 1: Brand title wordmark with custom Gradia SVG Monogram */}
        <div className="flex items-center gap-3 shrink-0">
          <svg className="w-8 h-8 rounded-lg shadow-xs shrink-0" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="9" fill="url(#gradia_brand_grad)" />
            <path d="M10 24L18 10L26 24" stroke="white" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.5 19.5H22.5" stroke="white" strokeWidth="2.75" strokeLinecap="round" />
            <circle cx="18" cy="18" r="2" fill="#A5B4FC" />
            <defs>
              <linearGradient id="gradia_brand_grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4F46E5" />
                <stop offset="1" stopColor="#312E81" />
              </linearGradient>
            </defs>
          </svg>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-left group cursor-pointer"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap block leading-tight">
              Gradia
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block whitespace-nowrap">
              Academic Operating System
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'courses'
                ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>Courses</span>
          </button>

          <button
            onClick={() => setActiveTab('rescue')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'rescue'
                ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-500" />
            <span>Grade Rescue</span>
          </button>

          <button
            onClick={() => setActiveTab('study')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'study'
                ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>Study & AI</span>
          </button>

          <button
            onClick={() => setActiveTab('focus')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'focus'
                ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Timer className="w-4 h-4 text-sky-500" />
            <span>Focus Timer</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action + Utilities (Theme, Settings, Profile) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setHowWorksOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="How Gradia Works — Architecture, Algorithms & Formulas Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden lg:inline">How it Works</span>
          </button>

          <button
            onClick={() => {
              setGuidedTourActive(true);
              setTourStep(1);
              setActiveTab('dashboard');
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Start 6-step interactive hackathon product walkthrough"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden lg:inline">Tour</span>
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Quick Add</span>
          </button>

          {/* Tasteful Student Initials Avatar */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-mono font-bold text-xs flex items-center justify-center border border-indigo-400/40 shadow-xs hover:ring-2 hover:ring-indigo-400/50 transition-all cursor-pointer shrink-0 ml-1"
            title={`${settings.studentName} · ${settings.major} (${settings.university})`}
          >
            {settings.studentName
              ? settings.studentName
                  .trim()
                  .split(/\s+/)
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'GF'}
          </button>
        </div>

      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="flex md:hidden border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'courses' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Courses
        </button>
        <button
          onClick={() => setActiveTab('rescue')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'rescue' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Rescue
        </button>
        <button
          onClick={() => setActiveTab('study')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'study' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Study & AI
        </button>
        <button
          onClick={() => setActiveTab('focus')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'focus' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          Focus
        </button>
      </div>
    </header>
  );
};
