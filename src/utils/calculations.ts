import {
  Assessment,
  AssessmentPolicyLimits,
  Course,
  GradeScaleEntry,
  LetterGrade,
  UniversityGradingPolicy,
} from '../types';

export const MAJU_DPLUS_NOTE_DEFAULT =
  '* Note on Undergraduate D+: Grade points marked with an asterisk in the MAJU Undergraduate table. Specific degree programs or prerequisite progressions may require a minimum grade of C or higher.';

// Official MAJU Undergraduate Grading Scale
export const MAJU_GRADE_SCALE: GradeScaleEntry[] = [
  { letter: 'A',  minPercent: 86, gradePoints: 4.00 },
  { letter: 'A-', minPercent: 82, gradePoints: 3.67 },
  { letter: 'B+', minPercent: 78, gradePoints: 3.33 },
  { letter: 'B',  minPercent: 74, gradePoints: 3.00 },
  { letter: 'B-', minPercent: 70, gradePoints: 2.67 },
  { letter: 'C+', minPercent: 66, gradePoints: 2.33 },
  { letter: 'C',  minPercent: 62, gradePoints: 2.00 },
  { letter: 'C-', minPercent: 58, gradePoints: 1.67 },
  { letter: 'D+', minPercent: 54, gradePoints: 1.33, note: '*' },
  { letter: 'D',  minPercent: 50, gradePoints: 1.00 },
  { letter: 'F',  minPercent: 0,  gradePoints: 0.00 },
];

export const MAJU_ASSESSMENT_LIMITS: AssessmentPolicyLimits = {
  midtermMin: 20,
  midtermMax: 25,
  courseworkMin: 10,
  courseworkMax: 35,
  finalMin: 40,
  finalMax: 50,
};

export const DEFAULT_MAJU_POLICY: UniversityGradingPolicy = {
  preset: 'maju_undergraduate',
  name: 'MAJU Undergraduate',
  scale: MAJU_GRADE_SCALE,
  policyNoteDPlus: MAJU_DPLUS_NOTE_DEFAULT,
  roundingMode: 'raw', // Do not round percentages before determining letter grades by default
  assessmentLimits: MAJU_ASSESSMENT_LIMITS,
};

// Standard Custom University Scale
export const CUSTOM_DEFAULT_GRADE_SCALE: GradeScaleEntry[] = [
  { letter: 'A+', minPercent: 97, gradePoints: 4.00 },
  { letter: 'A',  minPercent: 93, gradePoints: 4.00 },
  { letter: 'A-', minPercent: 90, gradePoints: 3.70 },
  { letter: 'B+', minPercent: 87, gradePoints: 3.30 },
  { letter: 'B',  minPercent: 83, gradePoints: 3.00 },
  { letter: 'B-', minPercent: 80, gradePoints: 2.70 },
  { letter: 'C+', minPercent: 77, gradePoints: 2.30 },
  { letter: 'C',  minPercent: 73, gradePoints: 2.00 },
  { letter: 'C-', minPercent: 70, gradePoints: 1.70 },
  { letter: 'D+', minPercent: 65, gradePoints: 1.30 },
  { letter: 'D',  minPercent: 60, gradePoints: 1.00 },
  { letter: 'F',  minPercent: 0,  gradePoints: 0.00 },
];

export const CUSTOM_DEFAULT_ASSESSMENT_LIMITS: AssessmentPolicyLimits = {
  midtermMin: 15,
  midtermMax: 30,
  courseworkMin: 10,
  courseworkMax: 40,
  finalMin: 35,
  finalMax: 55,
};

export const DEFAULT_CUSTOM_POLICY: UniversityGradingPolicy = {
  preset: 'custom',
  name: 'Custom University',
  scale: CUSTOM_DEFAULT_GRADE_SCALE,
  policyNoteDPlus: undefined,
  roundingMode: 'raw',
  assessmentLimits: CUSTOM_DEFAULT_ASSESSMENT_LIMITS,
};

// Backwards-compatible alias
export const STANDARD_GRADE_SCALE = MAJU_GRADE_SCALE;

/**
 * Determine letter grade and grade points for a given percentage.
 * Respects the raw percentage requirement unless explicit rounding is enabled.
 */
export function percentageToGrade(
  percentage: number,
  policy: UniversityGradingPolicy = DEFAULT_MAJU_POLICY
): { letter: LetterGrade; gradePoints: number; note?: string } {
  let effectivePercent = Math.max(0, Math.min(100, percentage));

  if (policy.roundingMode === 'round_integer') {
    effectivePercent = Math.round(effectivePercent);
  } else if (policy.roundingMode === 'round_1dec') {
    effectivePercent = Math.round(effectivePercent * 10) / 10;
  } else if (policy.roundingMode === 'ceil') {
    effectivePercent = Math.ceil(effectivePercent);
  } else if (policy.roundingMode === 'floor') {
    effectivePercent = Math.floor(effectivePercent);
  }
  // Default is 'raw': no rounding prior to boundary checks

  const scale = policy.scale && policy.scale.length > 0 ? policy.scale : MAJU_GRADE_SCALE;

  // Scale is sorted from highest minPercent descending
  for (const entry of scale) {
    if (effectivePercent >= entry.minPercent) {
      return {
        letter: entry.letter,
        gradePoints: entry.gradePoints,
        note: entry.note,
      };
    }
  }

  const last = scale[scale.length - 1];
  return {
    letter: last?.letter || 'F',
    gradePoints: last?.gradePoints ?? 0.0,
    note: last?.note,
  };
}

export function letterToMinPercent(
  letter: LetterGrade,
  policy: UniversityGradingPolicy = DEFAULT_MAJU_POLICY
): number {
  const scale = policy.scale && policy.scale.length > 0 ? policy.scale : MAJU_GRADE_SCALE;
  const match = scale.find((e) => e.letter === letter);
  if (match) return match.minPercent;

  // Fallback if requested letter not present in current scale (e.g. A+ in MAJU)
  if (letter === 'A+') return 86;
  return 86;
}

export function letterToGradePoints(
  letter: LetterGrade,
  policy: UniversityGradingPolicy = DEFAULT_MAJU_POLICY
): number {
  const scale = policy.scale && policy.scale.length > 0 ? policy.scale : MAJU_GRADE_SCALE;
  const match = scale.find((e) => e.letter === letter);
  return match ? match.gradePoints : 4.0;
}

export interface CourseScoreSummary {
  earnedWeightPoints: number;    // e.g. 52.5 pts earned of 100
  completedWeight: number;       // e.g. 60% of syllabus completed
  remainingWeight: number;       // e.g. 40% uncompleted
  currentPercentage: number;     // normalized: earnedWeightPoints / completedWeight * 100
  projectedPercentage: number;   // normalized current percentage projected to total
  maxPossiblePercentage: number; // earnedWeightPoints + remainingWeight (if 100% on remainder)
  letter: LetterGrade;
  gradePoints: number;
  hasRecordedScores: boolean;
  isValidConfiguration: boolean;
  isFullyCompleted: boolean;     // true if 100% of weight is completed
}

export function calculateCourseScore(
  course: Course,
  policy: UniversityGradingPolicy = DEFAULT_MAJU_POLICY
): CourseScoreSummary {
  let earnedWeightPoints = 0;
  let completedWeight = 0;

  const validAssessment = (a: Assessment) => Number.isFinite(a.weightPercent) && a.weightPercent >= 0 && a.weightPercent <= 100 && Number.isFinite(a.maxScore) && a.maxScore > 0 && (!a.completed || (Number.isFinite(a.currentScore) && a.currentScore! >= 0 && a.currentScore! <= a.maxScore));
  const configuredWeight = course.assessments.reduce((sum, a) => sum + a.weightPercent, 0);
  const isValidConfiguration = course.assessments.length > 0 && course.assessments.every(validAssessment) && Math.abs(configuredWeight - 100) < 0.000001;
  for (const item of course.assessments) {
    if (validAssessment(item) && item.completed && typeof item.currentScore === 'number' && item.maxScore > 0) {
      completedWeight += item.weightPercent;
      earnedWeightPoints += (item.currentScore / item.maxScore) * item.weightPercent;
    }
  }

  const remainingWeight = Math.max(0, 100 - completedWeight);
  // Current raw percentage on completed portion
  const currentPercentage = completedWeight > 0 ? (earnedWeightPoints / completedWeight) * 100 : 0;
  const maxPossiblePercentage = earnedWeightPoints + remainingWeight;
  const hasRecordedScores = completedWeight > 0 && course.assessments.every(validAssessment) && configuredWeight <= 100.000001;
  const isFullyCompleted = isValidConfiguration && course.assessments.every(a => a.completed) && Math.abs(completedWeight - 100) < 0.000001;

  // Determine grade based on policy (raw percentage default)
  const { letter, gradePoints } = percentageToGrade(currentPercentage, policy);

  return {
    earnedWeightPoints: Number(earnedWeightPoints.toFixed(2)),
    completedWeight: Number(completedWeight.toFixed(2)),
    remainingWeight: Number(remainingWeight.toFixed(2)),
    currentPercentage: Number(currentPercentage.toFixed(2)),
    projectedPercentage: Number(currentPercentage.toFixed(2)),
    maxPossiblePercentage: Number(maxPossiblePercentage.toFixed(2)),
    letter,
    gradePoints,
    hasRecordedScores,
    isValidConfiguration,
    isFullyCompleted,
  };
}

export interface SemesterGpaSummary {
  projectedCredits: number;
  projectedGpa: number;         // Projected GPA based on current scores across all courses
  finalizedGpa: number | null;  // Finalized GPA based only on 100% completed courses (null if none)
  totalCredits: number;         // Total enrolled credit hours
  finalizedCredits: number;     // Credits of fully completed courses
  qualityPoints: number;        // Total projected quality points
  finalizedQualityPoints: number; // Quality points of fully completed courses
  gpa: number;                  // Alias for projectedGpa (backward compatibility)
}

export function calculateSemesterGPA(
  courses: Course[],
  policy: UniversityGradingPolicy = DEFAULT_MAJU_POLICY
): SemesterGpaSummary {
  let totalCredits = 0;
  let totalQualityPoints = 0;
  let projectedCredits = 0;

  let finalizedCredits = 0;
  let finalizedQualityPoints = 0;

  for (const course of courses) {
    const summary = calculateCourseScore(course, policy);
    if (!Number.isFinite(course.credits) || course.credits <= 0) continue;
    totalCredits += course.credits;
    if (summary.hasRecordedScores) {
      projectedCredits += course.credits;
      totalQualityPoints += course.credits * summary.gradePoints;
    }

    if (summary.isFullyCompleted) {
      finalizedCredits += course.credits;
      finalizedQualityPoints += course.credits * summary.gradePoints;
    }
  }

  const projectedGpa = projectedCredits > 0 ? totalQualityPoints / projectedCredits : 0;
  const finalizedGpa = finalizedCredits > 0 ? finalizedQualityPoints / finalizedCredits : null;

  return {
    projectedCredits,
    projectedGpa: Number(projectedGpa.toFixed(2)),
    finalizedGpa: finalizedGpa !== null ? Number(finalizedGpa.toFixed(2)) : null,
    totalCredits,
    finalizedCredits,
    qualityPoints: Number(totalQualityPoints.toFixed(2)),
    finalizedQualityPoints: Number(finalizedQualityPoints.toFixed(2)),
    gpa: Number(projectedGpa.toFixed(2)),
  };
}

export interface CgpaSummary {
  cgpa: number;                  // Projected cumulative CGPA (backward compatibility)
  projectedCgpa: number;         // Projected CGPA including all courses
  finalizedCgpa: number;         // Finalized CGPA incorporating only completed courses
  semesterGpa: number;           // Projected semester GPA
  projectedSemesterGpa: number;  // Projected semester GPA
  finalizedSemesterGpa: number | null; // Finalized semester GPA
  totalCredits: number;          // Total cumulative credit hours
  finalizedCredits: number;      // Total finalized cumulative credit hours
}

export function calculateCGPA(
  courses: Course[],
  priorCredits: number = 0,
  priorCgpa: number = 0,
  policy: UniversityGradingPolicy = DEFAULT_MAJU_POLICY
): CgpaSummary {
  const semester = calculateSemesterGPA(courses, policy);
  const priorQualityPoints = priorCredits * priorCgpa;

  // Projected cumulative
  const totalCredits = priorCredits + semester.totalCredits;
  const totalQualityPoints = priorQualityPoints + semester.qualityPoints;
  const projectedCredits = priorCredits + semester.projectedCredits;
  const projectedCgpa = projectedCredits > 0 ? totalQualityPoints / projectedCredits : 0;

  // Finalized cumulative
  const finalizedCredits = priorCredits + semester.finalizedCredits;
  const finalizedQualityPoints = priorQualityPoints + semester.finalizedQualityPoints;
  const finalizedCgpa = finalizedCredits > 0 ? finalizedQualityPoints / finalizedCredits : priorCgpa;

  return {
    cgpa: Number(projectedCgpa.toFixed(2)),
    projectedCgpa: Number(projectedCgpa.toFixed(2)),
    finalizedCgpa: Number(finalizedCgpa.toFixed(2)),
    semesterGpa: semester.projectedGpa,
    projectedSemesterGpa: semester.projectedGpa,
    finalizedSemesterGpa: semester.finalizedGpa,
    totalCredits,
    finalizedCredits,
  };
}

/**
 * Validation engine for MAJU and University Assessment Weightage Policies
 */
export interface AssessmentWeightValidation {
  isValid: boolean;
  warnings: string[];
  breakdown: {
    midterm: number;
    coursework: number;
    final: number;
    total: number;
  };
}

export function categorizeAssessment(name: string, explicitCategory?: string): 'midterm' | 'coursework' | 'final' {
  if (explicitCategory === 'midterm' || explicitCategory === 'final' || explicitCategory === 'coursework') {
    return explicitCategory;
  }
  const lower = name.toLowerCase();
  if (lower.includes('midterm') || lower.includes('mid-term') || lower.includes('mid term')) {
    return 'midterm';
  }
  if (lower.includes('final exam') || lower.includes('terminal exam') || lower.includes('final examination') || lower.endsWith('final')) {
    return 'final';
  }
  return 'coursework';
}

export function validateCourseAssessmentWeights(
  courseOrAssessments: Course | Assessment[],
  policy: UniversityGradingPolicy = DEFAULT_MAJU_POLICY
): AssessmentWeightValidation {
  const assessments = Array.isArray(courseOrAssessments)
    ? courseOrAssessments
    : courseOrAssessments.assessments;
  const limits = policy.assessmentLimits || MAJU_ASSESSMENT_LIMITS;
  let midterm = 0;
  let coursework = 0;
  let final = 0;
  let total = 0;

  for (const a of assessments) {
    const cat = categorizeAssessment(a.name, a.category);
    total += a.weightPercent;
    if (cat === 'midterm') {
      midterm += a.weightPercent;
    } else if (cat === 'final') {
      final += a.weightPercent;
    } else {
      coursework += a.weightPercent;
    }
  }

  const warnings: string[] = [];

  // Total weight check
  if (total !== 100) {
    warnings.push(
      `Total assessment weight is ${total}% (must equal exactly 100% for a fully configured course).`
    );
  }

  // Midterm limit check
  if (midterm < limits.midtermMin || midterm > limits.midtermMax) {
    warnings.push(
      `Midterm weight is ${midterm}%, which violates the ${policy.name} policy limit of ${limits.midtermMin}–${limits.midtermMax}%.`
    );
  }

  // Coursework combined limit check
  if (coursework < limits.courseworkMin || coursework > limits.courseworkMax) {
    warnings.push(
      `Combined coursework weight (assignments, quizzes, projects) is ${coursework}%, which violates the ${policy.name} policy limit of ${limits.courseworkMin}–${limits.courseworkMax}%.`
    );
  }

  // Final exam limit check
  if (final < limits.finalMin || final > limits.finalMax) {
    warnings.push(
      `Final examination weight is ${final}%, which violates the ${policy.name} policy limit of ${limits.finalMin}–${limits.finalMax}%.`
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    breakdown: {
      midterm,
      coursework,
      final,
      total,
    },
  };
}

export interface AttendanceAnalytics {
  percentage: number;
  isAtRisk: boolean;
  safeToMiss: number;
  neededConsecutive: number;
  status: 'safe' | 'warning' | 'critical';
}

export function calculateAttendance(
  totalClasses: number,
  attendedClasses: number,
  thresholdPercent: number = 75
): AttendanceAnalytics {
  if (totalClasses <= 0) {
    return {
      percentage: 100,
      isAtRisk: false,
      safeToMiss: 0,
      neededConsecutive: 0,
      status: 'safe',
    };
  }

  const percentage = (attendedClasses / totalClasses) * 100;
  const thresholdRatio = thresholdPercent / 100;
  const isAtRisk = percentage < thresholdPercent;

  let safeToMiss = 0;
  let neededConsecutive = 0;

  if (!isAtRisk) {
    safeToMiss = Math.max(0, Math.floor((attendedClasses - thresholdRatio * totalClasses) / thresholdRatio));
  } else {
    neededConsecutive = Math.max(0, Math.ceil((thresholdRatio * totalClasses - attendedClasses) / (1 - thresholdRatio)));
  }

  let status: 'safe' | 'warning' | 'critical' = 'safe';
  if (percentage < thresholdPercent - 5) {
    status = 'critical';
  } else if (percentage < thresholdPercent + 3) {
    status = 'warning';
  }

  return {
    percentage: Number(percentage.toFixed(1)),
    isAtRisk,
    safeToMiss,
    neededConsecutive,
    status,
  };
}

export interface GradeRescueResult {
  targetLetter: LetterGrade;
  targetPercent: number;
  earnedWeightPoints: number;
  remainingWeight: number;
  maxAchievablePercent: number;
  requiredAverageOnRemaining: number;
  feasibility: 'incomplete' | 'already_secured' | 'feasible' | 'challenging' | 'extreme' | 'impossible';
  summaryMessage: string;
}

export function simulateGradeRescue(
  course: Course,
  targetLetter: LetterGrade,
  policy: UniversityGradingPolicy = DEFAULT_MAJU_POLICY
): GradeRescueResult {
  const summary = calculateCourseScore(course, policy);
  const targetPercent = letterToMinPercent(targetLetter, policy);
  const earned = summary.earnedWeightPoints;
  const remaining = summary.remainingWeight;
  const maxAchievable = summary.maxPossiblePercentage;

  if (!summary.isValidConfiguration) return { targetLetter, targetPercent, earnedWeightPoints: earned, remainingWeight: remaining, maxAchievablePercent: 0, requiredAverageOnRemaining: 0, feasibility: 'incomplete', summaryMessage: 'Complete a valid assessment plan totaling 100% with valid marks before using this forecast.' };

  if (remaining <= 0) {
    const isSecured = summary.currentPercentage >= targetPercent;
    return {
      targetLetter,
      targetPercent,
      earnedWeightPoints: earned,
      remainingWeight: remaining,
      maxAchievablePercent: maxAchievable,
      requiredAverageOnRemaining: 0,
      feasibility: isSecured ? 'already_secured' : 'impossible',
      summaryMessage: isSecured
        ? `Target ${targetLetter} (${targetPercent}%) is already locked in! Final score: ${summary.currentPercentage}%.`
        : `Course completed with ${summary.currentPercentage}%. Target ${targetLetter} requires at least ${targetPercent}%.`,
    };
  }

  const pointsNeeded = targetPercent - earned;

  if (pointsNeeded <= 0) {
    return {
      targetLetter,
      targetPercent,
      earnedWeightPoints: earned,
      remainingWeight: remaining,
      maxAchievablePercent: maxAchievable,
      requiredAverageOnRemaining: 0,
      feasibility: 'already_secured',
      summaryMessage: `You have already secured ${earned.toFixed(1)} points, which guarantees an ${targetLetter} (${targetPercent}%) regardless of remaining assessments!`,
    };
  }

  const requiredAverage = (pointsNeeded / remaining) * 100;

  let feasibility: GradeRescueResult['feasibility'] = 'feasible';
  let summaryMessage = '';

  if (requiredAverage > 100) {
    feasibility = 'impossible';
    const highestGrade = percentageToGrade(maxAchievable, policy);
    summaryMessage = `Mathematically impossible to reach ${targetLetter} (${targetPercent}%). Even with 100% on all remaining work, your maximum possible score is ${maxAchievable.toFixed(1)}% (${highestGrade.letter}).`;
  } else if (requiredAverage >= 93) {
    feasibility = 'extreme';
    summaryMessage = `Extreme difficulty: You need an average of ${requiredAverage.toFixed(1)}% across the remaining ${remaining}% course weight to secure an ${targetLetter} (${targetPercent}%).`;
  } else if (requiredAverage >= 82) {
    feasibility = 'challenging';
    summaryMessage = `Challenging but reachable: Target ${requiredAverage.toFixed(1)}% on upcoming tasks to attain ${targetLetter} (${targetPercent}%).`;
  } else {
    feasibility = 'feasible';
    summaryMessage = `Highly achievable: You need ${requiredAverage.toFixed(1)}% on remaining work to secure ${targetLetter} (${targetPercent}%).`;
  }

  return {
    targetLetter,
    targetPercent,
    earnedWeightPoints: earned,
    remainingWeight: remaining,
    maxAchievablePercent: maxAchievable,
    requiredAverageOnRemaining: Number(requiredAverage.toFixed(1)),
    feasibility,
    summaryMessage,
  };
}
