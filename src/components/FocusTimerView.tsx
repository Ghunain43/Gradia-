import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Headphones,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { sound } from '../utils/audio';

type TimerMode = 'pomodoro' | 'deepwork' | 'shortbreak' | 'longbreak';

const MODE_DURATIONS: { [key in TimerMode]: number } = {
  pomodoro: 25 * 60,
  deepwork: 50 * 60,
  shortbreak: 5 * 60,
  longbreak: 15 * 60,
};

export const FocusTimerView: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { courses, focusHistory, recordFocusSession } = useAcademic();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Ambient sound state
  const [ambientSound, setAmbientSound] = useState<'none' | 'brown' | 'rain' | 'library'>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.6);

  const timerRef = useRef<number | null>(null);

  // Sync ambient sound
  useEffect(() => {
    sound.setAmbient(ambientSound, ambientVolume);
    return () => {
      sound.stopAmbient();
    };
  }, [ambientSound, ambientVolume]);

  // Use wall-clock time so background tabs do not slow the countdown.
  const endAt = useRef<number | null>(null);
  const recordRef = useRef(recordFocusSession);
  recordRef.current = recordFocusSession;
  useEffect(() => {
    if (!isRunning) return;
    if (!endAt.current) endAt.current = Date.now() + timeLeft * 1000;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endAt.current! - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        endAt.current = null;
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        sound.playChime();
        recordRef.current({ courseId: selectedCourseId || undefined, mode, durationMinutes: MODE_DURATIONS[mode] / 60 });
      }
    };
    timerRef.current = window.setInterval(tick, 250);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, mode, selectedCourseId]);

  const switchMode = (newMode: TimerMode) => {
    endAt.current = null;
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const resetTimer = () => {
    endAt.current = null;
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const toggleTimer = () => {
    sound.playClick();
    endAt.current = null;
    if (!isRunning && timeLeft === 0) setTimeLeft(MODE_DURATIONS[mode]);
    setIsRunning(!isRunning);
  };

  // Time format
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage
  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  // Stats today
  const todayStr = new Date().toDateString();
  const todaySessions = focusHistory.filter((s) => new Date(s.completedAt).toDateString() === todayStr && (s.mode === 'pomodoro' || s.mode === 'deepwork'));
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  if (compact) return <section className="fm-timer"><div className="fm-panel-heading"><h2>A moment to focus</h2><Clock size={19}/></div><p>One task. A little less distraction.</p><select aria-label="Focus session course" value={selectedCourseId} disabled={isRunning} onChange={e => setSelectedCourseId(e.target.value)}><option value="">Any subject</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><div className="fm-hourglass" aria-hidden="true">⌛</div><div className="fm-timer-time" role="timer" aria-label="Time remaining">{timeFormatted}</div><small>{mode === 'pomodoro' ? '25-minute study session' : mode === 'deepwork' ? '50-minute study session' : 'A little break'}</small><div className="fm-timer-actions"><button className="fm-timer-start" onClick={toggleTimer}>{isRunning ? <Pause size={16}/> : <Play size={16}/>} {isRunning ? 'Pause' : timeLeft < totalDuration && timeLeft > 0 ? 'Resume' : 'Start focus'}</button><button className="icon-button" aria-label="Reset timer" onClick={resetTimer}><RotateCcw size={18}/></button></div></section>;

  return (
    <div className="glass-page glass-page-FocusTimerView space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="glass-page-eyebrow">MAKE SPACE FOR DEEP WORK</div><h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-sky-500" />
            <span>One thing at a time.</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose a course, settle in, and give yourself a little uninterrupted time.
          </p>
        </div>

        {/* Daily Stats Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 font-mono">
          <span>Today:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{todayMinutes} mins focused</span>
          <span aria-hidden="true">·</span>
          <span>{todaySessions.length} sessions</span>
        </div>
      </div>

      {/* Main Grid: Timer and Ambient Sound Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Timer Display & Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-surface p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
            
            {/* Mode Selector Buttons */}
            <div className="flex flex-wrap justify-center items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg mb-8">
              <button
                onClick={() => switchMode('pomodoro')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  mode === 'pomodoro'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Pomodoro (25m)
              </button>
              <button
                onClick={() => switchMode('deepwork')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  mode === 'deepwork'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Deep Work (50m)
              </button>
              <button
                onClick={() => switchMode('shortbreak')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  mode === 'shortbreak'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Short Break (5m)
              </button>
              <button
                onClick={() => switchMode('longbreak')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  mode === 'longbreak'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Long Break (15m)
              </button>
            </div>

            {/* Circular Timer Ring */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  className="stroke-indigo-600 dark:stroke-indigo-500 transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 110}
                  strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                  {timeFormatted}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mt-2">
                  {mode} · {isRunning ? 'Running' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={resetTimer}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Reset interval"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTimer}
                className={`px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Focus Session</span>
                  </>
                )}
              </button>
            </div>

            {/* Course Tagging Selector */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Logging session for:</span>
              <select
                aria-label="Course for this focus session" disabled={isRunning} value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Right 1 Col: Find your background sound & Focus Atmosphere */}
        <div className="space-y-4">
          
          {/* Ambient Sound Card */}
          <div className="glass-surface p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Find your background sound
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                Optional
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Choose a gentle sound, or keep things quiet.
            </p>

            {/* Sound Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAmbientSound(ambientSound === 'brown' ? 'none' : 'brown')}
                className={`p-3 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer ${
                  ambientSound === 'brown'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold">Brown Noise</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Deep low rumble</div>
              </button>

              <button
                onClick={() => setAmbientSound(ambientSound === 'rain' ? 'none' : 'rain')}
                className={`p-3 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer ${
                  ambientSound === 'rain'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold">Gentle Rain</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Acoustic droplets</div>
              </button>

              <button
                onClick={() => setAmbientSound(ambientSound === 'library' ? 'none' : 'library')}
                className={`p-3 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer ${
                  ambientSound === 'library'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold">Library Hum</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Muffled study air</div>
              </button>

              <button
                onClick={() => setAmbientSound('none')}
                className={`p-3 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer ${
                  ambientSound === 'none'
                    ? 'border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <div className="font-bold">Mute</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">Silence</div>
              </button>
            </div>

            {/* Volume Slider */}
            {ambientSound !== 'none' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs">
                <Volume2 className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  aria-label="Background sound volume" type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <span className="font-mono text-slate-500 w-8 text-right">
                  {Math.round(ambientVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Atmospheric Photo Card */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <img
              src={new URL('../assets/images/gradia_focus_ambient_1794400205321.jpg', import.meta.url).href}
              alt="Deep focus study desk"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                Room to breathe
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Take a break. Come back fresh.
              </h4>
              <p className="text-[11px] text-slate-300 mt-1">
                Step away from your screen between sessions. Find a rhythm that works for you.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
