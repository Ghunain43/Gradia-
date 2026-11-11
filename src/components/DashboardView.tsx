import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import {
  calculateAttendance,
  calculateCGPA,
  calculateCourseScore,
  calculateSemesterGPA,
} from '../utils/calculations';

interface DashboardViewProps {
  onNavigate: (tab: 'dashboard' | 'courses' | 'rescue' | 'study' | 'focus') => void;
  onSelectCourse?: (courseId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectCourse }) => {
  const { courses, quizResults, settings, quickRecordAttendance, documents, revisionPlan } = useAcademic();

  const semesterGpa = calculateSemesterGPA(courses, settings.gradingPolicy);
  const cgpaData = calculateCGPA(courses, settings.priorCredits, settings.priorCgpa, settings.gradingPolicy);

  // Overall attendance
  const totalClasses = courses.reduce((acc, c) => acc + c.attendance.totalClasses, 0);
  const totalAttended = courses.reduce((acc, c) => acc + c.attendance.attendedClasses, 0);
  const overallAttendance = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 100;

  // Identify attendance alerts
  const coursesWithAttendanceRisk = courses
    .map((c) => ({
      course: c,
      analytics: calculateAttendance(c.attendance.totalClasses, c.attendance.attendedClasses, c.attendance.minThresholdPercent),
    }))
    .filter((item) => item.analytics.isAtRisk || item.analytics.status === 'warning');

  // Collect all weak topics
  const allWeakTopics = Array.from(new Set(quizResults.flatMap((r) => r.weakTopics).filter(Boolean)));

  // Upcoming incomplete assessments sorted
  const upcomingAssessments = courses
    .flatMap((c) =>
      c.assessments
        .filter((a) => !a.completed)
        .map((a) => ({ ...a, courseCode: c.code, courseColor: c.color, courseId: c.id }))
    )
    .slice(0, 5);

  const gpaDelta = Number((cgpaData.projectedCgpa - settings.targetCgpa).toFixed(2));

  return (
    <div className="space-y-6">
      
      {/* Welcome & Student Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome back, {settings.studentName}
            </h1>
            <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {settings.gradingPolicy?.name || 'MAJU Undergraduate'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>{settings.university}</span>
            <span aria-hidden="true">·</span>
            <span>{settings.faculty || 'Faculty of Computing'}</span>
            <span aria-hidden="true">·</span>
            <span>{settings.major}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{settings.currentSemester}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('rescue')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulate Grade Rescue</span>
          </button>
          <button
            onClick={() => onNavigate('study')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Revision & Quiz</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid with Finalized vs Projected separation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative GPA Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-medium">Cumulative GPA (CGPA)</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {cgpaData.projectedCgpa.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              / 4.00
            </span>
            <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
              Projected
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <div>
              Finalized: <strong className="font-mono text-slate-700 dark:text-slate-300">{cgpaData.finalizedCgpa.toFixed(2)}</strong>
            </div>
            <div className="font-mono text-[11px]">
              Target: <span className="font-semibold text-slate-700 dark:text-slate-300">{settings.targetCgpa.toFixed(2)}</span> ({gpaDelta >= 0 ? `+${gpaDelta}` : gpaDelta})
            </div>
          </div>
        </div>

        {/* Semester GPA Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-medium">Semester GPA (SGPA)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {semesterGpa.projectedGpa.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              / 4.00
            </span>
            <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold">
              Projected
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <div>
              Finalized:{' '}
              <strong className="font-mono text-slate-700 dark:text-slate-300">
                {semesterGpa.finalizedGpa !== null ? `${semesterGpa.finalizedGpa.toFixed(2)}` : 'In Progress'}
              </strong>
            </div>
            <div className="font-mono text-[11px]">
              {semesterGpa.finalizedCredits}/{semesterGpa.totalCredits} cr done
            </div>
          </div>
        </div>

        {/* Total Academic Credits */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-medium">Credits Earned / Enrolled</span>
            <BookOpen className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {cgpaData.totalCredits}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              credits
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">+{semesterGpa.totalCredits}</span> this term
            <span className="mx-1">·</span>
            <span>{settings.priorCredits} completed</span>
          </div>
        </div>

        {/* Overall Attendance Rate */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="font-medium">Overall Attendance</span>
            <UserCheck className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tabular-nums ${
              overallAttendance >= 75 ? 'text-slate-900 dark:text-slate-100' : 'text-amber-500'
            }`}>
              {overallAttendance.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              avg
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            {totalAttended} attended of {totalClasses} classes
          </div>
        </div>
      </div>

      {/* Urgent Alerts Notification Section (if attendance risk or low grades exist) */}
      {coursesWithAttendanceRisk.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-300/40 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Attendance Threshold Attention Required
              </h3>
              <div className="mt-1 space-y-1 text-xs text-amber-800 dark:text-amber-300/90">
                {coursesWithAttendanceRisk.map(({ course, analytics }) => (
                  <p key={course.id}>
                    <strong className="font-semibold">{course.code} ({course.name}):</strong> Attendance is at{' '}
                    <span className="font-mono font-bold">{analytics.percentage}%</span> (minimum required:{' '}
                    <span className="font-mono">{course.attendance.minThresholdPercent}%</span>).{' '}
                    {analytics.isAtRisk ? (
                      <span className="underline decoration-amber-400 font-medium">
                        Must attend the next {analytics.neededConsecutive} consecutive classes to restore safe standing.
                      </span>
                    ) : (
                      <span>Close to threshold; only {analytics.safeToMiss} absence remaining.</span>
                    )}
                  </p>
                ))}
              </div>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Enrolled Courses & Academic Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans): Enrolled Courses Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Active Enrolled Courses
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time assessment scores and rapid attendance logging
              </p>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {courses.map((course) => {
              const score = calculateCourseScore(course, settings.gradingPolicy);
              const attendance = calculateAttendance(
                course.attendance.totalClasses,
                course.attendance.attendedClasses,
                course.attendance.minThresholdPercent
              );

              return (
                <div
                  key={course.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-800 dark:text-slate-200 shrink-0">
                        {course.code.split(' ')[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {course.code}: {course.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{course.instructor}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{course.credits} Credits</span>
                          <span aria-hidden="true">·</span>
                          <span>{course.schedule}</span>
                        </div>
                      </div>
                    </div>

                    {/* Grade & Score Summary */}
                    <div className="flex items-center gap-4 sm:text-right shrink-0">
                      <div>
                        <div className="flex items-baseline gap-1.5 sm:justify-end">
                          <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                            {score.letter}
                          </span>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            ({score.currentPercentage}%)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {score.gradePoints.toFixed(1)} GP · Target: {course.targetGrade}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Attendance Row */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    
                    {/* Weight completion progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span>Completed Syllabus Weight</span>
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                          {score.completedWeight}% / 100%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${score.completedWeight}%` }}
                        />
                      </div>
                    </div>

                    {/* Attendance quick logger */}
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                          {course.attendance.attendedClasses}/{course.attendance.totalClasses} classes ({attendance.percentage}%)
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {attendance.isAtRisk ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              Need {attendance.neededConsecutive} consecutive
                            </span>
                          ) : (
                            <span>Can miss {attendance.safeToMiss} safely</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => quickRecordAttendance(course.id, true)}
                          title="Record attended class"
                          className="px-2 py-1 text-xs font-semibold rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                        >
                          + Attend
                        </button>
                        <button
                          onClick={() => quickRecordAttendance(course.id, false)}
                          title="Record missed class"
                          className="px-2 py-1 text-xs font-semibold rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                        >
                          + Miss
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Academic Revision & Upcoming Milestones */}
        <div className="space-y-6">
          
          {/* Weak Topics & Adaptive Plan Quick Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Adaptive Revision Focus
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Gemini Engine
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Identified knowledge gaps from recent scored quizzes:
            </p>

            <div className="space-y-1.5 mb-4">
              {allWeakTopics.length > 0 ? (
                allWeakTopics.slice(0, 4).map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <span className="font-medium truncate">{topic}</span>
                    <span className="text-[11px] font-mono text-rose-500 dark:text-rose-400 shrink-0 ml-2">
                      Target
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-2">
                  No weak topics flagged yet. Take a scored quiz to calibrate!
                </p>
              )}
            </div>

            {revisionPlan && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-3">
                <div className="font-medium text-slate-900 dark:text-slate-200">
                  Current Schedule: {revisionPlan.dailySchedules.length} Days Active
                </div>
                <div className="text-[11px] text-slate-500">
                  {revisionPlan.strategyOverview.slice(0, 110)}...
                </div>
              </div>
            )}

            <button
              onClick={() => onNavigate('study')}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs"
            >
              <span>Open Study & AI Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upcoming Major Deadlines */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Upcoming Assessments
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {upcomingAssessments.length} pending
              </span>
            </div>

            <div className="space-y-2.5">
              {upcomingAssessments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs"
                >
                  <div className="truncate mr-2">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {a.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono">{a.courseCode}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{a.weightPercent}% weight</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] font-medium text-indigo-600 dark:text-indigo-400 block">
                      {a.dueDate || 'Soon'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('rescue')}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span>Calculate Required Final Exam Scores</span>
            </button>
          </div>

          {/* Today's High-Yield Actions */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Action Protocol
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Today's Focus
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('rescue')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Check Required Finals Score
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Algorithm Design (CS 311) · 3 credits
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('study')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    Review Space Optimization
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Flagged in recent diagnostic quiz
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-500 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('focus')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    25-Min Deep Work Interval
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Synthesized brown noise concentration
                  </div>
                </div>
                <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
