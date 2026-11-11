/**
 * Automated Verification Suite for Gradia AI Academic OS
 * Validates MAJU Undergraduate Grading Scale, Assessment Weightage Policies,
 * GPA / CGPA separation, and Grade Rescue what-if mathematics.
 */

import {
  DEFAULT_MAJU_POLICY,
  DEFAULT_CUSTOM_POLICY,
  MAJU_GRADE_SCALE,
  MAJU_ASSESSMENT_LIMITS,
  percentageToGrade,
  letterToGradePoints,
  letterToMinPercent,
  calculateCourseScore,
  calculateSemesterGPA,
  calculateCGPA,
  simulateGradeRescue,
  validateCourseAssessmentWeights,
} from '../src/utils/calculations';
import { Course, Assessment, UniversityGradingPolicy } from '../src/types';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, failureDetail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (failureDetail) {
      console.error(`    Detail: ${failureDetail}`);
    }
  }
}

console.log('\n============================================================');
console.log('🧪 GRADIA ACADEMIC OS — MAJU GRADING ENGINE TEST SUITE');
console.log('============================================================\n');

// -------------------------------------------------------------
// 1. MAJU GRADE BOUNDARIES & RAW PERCENTAGE TESTS
// -------------------------------------------------------------
console.log('--- 1. MAJU Undergraduate Grade Boundaries (Raw Percentage) ---');

const boundaryCases: Array<{ percent: number; expectedLetter: string; expectedGp: number }> = [
  { percent: 100, expectedLetter: 'A', expectedGp: 4.00 },
  { percent: 86.00, expectedLetter: 'A', expectedGp: 4.00 },
  { percent: 85.99, expectedLetter: 'A-', expectedGp: 3.67 }, // Crucial: raw percentage does not round up to 86
  { percent: 82.00, expectedLetter: 'A-', expectedGp: 3.67 },
  { percent: 81.99, expectedLetter: 'B+', expectedGp: 3.33 },
  { percent: 78.00, expectedLetter: 'B+', expectedGp: 3.33 },
  { percent: 77.99, expectedLetter: 'B', expectedGp: 3.00 },
  { percent: 74.00, expectedLetter: 'B', expectedGp: 3.00 },
  { percent: 73.99, expectedLetter: 'B-', expectedGp: 2.67 },
  { percent: 70.00, expectedLetter: 'B-', expectedGp: 2.67 },
  { percent: 69.99, expectedLetter: 'C+', expectedGp: 2.33 },
  { percent: 66.00, expectedLetter: 'C+', expectedGp: 2.33 },
  { percent: 65.99, expectedLetter: 'C', expectedGp: 2.00 },
  { percent: 62.00, expectedLetter: 'C', expectedGp: 2.00 },
  { percent: 61.99, expectedLetter: 'C-', expectedGp: 1.67 },
  { percent: 58.00, expectedLetter: 'C-', expectedGp: 1.67 },
  { percent: 57.99, expectedLetter: 'D+', expectedGp: 1.33 },
  { percent: 54.00, expectedLetter: 'D+', expectedGp: 1.33 },
  { percent: 53.99, expectedLetter: 'D', expectedGp: 1.00 },
  { percent: 50.00, expectedLetter: 'D', expectedGp: 1.00 },
  { percent: 49.99, expectedLetter: 'F', expectedGp: 0.00 },
  { percent: 25.00, expectedLetter: 'F', expectedGp: 0.00 },
  { percent: 0.00, expectedLetter: 'F', expectedGp: 0.00 },
];

boundaryCases.forEach(({ percent, expectedLetter, expectedGp }) => {
  const result = percentageToGrade(percent, DEFAULT_MAJU_POLICY);
  assert(
    result.letter === expectedLetter && Math.abs(result.gradePoints - expectedGp) < 0.001,
    `Boundary ${percent}% maps to ${expectedLetter} (${expectedGp} GP)`,
    `Received letter=${result.letter}, gp=${result.gradePoints}`
  );
});

// -------------------------------------------------------------
// 2. CONFIGURABLE ROUNDING POLICIES
// -------------------------------------------------------------
console.log('\n--- 2. Configurable Rounding Policy Behavior ---');

const roundIntegerPolicy: UniversityGradingPolicy = {
  ...DEFAULT_MAJU_POLICY,
  roundingMode: 'round_integer',
};
const ceilPolicy: UniversityGradingPolicy = {
  ...DEFAULT_MAJU_POLICY,
  roundingMode: 'ceil',
};
const floorPolicy: UniversityGradingPolicy = {
  ...DEFAULT_MAJU_POLICY,
  roundingMode: 'floor',
};

// 85.5% with integer round becomes 86.0% -> A
const stdRes = percentageToGrade(85.5, roundIntegerPolicy);
assert(stdRes.letter === 'A', 'Round integer: 85.5% rounds to 86.0% -> A');

// 85.4% with integer round stays 85.0% -> A-
const stdResBelow = percentageToGrade(85.4, roundIntegerPolicy);
assert(stdResBelow.letter === 'A-', 'Round integer: 85.4% rounds to 85.0% -> A-');

// 85.01% with ceil becomes 86.0% -> A
const ceilRes = percentageToGrade(85.01, ceilPolicy);
assert(ceilRes.letter === 'A', 'Ceil rounding: 85.01% ceils to 86.0% -> A');

// 85.99% with floor becomes 85.0% -> A-
const floorRes = percentageToGrade(85.99, floorPolicy);
assert(floorRes.letter === 'A-', 'Floor rounding: 85.99% floors to 85.0% -> A-');

// Default raw policy: 85.99% remains A- (NO rounding)
const rawRes = percentageToGrade(85.99, DEFAULT_MAJU_POLICY);
assert(rawRes.letter === 'A-', 'Raw mode: 85.99% remains unrounded -> A-');

// -------------------------------------------------------------
// 3. WEIGHTED ASSESSMENT & COURSE SCORE CALCULATIONS
// -------------------------------------------------------------
console.log('\n--- 3. Weighted Assessment Calculations ---');

const sampleAssessments: Assessment[] = [
  { id: 'a1', name: 'Midterm', category: 'midterm', weightPercent: 25, maxScore: 100, currentScore: 88, completed: true },
  { id: 'a2', name: 'Assignments', category: 'coursework', weightPercent: 15, maxScore: 50, currentScore: 45, completed: true }, // 90%
  { id: 'a3', name: 'Quiz', category: 'coursework', weightPercent: 15, maxScore: 20, currentScore: 18, completed: true }, // 90%
  { id: 'a4', name: 'Final Exam', category: 'final', weightPercent: 45, maxScore: 100, currentScore: undefined, completed: false },
];

const mockCourse: Course = {
  id: 'cs301',
  code: 'CS 301',
  name: 'Operating Systems',
  credits: 3,
  instructor: 'Dr. Tariq',
  room: 'CS Lab 2',
  schedule: 'Mon/Wed 10:00 AM',
  color: 'indigo',
  targetGrade: 'A',
  assessments: sampleAssessments,
  attendance: { totalClasses: 30, attendedClasses: 28, minThresholdPercent: 75 },
};

const scoreResult = calculateCourseScore(mockCourse, DEFAULT_MAJU_POLICY);
// Midterm: (88/100)*25 = 22 pts
// Assignments: (45/50)*15 = 13.5 pts
// Quiz: (18/20)*15 = 13.5 pts
// Total earned weight points = 22 + 13.5 + 13.5 = 49.0 pts
// Completed weight = 25 + 15 + 15 = 55%
// Current percentage on completed work = (49 / 55) * 100 = 89.09% -> A under MAJU
// Remaining weight = 45%
// Max achievable = 49 + 45 = 94.0%
assert(Math.abs(scoreResult.earnedWeightPoints - 49.0) < 0.01, 'Earned weight points equals 49.0');
assert(scoreResult.completedWeight === 55, 'Completed weight equals 55%');
assert(scoreResult.remainingWeight === 45, 'Remaining weight equals 45%');
assert(scoreResult.isFullyCompleted === false, 'Course is identified as in-progress');
assert(scoreResult.letter === 'A', 'Current performance of 89.09% maps to A');
assert(Math.abs(scoreResult.maxPossiblePercentage - 94.0) < 0.01, 'Max achievable percent is 94.0%');

// -------------------------------------------------------------
// 4. GRADE RESCUE & IMPOSSIBLE TARGET CALCULATIONS
// -------------------------------------------------------------
console.log('\n--- 4. Grade Rescue What-If Calculations ---');

// Case A: Target 'A' under MAJU requires 86%.
// Earned = 49 pts out of 55% completed. Remaining = 45%.
// Points needed = 86 - 49 = 37 pts.
// Required average on remaining 45% = (37 / 45) * 100 = 82.22%
const rescueA = simulateGradeRescue(mockCourse, 'A', DEFAULT_MAJU_POLICY);
assert(rescueA.targetPercent === 86, 'MAJU target A requires 86%');
assert(Math.abs(rescueA.requiredAverageOnRemaining - 82.2) <= 0.1, `Required score on final exam is ~82.2% (got ${rescueA.requiredAverageOnRemaining}%)`);
assert(rescueA.feasibility === 'challenging', 'Target A is challenging (82.2% required on remaining 45%)');

// Case B: Impossible Target Test
// Create a course with low completed scores such that reaching A (86%) is mathematically impossible
const lowScoreCourse: Course = {
  ...mockCourse,
  assessments: [
    { id: 'l1', name: 'Midterm', category: 'midterm', weightPercent: 25, maxScore: 100, currentScore: 50, completed: true }, // (50/100)*25 = 12.5 pts
    { id: 'l2', name: 'Coursework', category: 'coursework', weightPercent: 30, maxScore: 100, currentScore: 50, completed: true }, // (50/100)*30 = 15.0 pts
    { id: 'l3', name: 'Final Exam', category: 'final', weightPercent: 45, maxScore: 100, currentScore: undefined, completed: false }, // max 45 pts
  ],
};
// Total earned = 12.5 + 15 = 27.5 pts
// Max achievable = 27.5 + 45 = 72.5%
// Target 'A' (86%) requires 86 - 27.5 = 58.5 pts out of 45 pts -> (58.5/45)*100 = 130.0%
const rescueImpossible = simulateGradeRescue(lowScoreCourse, 'A', DEFAULT_MAJU_POLICY);
assert(rescueImpossible.maxAchievablePercent === 72.5, 'Max achievable percent is 72.5%');
assert(rescueImpossible.feasibility === 'impossible', 'Correctly flags target A as mathematically impossible');
assert(rescueImpossible.requiredAverageOnRemaining > 100, 'Required average exceeds 100%');
assert(rescueImpossible.summaryMessage.includes('impossible'), 'Summary message explains mathematical impossibility');

// -------------------------------------------------------------
// 5. SEMESTER GPA & CGPA WITH FINALIZED VS PROJECTED SEPARATION
// -------------------------------------------------------------
console.log('\n--- 5. GPA & CGPA Calculation with Finalized vs Projected ---');

const fullyCompletedCourse: Course = {
  id: 'cs302',
  code: 'CS 302',
  name: 'Database Systems',
  credits: 4,
  instructor: 'Dr. Salman',
  room: 'Eng Hall 301',
  schedule: 'Tue/Thu 11:30 AM',
  color: 'emerald',
  targetGrade: 'A',
  assessments: [
    { id: 'd1', name: 'Midterm', category: 'midterm', weightPercent: 25, maxScore: 100, currentScore: 90, completed: true },
    { id: 'd2', name: 'Coursework', category: 'coursework', weightPercent: 25, maxScore: 100, currentScore: 92, completed: true },
    { id: 'd3', name: 'Final Exam', category: 'final', weightPercent: 50, maxScore: 100, currentScore: 88, completed: true },
  ],
  attendance: { totalClasses: 30, attendedClasses: 30, minThresholdPercent: 75 },
};
// CS 302: (90*0.25) + (92*0.25) + (88*0.50) = 22.5 + 23 + 44 = 89.5% -> Grade 'A' (4.00 GP), 4 credits

// Mix of one fully completed course (CS 302: 4 cr, 4.00 GP) and one in-progress course (CS 301: 3 cr, 4.00 GP projected)
const semesterCourses = [mockCourse, fullyCompletedCourse];
const semesterGpa = calculateSemesterGPA(semesterCourses, DEFAULT_MAJU_POLICY);

assert(semesterGpa.totalCredits === 7, 'Total semester enrolled credits = 7');
assert(semesterGpa.finalizedCredits === 4, 'Finalized semester credits = 4');
assert(semesterGpa.finalizedGpa === 4.00, 'Finalized semester GPA = 4.00');
assert(semesterGpa.projectedGpa === 4.00, 'Projected semester GPA = 4.00');

// Test case where NO courses are finalized yet
const onlyInProgressGpa = calculateSemesterGPA([mockCourse], DEFAULT_MAJU_POLICY);
assert(onlyInProgressGpa.finalizedGpa === null, 'Finalized GPA is null when all courses are in progress');
assert(onlyInProgressGpa.projectedGpa === 4.00, 'Projected GPA is computed from active courses');

// Cumulative CGPA calculation
// Prior credits = 60, Prior CGPA = 3.50 -> Prior quality points = 210
// With CS 302 finalized (4 cr, 4.00 GP = 16 quality pts):
// Finalized CGPA = (210 + 16) / (60 + 4) = 226 / 64 = 3.53125 -> 3.53
// With CS 301 projected (3 cr, 4.00 GP = 12 quality pts):
// Projected CGPA = (210 + 16 + 12) / (60 + 4 + 3) = 238 / 67 = 3.5522 -> 3.55
const cgpaRes = calculateCGPA(semesterCourses, 60, 3.50, DEFAULT_MAJU_POLICY);
assert(Math.abs(cgpaRes.finalizedCgpa - 3.53) <= 0.01, `Finalized CGPA correctly computed: ${cgpaRes.finalizedCgpa}`);
assert(Math.abs(cgpaRes.projectedCgpa - 3.55) <= 0.01, `Projected CGPA correctly computed: ${cgpaRes.projectedCgpa}`);
assert(cgpaRes.totalCredits === 67, 'Total cumulative credits = 67');

// -------------------------------------------------------------
// 6. MAJU ASSESSMENT POLICY WEIGHT LIMITS & VALIDATION
// -------------------------------------------------------------
console.log('\n--- 6. MAJU Assessment Weight Policy Validation ---');

// Valid MAJU course: Midterm 25%, Coursework 30%, Final 45%, Total 100%
const validWeights: Assessment[] = [
  { id: 'v1', name: 'Midterm', category: 'midterm', weightPercent: 25, maxScore: 100, completed: false },
  { id: 'v2', name: 'Quiz', category: 'coursework', weightPercent: 10, maxScore: 100, completed: false },
  { id: 'v3', name: 'Assignment', category: 'coursework', weightPercent: 20, maxScore: 100, completed: false },
  { id: 'v4', name: 'Final Exam', category: 'final', weightPercent: 45, maxScore: 100, completed: false },
];
const validVal = validateCourseAssessmentWeights(validWeights, DEFAULT_MAJU_POLICY);
assert(validVal.isValid === true, 'Valid MAJU assessment combination passes validation');
assert(validVal.warnings.length === 0, 'No warnings for compliant assessment weights');

// Midterm too low (< 20%)
const midtermLow: Assessment[] = [
  { id: 'm1', name: 'Midterm', category: 'midterm', weightPercent: 15, maxScore: 100, completed: false },
  { id: 'm2', name: 'Coursework', category: 'coursework', weightPercent: 35, maxScore: 100, completed: false },
  { id: 'm3', name: 'Final Exam', category: 'final', weightPercent: 50, maxScore: 100, completed: false },
];
const midLowVal = validateCourseAssessmentWeights(midtermLow, DEFAULT_MAJU_POLICY);
assert(midLowVal.isValid === false, 'Flags invalid when Midterm < 20%');
assert(midLowVal.warnings.some((w) => w.toLowerCase().includes('midterm')), 'Warning details midterm limit violation');

// Midterm too high (> 25%)
const midtermHigh: Assessment[] = [
  { id: 'm1', name: 'Midterm', category: 'midterm', weightPercent: 30, maxScore: 100, completed: false },
  { id: 'm2', name: 'Coursework', category: 'coursework', weightPercent: 25, maxScore: 100, completed: false },
  { id: 'm3', name: 'Final Exam', category: 'final', weightPercent: 45, maxScore: 100, completed: false },
];
const midHighVal = validateCourseAssessmentWeights(midtermHigh, DEFAULT_MAJU_POLICY);
assert(midHighVal.isValid === false, 'Flags invalid when Midterm > 25%');

// Coursework too low (< 10%)
const cwLow: Assessment[] = [
  { id: 'c1', name: 'Midterm', category: 'midterm', weightPercent: 25, maxScore: 100, completed: false },
  { id: 'c2', name: 'Coursework', category: 'coursework', weightPercent: 8, maxScore: 100, completed: false },
  { id: 'c3', name: 'Final Exam', category: 'final', weightPercent: 50, maxScore: 100, completed: false },
  { id: 'c4', name: 'Extra', category: 'final', weightPercent: 17, maxScore: 100, completed: false },
];
const cwLowVal = validateCourseAssessmentWeights(cwLow, DEFAULT_MAJU_POLICY);
assert(cwLowVal.isValid === false, 'Flags invalid when Coursework < 10%');

// Coursework too high (> 35%)
const cwHigh: Assessment[] = [
  { id: 'c1', name: 'Midterm', category: 'midterm', weightPercent: 20, maxScore: 100, completed: false },
  { id: 'c2', name: 'Coursework', category: 'coursework', weightPercent: 40, maxScore: 100, completed: false },
  { id: 'c3', name: 'Final Exam', category: 'final', weightPercent: 40, maxScore: 100, completed: false },
];
const cwHighVal = validateCourseAssessmentWeights(cwHigh, DEFAULT_MAJU_POLICY);
assert(cwHighVal.isValid === false, 'Flags invalid when Coursework > 35%');

// Final Exam too low (< 40%)
const finalLow: Assessment[] = [
  { id: 'f1', name: 'Midterm', category: 'midterm', weightPercent: 25, maxScore: 100, completed: false },
  { id: 'f2', name: 'Coursework', category: 'coursework', weightPercent: 35, maxScore: 100, completed: false },
  { id: 'f3', name: 'Final Exam', category: 'final', weightPercent: 35, maxScore: 100, completed: false },
  { id: 'f4', name: 'Quiz', category: 'coursework', weightPercent: 5, maxScore: 100, completed: false },
];
const finalLowVal = validateCourseAssessmentWeights(finalLow, DEFAULT_MAJU_POLICY);
assert(finalLowVal.isValid === false, 'Flags invalid when Final < 40%');

// Final Exam too high (> 50%)
const finalHigh: Assessment[] = [
  { id: 'f1', name: 'Midterm', category: 'midterm', weightPercent: 20, maxScore: 100, completed: false },
  { id: 'f2', name: 'Coursework', category: 'coursework', weightPercent: 25, maxScore: 100, completed: false },
  { id: 'f3', name: 'Final Exam', category: 'final', weightPercent: 55, maxScore: 100, completed: false },
];
const finalHighVal = validateCourseAssessmentWeights(finalHigh, DEFAULT_MAJU_POLICY);
assert(finalHighVal.isValid === false, 'Flags invalid when Final > 50%');

// Total weight not equal to 100%
const sumInvalid: Assessment[] = [
  { id: 's1', name: 'Midterm', category: 'midterm', weightPercent: 25, maxScore: 100, completed: false },
  { id: 's2', name: 'Coursework', category: 'coursework', weightPercent: 25, maxScore: 100, completed: false },
  { id: 's3', name: 'Final Exam', category: 'final', weightPercent: 45, maxScore: 100, completed: false },
]; // total = 95%
const sumVal = validateCourseAssessmentWeights(sumInvalid, DEFAULT_MAJU_POLICY);
assert(sumVal.isValid === false, 'Flags invalid when total weight != 100% (e.g. 95%)');
assert(sumVal.warnings.some((w) => w.includes('95%')), 'Warning message specifies exact total weight (95%)');

// -------------------------------------------------------------
// 7. ATTENDANCE HEADROOM & RECOVERY CALCULATIONS
// -------------------------------------------------------------
console.log('\n--- 7. Attendance Headroom & Recovery Calculations ---');

// Case A: 28 attended out of 30 classes (93.3%)
// Threshold 75%. Safe to miss = Math.floor((28 - 0.75*30) / 0.75) = Math.floor((28 - 22.5) / 0.75) = Math.floor(5.5 / 0.75) = 7
const attendedA = 28;
const totalA = 30;
const percentA = (attendedA / totalA) * 100;
const safeToMissA = Math.floor((attendedA - 0.75 * totalA) / 0.75);
assert(Math.round(percentA) === 93, 'Attendance percentage 28/30 is ~93%');
assert(safeToMissA === 7, `Safe to miss headroom correctly equals 7 classes (calculated: ${safeToMissA})`);

// Case B: 18 attended out of 25 classes (72.0%) -> Below 75% threshold
// Needed consecutive = Math.ceil((0.75 * 25 - 18) / 0.25) = Math.ceil((18.75 - 18) / 0.25) = Math.ceil(0.75 / 0.25) = 3
const attendedB = 18;
const totalB = 25;
const percentB = (attendedB / totalB) * 100;
const neededConsecutiveB = Math.ceil((0.75 * totalB - attendedB) / 0.25);
assert(percentB === 72, 'Attendance percentage 18/25 is 72%');
assert(neededConsecutiveB === 3, `Needed consecutive attendance to recover 75% is 3 classes (calculated: ${neededConsecutiveB})`);

// Verify recovery: after attending 3 more: attended = 21, total = 28 -> 21/28 = 75.0%
const recoveredPercent = ((attendedB + neededConsecutiveB) / (totalB + neededConsecutiveB)) * 100;
assert(recoveredPercent >= 75.0, `After 3 consecutive attendances, rate reaches ${recoveredPercent}% >= 75%`);

// -------------------------------------------------------------
// 8. ADAPTIVE WEAK-TOPIC EXTRACTION LOGIC
// -------------------------------------------------------------
console.log('\n--- 8. Diagnostic Quiz Weak-Topic Detection ---');

const sampleQuestions = [
  { id: 'q1', topic: 'Dynamic Programming', userSelectedAnswer: 0, correctAnswer: 1 }, // incorrect
  { id: 'q2', topic: 'Dynamic Programming', userSelectedAnswer: 2, correctAnswer: 3 }, // incorrect
  { id: 'q3', topic: 'Graph Algorithms', userSelectedAnswer: 1, correctAnswer: 1 }, // correct
  { id: 'q4', topic: 'Graph Algorithms', userSelectedAnswer: 0, correctAnswer: 1 }, // incorrect
  { id: 'q5', topic: 'Sorting Complexity', userSelectedAnswer: 2, correctAnswer: 2 }, // correct
];

const topicStats: Record<string, { total: number; incorrect: number }> = {};
sampleQuestions.forEach((q) => {
  if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, incorrect: 0 };
  topicStats[q.topic].total += 1;
  if (q.userSelectedAnswer !== q.correctAnswer) {
    topicStats[q.topic].incorrect += 1;
  }
});

const weakTopics = Object.entries(topicStats)
  .filter(([_, stats]) => (stats.incorrect / stats.total) >= 0.5)
  .map(([topic]) => topic);

assert(weakTopics.includes('Dynamic Programming'), 'Identifies Dynamic Programming as weak topic (0% accuracy)');
assert(weakTopics.includes('Graph Algorithms'), 'Identifies Graph Algorithms as weak topic (50% error rate)');
assert(!weakTopics.includes('Sorting Complexity'), 'Excludes Sorting Complexity from weak topics (100% accuracy)');

// -------------------------------------------------------------
// SUMMARY REPORT
// -------------------------------------------------------------
console.log('\n============================================================');
console.log(`Test Execution Finished: ${passedTests}/${totalTests} Passed`);
console.log('============================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
