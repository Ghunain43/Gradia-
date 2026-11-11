import type { Course, DocumentNote, FocusSessionRecord, QuizResult, RevisionPlan, UserSettings } from '../types';
import { NEW_STUDENT_SETTINGS } from '../data/defaultSettings';
import { DEFAULT_MAJU_POLICY } from './calculations';

export interface AcademicData {
  courses: Course[];
  documents: DocumentNote[];
  quizResults: QuizResult[];
  revisionPlan: RevisionPlan | null;
  focusHistory: FocusSessionRecord[];
  settings: UserSettings;
}

export const STORAGE_KEYS: Record<keyof AcademicData, string> = {
  courses: 'gradia_courses_v3',
  documents: 'gradia_documents_v3',
  quizResults: 'gradia_quiz_results_v3',
  revisionPlan: 'gradia_revision_plan_v3',
  focusHistory: 'gradia_focus_history_v3',
  settings: 'gradia_settings_v3',
};

type Check = (value: unknown) => boolean;
const text: Check = (value) => typeof value === 'string';
const number: Check = (value) => typeof value === 'number' && Number.isFinite(value);
const boolean: Check = (value) => typeof value === 'boolean';
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const optional = (check: Check): Check => (value) => value === undefined || check(value);
const array = (check: Check): Check => (value) => Array.isArray(value) && value.every(check);
const shape = (fields: Record<string, Check>): Check => (value) => record(value) && Object.entries(fields).every(([key, check]) => check(value[key]));
const oneOf = (...values: unknown[]): Check => (value) => values.includes(value);

// Validate the structures consumers iterate, calculate with, and render. Keep all
// extra fields and custom grading values; this is not a new grading policy.
const checks: Record<keyof AcademicData, Check> = {
  courses: array(shape({
    id: text, code: text, name: text, credits: number, instructor: text, room: text,
    schedule: text, color: text, targetGrade: text,
    assessments: array(shape({ id: text, name: text, weightPercent: number, maxScore: number,
      currentScore: optional(number), dueDate: optional(text), completed: boolean, category: optional(text) })),
    attendance: shape({ totalClasses: number, attendedClasses: number, minThresholdPercent: number }),
  })),
  documents: array(shape({
    id: text, courseId: text, title: text, content: text, createdAt: text, wordCount: number,
    summary: optional(shape({ overview: text, keyTakeaways: array(text), examTraps: array(text), studyTip: text,
      coreConcepts: array(shape({ term: text, definition: text })),
      formulasAndTheorems: array(shape({ title: text, formulaOrRule: text, application: text })) })),
    flashcards: optional(array(shape({ id: text, front: text, back: text, topic: text, difficulty: text,
      rating: optional(text), status: optional(text), lastReviewed: optional(text) }))),
    quiz: optional(array(shape({ id: text, question: text, options: array(text), correctIndex: number,
      explanation: text, topic: text, userSelectedIndex: optional(number) }))),
  })),
  quizResults: array(shape({ id: text, courseId: text, docTitle: text, score: number, total: number,
    percentage: number, date: text, weakTopics: array(text) })),
  revisionPlan: (value) => value === null || shape({ strategyOverview: text, generatedAt: text,
    highYieldChecklist: array(text), dailySchedules: array(shape({ dayNumber: number, dayTitle: text,
      totalHours: number, sessions: array(shape({ courseCode: text, topic: text, durationMinutes: number,
        technique: text, specificGoal: text, completed: optional(boolean) })) })) })(value),
  focusHistory: array(shape({ id: text, courseId: optional(text), mode: text, durationMinutes: number, completedAt: text })),
  settings: shape({ studentName: text, major: text, university: text, currentSemester: text,
    priorCredits: number, priorCgpa: number, targetCgpa: number, defaultAttendanceThreshold: number,
    theme: oneOf('dark', 'light'), faculty: optional(text), activeModel: optional(text),
    gradingPolicy: shape({ preset: oneOf('maju_undergraduate', 'custom'), name: text,
      scale: (value) => array(shape({ letter: text, minPercent: number, gradePoints: number, note: optional(text) }))(value) && (value as unknown[]).length > 0,
      roundingMode: oneOf('raw', 'round_integer', 'round_1dec', 'ceil', 'floor'), policyNoteDPlus: optional(text),
      assessmentLimits: shape({ midtermMin: number, midtermMax: number, courseworkMin: number,
        courseworkMax: number, finalMin: number, finalMax: number }) }),
  }),
};

export function validateAcademicField<K extends keyof AcademicData>(field: K, value: unknown): AcademicData[K] {
  if (field === 'settings' && record(value)) {
    value = { ...NEW_STUDENT_SETTINGS, ...value, gradingPolicy: value.gradingPolicy ?? DEFAULT_MAJU_POLICY };
  }
  if (!checks[field](value)) throw new Error(`Invalid academic data in ${STORAGE_KEYS[field]}. Download a recovery backup and repair this record or restore a valid Gradia export.`);
  return value as AcademicData[K];
}

export function readAcademicField<K extends keyof AcademicData>(field: K, fallback: AcademicData[K]): AcademicData[K] {
  let saved: string | null;
  try {
    saved = localStorage.getItem(STORAGE_KEYS[field]);
  } catch {
    // Storage may be unavailable in private/restricted browsing.
    return fallback;
  }
  if (saved === null) return fallback;
  let parsed: unknown;
  try {
    parsed = JSON.parse(saved);
  } catch {
    throw new Error(`Invalid JSON in ${STORAGE_KEYS[field]}. Download a recovery backup before repairing browser storage.`);
  }
  return validateAcademicField(field, parsed);
}

export function validateAcademicImport(value: unknown): Partial<AcademicData> {
  if (!record(value)) throw new Error('Expected a Gradia export object.');
  const result: Partial<AcademicData> = {};
  for (const field of Object.keys(STORAGE_KEYS) as (keyof AcademicData)[]) {
    if (Object.hasOwn(value, field)) Object.assign(result, { [field]: validateAcademicField(field, value[field]) });
  }
  if (!Object.keys(result).length) throw new Error('No academic data found in this export.');
  return result;
}
