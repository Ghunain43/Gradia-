import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit2,
  FileText,
  Minus,
  Plus,
  Trash2,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { AssessmentCategory, Course, LetterGrade } from '../types';
import {
  calculateAttendance,
  calculateCourseScore,
  categorizeAssessment,
  STANDARD_GRADE_SCALE,
  validateCourseAssessmentWeights,
} from '../utils/calculations';

interface CoursesViewProps {
  onNavigateToStudy: (docId?: string) => void;
  onNavigateToRescue: (courseId?: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  onNavigateToStudy,
  onNavigateToRescue,
}) => {
  const {
    courses,
    documents,
    settings,
    updateCourse,
    deleteCourse,
    updateAssessmentScore,
    addAssessment,
    deleteAssessment,
    addCourse,
  } = useAcademic();

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState<boolean>(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState(4);
  const [newCourseInstructor, setNewCourseInstructor] = useState('');
  const [newCourseRoom, setNewCourseRoom] = useState('');
  const [newCourseSchedule, setNewCourseSchedule] = useState('');
  const [newCourseTargetGrade, setNewCourseTargetGrade] = useState<LetterGrade>('A');

  // New assessment state
  const [addingAssessmentCourseId, setAddingAssessmentCourseId] = useState<string | null>(null);
  const [newAssName, setNewAssName] = useState('');
  const [newAssCategory, setNewAssCategory] = useState<AssessmentCategory>('coursework');
  const [newAssWeight, setNewAssWeight] = useState<number>(20);
  const [newAssMaxScore, setNewAssMaxScore] = useState<number>(100);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;

    addCourse({
      code: newCourseCode.trim(),
      name: newCourseName.trim(),
      credits: Number(newCourseCredits) || 3,
      instructor: newCourseInstructor.trim() || 'Staff',
      room: newCourseRoom.trim() || 'Online / TBA',
      schedule: newCourseSchedule.trim() || 'TBA',
      color: 'indigo',
      targetGrade: newCourseTargetGrade,
      attendance: {
        totalClasses: 0,
        attendedClasses: 0,
        minThresholdPercent: settings.defaultAttendanceThreshold || 75,
      },
      assessments: [],
    });

    setIsAddingCourse(false);
    setNewCourseCode('');
    setNewCourseName('');
    setNewCourseInstructor('');
    setNewCourseRoom('');
    setNewCourseSchedule('');
  };

  const handleCreateAssessment = (courseId: string) => {
    if (!newAssName.trim() || newAssWeight <= 0 || newAssWeight > 100 || newAssMaxScore <= 0) return;

    addAssessment(courseId, {
      name: newAssName.trim(),
      weightPercent: Number(newAssWeight),
      maxScore: Number(newAssMaxScore) || 100,
      completed: false,
      category: newAssCategory,
    });

    setAddingAssessmentCourseId(null);
    setNewAssName('');
    setNewAssCategory('coursework');
    setNewAssWeight(20);
    setNewAssMaxScore(100);
  };

  return (
    <div className="glass-page glass-page-CoursesView space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="glass-page-eyebrow">YOUR SEMESTER, ORGANISED</div><h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            My courses
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your marks, attendance, and next steps. Open a course to update its details.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCourse(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Add Course Form Modal / Panel */}
      {isAddingCourse && (
        <div className="p-5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-900/90 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Add a course
            </h3>
            <button
              onClick={() => setIsAddingCourse(false)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateCourse} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="CoursesView-field-1" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course Code
              </label>
              <input id="CoursesView-field-1"
                type="text"
                placeholder="e.g. CS 301"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="CoursesView-field-2" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course Name
              </label>
              <input id="CoursesView-field-2"
                type="text"
                placeholder="e.g. Distributed Systems"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="CoursesView-field-3" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Credits
              </label>
              <input id="CoursesView-field-3"
                type="number"
                min={1}
                max={12}
                value={newCourseCredits}
                onChange={(e) => setNewCourseCredits(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label htmlFor="CoursesView-field-4" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Grade
              </label>
              <select id="CoursesView-field-4"
                value={newCourseTargetGrade}
                onChange={(e) => setNewCourseTargetGrade(e.target.value as LetterGrade)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              >
                {(settings.gradingPolicy?.scale || STANDARD_GRADE_SCALE).map((g) => (
                  <option key={g.letter} value={g.letter}>
                    {g.letter} ({g.gradePoints.toFixed(1)} GP)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="CoursesView-field-5" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Instructor
              </label>
              <input id="CoursesView-field-5"
                type="text"
                placeholder="e.g. Prof. David Karger"
                value={newCourseInstructor}
                onChange={(e) => setNewCourseInstructor(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="CoursesView-field-6" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Room / Location
              </label>
              <input id="CoursesView-field-6"
                type="text"
                placeholder="e.g. Gates Hall 304"
                value={newCourseRoom}
                onChange={(e) => setNewCourseRoom(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="CoursesView-field-7" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Schedule
              </label>
              <input id="CoursesView-field-7"
                type="text"
                placeholder="e.g. Mon, Wed 10:00 - 11:30 AM"
                value={newCourseSchedule}
                onChange={(e) => setNewCourseSchedule(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Save Course
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses Accordion / List */}
      <div className="space-y-4">
        {courses.map((course) => {
          const isExpanded = expandedCourseId === course.id;
          const score = calculateCourseScore(course, settings.gradingPolicy);
          const attendance = calculateAttendance(
            course.attendance.totalClasses,
            course.attendance.attendedClasses,
            course.attendance.minThresholdPercent
          );
          const linkedNotes = documents.filter((d) => d.courseId === course.id);
          const weightValidation = validateCourseAssessmentWeights(course, settings.gradingPolicy);

          return (
            <div
              key={course.id}
              className={`glass-surface rounded-xl border transition-all ${
                isExpanded
                  ? 'border-indigo-300 dark:border-indigo-800/80 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Collapsed / Header Bar */}
              <button type="button" aria-expanded={isExpanded} aria-label={`Manage ${course.name}`}
                onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                className="w-full text-left p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {course.code.split(' ')[0]}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {course.code}: {course.name}
                      </h3>
                      {attendance.isAtRisk && (
                        <span className="text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                          Attendance {attendance.percentage}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{course.instructor}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{course.credits} Credits</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.schedule}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.room}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:justify-end">
                  <div className="text-right">
                    <div className="flex items-baseline gap-1.5 justify-end">
                      <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                        {score.hasRecordedScores ? score.letter : '—'}
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {score.hasRecordedScores ? `(${score.currentPercentage}%)` : 'No marks yet'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Target: {course.targetGrade} · {score.completedWeight}% Graded
                    </div>
                  </div>

                  <div className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {/* Expanded Details Body */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                  
                  {/* Attendance Control & Analytics Banner */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-indigo-500" />
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                            Your attendance
                          </h4>
                          <span className="text-xs text-slate-500 font-mono">
                            (Min: {course.attendance.minThresholdPercent}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {!course.attendance.totalClasses ? <span>Record your first class to see your attendance.</span> : attendance.isAtRisk ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              Attend the next {attendance.neededConsecutive} consecutive classes to reach {course.attendance.minThresholdPercent}%.
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              At your current minimum, you can miss {attendance.safeToMiss} more {attendance.safeToMiss === 1 ? 'class' : 'classes'} safely.
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Interactive Attendance Counter */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                            {course.attendance.attendedClasses} / {course.attendance.totalClasses}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {course.attendance.totalClasses ? `${attendance.percentage}% attendance` : 'No classes recorded'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-3">
                          <button
                            onClick={() => {
                              if (course.attendance.attendedClasses > 0) {
                                updateCourse({
                                  ...course,
                                  attendance: {
                                    ...course.attendance,
                                    attendedClasses: course.attendance.attendedClasses - 1,
                                    totalClasses: Math.max(0, course.attendance.totalClasses - 1),
                                  },
                                });
                              }
                            }}
                            title="Decrement"
                            className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              updateCourse({
                                ...course,
                                attendance: {
                                  ...course.attendance,
                                  attendedClasses: course.attendance.attendedClasses + 1,
                                  totalClasses: course.attendance.totalClasses + 1,
                                },
                              });
                            }}
                            title="Add Attended"
                            className="px-2 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            + Attended
                          </button>
                          <button
                            onClick={() => {
                              updateCourse({
                                ...course,
                                attendance: {
                                  ...course.attendance,
                                  totalClasses: course.attendance.totalClasses + 1,
                                },
                              });
                            }}
                            title="Add Missed"
                            className="px-2 py-1 text-xs font-semibold rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                          >
                            + Missed
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assessments Table & Policy Compliance */}
                  <div className="space-y-3">
                    {/* MAJU / Policy Weight Validation Banner */}
                    {course.assessments.length === 0 ? <p className="empty-note">Add assessments from your course outline. Their weights should add up to 100%.</p> : !weightValidation.isValid ? (
                      <details className="p-3.5 rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/30 text-xs">
                        <summary className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 mb-1">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>{settings.gradingPolicy?.name || 'MAJU'} weights need review — see details</span>
                        </summary>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                          {weightValidation.warnings.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                        <div className="mt-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex flex-wrap gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
                          <span>Current Breakdown:</span>
                          <span>Midterm: <strong className="text-slate-900 dark:text-slate-100">{weightValidation.breakdown.midterm}%</strong> (policy: {settings.gradingPolicy?.assessmentLimits.midtermMin || 20}–{settings.gradingPolicy?.assessmentLimits.midtermMax || 25}%)</span>
                          <span>·</span>
                          <span>Coursework: <strong className="text-slate-900 dark:text-slate-100">{weightValidation.breakdown.coursework}%</strong> (policy: {settings.gradingPolicy?.assessmentLimits.courseworkMin || 10}–{settings.gradingPolicy?.assessmentLimits.courseworkMax || 35}%)</span>
                          <span>·</span>
                          <span>Final: <strong className="text-slate-900 dark:text-slate-100">{weightValidation.breakdown.final}%</strong> (policy: {settings.gradingPolicy?.assessmentLimits.finalMin || 40}–{settings.gradingPolicy?.assessmentLimits.finalMax || 50}%)</span>
                          <span>·</span>
                          <span>Total: <strong className="text-slate-900 dark:text-slate-100">{weightValidation.breakdown.total}%</strong> (target: 100%)</span>
                        </div>
                      </details>
                    ) : (
                      <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300 flex flex-wrap items-center justify-between font-mono">
                        <div className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{settings.gradingPolicy?.name || 'MAJU'} Policy Compliant: Midterm {weightValidation.breakdown.midterm}%, Coursework {weightValidation.breakdown.coursework}%, Final {weightValidation.breakdown.final}%</span>
                        </div>
                        <span className="font-bold">Total: 100%</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Syllabus Assessment Weights & Grades
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500">
                          Total Weight: {course.assessments.reduce((acc, a) => acc + a.weightPercent, 0)}%
                        </span>
                        <button
                          onClick={() => setAddingAssessmentCourseId(course.id)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Assessment</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Assessment Name</th>
                            <th className="py-2.5 px-3 font-mono text-right">Weight</th>
                            <th className="py-2.5 px-3 font-mono text-right">Max Score</th>
                            <th className="py-2.5 px-3 font-mono text-right">Earned Score</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {course.assessments.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                    {categorizeAssessment(a.name, a.category)}
                                  </span>
                                  <span>{a.name}</span>
                                </div>
                                {a.dueDate && (
                                  <div className="text-[11px] text-slate-500 mt-0.5">Due: {a.dueDate}</div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-right text-slate-700 dark:text-slate-300">
                                {a.weightPercent}%
                              </td>
                              <td className="py-2.5 px-3 font-mono text-right text-slate-700 dark:text-slate-300">
                                {a.maxScore} pts
                              </td>
                              <td className="py-2.5 px-3 font-mono text-right">
                                {a.completed ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <input
                                      aria-label={`Score for ${a.name}`} type="number"
                                      min={0}
                                      max={a.maxScore}
                                      value={a.currentScore ?? ''}
                                      onChange={(e) =>
                                        e.target.value !== '' && e.target.validity.valid && updateAssessmentScore(course.id, a.id, Number(e.target.value), true)
                                      }
                                      className="w-16 px-1.5 py-0.5 text-right font-mono font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                    <span className="text-slate-400 text-[11px]">
                                      ({(((a.currentScore || 0) / a.maxScore) * 100).toFixed(0)}%)
                                    </span>
                                  </div>
                                ) : (
                                  <input aria-label={`Score for ${a.name}`} type="number" min={0} max={a.maxScore} placeholder="Mark" className="w-20 p-2 border border-slate-300 dark:border-slate-700 rounded" onChange={e => { if (e.target.value !== '' && e.target.validity.valid) updateAssessmentScore(course.id, a.id, Number(e.target.value), true); }} />
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  disabled={!a.completed && a.currentScore === undefined}
                                  onClick={() =>
                                    updateAssessmentScore(
                                      course.id,
                                      a.id,
                                      a.currentScore ?? 0,
                                      !a.completed
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                                    a.completed
                                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {a.completed ? 'Recorded · undo' : 'Enter a mark'}
                                </button>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => deleteAssessment(course.id, a.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                                  title="Delete assessment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Inline add assessment form */}
                    {addingAssessmentCourseId === course.id && (
                      <div className="mt-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          placeholder="Assessment Name (e.g. Lab 2)"
                          value={newAssName}
                          onChange={(e) => setNewAssName(e.target.value)}
                          className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex-1 min-w-[160px]"
                        />
                        <div className="flex items-center gap-1.5 text-xs">
                          <span>Category:</span>
                          <select
                            aria-label="Assessment category" value={newAssCategory}
                            onChange={(e) => setNewAssCategory(e.target.value as AssessmentCategory)}
                            className="px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="coursework">Coursework (Quiz, Lab, Assignment)</option>
                            <option value="midterm">Midterm Examination</option>
                            <option value="final">Final Examination</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span>Weight %:</span>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            aria-label="Assessment weight percent" value={newAssWeight}
                            onChange={(e) => setNewAssWeight(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span>Max pts:</span>
                          <input
                            type="number"
                            min={1}
                            aria-label="Assessment maximum score" value={newAssMaxScore}
                            onChange={(e) => setNewAssMaxScore(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <button
                          onClick={() => handleCreateAssessment(course.id)}
                          className="px-3 py-1 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setAddingAssessmentCourseId(null)}
                          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Connected Documents and Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>{linkedNotes.length} Attached Study Material / Notes</span>
                      {linkedNotes.length > 0 && (
                        <button
                          onClick={() => onNavigateToStudy(linkedNotes[0].id)}
                          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline ml-1"
                        >
                          View Notes in Study Hub
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onNavigateToRescue(course.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Run Grade Rescue for {course.code}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${course.code}?`)) {
                            deleteCourse(course.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
