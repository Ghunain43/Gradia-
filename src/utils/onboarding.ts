import { STORAGE_KEYS } from './academicStorage';
import { DEFAULT_CUSTOM_POLICY } from './calculations';
import type { UserSettings } from '../types';
export function hasSavedAcademicData() {
  try { return Object.values(STORAGE_KEYS).some(key => localStorage.getItem(key) !== null); } catch { return false; }
}
export { NEW_STUDENT_SETTINGS } from '../data/defaultSettings';
