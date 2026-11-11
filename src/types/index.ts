export type LetterGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F';

export interface GradeScaleEntry {
  letter: LetterGrade;
  minPercent: number;
  gradePoints: number;
  note?: string; // e.g. '*' for MAJU D+
}

export type AssessmentCategory = 'midterm' | 'coursework' | 'final';

export interface Assessment {
  id: string;
  name: string;
  weightPercent: number;
  maxScore: number;
  currentScore?: number;
  dueDate?: string;
  completed: boolean;
  category?: AssessmentCategory;
}

export interface CourseAttendance {
  totalClasses: number;
  attendedClasses: number;
  minThresholdPercent: number;
}

export type PresetUniversity = 'maju_undergraduate' | 'custom';

export interface AssessmentPolicyLimits {
  midtermMin: number;
  midtermMax: number;
  courseworkMin: number;
  courseworkMax: number;
  finalMin: number;
  finalMax: number;
}

export type RoundingMode = 'raw' | 'round_integer' | 'round_1dec' | 'ceil' | 'floor';

export interface UniversityGradingPolicy {
  preset: PresetUniversity;
  name: string;
  scale: GradeScaleEntry[];
  policyNoteDPlus?: string;
  roundingMode: RoundingMode;
  assessmentLimits: AssessmentPolicyLimits;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  room: string;
  schedule: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'teal';
  targetGrade: LetterGrade;
  assessments: Assessment[];
  attendance: CourseAttendance;
}

export interface CoreConcept {
  term: string;
  definition: string;
}

export interface FormulaOrTheorem {
  title: string;
  formulaOrRule: string;
  application: string;
}

export interface AcademicSummary {
  overview: string;
  keyTakeaways: string[];
  coreConcepts: CoreConcept[];
  formulasAndTheorems: FormulaOrTheorem[];
  examTraps: string[];
  studyTip: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating?: 'again' | 'hard' | 'good' | 'easy';
  lastReviewed?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  userSelectedIndex?: number;
}

export interface DocumentNote {
  id: string;
  courseId: string;
  title: string;
  content: string;
  createdAt: string;
  wordCount: number;
  summary?: AcademicSummary;
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
}

export interface QuizResult {
  id: string;
  courseId: string;
  docTitle: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
  weakTopics: string[];
}

export interface RevisionSession {
  courseCode: string;
  topic: string;
  durationMinutes: number;
  technique: string;
  specificGoal: string;
  completed?: boolean;
}

export interface RevisionDay {
  dayNumber: number;
  dayTitle: string;
  totalHours: number;
  sessions: RevisionSession[];
}

export interface RevisionPlan {
  strategyOverview: string;
  dailySchedules: RevisionDay[];
  highYieldChecklist: string[];
  generatedAt: string;
}

export interface FocusSessionRecord {
  id: string;
  courseId?: string;
  mode: 'pomodoro' | 'deepwork' | 'shortbreak' | 'longbreak';
  durationMinutes: number;
  completedAt: string;
}

export interface UserSettings {
  studentName: string;
  major: string;
  university: string;
  currentSemester: string;
  priorCredits: number;
  priorCgpa: number;
  targetCgpa: number;
  defaultAttendanceThreshold: number;
  theme: 'dark' | 'light';
  faculty?: string;
  activeModel?: string;
  gradingPolicy?: UniversityGradingPolicy;
}
