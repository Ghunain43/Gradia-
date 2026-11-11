import { useModalFocus } from '../utils/useModalFocus';
import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Plus,
  TrendingUp,
  UserCheck,
  X,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: 'dashboard' | 'courses' | 'rescue' | 'study' | 'focus') => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { courses, quickRecordAttendance, updateAssessmentScore, addDocument } = useAcademic();

  const [activeMode, setActiveMode] = useState<'attendance' | 'score' | 'note'>('attendance');

  // Attendance state
  const [attCourseId, setAttCourseId] = useState<string>(courses[0]?.id || '');
  const [attSuccess, setAttSuccess] = useState<string | null>(null);

  // Score state
  const [scoreCourseId, setScoreCourseId] = useState<string>(courses[0]?.id || '');
  const [scoreAssessmentId, setScoreAssessmentId] = useState<string>('');
  const [scoreVal, setScoreVal] = useState<number | ''>('');
  const [scoreSuccess, setScoreSuccess] = useState<string | null>(null);

  // Note state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCourseId, setNoteCourseId] = useState<string>(courses[0]?.id || '');
  const [noteContent, setNoteContent] = useState('');

  const dialogRef = useModalFocus(isOpen, onClose);
  if (!isOpen) return null;

  const selectedScoreCourse = courses.find((c) => c.id === scoreCourseId) || courses[0];

  const handleRecordAttendance = (attended: boolean) => {
    if (!courses.some(c => c.id === attCourseId)) return;
    quickRecordAttendance(attCourseId, attended);
    const crs = courses.find((c) => c.id === attCourseId);
    setAttSuccess(`Logged ${attended ? 'Attended (+1)' : 'Missed (+1)'} for ${crs?.code}`);
    setTimeout(() => {
      setAttSuccess(null);
      onClose();
    }, 1200);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const assessment = selectedScoreCourse?.assessments.find(a => a.id === scoreAssessmentId);
    if (!assessment || scoreVal === '' || scoreVal < 0 || scoreVal > assessment.maxScore) return;
    updateAssessmentScore(scoreCourseId, scoreAssessmentId, Number(scoreVal), true);
    setScoreSuccess('Assessment score saved and GPA updated!');
    setTimeout(() => {
      setScoreSuccess(null);
      onClose();
    }, 1200);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    addDocument({
      title: noteTitle.trim(),
      courseId: noteCourseId,
      content: noteContent.trim(),
    });
    onClose();
    onNavigate('study');
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Quick add" tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="glass-dialog w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-500" />
            <span>Add a little progress</span>
          </h3>
          <button
            onClick={onClose} aria-label="Close dialog"
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!courses.length && <p className="text-sm">Add a course first to record attendance or marks. <button className="quiet-button" onClick={() => { onClose(); onNavigate('courses'); }}>Go to My courses</button></p>}
        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveMode('attendance')}
            className={`py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'attendance'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>Attendance</span>
          </button>

          <button
            onClick={() => setActiveMode('score')}
            className={`py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'score'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Grade Score</span>
          </button>

          <button
            onClick={() => setActiveMode('note')}
            className={`py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'note'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>Study Note</span>
          </button>
        </div>

        {/* MODE 1: ATTENDANCE */}
        {activeMode === 'attendance' && (
          <div className="space-y-4 pt-1">
            <div>
              <label htmlFor="QuickAddModal-field-1" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Select Course
              </label>
              <select id="QuickAddModal-field-1"
                value={attCourseId}
                onChange={(e) => setAttCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>

            {attSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{attSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleRecordAttendance(true)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Attended Class (+1)</span>
              </button>

              <button
                type="button"
                onClick={() => handleRecordAttendance(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Missed Class (+1)</span>
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: SCORE UPDATE */}
        {activeMode === 'score' && (
          <form onSubmit={handleSaveScore} className="space-y-4 pt-1">
            <div>
              <label htmlFor="QuickAddModal-field-2" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Select Course
              </label>
              <select id="QuickAddModal-field-2"
                value={scoreCourseId}
                onChange={(e) => {
                  setScoreCourseId(e.target.value);
                  setScoreAssessmentId('');
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="QuickAddModal-field-3" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assessment Item
              </label>
              <select id="QuickAddModal-field-3"
                value={scoreAssessmentId}
                onChange={(e) => {
                  setScoreAssessmentId(e.target.value);
                  const ass = selectedScoreCourse.assessments.find((a) => a.id === e.target.value);
                  if (ass && ass.currentScore !== undefined) {
                    setScoreVal(ass.currentScore);
                  } else setScoreVal('');
                }}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- Choose Assessment --</option>
                {selectedScoreCourse.assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.weightPercent}% weight · {a.completed ? `Current: ${a.currentScore}` : 'Pending'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="QuickAddModal-field-4" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Score (out of max points)
              </label>
              <input id="QuickAddModal-field-4"
                type="number"
                min={0}
                max={selectedScoreCourse?.assessments.find(a => a.id === scoreAssessmentId)?.maxScore || 100}
                required
                value={scoreVal}
                onChange={(e) => setScoreVal(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {scoreSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{scoreSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!scoreAssessmentId}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-xs"
            >
              Record Score & Recalculate GPA
            </button>
          </form>
        )}

        {/* MODE 3: STUDY NOTE */}
        {activeMode === 'note' && (
          <form onSubmit={handleSaveNote} className="space-y-4 pt-1">
            <div>
              <label htmlFor="QuickAddModal-field-5" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Note / Lecture Title
              </label>
              <input id="QuickAddModal-field-5"
                type="text"
                placeholder="e.g. Chapter 6: Vector Divergence & Maxwell Equations"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="QuickAddModal-field-6" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course
              </label>
              <select id="QuickAddModal-field-6"
                value={noteCourseId}
                onChange={(e) => setNoteCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="QuickAddModal-field-7" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Lecture Content / Derivations
              </label>
              <textarea id="QuickAddModal-field-7"
                rows={4}
                placeholder="Paste key notes, concepts, or homework insights..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                required
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs"
            >
              Save & Open in Study Hub
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
