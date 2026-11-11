import { OnboardingView } from './components/OnboardingView';
import { hasSavedAcademicData } from './utils/onboarding';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AcademicProvider, useAcademic } from './context/AcademicContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CoursesView } from './components/CoursesView';
import { GradeRescueView } from './components/GradeRescueView';
import { StudyAIView } from './components/StudyAIView';
import { FocusTimerView } from './components/FocusTimerView';
import { SettingsModal } from './components/SettingsModal';
import { QuickAddModal } from './components/QuickAddModal';
import { HowGradiaWorksModal } from './components/HowGradiaWorksModal';
import { GuidedTourOverlay } from './components/GuidedTourOverlay';

type ActiveTab = 'dashboard' | 'courses' | 'rescue' | 'study' | 'focus';

function MainApp() {
  const [setupOpen, setSetupOpen] = useState(() => { try { return !hasSavedAcademicData() && localStorage.getItem('gradia_setup_done') !== 'true'; } catch { return false; } });
  const finishSetup = () => { try { localStorage.setItem('gradia_setup_done', 'true'); } catch {} setSetupOpen(false); };
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [studyDocId, setStudyDocId] = useState<string | undefined>();
  const [rescueCourseId, setRescueCourseId] = useState<string | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const {
    settings,
    howWorksOpen,
    setHowWorksOpen,
    setGuidedTourActive,
    setTourStep,
  } = useAcademic();

  const handleNavigateToRescue = (courseId?: string) => {
    setRescueCourseId(courseId);
    setActiveTab('rescue');
  };

  const handleNavigateToStudy = (docId?: string) => {
    setStudyDocId(docId);
    setActiveTab('study');
  };

  if (setupOpen) return <OnboardingView onFinish={finishSetup} />;

  return (
    <div className="fm-shell min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-300">
      
      {/* Top Bar Contract (3 zones) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Viewport Container */}
      <a className="skip-link" href="#main-content">Skip to content</a><main id="main-content" tabIndex={-1} className={`fm-main ${activeTab === 'dashboard' ? 'fm-dashboard-grid' : ''}`}>
        <p className="text-xs text-slate-600 dark:text-slate-300" style={{gridColumn:'1 / -1'}} role="note">{settings.profileMode === 'demo' ? 'Demo mode: course names, credits, profile and supplied attendance are confirmed. Marks, assessment dates, rooms, schedules, study history and AI examples are sample data; predictions use those samples. Attendance counts approximate the supplied percentages.' : 'Academic estimates depend on your recorded marks. Legacy or imported sample records are not verified university results.'}</p>
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            onSelectCourse={(courseId) => handleNavigateToRescue(courseId)}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            onNavigateToStudy={handleNavigateToStudy}
            onNavigateToRescue={handleNavigateToRescue}
          />
        )}

        {activeTab === 'rescue' && (
          <GradeRescueView
            initialCourseId={rescueCourseId}
            onNavigateToStudy={handleNavigateToStudy}
          />
        )}

        {activeTab === 'study' && <StudyAIView initialDocId={studyDocId} />}

        <div className={activeTab === 'dashboard' ? 'fm-timer-slot' : ''} hidden={activeTab !== 'focus' && activeTab !== 'dashboard'}><FocusTimerView compact={activeTab === 'dashboard'} /></div>
      </main>

      {/* Clean Footer adhering to anti-slop rules (no fake engines or mock telemetry) */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-xs text-slate-500 py-6 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Gradia</span>
            <span aria-hidden="true">·</span>
            <span>Your academic companion</span>
            <span aria-hidden="true">·</span>
            <button onClick={() => setHowWorksOpen(true)}>How it Works</button><button onClick={() => { setGuidedTourActive(true); setTourStep(1); setActiveTab('dashboard'); }}>Tour</button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Academic Settings
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('rescue')}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Grade Rescue
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('focus')}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Focus Timer
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <SettingsModal key={String(isSettingsOpen)}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onNavigate={setActiveTab}
      />

      <HowGradiaWorksModal
        isOpen={howWorksOpen}
        onClose={() => setHowWorksOpen(false)}
        onStartTour={() => {
          setGuidedTourActive(true);
          setTourStep(1);
        }}
      />

      <GuidedTourOverlay
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
      />

    </div>
  );
}

export default function App() {
  return (
    <AcademicProvider>
      <MainApp />
    </AcademicProvider>
  );
}
