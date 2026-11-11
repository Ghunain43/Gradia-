import { hasSavedAcademicData, NEW_STUDENT_SETTINGS } from '../utils/onboarding';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { readAcademicField, STORAGE_KEYS, validateAcademicImport } from '../utils/academicStorage';
import {
  AcademicSummary,
  Assessment,
  Course,
  DocumentNote,
  Flashcard,
  FocusSessionRecord,
  QuizQuestion,
  QuizResult,
  RevisionPlan,
  UniversityGradingPolicy,
  UserSettings,
} from '../types';
import {
  DEFAULT_CUSTOM_POLICY,
  DEFAULT_MAJU_POLICY,
} from '../utils/calculations';
import {
  INITIAL_COURSES,
  INITIAL_DOCUMENTS,
  INITIAL_FOCUS_HISTORY,
  INITIAL_QUIZ_RESULTS,
  INITIAL_REVISION_PLAN,
  INITIAL_USER_SETTINGS,
} from '../data/mockData';

interface AcademicContextType {
  courses: Course[];
  documents: DocumentNote[];
  quizResults: QuizResult[];
  revisionPlan: RevisionPlan | null;
  focusHistory: FocusSessionRecord[];
  settings: UserSettings;
  isGenerating: boolean;
  generationStatus: string;
  error: string | null;
  clearError: () => void;

  // Course actions
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  quickRecordAttendance: (courseId: string, attended: boolean) => void;
  updateAssessmentScore: (courseId: string, assessmentId: string, score: number, completed?: boolean) => void;
  addAssessment: (courseId: string, assessment: Omit<Assessment, 'id'>) => void;
  deleteAssessment: (courseId: string, assessmentId: string) => void;

  // Document & Notes actions
  addDocument: (doc: Omit<DocumentNote, 'id' | 'createdAt' | 'wordCount'>) => DocumentNote;
  updateDocument: (doc: DocumentNote) => void;
  deleteDocument: (id: string) => void;

  // Study actions
  updateFlashcardRating: (docId: string, cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  recordQuizResult: (result: Omit<QuizResult, 'id' | 'date'>) => void;
  toggleRevisionSession: (dayIndex: number, sessionIndex: number) => void;

  // Focus actions
  recordFocusSession: (session: Omit<FocusSessionRecord, 'id' | 'completedAt'>) => void;

  // Settings & Storage
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  setGradingPreset: (preset: 'maju_undergraduate' | 'custom') => void;
  updateGradingPolicy: (policyUpdates: Partial<UniversityGradingPolicy>) => void;
  resetToDemoData: () => void;
  resetToGhunainDemoData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;

  // Guided Tour & How Works Guide
  howWorksOpen: boolean;
  setHowWorksOpen: (open: boolean) => void;
  guidedTourActive: boolean;
  setGuidedTourActive: (active: boolean) => void;
  tourStep: number;
  setTourStep: (step: number) => void;

  // Gemini AI calls
  generateSummary: (docId: string) => Promise<AcademicSummary | null>;
  generateFlashcards: (docId: string, count?: number, topic?: string) => Promise<Flashcard[] | null>;
  generateQuiz: (docId: string, count?: number, difficulty?: string, topic?: string) => Promise<QuizQuestion[] | null>;
  generateAdaptiveRevisionPlan: (daysAvailable?: number, dailyHours?: number) => Promise<RevisionPlan | null>;
  askTutor: (courseName: string, topic: string, query: string, history?: any[], content?: string) => Promise<string>;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [existingProfile] = useState(hasSavedAcademicData);
  const [courses, setCourses] = useState<Course[]>(() => readAcademicField('courses', []));
  const [documents, setDocuments] = useState<DocumentNote[]>(() => readAcademicField('documents', []));
  const [quizResults, setQuizResults] = useState<QuizResult[]>(() => readAcademicField('quizResults', []));
  const [revisionPlan, setRevisionPlan] = useState<RevisionPlan | null>(() => readAcademicField('revisionPlan', null));
  const [focusHistory, setFocusHistory] = useState<FocusSessionRecord[]>(() => readAcademicField('focusHistory', []));
  const [settings, setSettings] = useState<UserSettings>(() => readAcademicField('settings', NEW_STUDENT_SETTINGS));

  // Tour & Modal states
  const [howWorksOpen, setHowWorksOpen] = useState<boolean>(false);
  const [guidedTourActive, setGuidedTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(1);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses));
    } catch {}
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(documents));
    } catch {}
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.quizResults, JSON.stringify(quizResults));
    } catch {}
  }, [quizResults]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.revisionPlan, JSON.stringify(revisionPlan));
    } catch {}
  }, [revisionPlan]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.focusHistory, JSON.stringify(focusHistory));
    } catch {}
  }, [focusHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [settings]);

  // Course actions
  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${crypto.randomUUID()}`,
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  const updateCourse = (updatedCourse: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const quickRecordAttendance = (courseId: string, attended: boolean) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          attendance: {
            ...c.attendance,
            totalClasses: c.attendance.totalClasses + 1,
            attendedClasses: attended ? c.attendance.attendedClasses + 1 : c.attendance.attendedClasses,
          },
        };
      })
    );
  };

  const updateAssessmentScore = (
    courseId: string,
    assessmentId: string,
    score: number,
    completed: boolean = true
  ) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          assessments: c.assessments.map((a) =>
            a.id === assessmentId ? { ...a, currentScore: score, completed } : a
          ),
        };
      })
    );
  };

  const addAssessment = (courseId: string, assessmentData: Omit<Assessment, 'id'>) => {
    const newAssessment: Assessment = {
      ...assessmentData,
      id: `a-${Date.now()}`,
    };
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          assessments: [...c.assessments, newAssessment],
        };
      })
    );
  };

  const deleteAssessment = (courseId: string, assessmentId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          assessments: c.assessments.filter((a) => a.id !== assessmentId),
        };
      })
    );
  };

  // Documents
  const addDocument = (docData: Omit<DocumentNote, 'id' | 'createdAt' | 'wordCount'>): DocumentNote => {
    const wordCount = docData.content.trim().split(/\s+/).filter(Boolean).length;
    const newDoc: DocumentNote = {
      ...docData,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      wordCount,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const updateDocument = (doc: DocumentNote) => {
    const wordCount = doc.content.trim().split(/\s+/).filter(Boolean).length;
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...doc, wordCount } : d)));
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const updateFlashcardRating = (
    docId: string,
    cardId: string,
    rating: 'again' | 'hard' | 'good' | 'easy'
  ) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId || !doc.flashcards) return doc;
        return {
          ...doc,
          flashcards: doc.flashcards.map((fc) =>
            fc.id === cardId ? { ...fc, rating, lastReviewed: new Date().toISOString() } : fc
          ),
        };
      })
    );
  };

  const recordQuizResult = (resultData: Omit<QuizResult, 'id' | 'date'>) => {
    const newResult: QuizResult = {
      ...resultData,
      id: `qr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setQuizResults((prev) => [newResult, ...prev]);
  };

  const toggleRevisionSession = (dayIndex: number, sessionIndex: number) => {
    if (!revisionPlan) return;
    const updated = { ...revisionPlan };
    const day = updated.dailySchedules[dayIndex];
    if (day && day.sessions[sessionIndex]) {
      day.sessions[sessionIndex].completed = !day.sessions[sessionIndex].completed;
      setRevisionPlan(updated);
    }
  };

  const recordFocusSession = (sessionData: Omit<FocusSessionRecord, 'id' | 'completedAt'>) => {
    const record: FocusSessionRecord = {
      ...sessionData,
      id: `focus-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    setFocusHistory((prev) => [record, ...prev]);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const setGradingPreset = (preset: 'maju_undergraduate' | 'custom') => {
    setSettings((prev) => {
      if (preset === 'maju_undergraduate') {
        return {
          ...prev,
          university: prev.university.includes('Pacific') ? 'Mohammad Ali Jinnah University (MAJU)' : prev.university,
          gradingPolicy: { ...DEFAULT_MAJU_POLICY },
        };
      } else {
        return {
          ...prev,
          gradingPolicy: { ...DEFAULT_CUSTOM_POLICY },
        };
      }
    });
  };

  const updateGradingPolicy = (policyUpdates: Partial<UniversityGradingPolicy>) => {
    setSettings((prev) => ({
      ...prev,
      gradingPolicy: {
        ...(prev.gradingPolicy || DEFAULT_MAJU_POLICY),
        ...policyUpdates,
      },
    }));
  };

  const resetToDemoData = () => {
    setCourses(INITIAL_COURSES);
    setDocuments(INITIAL_DOCUMENTS);
    setQuizResults(INITIAL_QUIZ_RESULTS);
    setRevisionPlan(INITIAL_REVISION_PLAN);
    setFocusHistory(INITIAL_FOCUS_HISTORY);
    setSettings({ ...INITIAL_USER_SETTINGS, profileMode: 'demo' });
    setError(null);
  };

  const resetToGhunainDemoData = resetToDemoData;

  const exportDataJson = () => {
    const bundle = {
      courses,
      documents,
      quizResults,
      revisionPlan,
      focusHistory,
      settings,
      exportedAt: new Date().toISOString(),
      app: 'Gradia Academic OS',
    };
    return JSON.stringify(bundle, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      // Validate the whole import before updating any state.
      const parsed = validateAcademicImport(JSON.parse(jsonStr));
      if (parsed.courses !== undefined) setCourses(parsed.courses);
      if (parsed.documents !== undefined) setDocuments(parsed.documents);
      if (parsed.quizResults !== undefined) setQuizResults(parsed.quizResults);
      if (parsed.revisionPlan !== undefined) setRevisionPlan(parsed.revisionPlan);
      if (parsed.focusHistory !== undefined) setFocusHistory(parsed.focusHistory);
      if (parsed.settings !== undefined) setSettings(parsed.settings);
      return true;
    } catch (e: any) {
      setError(`Failed to import data: ${e.message}`);
      return false;
    }
  };

  // --- Real Server-Side Gemini Calls ---

  const generateSummary = async (docId: string): Promise<AcademicSummary | null> => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) {
      setError('Document not found for summarization.');
      return null;
    }

    const course = courses.find((c) => c.id === doc.courseId);
    setIsGenerating(true);
    setGenerationStatus('Synthesizing core concepts, theorems, and exam traps with Gemini...');
    setError(null);

    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        signal: AbortSignal.timeout(90000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: doc.title,
          courseName: course ? `${course.code}: ${course.name}` : 'General',
          content: doc.content,
          model: settings.activeModel || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const summary: AcademicSummary = await res.json();
      // Update document with summary
      setDocuments(prev => prev.map(d => d.id === doc.id && d.content === doc.content ? { ...d, summary } : d));
      return summary;
    } catch (err: any) {
      console.error('Error generating summary:', err);
      setError(err.message || 'Failed to generate academic summary. Check your Gemini API connection.');
      return null;
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const generateFlashcards = async (
    docId: string,
    count: number = 6,
    topic?: string
  ): Promise<Flashcard[] | null> => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) {
      setError('Document not found for flashcards generation.');
      return null;
    }

    setIsGenerating(true);
    setGenerationStatus(`Generating ${count} active recall study flashcards with Gemini...`);
    setError(null);

    try {
      const res = await fetch('/api/gemini/flashcards', {
        method: 'POST',
        signal: AbortSignal.timeout(90000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: doc.content,
          count,
          topic,
          model: settings.activeModel || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const newFlashcards: Flashcard[] = data.flashcards || [];

      setDocuments(prev => prev.map(d => d.id === doc.id && d.content === doc.content ? { ...d, flashcards: [...newFlashcards, ...(d.flashcards || [])] } : d));
      return newFlashcards;
    } catch (err: any) {
      console.error('Error generating flashcards:', err);
      setError(err.message || 'Failed to generate flashcards with Gemini.');
      return null;
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const generateQuiz = async (
    docId: string,
    count: number = 5,
    difficulty: string = 'Mixed',
    topic?: string
  ): Promise<QuizQuestion[] | null> => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) {
      setError('Document not found for quiz generation.');
      return null;
    }

    setIsGenerating(true);
    setGenerationStatus(`Engineering ${count} scored exam-grade MCQs with Gemini...`);
    setError(null);

    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        signal: AbortSignal.timeout(90000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: doc.content,
          count,
          difficulty,
          topic,
          model: settings.activeModel || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const questions: QuizQuestion[] = data.questions || [];

      setDocuments(prev => prev.map(d => d.id === doc.id && d.content === doc.content ? { ...d, quiz: questions } : d));
      return questions;
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      setError(err.message || 'Failed to generate quiz with Gemini.');
      return null;
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const generateAdaptiveRevisionPlan = async (
    daysAvailable: number = 7,
    dailyHours: number = 3
  ): Promise<RevisionPlan | null> => {
    // Collect all weak topics identified across quiz attempts
    const allWeakTopics = Array.from(
      new Set(quizResults.flatMap((r) => r.weakTopics).filter(Boolean))
    );


    setIsGenerating(true);
    setGenerationStatus('Gemini is computing cognitive pacing and optimizing your revision schedule...');
    setError(null);

    try {
      const courseSummaries = courses.map((c) => ({
        code: c.code,
        name: c.name,
        credits: c.credits,
        assessments: c.assessments.map((a) => ({
          name: a.name,
          completed: a.completed,
          score: a.currentScore,
          weight: a.weightPercent,
        })),
      }));

      const res = await fetch('/api/gemini/revision-plan', {
        method: 'POST',
        signal: AbortSignal.timeout(90000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weakTopics: allWeakTopics,
          studyTopics: documents.map(d => d.title),
          courses: courseSummaries,
          daysAvailable,
          dailyHours,
          model: settings.activeModel || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const planData = await res.json();
      const plan: RevisionPlan = {
        strategyOverview: planData.strategyOverview,
        dailySchedules: planData.dailySchedules || [],
        highYieldChecklist: planData.highYieldChecklist || [],
        generatedAt: new Date().toISOString(),
      };

      setRevisionPlan(plan);
      return plan;
    } catch (err: any) {
      console.error('Error generating revision plan:', err);
      setError(err.message || 'Failed to generate adaptive revision plan with Gemini.');
      return null;
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const askTutor = async (
    courseName: string,
    topic: string,
    query: string,
    history: any[] = [],
    content: string = ''
  ): Promise<string> => {
    setError(null);
    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        signal: AbortSignal.timeout(90000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName,
          topic,
          query,
          conversationHistory: history,
          content,
          model: settings.activeModel || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Tutor error (${res.status})`);
      }

      const data = await res.json();
      return data.reply;
    } catch (err: any) {
      console.error('Tutor error:', err);
      throw err;
    }
  };

  return (
    <AcademicContext.Provider
      value={{
        courses,
        documents,
        quizResults,
        revisionPlan,
        focusHistory,
        settings,
        isGenerating,
        generationStatus,
        error,
        clearError,
        addCourse,
        updateCourse,
        deleteCourse,
        quickRecordAttendance,
        updateAssessmentScore,
        addAssessment,
        deleteAssessment,
        addDocument,
        updateDocument,
        deleteDocument,
        updateFlashcardRating,
        recordQuizResult,
        toggleRevisionSession,
        recordFocusSession,
        updateSettings,
        setGradingPreset,
        updateGradingPolicy,
        resetToDemoData,
        resetToGhunainDemoData,
        exportDataJson,
        importDataJson,
        howWorksOpen,
        setHowWorksOpen,
        guidedTourActive,
        setGuidedTourActive,
        tourStep,
        setTourStep,
        generateSummary,
        generateFlashcards,
        generateQuiz,
        generateAdaptiveRevisionPlan,
        askTutor,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = (): AcademicContextType => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};
