from pathlib import Path
import json,struct
r=Path('gradia-video-assets')
# Per-capture observations from the real browser session; no inferred live AI successes.
rows=[
(1,'Dashboard overview','Open the explicit demo workspace','Widgets and five-module shell render','This is the demonstration workspace, not a verified transcript.'),
(2,'Personalized welcome','Read the welcome banner','Name, motivation and current week','Start with a small next step.'),
(3,'Progress and attendance','Read graded weight and attendance','Two academic widgets with eligible-credit estimate','Graded coursework and attendance answer different questions.'),
(4,'Example task','Create a high-priority temporary reminder','New task appears with its unchecked box','Make the next study action specific.'),
(5,'Weekly calendar','Read the current week','Today highlighted; no academic schedule integration','This strip shows dates, not imported class meetings.'),
(6,'Dashboard timer','View the compact focus controls','Ready state for the shared timer','Choose a course and start a focused block.'),
(7,'Sidebar modules','Choose among the five modules','Real icon rail with accessible names','Move between tracking, planning, studying, and focus.'),
(8,'Course overview','Browse the enrolled subjects','Eight courses in the explicit demo profile','Course credits drive the GPA calculations.'),
(9,'Course details','Expand Digital Logic Design','Attendance and assessment table','Open a course to see the evidence behind its estimate.'),
(10,'Add course form','Enter temporary code and name; cancel','Form fields and target grade selector','New courses begin without assessment marks.'),
(11,'Attendance','Click Attended once','Demo counts change from 19/20 to 20/21; 95.2%','Record each class consistently.'),
(12,'Assessment management','Open Add Assessment','Category, weight and maximum-mark inputs','Assessment weight differs from the maximum mark.'),
(13,'Course calculations','Inspect the recorded marks','55% graded and current normalized performance','Current performance is not a final course result.'),
(14,'Grade Rescue overview','Open Grade Rescue','Target selection and required-average explanation','Ask what marks are needed on the remaining work.'),
(15,'Prediction controls','Expand assessment simulation','Interactive what-if final-exam slider','Explore a scenario without changing the stored mark.'),
(16,'Example scenario','Set the final-exam slider to 75','Hypothetical course outcome recalculates','This is an assumption, not a newly recorded result.'),
(17,'Required marks','Select target A-minus','Required average for the lower target recalculates','The target threshold and remaining weight determine the result.'),
(18,'Study overview','Open Study and AI','Material list and preloaded summary interface','Bring your own lecture material to the study workspace.'),
(19,'Upload interface','Open Upload Notes / PDF','Title, associated course, file input and text area','A searchable PDF or pasted notes work best.'),
(20,'PDF extraction','Upload the included two-page handout','PDF.js reports 2 pages and 1,131 characters','Review extracted text before saving it.'),
(21,'Summary example','Open the preloaded algorithms document','Sample overview, concepts and takeaways','This is a built-in sample summary, not live Gemini output.'),
(22,'Flashcards example','Open Flashcards on the sample document','Question face and recall-rating controls','Try recalling the answer before you reveal it.'),
(23,'Quiz questions','Open the sample three-question quiz','Four options per question and scoring control','Complete every answer before submitting.'),
(24,'Answering a quiz','Choose answers A, C and B','All three sample questions answered','We deliberately miss one question to demonstrate feedback.'),
(25,'Quiz results','Submit the sample attempt','Actual 2/3 score and answer explanations','Scoring compares selected choices with the stored answer key.'),
(26,'Weak-topic suggestion','Mark sample plan blocks complete; return to Overview','Dashboard suggests Space Optimization from the new missed answer','Once no unfinished plan block remains, review a missed topic.'),
(27,'Revision plan example','Open Revision plan','Days/hours controls and preloaded study blocks','This is the old sample plan; it was not regenerated.'),
(28,'Tutor error','Ask a question about the uploaded logic notes','Real missing-key error after submission','The app reports failure instead of inventing an answer.'),
(29,'Full Focus Timer','Open Focus','Four timer modes and ambient sound controls','Choose a session that fits the work.'),
(30,'Active focus','Start a Pomodoro session','Real countdown at 24:59','A focus block is running.'),
(31,'Timer completion','Allow a real five-minute break to finish','00:00 and a persisted shortbreak completion record','This is a completed break, not a 25-minute study session.'),
(32,'Completed task','Check off the temporary task','Strikethrough and active-task count zero','Mark small steps complete as you finish them.'),
(33,'Profile settings','Open Settings','Demo identity, prior results, theme and missing-key status','Your assumptions and prior results are configurable.'),
(34,'MAJU policy','Expand Grading rules','Encoded MAJU boundaries and assessment ranges','Check the preset against your institution’s current rules.'),
(35,'Custom university','Preview Custom University; cancel','Editable scale and weight limits','Other institutions need their own verified configuration.'),
(36,'Onboarding welcome','Open a fresh isolated browser context','Demo versus personal setup choices','Explore samples or start with your own blank profile.'),
(37,'How Gradia Works','Open the help modal','Twelve explanation topics','Help explains the calculations and AI workflow.'),
(38,'Guided tour','Launch the footer Tour control','Dashboard tour popover','Use the tour to introduce the main modules.'),
(39,'Mobile dashboard','Open Overview at 390 by 844','Stacked cards and bottom navigation','The layout adapts to a phone-sized screen.'),
(40,'Mobile navigation','Scroll the mobile Overview','Navigation remains available while scrolling','Switch modules from the bottom bar.'),
(41,'Mobile Study and AI','Tap Study and AI','Study workspace at phone width','The same materials are accessible in a smaller layout.'),
(42,'Mobile courses','Tap My courses','Responsive course list','Open your course without returning to a desktop.'),
(43,'Summary error','Request a summary from the uploaded PDF','Actual missing-key notice; no new summary','Extraction succeeds independently of AI availability.'),
(44,'Flashcard error','Request six cards from the uploaded PDF','Actual missing-key notice; no new cards','A failed API call does not create replacement cards.'),
(45,'Quiz error','Request five questions from the uploaded PDF','Actual missing-key notice; no new quiz','No fresh questions are available until the server is configured.'),
(46,'Revision error','Click Recompute Plan','Missing-key error while the old sample plan remains','An existing plan is not evidence of a successful regeneration.'),
(47,'Flashcard answer','Click the sample card to flip it','Answer face is visible','Compare your recalled answer with the sample explanation.'),
(48,'Paused focus','Pause the running Pomodoro','Countdown stops at 24:58','Pause and continue without claiming completed study time.'),
(49,'Light theme','Toggle the header theme button','Light-mode dashboard','The same workspace supports both visual themes.'),
(50,'Onboarding identity','Continue to personal-profile step','Optional blank identity fields','Fill only what you want to use.'),
(51,'Onboarding prior results','Continue without entering identity','Optional prior CGPA and credit inputs','Use real transcript values or leave these blank.'),
(52,'Onboarding courses','Continue to initial course setup','Optional course drafts','You can add courses now or later.'),
(53,'Onboarding goal','Continue to the final setup step','Study-goal choices','Choose a small intention for the semester.'),
(54,'Empty personal dashboard','Finish setup with no academic inputs','No fabricated grades, courses or attendance','A personal workspace begins with your actual inputs.')]
manifest=[]
for n,feature,action,shows,narration in rows:
 p=next((r/'screenshots').glob(f'{n:02}-*.png'))
 w,h=struct.unpack('>II',p.read_bytes()[16:24])
 limit='Captured in isolated browser storage; original saved academic data was untouched.'
 tested='Rendered and interacted with as described; not exhaustive functional QA.'
 if n in [1,2,3,8,9,11,12,13,14,15,16,17,33]: limit+=' Demo marks, rooms, schedules and dates are illustrative, not verified student records.'
 if n in [18,21,22,23,24,25,27,47]: limit+=' PRELOADED SAMPLE content, not live Gemini output and not generated from the newly uploaded PDF.'
 if n in [28,43,44,45,46]: limit+=' Live Gemini unavailable: server key not configured. Error path tested; generation success not tested.'
 if n==26:limit+=' No separate weak-topic report. Demo plan completion clicks are illustrative; they do not prove studying was performed. The missed-topic evidence came from the real 2/3 quiz attempt.'
 if n==27:limit+=' Recompute failed; no fresh personalized recommendation was produced.'
 if n==31:limit+=' Real five-minute break completed without time acceleration. A full 25-minute study completion was not captured; break time is excluded from focused-minute totals.'
 if n in [10,12,35]: tested='Form opened and inspected; values previewed where described. No save/create success claim for this capture.'
 if n in [22,47]:limit+=' Recall buttons save rating/timestamp; their day labels are not backed by a complete scheduled-review engine.'
 if n==20:limit+=' Text PDF tested successfully; scanned and corrupted PDF errors were not exercised in this capture task. No OCR implementation.'
 if n in [39,40,41,42]:limit+=' Basic mobile rendering/navigation tested at one viewport; not comprehensive device QA.'
 manifest.append(dict(number=n,filename='screenshots/'+p.name,feature=feature,student_action=action,demonstrates=shows,suggested_narration=narration,tested=tested,limitations=limit,width=w,height=h))
(r/'capture-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
lines=['# Screenshot and recording index','','54 PNG screenshots. All are real application captures. Desktop viewport: 1920×1080; selected screenshots are native feature crops. Mobile viewport: 390×844. Crops preserve actual rendered pixels; no interface mockups or fabricated output were substituted.','','## Important evidence boundaries','','- Gemini had no configured server key. Fresh generation did not succeed. Samples in screenshots 18, 21–25, 27 and 47 are preloaded demo content.','- The real uploaded PDF, extraction text, request metadata, quiz result and timer evidence are included. They contain demonstration material only.','- Screenshot 26 shows the dashboard fallback to a saved missed topic after demo plan blocks were marked complete. There is no dedicated weak-topic report page.','- Screenshot 31 is actual five-minute break completion, not a 25-minute study completion.','- Original browser profiles and academic data were never used or reset. All actions happened in newly created nonpersistent browser contexts.','']
for m in manifest:
 lines += [f"## {m['number']:02} · {m['feature']}",'',f"- File: [{m['filename']}]({m['filename']}) ({m['width']}×{m['height']})",f"- Student action: {m['student_action']}",f"- Demonstrates: {m['demonstrates']}",f"- Suggested narration: {m['suggested_narration']}",f"- Tested: {m['tested']}",f"- Limitations: {m['limitations']}",'']
lines+=['## Silent screen recordings','','These seven WebM clips were cut from real Playwright video capture. No voice-over or application audio is present. They are optional editing inserts; the 14-minute narration timeline uses still screenshots.','']
for v in json.loads((r/'recordings-manifest.json').read_text()):
 lines += [f"- [{v['filename']}]({v['filename']}) — {v['feature'].replace('-',' ')}, approximately {v['requestedDurationSeconds']} seconds."]
lines += ['','Recording caveats: course entry is demonstrated without saving a new course; the PDF clip ends with an AI configuration failure; quiz/revision content is preloaded sample material; the focus clip shows start and pause, not a complete study session. Short clips may be held or looped during editing only when the narration does not imply additional progress.']
(r/'SCREENSHOT_INDEX.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('Indexed',len(manifest),'screenshots')
