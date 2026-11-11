import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  Calculator,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { LetterGrade } from '../types';
import {
  calculateCGPA,
  calculateCourseScore,
  calculateSemesterGPA,
  letterToGradePoints,
  letterToMinPercent,
  percentageToGrade,
  simulateGradeRescue,
  STANDARD_GRADE_SCALE,
} from '../utils/calculations';

interface GradeRescueViewProps {
  initialCourseId?: string;
  onNavigateToStudy: (docId?: string) => void;
}

export const GradeRescueView: React.FC<GradeRescueViewProps> = ({
  initialCourseId,
  onNavigateToStudy,
}) => {
  const { courses, settings } = useAcademic();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || courses[0]?.id || ''
  );
  const [targetGrade, setTargetGrade] = useState<LetterGrade>('A');

  // Multi-course simulation state: stores projected letter grades for each course
  const [projectedGrades, setProjectedGrades] = useState<{ [courseId: string]: LetterGrade }>(() => {
    const map: { [courseId: string]: LetterGrade } = {};
    for (const c of courses) {
      const current = calculateCourseScore(c, settings.gradingPolicy);
      map[c.id] = current.letter;
    }
    return map;
  });

  // What-if assessment score overrides for the selected course
  const [assessmentOverrides, setAssessmentOverrides] = useState<{ [assId: string]: number }>({});

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const rescueAnalysis = selectedCourse ? simulateGradeRescue(selectedCourse, targetGrade, settings.gradingPolicy) : null;
  const currentScore = selectedCourse ? calculateCourseScore(selectedCourse, settings.gradingPolicy) : null;

  // Compute what-if course grade with current assessment overrides
  const computeWhatIfCourseScore = () => {
    if (!selectedCourse) return null;
    let earnedWeight = 0;
    let totalWeight = 0;

    for (const a of selectedCourse.assessments) {
      totalWeight += a.weightPercent;
      if (a.completed && typeof a.currentScore === 'number') {
        earnedWeight += (a.currentScore / a.maxScore) * a.weightPercent;
      } else {
        const simulatedScore = assessmentOverrides[a.id] !== undefined ? assessmentOverrides[a.id] : a.maxScore * 0.85;
        earnedWeight += (simulatedScore / a.maxScore) * a.weightPercent;
      }
    }

    const percentage = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
    const grade = percentageToGrade(percentage, settings.gradingPolicy);
    return {
      percentage: Number(percentage.toFixed(1)),
      letter: grade.letter,
      gradePoints: grade.gradePoints,
    };
  };

  const whatIfCourseResult = computeWhatIfCourseScore();

  // Multi-course simulated CGPA calculation
  const computeSimulatedCGPA = () => {
    let semesterQualityPoints = 0;
    let semesterCredits = 0;

    for (const c of courses) {
      const gradeLetter = projectedGrades[c.id] || 'B';
      const points = letterToGradePoints(gradeLetter, settings.gradingPolicy);
      semesterQualityPoints += c.credits * points;
      semesterCredits += c.credits;
    }

    const simSemesterGpa = semesterCredits > 0 ? semesterQualityPoints / semesterCredits : 0;
    const priorPoints = settings.priorCredits * settings.priorCgpa;
    const totalCredits = settings.priorCredits + semesterCredits;
    const simCgpa = totalCredits > 0 ? (priorPoints + semesterQualityPoints) / totalCredits : simSemesterGpa;

    return {
      simulatedSemesterGpa: Number(simSemesterGpa.toFixed(2)),
      simulatedCgpa: Number(simCgpa.toFixed(2)),
      totalCredits,
    };
  };

  const simulatedCgpaResult = computeSimulatedCGPA();
  const currentCgpa = calculateCGPA(courses, settings.priorCredits, settings.priorCgpa, settings.gradingPolicy);

  // Auto-solve optimal distribution to hit target CGPA
  const handleAutoSolveOptimal = () => {
    const updated: { [courseId: string]: LetterGrade } = {};
    const semesterCredits = courses.reduce((acc, c) => acc + c.credits, 0);
    const totalCreditsNeeded = settings.priorCredits + semesterCredits;
    const totalQualityPointsNeeded = totalCreditsNeeded * settings.targetCgpa;
    const priorQualityPoints = settings.priorCredits * settings.priorCgpa;
    const semesterPointsNeeded = Math.max(0, totalQualityPointsNeeded - priorQualityPoints);
    const requiredSemesterGpa = semesterCredits > 0 ? semesterPointsNeeded / semesterCredits : 3.8;

    courses.forEach((c) => {
      if (requiredSemesterGpa >= 3.85) {
        updated[c.id] = 'A';
      } else if (requiredSemesterGpa >= 3.5) {
        updated[c.id] = c.credits >= 4 ? 'A' : 'A-';
      } else if (requiredSemesterGpa >= 3.2) {
        updated[c.id] = c.credits >= 4 ? 'A-' : 'B+';
      } else if (requiredSemesterGpa >= 2.8) {
        updated[c.id] = 'B';
      } else {
        updated[c.id] = 'B-';
      }
    });

    setProjectedGrades(updated);
  };

  const feasibilityStyles = {
    already_secured: {
      badge: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      label: 'Guaranteed Lock',
    },
    feasible: {
      badge: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      label: 'High Feasibility',
    },
    challenging: {
      badge: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      label: 'Challenging',
    },
    extreme: {
      badge: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      label: 'Extreme Stretch',
    },
    impossible: {
      badge: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      label: 'Mathematically Impossible',
    },
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-amber-500" />
            <span>Grade Rescue "What-If" Simulator</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Solve reverse target grades, compute required exam scores, and simulate semester CGPA trajectories
          </p>
        </div>

        <button
          onClick={handleAutoSolveOptimal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-xs w-fit"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Solve Target CGPA ({settings.targetCgpa.toFixed(2)})</span>
        </button>
      </div>

      {/* Top Section: Course-Level Solver */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Course Selector and Solver Engine */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
            
            {/* Course Selector Tabs */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Select Course to Rescue
              </label>
              <div className="flex flex-wrap gap-2">
                {courses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCourseId(c.id);
                      setAssessmentOverrides({});
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      selectedCourseId === c.id
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="font-mono font-bold mr-1">{c.code}</span>
                    <span className="opacity-80">({c.credits} cr)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Grade Selector */}
            {selectedCourse && rescueAnalysis && currentScore && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Target Final Letter Grade for {selectedCourse.code}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Current: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentScore.letter} ({currentScore.currentPercentage}%)</span> with {currentScore.remainingWeight}% weight remaining
                    </p>
                  </div>

                  {/* Letter Grade Buttons from active policy */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {(settings.gradingPolicy?.scale || STANDARD_GRADE_SCALE)
                      .filter((s) => s.letter !== 'F')
                      .map((grade) => (
                        <button
                          key={grade.letter}
                          onClick={() => setTargetGrade(grade.letter)}
                          className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                            targetGrade === grade.letter
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                          title={`Requires ≥ ${grade.minPercent}% under ${settings.gradingPolicy?.name || 'Grading Scale'}`}
                        >
                          <span>{grade.letter}</span>
                          <span className="text-[10px] font-normal opacity-70">
                            ≥{grade.minPercent}%
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* D+ Footnote / Configurable Policy Note */}
                {targetGrade === 'D+' && settings.gradingPolicy?.policyNoteDPlus && (
                  <div className="mb-3 text-[11px] text-amber-700 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-2.5 flex items-start gap-2 font-medium">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <span className="font-semibold text-amber-800 dark:text-amber-200">D+ Policy Note (*):</span>{' '}
                      {settings.gradingPolicy.policyNoteDPlus}
                    </div>
                  </div>
                )}

                {/* Solver Result Banner */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                            feasibilityStyles[rescueAnalysis.feasibility].badge
                          }`}
                        >
                          {feasibilityStyles[rescueAnalysis.feasibility].label}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {settings.gradingPolicy?.name || 'Scale'}: Target {rescueAnalysis.targetLetter} (≥ {rescueAnalysis.targetPercent}%)
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium leading-relaxed">
                        {rescueAnalysis.summaryMessage}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-500 font-medium">Required Avg</div>
                      <div className={`text-2xl font-bold font-mono tabular-nums ${
                        rescueAnalysis.requiredAverageOnRemaining > 100
                          ? 'text-rose-500'
                          : rescueAnalysis.requiredAverageOnRemaining > 90
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}>
                        {rescueAnalysis.requiredAverageOnRemaining}%
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        across {rescueAnalysis.remainingWeight}% work
                      </div>
                    </div>
                  </div>

                  {/* Math Formula breakdown */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <div>
                      Points Earned: <span className="font-semibold text-slate-800 dark:text-slate-200">{rescueAnalysis.earnedWeightPoints} pts</span>
                    </div>
                    <div>
                      Points Needed: <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.max(0, rescueAnalysis.targetPercent - rescueAnalysis.earnedWeightPoints).toFixed(1)} pts</span>
                    </div>
                    <div>
                      Max Possible: <span className="font-semibold text-slate-800 dark:text-slate-200">{rescueAnalysis.maxAchievablePercent}%</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* What-If Assessment Overrides Slider Box */}
            {selectedCourse && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Interactive What-If Scenario for Upcoming Assignments
                  </h4>
                  <button
                    onClick={() => setAssessmentOverrides({})}
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 font-mono"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedCourse.assessments.map((a) => {
                    const isUpcoming = !a.completed;
                    const simulatedScore =
                      assessmentOverrides[a.id] !== undefined
                        ? assessmentOverrides[a.id]
                        : a.completed && typeof a.currentScore === 'number'
                        ? a.currentScore
                        : Math.round(a.maxScore * 0.85);

                    return (
                      <div
                        key={a.id}
                        className={`p-3 rounded-lg border text-xs ${
                          isUpcoming
                            ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{a.name}</span>
                            <span className="font-mono text-[11px] text-slate-500">
                              ({a.weightPercent}% weight)
                            </span>
                            {isUpcoming && (
                              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.2 rounded">
                                Simulation Target
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                            <span>{simulatedScore}</span>
                            <span className="text-slate-400">/ {a.maxScore} pts</span>
                            <span className="text-slate-500 font-normal">
                              ({((simulatedScore / a.maxScore) * 100).toFixed(0)}%)
                            </span>
                          </div>
                        </div>

                        {/* Slider for upcoming tasks */}
                        {isUpcoming ? (
                          <input
                            type="range"
                            min={0}
                            max={a.maxScore}
                            step={1}
                            value={simulatedScore}
                            onChange={(e) =>
                              setAssessmentOverrides({
                                ...assessmentOverrides,
                                [a.id]: Number(e.target.value),
                              })
                            }
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        ) : (
                          <div className="text-[11px] text-slate-500 font-mono">
                            Completed score locked in at {a.currentScore}/{a.maxScore} pts
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Projected outcome banner */}
                {whatIfCourseResult && (
                  <div className="p-3 rounded-lg bg-slate-900 text-white flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-slate-400">Projected Course Grade with Simulation:</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-emerald-400">{whatIfCourseResult.letter}</span>
                      <span className="text-slate-300">({whatIfCourseResult.percentage}%)</span>
                      <span className="text-slate-400">· {whatIfCourseResult.gradePoints.toFixed(1)} GP</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Right 1 Col: Multi-Course Semester CGPA Planner */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <span>Semester CGPA Trajectory</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Target: {settings.targetCgpa.toFixed(2)} CGPA
                </p>
              </div>
            </div>

            {/* Comparison Metrics */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Simulated Semester GPA</div>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  {simulatedCgpaResult.simulatedSemesterGpa.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Simulated Final CGPA</div>
                <div className={`text-2xl font-bold font-mono mt-0.5 ${
                  simulatedCgpaResult.simulatedCgpa >= settings.targetCgpa
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-500'
                }`}>
                  {simulatedCgpaResult.simulatedCgpa.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Current Real Standing Banner */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
              <span>
                Finalized CGPA:{' '}
                <strong className="font-mono text-slate-800 dark:text-slate-200">
                  {currentCgpa.finalizedCgpa !== null ? currentCgpa.finalizedCgpa.toFixed(2) : 'In Progress'}
                </strong>
              </span>
              <span>
                Current Projected:{' '}
                <strong className="font-mono text-slate-800 dark:text-slate-200">
                  {currentCgpa.projectedCgpa.toFixed(2)}
                </strong>
              </span>
            </div>

            {/* Target Status Verdict */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              {simulatedCgpaResult.simulatedCgpa >= settings.targetCgpa ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Goal Achieved! Cumulative target of {settings.targetCgpa.toFixed(2)} will be met with this trajectory.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Short by {(settings.targetCgpa - simulatedCgpaResult.simulatedCgpa).toFixed(2)} pts. Increase grades in higher-credit courses (4 cr).
                  </span>
                </div>
              )}
            </div>

            {/* Quick Letter Grade Adjuster for each course */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Projected Grades by Course:
              </label>

              <div className="space-y-2">
                {courses.map((course) => {
                  const currentProj = projectedGrades[course.id] || 'B';
                  return (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/20"
                    >
                      <div className="truncate mr-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {course.code}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1.5 font-mono">
                          ({course.credits} cr)
                        </span>
                      </div>

                      <select
                        value={currentProj}
                        onChange={(e) =>
                          setProjectedGrades({
                            ...projectedGrades,
                            [course.id]: e.target.value as LetterGrade,
                          })
                        }
                        className="px-2 py-1 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        {(settings.gradingPolicy?.scale || STANDARD_GRADE_SCALE).map((g) => (
                          <option key={g.letter} value={g.letter}>
                            {g.letter} ({g.gradePoints.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => onNavigateToStudy()}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span>Review High-Yield Notes in Study Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
