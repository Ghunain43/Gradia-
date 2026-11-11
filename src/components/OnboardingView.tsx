import { BrandLogo } from './BrandLogo';
import React, { useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { DEFAULT_CUSTOM_POLICY, DEFAULT_MAJU_POLICY } from '../utils/calculations';
import type { Course } from '../types';
export function OnboardingView({ onFinish }: { onFinish: () => void }) {
  const { updateSettings, addCourse, resetToGhunainDemoData } = useAcademic();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [program, setProgram] = useState('');
  const [maju, setMaju] = useState(false);
  const [cgpa, setCgpa] = useState('');
  const [credits, setCredits] = useState('');
  const [goal, setGoal] = useState('Build a steady study habit');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseCredits, setCourseCredits] = useState(3);
  const [drafts, setDrafts] = useState<Omit<Course, 'id'>[]>([]);
  const finish = () => {
    updateSettings({ studentName: name.trim(), university: maju ? 'Mohammad Ali Jinnah University (MAJU)' : university.trim(), major: program.trim(), priorCgpa: Number(cgpa), priorCredits: Number(credits), gradingPolicy: maju ? DEFAULT_MAJU_POLICY : DEFAULT_CUSTOM_POLICY, studyGoal: goal, profileMode: 'personal' });
    drafts.forEach(addCourse);
    onFinish();
  };
  const titles = ['A little clarity for your next chapter.', 'Let’s make this your space.', 'Pick up where you left off.', 'What are you studying?', 'What matters to you?'];
  return <section className="onboarding"><div className="onboarding-aside"><BrandLogo variant="artwork"/><h2>Your semester.<br/>One step<br/>at a time.</h2><p>Less wondering where you stand.<br/>More knowing what comes next.</p><BookOpen size={56} strokeWidth={1}/></div><div className="onboarding-body"><div className="eyebrow">Welcome to Gradia · Step {step + 1} of 5</div><progress value={step + 1} max={5} aria-label="Setup progress"/><h1>{titles[step]}</h1><form onSubmit={e => { e.preventDefault(); step === 4 ? finish() : setStep(step + 1); }}>
    {step === 0 && <><p>See how you’re doing, find your next step, and turn lecture notes into useful study tools.</p><p>Set up in a few short steps. Everything is optional and can be changed later.</p><button type="button" className="demo-option" onClick={() => { resetToGhunainDemoData(); updateSettings({ profileMode: 'demo' }); onFinish(); }}><b>Explore with sample data <ArrowRight size={18}/></b><span>Try Ghunain’s MAJU profile, with example courses and study material.</span></button></>}
    {step === 1 && <><label>Your name<input autoComplete="given-name" value={name} onChange={e => setName(e.target.value)}/></label><label>University<select value={maju ? 'maju' : 'other'} onChange={e => setMaju(e.target.value === 'maju')}><option value="other">Another university / decide later</option><option value="maju">Mohammad Ali Jinnah University (MAJU)</option></select></label>{!maju && <label>University name (optional)<input value={university} onChange={e => setUniversity(e.target.value)}/></label>}<label>Academic program<input placeholder="e.g. BS Computer Science" value={program} onChange={e => setProgram(e.target.value)}/></label><p>{maju ? 'The MAJU undergraduate scale will be selected.' : 'We will use an editable example scale. Check it against your university policy in Settings before relying on predictions.'}</p></>}
    {step === 2 && <><p>Already completed a semester? Add the results from your transcript. Starting university? Leave these blank.</p><label>Previous CGPA<input type="number" min="0" max="4" step="0.01" value={cgpa} onChange={e => setCgpa(e.target.value)}/></label><label>Completed credits<input type="number" min="0" max="500" step="1" value={credits} onChange={e => setCredits(e.target.value)}/></label><p>CGPA is your average grade point across completed courses.</p></>}
    {step === 3 && <><p>Add a course now, or add all of them later. New courses start with no marks or attendance.</p><label>Course name<input value={courseName} onChange={e => setCourseName(e.target.value)}/></label><div className="setup-row"><label>Course code<input value={courseCode} onChange={e => setCourseCode(e.target.value)}/></label><label>Credits<input type="number" min="1" max="12" value={courseCredits} onChange={e => setCourseCredits(Number(e.target.value))}/></label></div><button className="quiet-button" type="button" disabled={!courseName.trim() || !courseCode.trim() || courseCredits < 1 || courseCredits > 12} onClick={() => { setDrafts([...drafts, { name: courseName.trim(), code: courseCode.trim(), credits: courseCredits, instructor: '', room: '', schedule: '', color: 'indigo', targetGrade: 'A', assessments: [], attendance: { totalClasses: 0, attendedClasses: 0, minThresholdPercent: 75 } }]); setCourseName(''); setCourseCode(''); }}>Add to my courses</button><ul>{drafts.map((c,i) => <li key={i}>{c.code} · {c.name}<button type="button" className="quiet-button" aria-label={`Remove ${c.name}`} onClick={() => setDrafts(drafts.filter((_,n) => n !== i))}>Remove</button></li>)}</ul></>}
    {step === 4 && <><p>A small intention is a good start. Your goal will appear on your overview.</p>{['Build a steady study habit', 'Improve my grades', 'Stay on top of attendance'].map(value => <label className="goal-choice" key={value}><input type="radio" name="goal" checked={goal === value} onChange={() => setGoal(value)}/>{value}</label>)}</>}
    <div className="setup-actions">{step > 0 && <button className="quiet-button" type="button" onClick={() => setStep(step-1)}>Back</button>}<button className="primary-button" type="submit">{step === 4 ? 'Enter my dashboard' : step === 0 ? 'Make it mine' : 'Continue'}<ArrowRight size={17}/></button></div>
    </form><button className="quiet-button" onClick={onFinish}>Skip setup for now</button></div></section>;
}
