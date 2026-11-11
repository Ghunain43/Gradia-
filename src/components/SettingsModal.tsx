import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  Copy,
  Download,
  HelpCircle,
  Info,
  Moon,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import {
  DEFAULT_CUSTOM_POLICY,
  DEFAULT_MAJU_POLICY,
  MAJU_DPLUS_NOTE_DEFAULT,
  MAJU_GRADE_SCALE,
  percentageToGrade,
} from '../utils/calculations';
import {
  GradeScaleEntry,
  LetterGrade,
  PresetUniversity,
  RoundingMode,
  UniversityGradingPolicy,
} from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    resetToDemoData,
    resetToGhunainDemoData,
    exportDataJson,
    importDataJson,
  } = useAcademic();

  const [name, setName] = useState(settings.studentName);
  const [faculty, setFaculty] = useState(settings.faculty || 'Faculty of Computing');
  const [major, setMajor] = useState(settings.major);
  const [university, setUniversity] = useState(settings.university);
  const [semester, setSemester] = useState(settings.currentSemester);
  const [priorCredits, setPriorCredits] = useState(settings.priorCredits);
  const [priorCgpa, setPriorCgpa] = useState(settings.priorCgpa);
  const [targetCgpa, setTargetCgpa] = useState(settings.targetCgpa);
  const [attendanceThreshold, setAttendanceThreshold] = useState(settings.defaultAttendanceThreshold);
  const [activeModel, setActiveModel] = useState(settings.activeModel || 'gemini-3.8-flash');
  const [theme, setTheme] = useState(settings.theme);

  // Grading Policy state
  const currentPolicy = settings.gradingPolicy || DEFAULT_MAJU_POLICY;
  const [preset, setPreset] = useState<PresetUniversity>(currentPolicy.preset || 'maju_undergraduate');
  const [scale, setScale] = useState<GradeScaleEntry[]>(currentPolicy.scale || MAJU_GRADE_SCALE);
  const [policyNoteDPlus, setPolicyNoteDPlus] = useState<string>(
    currentPolicy.policyNoteDPlus || MAJU_DPLUS_NOTE_DEFAULT
  );
  const [roundingMode, setRoundingMode] = useState<RoundingMode>(currentPolicy.roundingMode || 'raw');
  const [assessmentLimits, setAssessmentLimits] = useState(currentPolicy.assessmentLimits);

  // Grade Preview Calculator state
  const [previewPercent, setPreviewPercent] = useState<number>(85.9);

  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Health check state
  const [apiHealth, setApiHealth] = useState<{ hasGeminiKey: boolean; model: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => setApiHealth(data))
        .catch(() => setApiHealth({ hasGeminiKey: false, model: 'gemini-3.8-flash' }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePresetChange = (newPreset: PresetUniversity) => {
    setPreset(newPreset);
    if (newPreset === 'maju_undergraduate') {
      setScale(DEFAULT_MAJU_POLICY.scale);
      setAssessmentLimits(DEFAULT_MAJU_POLICY.assessmentLimits);
      setPolicyNoteDPlus(DEFAULT_MAJU_POLICY.policyNoteDPlus || MAJU_DPLUS_NOTE_DEFAULT);
      setRoundingMode(DEFAULT_MAJU_POLICY.roundingMode);
      setUniversity('Mohammad Ali Jinnah University (MAJU)');
    } else {
      setScale(DEFAULT_CUSTOM_POLICY.scale);
      setAssessmentLimits(DEFAULT_CUSTOM_POLICY.assessmentLimits);
      setPolicyNoteDPlus('');
      setRoundingMode(DEFAULT_CUSTOM_POLICY.roundingMode);
    }
  };

  const handleScaleMinPercentChange = (index: number, val: number) => {
    const updated = [...scale];
    updated[index] = { ...updated[index], minPercent: val };
    setScale(updated);
  };

  const handleScaleGradePointsChange = (index: number, val: number) => {
    const updated = [...scale];
    updated[index] = { ...updated[index], gradePoints: val };
    setScale(updated);
  };

  const activePolicyDraft: UniversityGradingPolicy = {
    preset,
    name: preset === 'maju_undergraduate' ? 'MAJU Undergraduate' : 'Custom University',
    scale,
    policyNoteDPlus,
    roundingMode,
    assessmentLimits,
  };

  const previewResult = percentageToGrade(previewPercent, activePolicyDraft);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studentName: name.trim(),
      faculty: faculty.trim(),
      major: major.trim(),
      university: university.trim(),
      currentSemester: semester.trim(),
      priorCredits: Number(priorCredits),
      priorCgpa: Number(priorCgpa),
      targetCgpa: Number(targetCgpa),
      defaultAttendanceThreshold: Number(attendanceThreshold),
      activeModel: activeModel.trim() || 'gemini-3.8-flash',
      theme,
      gradingPolicy: activePolicyDraft,
    });
    onClose();
  };

  const handleExport = () => {
    const json = exportDataJson();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gradia_academic_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = importDataJson(importJsonText);
    if (success) {
      setImportNotice('Academic data imported successfully!');
      setTimeout(() => {
        setImportNotice(null);
        onClose();
      }, 1200);
    } else {
      setImportNotice('Invalid JSON format. Please verify data structure.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 sm:p-6 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              <span>Gradia Academic & University Policy Settings</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure official MAJU Undergraduate or Custom grading policies, assessment weight limits, and GPA calibration
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini Engine Status Banner */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Server-Side Gemini Integration:
              </span>{' '}
              <span className="font-mono text-slate-600 dark:text-slate-400">
                {apiHealth?.model || 'gemini-3.8-flash'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            {apiHealth?.hasGeminiKey ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>API Key Connected</span>
              </span>
            ) : (
              <span className="text-amber-500 font-semibold">
                Running in Demo / Check Secrets Panel
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: University Grading Policy & Presets */}
          <div className="p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  1. University Grading Policy Preset
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select official MAJU Undergraduate or calibrate for a custom university
                </p>
              </div>

              {/* Segmented Preset Switcher */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handlePresetChange('maju_undergraduate')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    preset === 'maju_undergraduate'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  MAJU Undergraduate
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange('custom')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    preset === 'custom'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Custom University
                </button>
              </div>
            </div>

            {/* Assessment Weightage Rules Box */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-500" />
                  <span>{preset === 'maju_undergraduate' ? 'Official MAJU Assessment Weightage Policy' : 'Custom Assessment Weightage Limits'}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  Total must equal 100%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">Midterm Examination</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {assessmentLimits.midtermMin}% – {assessmentLimits.midtermMax}%
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">Combined Coursework (Quizzes, Labs, P-Sets)</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {assessmentLimits.courseworkMin}% – {assessmentLimits.courseworkMax}%
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">Final Comprehensive Exam</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {assessmentLimits.finalMin}% – {assessmentLimits.finalMax}%
                  </div>
                </div>
              </div>

              {preset === 'custom' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500">
                  <span>Custom limits can be tailored above if required by your department.</span>
                </div>
              )}
            </div>

            {/* Rounding Policy Selection */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Percentage Classification & Rounding Rule
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2 ${
                  roundingMode === 'raw'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="roundingMode"
                    value="raw"
                    checked={roundingMode === 'raw'}
                    onChange={() => setRoundingMode('raw')}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <div>Raw Percentage (Default)</div>
                    <div className="text-[10px] font-normal opacity-80">Do not round before determining letter grade (e.g. 85.99% is A-)</div>
                  </div>
                </label>

                <label className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2 ${
                  roundingMode === 'round_integer'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="roundingMode"
                    value="round_integer"
                    checked={roundingMode === 'round_integer'}
                    onChange={() => setRoundingMode('round_integer')}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <div>Round to Nearest Integer</div>
                    <div className="text-[10px] font-normal opacity-80">Round to integer (e.g. 85.5% rounds to 86% &rarr; A)</div>
                  </div>
                </label>

                <label className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2 ${
                  roundingMode === 'round_1dec'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="roundingMode"
                    value="round_1dec"
                    checked={roundingMode === 'round_1dec'}
                    onChange={() => setRoundingMode('round_1dec')}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <div>Round to 1 Decimal</div>
                    <div className="text-[10px] font-normal opacity-80">Rounds to 0.1% before grade mapping</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Editable Grading Scale Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {preset === 'maju_undergraduate' ? 'Official MAJU Undergraduate Grade Mapping' : 'Custom University Grade Mapping Table'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {scale.length} Grade Bands
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold uppercase font-mono">
                    <tr>
                      <th className="py-2 px-3">Grade</th>
                      <th className="py-2 px-3">Percentage Range</th>
                      <th className="py-2 px-3 text-right">Grade Points</th>
                      <th className="py-2 px-3">Policy Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-mono">
                    {scale.map((entry, idx) => {
                      const prevMin = idx > 0 ? scale[idx - 1].minPercent : 100;
                      const rangeLabel =
                        idx === 0
                          ? `${entry.minPercent}–100%`
                          : entry.letter === 'F'
                          ? `Below ${prevMin}%`
                          : `${entry.minPercent}–below ${prevMin}%`;

                      return (
                        <tr key={entry.letter} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                            {entry.letter}
                            {entry.note && (
                              <span className="text-amber-500 ml-0.5 font-bold">{entry.note}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {preset === 'custom' ? (
                              <div className="flex items-center gap-1.5">
                                <span>Min %:</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={entry.minPercent}
                                  onChange={(e) =>
                                    handleScaleMinPercentChange(idx, Number(e.target.value))
                                  }
                                  className="w-16 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                              </div>
                            ) : (
                              <span>{rangeLabel}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                            {preset === 'custom' ? (
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                max={4.0}
                                value={entry.gradePoints}
                                onChange={(e) =>
                                  handleScaleGradePointsChange(idx, Number(e.target.value))
                                }
                                className="w-16 px-1.5 py-0.5 text-right rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              />
                            ) : (
                              <span>{entry.gradePoints.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px] font-sans">
                            {entry.letter === 'D+' && entry.note ? (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                * Special Undergraduate Note
                              </span>
                            ) : entry.letter === 'F' ? (
                              <span className="text-rose-500">Fail / Zero points</span>
                            ) : (
                              <span>Standard</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Configurable D+ Asterisk Policy Note */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-1.5 text-xs">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                Official Footnote for D+ Grade Points (*)
              </label>
              <textarea
                rows={2}
                value={policyNoteDPlus}
                onChange={(e) => setPolicyNoteDPlus(e.target.value)}
                placeholder="Configurable policy note regarding undergraduate D+ requirements..."
                className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-500">
                Displayed wherever D+ is referenced rather than inventing an assumed meaning.
              </p>
            </div>

            {/* Interactive Grade Preview Calculator */}
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Interactive Grade Preview Calculator</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Tests raw boundary rules in real time
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Test Score Percentage:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{previewPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={previewPercent}
                    onChange={(e) => setPreviewPercent(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                    <span>Quick Boundary Checks:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewPercent(86.0)}
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border font-mono text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                    >
                      86.0% (A)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPercent(85.99)}
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border font-mono text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                    >
                      85.99% (A-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPercent(78.0)}
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border font-mono text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                    >
                      78.0% (B+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPercent(54.0)}
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border font-mono text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                    >
                      54.0% (D+*)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPercent(49.9)}
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border font-mono text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                    >
                      49.9% (F)
                    </button>
                  </div>
                </div>

                {/* Result Card */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center min-w-[130px] shrink-0">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Assigned Grade</div>
                  <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {previewResult.letter}
                    {previewResult.note && <span className="text-amber-500">{previewResult.note}</span>}
                  </div>
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                    {previewResult.gradePoints.toFixed(2)} GP
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Student Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Student Identity & Program
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Faculty / Academic Division
                </label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  placeholder="e.g. Faculty of Computing"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Major / Degree Program
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  University Name
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Term / Semester
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Active Gemini AI Model
                </label>
                <select
                  value={activeModel}
                  onChange={(e) => setActiveModel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended / Balanced)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: GPA & Cumulative Calibration */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. GPA History & Attendance Rules
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Prior Completed Credits
                </label>
                <input
                  type="number"
                  min={0}
                  max={250}
                  value={priorCredits}
                  onChange={(e) => setPriorCredits(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Previous CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={4.0}
                  value={priorCgpa}
                  onChange={(e) => setPriorCgpa(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target CGPA Goal
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={4.0}
                  value={targetCgpa}
                  onChange={(e) => setTargetCgpa(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Attendance Min Threshold %
                </label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={attendanceThreshold}
                  onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Theme preference */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              4. Appearance
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light Mode</span>
              </button>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
            >
              Save Calibration & Policy
            </button>
          </div>
        </form>

        {/* Section 5: Data Management & Backup */}
        <div className="space-y-3 pt-5 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Persistent Data Storage & Backup
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Export JSON Backup'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset to official Ghunain Fayaz (MAJU BSCS Fall 2026) demo data? All 8 courses, authentic attendance counts, and study records will be restored.')) {
                  resetToGhunainDemoData();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Ghunain Demo Data</span>
            </button>
          </div>

          {/* Quick JSON Import */}
          <div className="pt-2">
            <textarea
              rows={2}
              placeholder="Paste JSON backup bundle here to restore state..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {importNotice && (
              <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                {importNotice}
              </div>
            )}
            {importJsonText.trim().length > 0 && (
              <button
                type="button"
                onClick={handleImport}
                className="mt-1.5 px-3 py-1 text-xs font-semibold rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Apply Import
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
