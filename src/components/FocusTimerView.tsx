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

export const FocusTimerView: React.FC = () => {
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

  // Handle countdown
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            sound.playChime();

            // Record completed session
            const durationMins = Math.round(MODE_DURATIONS[mode] / 60);
            recordFocusSession({
              courseId: selectedCourseId,
              mode,
              durationMinutes: durationMins,
            });

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedCourseId]);

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const toggleTimer = () => {
    sound.playClick();
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
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = focusHistory.filter((s) => s.completedAt.startsWith(todayStr));
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-sky-500" />
            <span>Deep Work Chamber & Focus Timer</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Synthesized ambient noise, customizable cognitive intervals, and course study logging
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
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
            
            {/* Mode Selector Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg mb-8">
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
                value={selectedCourseId}
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

        {/* Right 1 Col: Ambient Audio Synthesizer & Focus Atmosphere */}
        <div className="space-y-4">
          
          {/* Ambient Sound Card */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Ambient Audio Synthesizer
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                Web Audio API
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Zero external files. Real-time procedural sound waves to shield you from distractions:
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
                  type="range"
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
              src="/src/assets/images/gradia_focus_ambient_1794400205321.jpg"
              alt="Deep focus study desk"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                Cognitive Flow
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                The Science of 50-Minute Ultradian Cycles
              </h4>
              <p className="text-[11px] text-slate-300 mt-1">
                Rest 10 minutes between deep blocks to consolidate long-term memory schemas.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
