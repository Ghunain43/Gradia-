import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App';
import { AcademicProvider, useAcademic } from '../src/context/AcademicContext';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';
import { CoursesView } from '../src/components/CoursesView';
import { GradeRescueView } from '../src/components/GradeRescueView';
import { StudyAIView } from '../src/components/StudyAIView';
import { FocusTimerView } from '../src/components/FocusTimerView';
import { HowGradiaWorksModal } from '../src/components/HowGradiaWorksModal';
import { readAcademicField, STORAGE_KEYS, validateAcademicImport } from '../src/utils/academicStorage';
import { INITIAL_COURSES, INITIAL_DOCUMENTS, INITIAL_FOCUS_HISTORY, INITIAL_QUIZ_RESULTS,
  INITIAL_REVISION_PLAN, INITIAL_USER_SETTINGS } from '../src/data/mockData';

const records = new Map<string, string>();
const storage = {
  getItem: (key: string) => records.get(key) ?? null,
  setItem: (key: string, value: string) => { records.set(key, value); },
};
beforeEach(() => {
  records.clear();
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
});

const demo = { courses: INITIAL_COURSES, documents: INITIAL_DOCUMENTS, quizResults: INITIAL_QUIZ_RESULTS,
  revisionPlan: INITIAL_REVISION_PLAN, focusHistory: INITIAL_FOCUS_HISTORY, settings: INITIAL_USER_SETTINGS };

test('the real app renders the dashboard, including the new guide controls', () => {
  // Previously threw ReferenceError: HelpCircle is not defined, even with clean storage.
  for (const [field, value] of Object.entries(demo)) records.set(STORAGE_KEYS[field as keyof typeof STORAGE_KEYS], JSON.stringify(value));
  const html = renderToString(<App />);
  assert.match(html, /How it Works/);
  assert.match(html, /Tour/);
  assert.match(html, /Welcome back/);
  assert.match(html, /Ghunain Fayaz/);
  assert.doesNotMatch(html, /Interactive Product Tour/);
});

test('every saved demo record validates and retains MAJU data unchanged', () => {
  assert.deepEqual(validateAcademicImport(demo), demo);
  for (const [field, value] of Object.entries(demo)) {
    records.set(STORAGE_KEYS[field as keyof typeof STORAGE_KEYS], JSON.stringify(value));
  }
  assert.match(renderToString(<App />), /MAJU Undergraduate/);
});

test('all five views and the open guide render without browser-only PDF initialization', () => {
  for (const [field, value] of Object.entries(demo)) records.set(STORAGE_KEYS[field as keyof typeof STORAGE_KEYS], JSON.stringify(value));
  for (const view of [
    <CoursesView onNavigateToStudy={() => {}} onNavigateToRescue={() => {}} />,
    <GradeRescueView onNavigateToStudy={() => {}} />,
    <StudyAIView />,
    <FocusTimerView />,
    <HowGradiaWorksModal isOpen onClose={() => {}} onStartTour={() => {}} />,
  ]) {
    assert.ok(renderToString(<AcademicProvider>{view}</AcademicProvider>).length > 100);
  }
});

test('the provider exposes the three guide and tour actions used by Navbar', () => {
  function Probe() {
    const context = useAcademic();
    for (const action of [context.setHowWorksOpen, context.setGuidedTourActive, context.setTourStep]) {
      assert.equal(typeof action, 'function');
    }
    return null;
  }
  renderToString(<AcademicProvider><Probe /></AcademicProvider>);
});

test('invalid JSON raises a useful error without erasing the saved record', () => {
  records.set(STORAGE_KEYS.courses, '{broken');
  assert.throws(() => renderToString(<App />), /Invalid JSON in gradia_courses_v3/);
  assert.equal(records.get(STORAGE_KEYS.courses), '{broken');
});

test('valid JSON with invalid structure is rejected before consumers render', () => {
  const malformed = { courses: [null], documents: [{}], quizResults: {}, revisionPlan: {},
    focusHistory: null, settings: { targetCgpa: '4.0' } };
  for (const [field, value] of Object.entries(malformed)) {
    records.clear();
    const key = STORAGE_KEYS[field as keyof typeof STORAGE_KEYS];
    const raw = JSON.stringify(value);
    records.set(key, raw);
    assert.throws(() => renderToString(<App />), new RegExp(`Invalid academic data in ${key}`));
    assert.equal(records.get(key), raw);
  }
});

test('nested invalid academic data and malformed grading policies are rejected', () => {
  assert.throws(() => validateAcademicImport({ courses: [{ ...INITIAL_COURSES[0], attendance: null }] }));
  assert.throws(() => validateAcademicImport({ documents: [{ ...INITIAL_DOCUMENTS[0], summary: {} }] }));
  assert.throws(() => validateAcademicImport({ settings: { gradingPolicy: { scale: [] } } }));
});

test('empty collections and a cleared revision plan remain empty after startup', () => {
  for (const field of ['courses', 'documents', 'quizResults', 'focusHistory'] as const) {
    records.set(STORAGE_KEYS[field], '[]');
    assert.deepEqual(readAcademicField(field, demo[field]), []);
  }
  records.set(STORAGE_KEYS.revisionPlan, 'null');
  assert.equal(readAcademicField('revisionPlan', INITIAL_REVISION_PLAN), null);
  assert.match(renderToString(<App />), /Welcome back/);
});

test('older settings receive missing defaults while preserving custom grades and profile', () => {
  const policy = { ...INITIAL_USER_SETTINGS.gradingPolicy!, name: 'My custom scale', preset: 'custom',
    scale: [{ letter: 'A', minPercent: 90, gradePoints: 4 }] };
  const migrated = validateAcademicImport({ settings: { studentName: 'Student', gradingPolicy: policy } });
  assert.equal(migrated.settings?.studentName, 'Student');
  assert.equal(migrated.settings?.targetCgpa, 3.5);
  assert.deepEqual(migrated.settings?.gradingPolicy, policy);
});

test('unavailable browser storage still allows the demo dashboard to render', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage denied'); } });
  assert.match(renderToString(<App />), /Welcome back/);
});

test('imports reject an invalid bundle instead of partially applying it', () => {
  assert.throws(() => validateAcademicImport({ courses: INITIAL_COURSES, quizResults: [null] }));
  assert.throws(() => validateAcademicImport(null));
  assert.throws(() => validateAcademicImport({}));
  assert.deepEqual(validateAcademicImport({ courses: [], revisionPlan: null }), { courses: [], revisionPlan: null });
});

test('recovery UI displays an actionable error and a non-destructive backup option', () => {
  const boundary = new AppErrorBoundary({ children: <p>App</p> });
  boundary.state = { ...boundary.state, ...AppErrorBoundary.getDerivedStateFromError(new Error('Broken saved data')) };
  const html = renderToString(boundary.render());
  assert.match(html, /role="alert"/);
  assert.match(html, /Broken saved data/);
  assert.match(html, /Reload Gradia/);
  assert.match(html, /Download saved data/);
});


test('first launch offers optional setup without loading invented student records', () => {
  const html = renderToString(<App />);
  assert.match(html, /Explore with sample data/);
  assert.match(html, /Skip setup for now/);
  function Probe() {
    const { courses, settings, documents } = useAcademic();
    assert.deepEqual(courses, []);
    assert.deepEqual(documents, []);
    assert.equal(settings.priorCredits, 0);
    assert.equal(settings.gradingPolicy?.preset, 'custom');
    return null;
  }
  renderToString(<AcademicProvider><Probe /></AcademicProvider>);
});

test('legacy profile names and course titles never trigger destructive migration', () => {
  const settings = { ...INITIAL_USER_SETTINGS, studentName: 'Alex Mercer' };
  const courses = [{ ...INITIAL_COURSES[0], name: 'Consensus Systems' }];
  records.set(STORAGE_KEYS.settings, JSON.stringify(settings));
  records.set(STORAGE_KEYS.courses, JSON.stringify(courses));
  assert.deepEqual(readAcademicField('settings', INITIAL_USER_SETTINGS), settings);
  assert.deepEqual(readAcademicField('courses', []), courses);
  assert.doesNotMatch(renderToString(<App />), /Skip setup for now/);
});

test('unmarked courses show unavailable grades rather than a fabricated A', () => {
  records.set(STORAGE_KEYS.courses, JSON.stringify([{ ...INITIAL_COURSES[0], assessments: [], attendance: { totalClasses: 0, attendedClasses: 0, minThresholdPercent: 75 } }]));
  const html = renderToString(<App />);
  assert.match(html, /No marks yet/);
  assert.match(html, /Attendance not recorded/);
  assert.match(html, /Add your first assessment mark/);
});
