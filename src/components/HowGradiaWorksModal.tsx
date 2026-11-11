import React, { useState } from 'react';
import {
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  Cpu,
  Database,
  HelpCircle,
  Layers,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Target,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';

interface HowGradiaWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export const HowGradiaWorksModal: React.FC<HowGradiaWorksModalProps> = ({
  isOpen,
  onClose,
  onStartTour,
}) => {
  const [activeSection, setActiveSection] = useState<number>(1);

  // Interactive mini-calculator state for Question 4 (Grade Rescue)
  const [interactiveTarget, setInteractiveTarget] = useState<number>(86); // MAJU 'A'
  const [interactiveEarned, setInteractiveEarned] = useState<number>(45); // e.g. 45% earned out of 55%
  const [interactiveRemaining, setInteractiveRemaining] = useState<number>(45); // 45% remaining

  const pointsNeeded = Math.max(0, interactiveTarget - interactiveEarned);
  const requiredAvg =
    interactiveRemaining > 0
      ? Number(((pointsNeeded / interactiveRemaining) * 100).toFixed(1))
      : 0;
  const isImpossible = requiredAvg > 100;

  if (!isOpen) return null;

  const questions = [
    { id: 1, title: '1. What is Gradia?', category: 'Overview', icon: Brain },
    { id: 2, title: '2. What problem does it solve?', category: 'Problem', icon: Target },
    { id: 3, title: '3. How does the GPA/CGPA calculator work?', category: 'Mathematics', icon: Calculator },
    { id: 4, title: '4. How does Grade Rescue calculate required marks?', category: 'Mathematics', icon: Zap },
    { id: 5, title: '5. How does attendance risk detection work?', category: 'Analytics', icon: UserCheck },
    { id: 6, title: '6. How does Gemini process uploaded notes?', category: 'AI Pipeline', icon: Cpu },
    { id: 7, title: '7. How are flashcards and quizzes generated?', category: 'AI Pipeline', icon: Sparkles },
    { id: 8, title: '8. How does the system identify weak topics?', category: 'Adaptive Loop', icon: ShieldAlert },
    { id: 9, title: '9. How does the adaptive revision planner work?', category: 'Adaptive Loop', icon: Compass },
    { id: 10, title: '10. What is TypeScript vs. what requires Gemini?', category: 'Architecture', icon: Code2 },
    { id: 11, title: '11. Where is student data stored?', category: 'Privacy & Storage', icon: Database },
    { id: 12, title: '12. What happens if Gemini API is unavailable?', category: 'Resilience', icon: Lightbulb },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              G
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>How Gradia Works — Developer & Judge Technical Guide</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A student-friendly technical handbook designed for GDG hackathon presentations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onStartTour && (
              <button
                onClick={() => {
                  onClose();
                  onStartTour();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Launch Interactive Tour</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left sidebar questions + Right detail panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Question Navigation Sidebar */}
          <div className="w-full md:w-72 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-3 space-y-1 bg-slate-50/30 dark:bg-slate-950/30 shrink-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Table of Contents
            </div>
            {questions.map((q) => {
              const Icon = q.icon;
              const isActive = activeSection === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setActiveSection(q.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{q.title}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 shrink-0 ${isActive ? 'text-white' : 'opacity-0'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Detail Pane */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            
            {/* QUESTION 1 */}
            {activeSection === 1 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 01 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">What is Gradia?</h3>
                </div>
                <p>
                  <strong>Gradia</strong> is a personal, precision-engineered <em>Academic Operating System</em> designed for university students. It unifies course tracking, rigorous GPA and CGPA calculations, Grade Rescue what-if simulations, attendance risk forecasting, and AI-powered study workflows into a single cohesive workspace.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-indigo-500" />
                    <span>The Philosophy: Precision Math + Generative Intelligence</span>
                  </div>
                  <p>
                    Unlike generic study apps that dump AI chat boxes over static notes, Gradia enforces a strict architectural boundary: <strong>all grading and risk calculations are 100% deterministic TypeScript math</strong>, while <strong>Gemini is reserved exclusively for high-leverage cognitive tasks</strong> like summarizing complex lecture notes, generating active-recall flashcards, creating scored diagnostic MCQs, and synthesizing adaptive revision schedules.
                  </p>
                </div>
              </div>
            )}

            {/* QUESTION 2 */}
            {activeSection === 2 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 02 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">What Problem Does Gradia Solve?</h3>
                </div>
                <p>
                  University students face three critical cognitive and administrative challenges every semester:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-1.5">
                    <div className="font-semibold text-xs text-rose-600 dark:text-rose-400">1. Opaque Trajectories</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Students rarely know the exact marks they need on upcoming finals to hit their target GPA or retain a scholarship.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-1.5">
                    <div className="font-semibold text-xs text-amber-600 dark:text-amber-400">2. Attendance Ambush</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      University policies (like MAJU’s 75% threshold) can result in exam debarment without proactive consecutive-attendance alerts.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-1.5">
                    <div className="font-semibold text-xs text-indigo-600 dark:text-indigo-400">3. Passive Cramming</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Students re-read lecture slides passively instead of testing themselves with targeted diagnostic quizzes and spaced retrieval.
                    </p>
                  </div>
                </div>
                <p className="text-xs">
                  Gradia replaces fragmented spreadsheets and last-minute panic with transparent numerical clarity and adaptive study recommendations.
                </p>
              </div>
            )}

            {/* QUESTION 3 */}
            {activeSection === 3 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 03 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">How Does the GPA and CGPA Calculator Work?</h3>
                </div>
                <p>
                  Gradia uses the official credit-hour weighted quality points system:
                </p>
                <div className="p-4 rounded-xl font-mono text-xs bg-slate-900 text-slate-100 space-y-2">
                  <div className="text-indigo-300 font-semibold">// Semester GPA Formula</div>
                  <div>Semester Quality Points = ∑ (Course Credits × Grade Points)</div>
                  <div>Semester GPA = Semester Quality Points / Total Enrolled Semester Credits</div>
                  <div className="text-emerald-300 font-semibold pt-2">// Cumulative CGPA Formula</div>
                  <div>Total Quality Points = (Prior Credits × Prior CGPA) + Semester Quality Points</div>
                  <div>Cumulative CGPA = Total Quality Points / (Prior Credits + Semester Credits)</div>
                </div>
                <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs space-y-1">
                  <div className="font-semibold text-indigo-900 dark:text-indigo-200">Finalized vs. Projected Separation:</div>
                  <p className="text-indigo-800 dark:text-indigo-300">
                    A key innovation in Gradia is separating <strong>Finalized GPA</strong> from <strong>Projected GPA</strong>. When a course is still in progress (e.g. final exam not yet graded), it contributes only to the <em>Projected GPA</em>. Only fully completed courses factor into the official <em>Finalized GPA</em>.
                  </p>
                </div>
              </div>
            )}

            {/* QUESTION 4 */}
            {activeSection === 4 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 04 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">How Does Grade Rescue Calculate Required Marks?</h3>
                </div>
                <p>
                  Grade Rescue is a reverse-optimization solver. Given a student’s earned assessment marks and their desired final letter grade (e.g. an <strong>A</strong> requiring ≥ 86% in MAJU), it calculates the exact percentage score required across the remaining uncompleted work.
                </p>
                
                {/* Interactive Simulator */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Live Mathematical Sandbox:</span>
                    <span className="text-[11px] font-mono text-slate-500">Try dragging the sliders</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between font-mono">
                      <span>Target Minimum %: <strong>{interactiveTarget}%</strong></span>
                      <input
                        type="range"
                        min={50}
                        max={100}
                        value={interactiveTarget}
                        onChange={(e) => setInteractiveTarget(Number(e.target.value))}
                        className="w-32 accent-indigo-600"
                      />
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Weight Points Earned: <strong>{interactiveEarned} pts</strong></span>
                      <input
                        type="range"
                        min={0}
                        max={60}
                        value={interactiveEarned}
                        onChange={(e) => setInteractiveEarned(Number(e.target.value))}
                        className="w-32 accent-indigo-600"
                      />
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Remaining Course Weight: <strong>{interactiveRemaining}%</strong></span>
                      <input
                        type="range"
                        min={10}
                        max={60}
                        value={interactiveRemaining}
                        onChange={(e) => setInteractiveRemaining(Number(e.target.value))}
                        className="w-32 accent-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      Points Needed: <span className="font-bold">{pointsNeeded.toFixed(1)} pts</span>
                    </div>
                    <div>
                      Required Score on Remaining:{' '}
                      <span className={`font-bold text-sm ${isImpossible ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {requiredAvg}% {isImpossible ? '(Impossible!)' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <strong>The Exact Formula:</strong>
                  <div className="font-mono bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg text-[11px]">
                    Required Average on Remaining = ((Target Minimum % - Earned Points) / Remaining Weight %) × 100
                  </div>
                </div>
              </div>
            )}

            {/* QUESTION 5 */}
            {activeSection === 5 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 05 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">How Does Attendance Risk Detection Work?</h3>
                </div>
                <p>
                  Universities enforce a minimum attendance policy (75% at MAJU). Gradia’s attendance analytics engine continuously computes two proactive forward-looking metrics:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">Safe-to-Miss Headroom</span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      If attendance is currently above 75%, it calculates exactly how many future classes the student can miss before falling below threshold.
                    </p>
                    <div className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 pt-1">
                      safeToMiss = ⌊(Attended - ThresholdRatio × Total) / ThresholdRatio⌋
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 space-y-1">
                    <span className="font-bold text-rose-800 dark:text-rose-300">Consecutive Classes Recovery</span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      If attendance drops below 75%, it calculates the exact consecutive class count the student MUST attend without any absence to restore safe standing.
                    </p>
                    <div className="font-mono text-[10px] text-rose-700 dark:text-rose-400 pt-1">
                      neededConsecutive = ⌈(ThresholdRatio × Total - Attended) / (1 - ThresholdRatio)⌉
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QUESTION 6 */}
            {activeSection === 6 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 06 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">How Does Gemini Process Uploaded Notes?</h3>
                </div>
                <p>
                  Gradia features a multi-tiered ingestion pipeline for lecture notes and documents:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-xs">
                  <li><strong>Client-Side PDF Text Extraction:</strong> Uploaded PDF files are parsed directly in the student's browser using PDF.js. It extracts text items page-by-page and detects whether the document is a scanned image.</li>
                  <li><strong>Preview Before Save:</strong> The student inspects and can edit the extracted text before saving, preventing binary garbage from reaching the model.</li>
                  <li><strong>Server-Side Secure Gemini Dispatch:</strong> The backend proxy in `server.ts` routes the text to Gemini with strict JSON schemas (`responseMimeType: "application/json"`). The user's API key is never exposed to the client.</li>
                  <li><strong>Structured Academic Synthesis:</strong> Gemini returns executive overviews, key takeaways, core concept dictionaries, formulas/theorems, and high-yield exam traps.</li>
                </ol>
              </div>
            )}

            {/* QUESTION 7 */}
            {activeSection === 7 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 07 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">How are Flashcards and Quizzes Generated?</h3>
                </div>
                <p>
                  Rather than trivial trivia questions, Gradia instructs Gemini to synthesize active recall questions based on Bloom’s Revised Taxonomy:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <strong className="text-slate-900 dark:text-slate-100">Flashcards:</strong> Prompt specifies conceptual cause-and-effect pairs, edge case trade-offs (e.g. <em>"Why does Paxos require 2F+1 nodes to tolerate F crash faults?"</em>), and assigns difficulty tiers (`Easy`, `Medium`, `Hard`).
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <strong className="text-slate-900 dark:text-slate-100">Scored MCQs:</strong> Four plausible options with exactly one correct answer, educational distractor explanations, and a granular subtopic tag (e.g. <em>"Space Optimization"</em>, <em>"FSM Architecture"</em>).
                  </div>
                </div>
              </div>
            )}

            {/* QUESTION 8 */}
            {activeSection === 8 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 08 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">How Does the System Identify Weak Topics?</h3>
                </div>
                <p>
                  This is the core <strong>diagnostic feedback loop</strong> of Gradia:
                </p>
                <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2">
                  <div className="text-amber-400 font-semibold">// The Weak Topic Extraction Pipeline</div>
                  <div>1. Student submits MCQ quiz</div>
                  <div>2. Engine compares userSelection against correctIndex</div>
                  <div>3. When (userSelection !== correctIndex):</div>
                  <div className="pl-4 text-rose-300">weakTopics.push(question.topic)</div>
                  <div>4. Record saved to persistent QuizResult store in localStorage</div>
                  <div>5. Dashboard and Revision Planner aggregate all historical weak topics</div>
                </div>
                <p className="text-xs">
                  This ensures the student’s revision schedule is always driven by empirical assessment performance rather than guesswork.
                </p>
              </div>
            )}

            {/* QUESTION 9 */}
            {activeSection === 9 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 09 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">How Does the Adaptive Revision Planner Work?</h3>
                </div>
                <p>
                  When the student clicks <em>"Generate Adaptive Revision Plan"</em>, Gradia compiles:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>All identified weak topics from recent quiz submissions</li>
                  <li>Active enrolled courses and their credit hour weights</li>
                  <li>Current syllabus completion percentages and upcoming assessment weights</li>
                  <li>User-configured days available and daily study hours</li>
                </ul>
                <p className="text-xs pt-2">
                  Gemini formats this into an actionable multi-day cognitive pacing schedule pairing each weak topic with a high-impact retrieval technique (<em>"Active Recall"</em>, <em>"Feynman Technique"</em>, <em>"Practice Problems"</em>, <em>"Code Trace"</em>) and concrete deliverable goals.
                </p>
              </div>
            )}

            {/* QUESTION 10 */}
            {activeSection === 10 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 10 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">TypeScript Engine vs. Gemini AI: What Does What?</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
                    <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-indigo-600" />
                      <span>TypeScript Engine (Deterministic)</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <li>• GPA & CGPA weighted quality points</li>
                      <li>• Grade Rescue reverse optimization math</li>
                      <li>• MAJU grade boundary mapping (86% = A)</li>
                      <li>• Assessment limits validation (Midterm 20-25%, Final 40-50%)</li>
                      <li>• Safe-to-miss & consecutive attendance recovery</li>
                      <li>• Quiz scoring & weak topic identification</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/30 dark:bg-violet-950/20 space-y-2">
                    <div className="font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      <span>Gemini API (Generative Intelligence)</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <li>• Lecture notes synthesis & executive summaries</li>
                      <li>• Extracting key concepts & formulas from PDFs</li>
                      <li>• Engineering active recall flashcards</li>
                      <li>• Generating diagnostic 4-option MCQs with explanations</li>
                      <li>• Adaptive revision schedule pacing</li>
                      <li>• Socratic academic AI tutor conversations</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* QUESTION 11 */}
            {activeSection === 11 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 11 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">Where is Student Data Stored?</h3>
                </div>
                <p>
                  Gradia operates on a <strong>privacy-first, local-first</strong> architecture:
                </p>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-500" />
                    <span>Browser LocalStorage Persistence</span>
                  </div>
                  <p>
                    All course records, attendance logs, notes, quiz scores, and settings are saved locally in the user's browser under versioned keys (`gradia_*_v3`). No student data is transmitted to or logged on external servers except when dispatching notes content to Gemini via server-side proxy routes.
                  </p>
                  <p>
                    Students can export their entire academic portfolio to an offline JSON file anytime and restore it on any device via Settings.
                  </p>
                </div>
              </div>
            )}

            {/* QUESTION 12 */}
            {activeSection === 12 && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Concept 12 / 12</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">What Happens if the Gemini API is Unavailable?</h3>
                </div>
                <p>
                  Gradia is built with graceful resilience. If the Gemini API key has quota limits or the network drops:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">100% Offline Core OS:</strong> The dashboard, GPA/CGPA calculators, Grade Rescue simulator, attendance analytics, course managers, Pomodoro focus timer, and existing saved flashcards/notes continue functioning with zero degradation.
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">Truthful Error Reporting:</strong> The app never hallucinates fake responses when an API call fails. It displays a clean, actionable error banner explaining the status and inviting the user to retry or inspect their configuration.
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Prepared for GDG Hackathon Showcase</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">BSCS Student Edition</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection((prev) => Math.max(1, prev - 1))}
              disabled={activeSection === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setActiveSection((prev) => Math.min(12, prev + 1))}
              disabled={activeSection === 12}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-40 hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              Next Concept
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
