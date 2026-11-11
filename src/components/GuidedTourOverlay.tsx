import { useModalFocus } from '../utils/useModalFocus';
import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  Compass,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

interface GuidedTourOverlayProps {
  activeTab: 'dashboard' | 'courses' | 'rescue' | 'study' | 'focus';
  onNavigateTab: (tab: 'dashboard' | 'courses' | 'rescue' | 'study' | 'focus') => void;
}

export const GuidedTourOverlay: React.FC<GuidedTourOverlayProps> = ({
  activeTab,
  onNavigateTab,
}) => {
  const { guidedTourActive, setGuidedTourActive, tourStep, setTourStep } = useAcademic();

  const dialogRef = useModalFocus(guidedTourActive, () => setGuidedTourActive(false));
  if (!guidedTourActive) return null;

  const steps = [
    {
      step: 1,
      targetTab: 'dashboard' as const,
      badge: 'Step 1 of 6',
      title: 'Your semester at a glance',
      icon: Compass,
      description:
        'See your completed results, estimated semester performance, attendance, and a suggested next step based on your saved records.',
      highlightText: 'Notice how Finalized GPA and Projected GPA are cleanly separated.',
      actionLabel: 'Next: Explore Grade Rescue',
    },
    {
      step: 2,
      targetTab: 'rescue' as const,
      badge: 'Step 2 of 6',
      title: 'Grade Rescue "What-If" Simulator',
      icon: Calculator,
      description:
        'Grade Rescue uses reverse-optimization mathematics to solve exactly what percentage you need on upcoming final exams to achieve an "A" (≥86% in MAJU) or any target grade.',
      highlightText: 'Try clicking target letters or adjusting what-if sliders to see instant required scores.',
      actionLabel: 'Next: Study & AI Workspace',
    },
    {
      step: 3,
      targetTab: 'study' as const,
      badge: 'Step 3 of 6',
      title: 'Searchable PDF & Notes Ingestion',
      icon: BookOpen,
      description:
        'In the Study & AI hub, click "Upload / Paste Lecture Notes". Gradia extracts text client-side using PDF.js and displays a live text preview before saving—ensuring zero corrupted binary files reach the model.',
      highlightText: 'Works seamlessly with your course lecture slides and chapter notes.',
      actionLabel: 'Next: Gemini Diagnostic Quizzes',
    },
    {
      step: 4,
      targetTab: 'study' as const,
      badge: 'Step 4 of 6',
      title: 'Scored Exam-Grade MCQs',
      icon: Sparkles,
      description:
        'Under any saved study document, click the "Diagnostic Quiz" tab and hit "Generate Scored Quiz with Gemini". It crafts rigorous 4-option MCQs with in-depth explanations for every option.',
      highlightText: 'Each question is tagged with a granular subtopic to detect exact knowledge gaps.',
      actionLabel: 'Next: Weak-Topic Feedback Loop',
    },
    {
      step: 5,
      targetTab: 'study' as const,
      badge: 'Step 5 of 6',
      title: 'Automated Weak-Topic Detection',
      icon: Target,
      description:
        'Whenever you submit a quiz, any questions answered incorrectly are immediately logged as weak topics (e.g., "Space Optimization" or "FSM Architecture") and saved to your persistent academic record.',
      highlightText: 'Empirical assessment data powers your study priorities instead of guesswork.',
      actionLabel: 'Next: Adaptive Revision Planning',
    },
    {
      step: 6,
      targetTab: 'study' as const,
      badge: 'Step 6 of 6',
      title: 'Adaptive Cognitive Revision Planner',
      icon: Brain,
      description:
        'Switch to the "Adaptive Plan" tab. Gemini synthesizes your diagnosed weak topics with your course credit weights into an actionable multi-day study schedule with spaced retrieval techniques.',
      highlightText: 'You’re ready. Start with one course, one set of notes, or one focus session.',
      actionLabel: 'Finish Tour & Explore',
    },
  ];

  const current = steps[tourStep - 1] || steps[0];
  const Icon = current.icon;

  const handleNext = () => {
    if (tourStep < steps.length) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      const nextTarget = steps[nextStep - 1]?.targetTab;
      if (nextTarget && activeTab !== nextTarget) {
        onNavigateTab(nextTarget);
      }
    } else {
      setGuidedTourActive(false);
      setTourStep(1);
    }
  };

  const handlePrev = () => {
    if (tourStep > 1) {
      const prevStep = tourStep - 1;
      setTourStep(prevStep);
      const prevTarget = steps[prevStep - 1]?.targetTab;
      if (prevTarget && activeTab !== prevTarget) {
        onNavigateTab(prevTarget);
      }
    }
  };

  return (
    <aside
      aria-label="Interactive Product Tour"
      className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-indigo-200 dark:border-indigo-900/80 bg-white dark:bg-slate-900 shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-5 duration-200"
    >
      {/* Step Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {current.badge}
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {current.title}
            </h4>
          </div>
        </div>

        <button
          onClick={() => setGuidedTourActive(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded transition-colors"
          title="Exit Tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {current.description}
      </p>

      {/* Highlight Box */}
      <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-start gap-1.5 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <span>{current.highlightText}</span>
      </div>

      {/* Step Navigation Bar */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          {steps.map((s) => (
            <div
              key={s.step}
              className={`h-1.5 rounded-full transition-all ${
                s.step === tourStep
                  ? 'w-5 bg-indigo-600'
                  : s.step < tourStep
                  ? 'w-2 bg-indigo-300 dark:bg-indigo-700'
                  : 'w-2 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {tourStep > 1 && (
            <button
              onClick={handlePrev}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <span>{current.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
