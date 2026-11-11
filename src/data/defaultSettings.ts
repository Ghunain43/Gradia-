import type { UserSettings } from '../types';
import { DEFAULT_CUSTOM_POLICY } from '../utils/calculations';
export const NEW_STUDENT_SETTINGS: UserSettings = {
  studentName: '', university: '', major: '', currentSemester: '', priorCredits: 0, priorCgpa: 0,
  targetCgpa: 3.5, defaultAttendanceThreshold: 75, theme: 'light', gradingPolicy: DEFAULT_CUSTOM_POLICY,
};
