# Gradia training video: 14-minute 56-second narration script

Target: 14:56 at roughly 153 words per minute, with room for cursor emphasis and brief pauses. Rehearse pacing; scene durations are editorial targets, not recorded voice timings. The timeline and narration are generated from the same text.

**Required editorial disclosure:** Keep “PRELOADED DEMO SAMPLE — NOT LIVE GEMINI OUTPUT” visible over scenes 14–20 whenever sample study content is shown. Scene 13 must precede those examples. For scene 23, label “REAL 5-MINUTE BREAK; NOT A COMPLETED STUDY SESSION.” Do not edit errors into apparent successes.

All screenshots are real browser captures. Desktop pages were captured at 1920×1080; some numbered screenshots are intentional feature crops. Mobile pages are 390×844. Recordings are silent WebM screen captures; provide your own narration. See SCREENSHOT_INDEX.md for limits and source provenance.

## 00:00–00:32 · Scene 1: Welcome to Gradia

Visuals: `screenshots/01-dashboard-overview.png`, `screenshots/02-personalized-welcome.png`

**On-screen caption:** A clearer next step for every student

**Narration:** Welcome to Gradia, an AI academic workspace that brings course tracking, grade planning, study tools, and focus sessions into one place. A student often has lecture files in one folder, marks in another, and a revision plan only in their head. Gradia connects those activities around a simple question: what should I work on next? This walkthrough uses the explicit demonstration profile. Its sample marks, schedules, study history, and example AI content are not verified personal academic records.

## 00:32–01:04 · Scene 2: Read the dashboard

Visuals: `screenshots/03-academic-progress-attendance.png`, `screenshots/05-calendar-navigation.png`, `screenshots/06-dashboard-focus-timer.png`

**On-screen caption:** Progress, attendance, tasks, and focus

**Narration:** Start on Overview. The welcome card includes the current week, not a timetable imported from the university. The progress bars show how much assessment weight has recorded marks. Attendance summarizes entered class counts. Expected semester GPA is an estimate from eligible recorded marks, while current CGPA uses prior results and completed courses. A new course without marks should not be treated as an automatic A. The dashboard also gives quick access to tasks, a focus timer, and your next study action.

## 01:04–01:36 · Scene 3: Navigate the workspace

Visuals: `screenshots/07-sidebar-modules.png`, `screenshots/40-mobile-navigation.png`

**On-screen caption:** Five modules, one workspace

**Narration:** The sidebar opens Overview, My courses, Grade Rescue, Study and AI, and Focus. Each icon has an accessible name, and desktop labels or tooltips help beginners find their way. The header provides settings access, a theme switch, and attendance notifications. The focus-mode switch opens the Focus module; it does not block other websites. On a phone, the same main choices move into a bottom navigation bar. Your browser window can change without creating a different academic profile.

## 01:36–02:08 · Scene 4: Plan a small task

Visuals: `screenshots/04-example-task.png`, `screenshots/32-completed-task.png`

**On-screen caption:** Add a task, then mark it complete

**Narration:** In My tasks, select Add task. Enter a clear action, optionally choose a due date, set a priority, and save. Here we created a temporary task to review logic gates, then checked it off. The active task count changes immediately. You can also edit or delete a task. These are personal reminders, not deadlines discovered by AI. Tasks persist in browser storage on this device. They use a separate storage key and are not included in the current academic JSON export.

## 02:08–02:40 · Scene 5: Understand your courses

Visuals: `screenshots/08-courses-overview.png`, `screenshots/09-course-details.png`

**On-screen caption:** Open a course to see the details

**Narration:** Open My courses to see the enrolled subjects and credits. Select Digital Logic Design to expand its attendance, assessments, and study links. In this example, eight courses total seventeen credits. The confirmed demonstration profile also includes fifty-three previously completed credits and a previous CGPA of four point zero. The visible timetable, rooms, assessment dates, and marks are illustrative samples. Use the actual course outline and your own records when setting up a personal workspace. Gradia is not a university records portal.

## 02:40–03:12 · Scene 6: Add a course

Visuals: `screenshots/10-add-course-form.png`, `screenshots/52-onboarding-courses.png`

**On-screen caption:** New courses start without marks

**Narration:** Choose Add New Course and enter the course code, name, credit hours, and target grade. Instructor, room, and schedule are optional details you can supply. We filled this form with temporary demonstration values and canceled it, so that screenshot does not prove a new course was saved. The implementation supports saving a course with no assessments and zero recorded classes. You can also draft courses during onboarding. Always check credit values before relying on semester or cumulative calculations.

## 03:12–03:44 · Scene 7: Track attendance

Visuals: `screenshots/11-attendance-tracking.png`

**On-screen caption:** Record attended and missed classes

**Narration:** Within an expanded course, use Attended or Missed to record a class. We clicked Attended once in isolated demo storage, changing the example from nineteen out of twenty to twenty out of twenty-one. The displayed percentage became ninety-five point two. The calculator also estimates how many future classes can be missed while staying at the configured minimum. This depends entirely on accurate counts and your attendance rule. The original demonstration counts approximate supplied percentages; they are not an imported attendance register.

## 03:44–04:16 · Scene 8: Record assessments

Visuals: `screenshots/12-assessment-management.png`, `screenshots/13-course-progress-calculations.png`

**On-screen caption:** Weight, maximum mark, and earned mark

**Narration:** The assessment table separates a task's weight in the course from its maximum raw score. An assessment worth twenty-five percent can still be marked out of one hundred. Enter the mark you actually received and use the completion control appropriately. The total assessment plan should equal one hundred percent. Gradia displays policy warnings and distinguishes graded coursework from the work still remaining. Our capture shows the assessment-entry form; we did not add an extra invented assessment to the demonstration course.

## 04:16–04:48 · Scene 9: Understand grade calculations

Visuals: `screenshots/13-course-progress-calculations.png`, `screenshots/34-maju-grading-policy.png`

**On-screen caption:** Deterministic mathematics, not AI guesses

**Narration:** Grade calculations run in TypeScript and do not need Gemini. Each recorded mark contributes its fraction of the maximum score multiplied by its assessment weight. The current percentage normalizes those contributions over completed weight. That is current performance, not a final transcript grade. The selected grading scale converts the percentage into grade points. Semester GPA weights those points by course credits. Cumulative calculations combine eligible semester quality points with the prior CGPA and completed credits supplied in settings.

## 04:48–05:20 · Scene 10: Choose a Grade Rescue target

Visuals: `screenshots/14-grade-rescue-overview.png`, `screenshots/17-required-marks-explanation.png`

**On-screen caption:** What marks do I need next?

**Narration:** Grade Rescue answers a specific planning question: what average do I need on the remaining work to reach a target grade? Choose a course, then choose a target such as A or A-minus. The screen shows earned points, remaining weight, and a required average. For the sample Digital Logic Design marks, an A requires about eighty-one point six percent across the remaining forty-five percent of course weight. Changing the target recalculates the requirement immediately. These are conditional calculations, not promised results.

## 05:20–05:52 · Scene 11: Explore a scenario

Visuals: `screenshots/15-grade-prediction-interface.png`, `screenshots/16-example-grade-scenario.png`

**On-screen caption:** What-if scores do not change your marks

**Narration:** Expand Explore different assessment scores and move the final-exam slider. We used a hypothetical score of seventy-five out of one hundred. The estimated outcome changes while the actual course record stays unchanged. The semester panel similarly lets you choose assumed grades and compare a simulated cumulative result with your goal. It is a planning tool, not an optimizer that guarantees success. An incomplete or invalid assessment plan prevents a reliable Grade Rescue forecast. Check all remaining weights against the course outline.

## 05:52–06:24 · Scene 12: Bring your study material

Visuals: `screenshots/18-study-ai-overview.png`, `screenshots/19-document-upload.png`

**On-screen caption:** PDF or text becomes study material

**Narration:** Open Study and AI, then Upload Notes or PDF. Give the document a title and associate it with a course. You can select a PDF or text file, or paste notes directly. Before asking for AI output, make sure you have permission to use the material and inspect the extracted text. A saved document is the starting point for summaries, flashcards, quizzes, and tutoring. The revision planner uses course information, missed quiz topics, and document titles rather than silently reading every stored PDF.

## 06:24–06:56 · Scene 13: See PDF extraction

Visuals: `screenshots/20-pdf-text-extracted.png`

**On-screen caption:** Verified: two pages of selectable text

**Narration:** We uploaded the included two-page logic-gates handout through the real interface. PDF.js extracted one thousand one hundred and thirty-one characters, including page separators, and displayed two pages. We then saved the document. Extraction happens in the browser; the PDF file is not sent as a binary file to Gemini by this workflow. Searchable text PDFs work best. The implementation warns when there is little selectable text, but it does not perform optical character recognition. Review and correct the text before saving.

## 06:56–07:28 · Scene 14: Be honest about AI availability

Visuals: `screenshots/43-gemini-summary-unavailable.png`, `screenshots/44-gemini-flashcards-unavailable.png`, `screenshots/45-gemini-quiz-unavailable.png`, `screenshots/46-gemini-revision-unavailable.png`, `screenshots/28-tutor-question-unavailable.png`

**On-screen caption:** Verified failure, not fabricated success

**Narration:** This capture environment has no Gemini server key configured. We actually requested a summary, flashcards, a quiz, a revision plan, and a tutor answer. Each request reported the missing configuration. The app did not invent replacement answers. Captured request evidence confirms that the extracted handout text reached the summary, flashcard, quiz, and tutor endpoints. That proves the browser-to-server handoff, not successful processing by Google. The following learning examples are preloaded samples, clearly separated from the newly uploaded PDF.

## 07:28–08:00 · Scene 15: Read a summary

Visuals: `screenshots/21-sample-summary.png`

**On-screen caption:** Sample summary: structure and study value

**Narration:** This is the built-in Dynamic Programming sample summary, not an answer generated during this recording. It demonstrates the intended output structure: an overview, key takeaways, important concepts, formulas or principles, exam traps, and a study tip. With a working server key and model access, the summary endpoint asks Gemini to build this structure from supplied text. The server checks its shape before returning it. A valid structure does not guarantee factual correctness, so compare explanations and formulas with the original lecture material.

## 08:00–08:32 · Scene 16: Practice with flashcards

Visuals: `screenshots/22-sample-flashcards.png`, `screenshots/47-sample-flashcard-answer.png`

**On-screen caption:** Recall before revealing the answer

**Narration:** Open Flashcards and try answering the question before revealing its back. We flipped a preloaded card about why a greedy method fails for zero-one knapsack. The recall buttons offer Again, Hard, Good, and Easy. In the current implementation, they save a rating and review timestamp. Although day intervals appear on the buttons, there is no complete due-date scheduling engine behind those labels. Describe them as recall feedback, not a verified spaced-repetition scheduler. New card generation still requires a working Gemini connection.

## 08:32–09:04 · Scene 17: Answer a quiz

Visuals: `screenshots/23-sample-quiz-ready.png`, `screenshots/24-answering-sample-quiz.png`

**On-screen caption:** Complete every answer before submitting

**Narration:** Choose Practice quiz. The sample document contains three questions, each with four options. We deliberately answered the first question incorrectly and the other two correctly to demonstrate feedback. Select one option for every question, then submit. The client checks that the attempt is complete and structurally valid before scoring it. New questions and their answer explanations normally come from Gemini, but scoring does not call the model. For this walkthrough, the question set is the preloaded example, not a live-generated quiz.

## 09:04–09:36 · Scene 18: Review the result

Visuals: `screenshots/25-quiz-results-explanations.png`

**On-screen caption:** Verified result: two out of three

**Narration:** After submission, the interface showed a final score of two out of three, or sixty-six point seven percent. Correct and incorrect choices were distinguished and concept explanations became visible. Those explanations belong to the quiz content; they are not a fresh AI diagnosis written after submission. The deterministic grading function compares each selected index with the question's stored correct index. A wrong answer adds its topic label to the attempt's weak-topic list. Retaking a quiz can help you check understanding after reviewing the explanation.

## 09:36–10:08 · Scene 19: Identify the next topic

Visuals: `screenshots/26-weak-topic-workflow.png`

**On-screen caption:** A missed topic is a useful signal

**Narration:** Our recorded attempt saved Space Optimization as the missed topic. That is a simple signal from an incorrect answer, not a psychological assessment or a sophisticated mastery model. Gradia does not have a separate weak-topic report screen. The dashboard first offers unfinished revision work. After we marked the preloaded demo plan blocks complete, it fell back to the missed topic and suggested another look. Those completion clicks were a demonstration action, not evidence that the suggested studying had actually been done.

## 10:08–10:40 · Scene 20: Build a revision plan

Visuals: `screenshots/27-sample-revision-plan.png`, `screenshots/46-gemini-revision-unavailable.png`

**On-screen caption:** Suggested study blocks, not official deadlines

**Narration:** The revision tab lets you choose available study days and hours per day. A request sends quiz weak-topic tags, general document topics, and course information to Gemini. The server checks the returned day sequence, course references, and study durations. The plan shown here is the old sample plan: recomputation failed because no key was configured. With live access, review the generated blocks before following them. They are suggestions, not an official timetable. Existing missed topics are accumulated; the planner does not yet model mastery decay.

## 10:40–11:12 · Scene 21: Ask a follow-up question

Visuals: `screenshots/28-tutor-question-unavailable.png`

**On-screen caption:** Tutor requests include selected source text

**Narration:** Ask a tutor lets you type a question in the context of the selected document. We asked why OR and XOR differ when both inputs are one. The request included the extracted source text and recent conversation history. The interface displayed an actual missing-key error instead of a tutor explanation. The initial welcome greeting is static interface text. With a working connection, use tutoring to clarify a point or request an example, then verify the answer against your notes. Do not describe this capture as a successful AI conversation.

## 11:12–11:44 · Scene 22: Start and pause focus

Visuals: `screenshots/06-dashboard-focus-timer.png`, `screenshots/29-full-focus-timer.png`, `screenshots/30-active-study-session.png`, `screenshots/48-paused-focus-session.png`

**On-screen caption:** One course, one timed session

**Narration:** Open Focus or use the compact dashboard timer. The app offers a twenty-five-minute Pomodoro, fifty-minute deep work, and five- or fifteen-minute breaks. Choose a course, start the timer, and pause when needed. We verified a real countdown and pause. It uses a wall-clock deadline rather than assuming every browser interval fires on time. The timer is shared between its compact and full views within the mounted app, but an active countdown is not restored after a full page reload.

## 11:44–12:16 · Scene 23: Understand completion

Visuals: `screenshots/31-timer-completion-short-break.png`

**On-screen caption:** Verified: a real five-minute break completed

**Narration:** We let a real five-minute break run to zero while preparing other captures. No accelerated clock or edited timer state was used. The app saved a short-break record with a five-minute duration. This demonstrates the timer's completion path, not a completed twenty-five-minute study session. Break records do not increase the focused-minute total, which counts Pomodoro and deep-work sessions. Optional background sounds are synthesized with the Web Audio API. The screen recordings are silent and do not claim to capture or verify their audible quality.

## 12:16–12:48 · Scene 24: Configure your profile

Visuals: `screenshots/33-profile-settings.png`, `screenshots/34-maju-grading-policy.png`, `screenshots/35-university-configuration.png`

**On-screen caption:** Check your university rules

**Narration:** Settings contains profile details, previous credits, CGPA, an attendance minimum, appearance, and grading configuration. The MAJU preset includes its encoded undergraduate boundaries and assessment-weight limits. The custom preset lets other students edit a scale. These values should be checked against current institutional requirements before real academic decisions. We previewed custom configuration and dismissed it without saving. Gemini settings report server-key status and discover available models; they do not ask the student to store an API key in browser storage.

## 12:48–13:20 · Scene 25: Start fresh and find help

Visuals: `screenshots/36-onboarding.png`, `screenshots/50-onboarding-profile.png`, `screenshots/51-onboarding-prior-results.png`, `screenshots/52-onboarding-courses.png`, `screenshots/53-onboarding-goal.png`, `screenshots/54-empty-personal-dashboard.png`, `screenshots/37-how-gradia-works.png`, `screenshots/38-guided-tour.png`

**On-screen caption:** Optional setup; no invented personal records

**Narration:** Onboarding offers two distinct paths: explore explicit sample data or create your own workspace. The personal steps collect optional identity, prior results, courses, and a study goal. We completed them without entering academic records and captured the resulting empty dashboard. There were no fabricated personal marks or attendance entries. How it Works explains the concepts, and the footer Tour control walks through the modules. Use those aids when introducing Gradia to someone who has never used a grade planner or AI study tool.

## 13:20–13:52 · Scene 26: Use the mobile and light views

Visuals: `screenshots/39-mobile-dashboard.png`, `screenshots/40-mobile-navigation.png`, `screenshots/41-mobile-study-ai.png`, `screenshots/42-mobile-courses.png`, `screenshots/49-light-mode-dashboard.png`

**On-screen caption:** The same workflow on a smaller screen

**Narration:** The mobile captures use a three-hundred-and-ninety by eight-hundred-and-forty-four viewport. Widgets stack vertically, navigation stays near the bottom, and courses and the study workspace remain reachable. Scroll to find controls lower on a page. The light-mode capture shows the same dashboard in the alternate theme; we have not redesigned either version for this package. These screenshots verify rendering and basic navigation at that size. They are not a claim that every mobile input, browser, or accessibility combination has received exhaustive testing.

## 13:52–14:24 · Scene 27: Know where data goes

Visuals: `screenshots/33-profile-settings.png`, `screenshots/54-empty-personal-dashboard.png`

**On-screen caption:** Local storage is not cloud synchronization

**Narration:** Academic records and study documents live in browser localStorage, managed by the AcademicProvider. Settings can export and import an academic JSON bundle. That export currently omits the separate tasks collection. There is no implemented account-based cloud synchronization, so another browser or origin has different data. AI generation sends relevant text or planning context to the Express server and then Gemini when configured. The server holds the API key. Back up important records, and avoid treating local storage as an encrypted or institutionally verified records system.

## 14:24–14:56 · Scene 28: Present the learning workflow

Visuals: `screenshots/20-pdf-text-extracted.png`, `screenshots/25-quiz-results-explanations.png`, `screenshots/26-weak-topic-workflow.png`, `screenshots/27-sample-revision-plan.png`, `screenshots/43-gemini-summary-unavailable.png`

**On-screen caption:** Verified local workflow; live AI still requires setup

**Narration:** For judges, connect the pieces: bring lecture material, extract readable text, create study aids when AI is available, answer a quiz, identify missed topics, and plan the next revision block. The strongest demonstration separates deterministic academic mathematics from generative assistance. In this package, PDF extraction, local sample-quiz scoring, missed-topic persistence, navigation, tasks, attendance interaction, and timer completion were observed. Live Gemini generation remains unavailable. Use the included three-minute demo plan and its honest offline fallback. Gradia's promise is a clearer next action, supported by evidence rather than invented certainty.

## Editing instructions

- Maintain the 28 scenes in order. Use slow pans on full desktop views and hold feature crops at readable scale. Do not stretch mobile screenshots horizontally.
- A scene can switch among its listed stills while the narration continues. The full sequence lasts 896 seconds.
- Seven optional silent recordings are indexed in SCREENSHOT_INDEX.md. They demonstrate real interactions; they do not replace the missing live Gemini evidence.
- Add captions in the video editor, not by changing the original screenshots. Preserve demo and error notices.
- The accompanying PDF and sanitized request/quiz/timer evidence support the narration. No API credentials are included.
- Narration word count: 2281. Estimated reading rate for 14 minutes 56 seconds: 153 words/minute.
