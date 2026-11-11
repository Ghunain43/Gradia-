import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server';
import { client, discoverModels, selectModel, publicAiError, validateOutput } from '../server/gemini';
import { INITIAL_COURSES, INITIAL_USER_SETTINGS } from '../src/data/mockData';
import { calculateCGPA, calculateCourseScore, calculateSemesterGPA, simulateGradeRescue } from '../src/utils/calculations';
import { validateAcademicImport } from '../src/utils/academicStorage';
import { gradeQuiz } from '../src/utils/quiz';
const course = structuredClone(INITIAL_COURSES[0]);
const blank = { ...course, assessments: [] };
test('confirmed profile and enrollment remain intact', () => {
  assert.equal(INITIAL_USER_SETTINGS.studentName, 'Ghunain Fayaz');
  assert.equal(INITIAL_USER_SETTINGS.priorCredits, 53);
  assert.equal(INITIAL_USER_SETTINGS.priorCgpa, 4);
  assert.equal(INITIAL_COURSES.length, 8);
  assert.equal(INITIAL_COURSES.reduce((s,c) => s+c.credits,0),17);
  assert.equal(INITIAL_USER_SETTINGS.profileMode, 'demo');
});
test('unmarked courses never add assumed A grades or credits to forecasts', () => {
  assert.equal(calculateCourseScore(blank).hasRecordedScores, false);
  const partial = { ...course, assessments: [{id:'a',name:'Quiz',weightPercent:20,maxScore:100,currentScore:70,completed:true}] };
  const alone = calculateSemesterGPA([partial]);
  const mixed = calculateSemesterGPA([partial, blank]);
  assert.equal(mixed.projectedGpa, alone.projectedGpa);
  assert.equal(mixed.projectedCredits, course.credits);
  assert.equal(calculateCGPA([blank],53,4).projectedCgpa,4);
  assert.equal(calculateSemesterGPA([blank]).finalizedGpa,null);
});
test('overweight, missing and invalid scores cannot finalize or secure a grade', () => {
  for (const assessments of [
    [{id:'a',name:'Exam',weightPercent:110,maxScore:100,currentScore:95,completed:true}],
    [{id:'a',name:'Exam',weightPercent:100,maxScore:100,completed:true}],
    [{id:'a',name:'Exam',weightPercent:100,maxScore:100,currentScore:101,completed:true}],
    [{id:'a',name:'Exam',weightPercent:100,maxScore:100,currentScore:-1,completed:true}],
  ]) {
    const c = {...course, assessments};
    assert.equal(calculateCourseScore(c).isFullyCompleted,false);
    assert.equal(simulateGradeRescue(c,'A').feasibility,'incomplete');
  }
});
test('partial settings do not invent identity or previous results', () => {
  const result = validateAcademicImport({settings:{studentName:'New student'}}).settings!;
  assert.equal(result.priorCredits,0); assert.equal(result.priorCgpa,0); assert.equal(result.university,'');
});
const question = { id:'q', question:'Question?', options:['A','B','C','D'], correctIndex:1, explanation:'Because B',topic:'Logic' };
test('quiz grading requires complete valid attempts and identifies only missed topics', () => {
  assert.throws(() => gradeQuiz([],{}));
  assert.throws(() => gradeQuiz([question],{}));
  assert.throws(() => gradeQuiz([{...question,correctIndex:7}],{q:1}));
  assert.deepEqual(gradeQuiz([question],{q:1}),{score:1,total:1,percentage:100,weakTopics:[]});
  assert.deepEqual(gradeQuiz([question],{q:0}).weakTopics,['Logic']);
});
test('model selection respects server configuration and rejects unavailable names', async () => {
  const fake:any = {models:{list:async function*(){yield {name:'models/gemini-test-flash', supportedActions:['generateContent']}; yield {name:'models/embedding',supportedActions:['embedContent']};}}};
  const names = await discoverModels(fake);
  assert.deepEqual(names,['gemini-test-flash']);
  assert.equal(selectModel(names,undefined,''),'gemini-test-flash');
  assert.equal(selectModel(names,'unavailable','gemini-test-flash'),'gemini-test-flash');
  assert.throws(() => selectModel(names,'unavailable',''));
});
test('errors conceal raw provider details and explain quota, permission and network failures', () => {
  assert.equal(publicAiError({status:429}).status,429);
  assert.match(publicAiError({status:403,message:'secret-key'}).error,/permissions/);
  assert.doesNotMatch(publicAiError(new Error('secret-key')).error,/secret-key/);
  assert.equal(publicAiError(new SyntaxError()).status,502);
});
test('invalid quiz answers and impossible revision durations are rejected', () => {
  assert.throws(() => validateOutput('quiz',[{...question,correctIndex:8}],{count:1}));
  assert.throws(() => validateOutput('quiz',[{...question,options:['A','A','C','D']}],{count:1}));
  assert.throws(() => validateOutput('revision-plan',{dailySchedules:[{dayNumber:1,totalHours:2,sessions:[{courseCode:'CS',durationMinutes:120}]}]},{daysAvailable:1,dailyHours:1,courses:[{code:'CS'}]}));
});
test('actual HTTP endpoints: all five flows, source grounding, missing key and malformed output', async () => {
  const server = app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve => server.once('listening',resolve));
  const address = server.address() as {port:number};
  const base = `http://127.0.0.1:${address.port}`;
  const originalClient = app.locals.geminiClient;
  const originalModel = process.env.GEMINI_MODEL;
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL;
  let output:any, captured = '';
  const fake = {models:{list:async function*(){yield {name:'models/gemini-test-flash',supportedActions:['generateContent']};},generateContent:async (request:any)=>{captured=request.contents;return {text:typeof output==='string'?output:JSON.stringify(output)};}}};
  const post = (route:string,body:any) => fetch(`${base}/api/gemini/${route}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  try {
    delete process.env.GEMINI_API_KEY;
    app.locals.geminiClient = client;
    for (const [route,body] of [['summarize',{content:'notes'}],['flashcards',{content:'notes'}],['quiz',{content:'notes'}],['tutor',{query:'Explain'}],['revision-plan',{courses:[{code:'CS',name:'Logic'}]}]] as const) assert.equal((await post(route,body)).status,503);
    app.locals.geminiClient = () => fake;
    assert.equal((await fetch(`${base}/api/gemini/models`)).status,200);
    output={overview:'Overview',keyTakeaways:['Point'],coreConcepts:[{term:'Logic',definition:'Reasoning'}],formulasAndTheorems:[],examTraps:['Trap'],studyTip:'Practice'};
    assert.equal((await post('summarize',{content:'SOURCE TEXT'})).status,200); assert.match(captured,/SOURCE TEXT/);
    output=[{front:'Question',back:'Answer',topic:'Logic',difficulty:'Easy'}];
    let response=await post('flashcards',{content:'SOURCE TEXT',count:1}); assert.equal(response.status,200); assert.equal((await response.json()).flashcards[0].status,'new');
    output=[question]; response=await post('quiz',{content:'SOURCE TEXT',count:1}); assert.equal(response.status,200);
    const questions=(await response.json()).questions; assert.equal(gradeQuiz(questions,{[questions[0].id]:0}).score,0);
    output={strategyOverview:'Review missed Logic',dailySchedules:[{dayNumber:1,dayTitle:'Review',totalHours:1,sessions:[{courseCode:'CS',topic:'Logic',durationMinutes:60,technique:'Recall',specificGoal:'Solve questions'}]}],highYieldChecklist:['Review errors']};
    assert.equal((await post('revision-plan',{weakTopics:['Logic'],courses:[{code:'CS',name:'Logic'}],daysAvailable:1,dailyHours:1})).status,200); assert.match(captured,/Logic/);
    output='A grounded explanation'; assert.equal((await post('tutor',{query:'Explain',content:'DOCUMENT SOURCE'})).status,200); assert.match(captured,/DOCUMENT SOURCE/);
    for (const invalid of ['', '{}', 'not JSON']) { output=invalid; assert.equal((await post('summarize',{content:'notes'})).status,502); }
    output=[{...question,options:[]}]; assert.equal((await post('quiz',{content:'notes',count:1})).status,502);
    assert.equal((await post('quiz',{content:' ',count:1})).status,400);
    assert.equal((await post('flashcards',{content:'notes',count:-1})).status,400);
    assert.equal((await post('tutor',{query:'Explain',conversationHistory:{}})).status,400);
    assert.equal((await post('revision-plan',{daysAvailable:-1})).status,400);
  } finally {
    app.locals.geminiClient=originalClient;
    if(originalModel===undefined) delete process.env.GEMINI_MODEL; else process.env.GEMINI_MODEL=originalModel;
    if(originalKey===undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY=originalKey;
    await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  }
});
