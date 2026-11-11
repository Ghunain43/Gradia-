# Gradia technical walkthrough

This document describes the checked-out source as captured on 11 November 2026. It is an implementation guide, not a claim of institutional certification or complete end-to-end testing. All source paths below are relative to the project root. The visual design and application functionality were not changed for this package.

## Architecture and entry points

- **Frontend:** React 19, TypeScript, Vite and Tailwind CSS. `src/main.tsx` mounts the application with `AppErrorBoundary`. `src/App.tsx` contains `MainApp` and the `AcademicProvider` wrapper. The main module is selected using local React state rather than a URL-based client router.
- **State:** `src/context/AcademicContext.tsx` exposes courses, documents, quiz attempts, revision plan, focus history, settings, CRUD operations and AI request functions through `useAcademic()`.
- **Views:** `DashboardView.tsx`, `CoursesView.tsx`, `GradeRescueView.tsx`, `StudyAIView.tsx` and `FocusTimerView.tsx`. `Navbar.tsx` switches among them. `OnboardingView.tsx`, `SettingsModal.tsx`, `HowGradiaWorksModal.tsx` and `GuidedTourOverlay.tsx` support setup and help.
- **Presentation:** `src/index.css` contains the shared glass/MAJU-blue styles and responsive behavior. `BrandLogo.tsx` renders the existing supplied artwork. This capture task made no style changes.
- **Backend:** `server.ts` creates an Express app. Development mode attaches Vite middleware. Production mode serves `dist` and the SPA fallback. JSON bodies are limited to 20 MB, with smaller endpoint-specific text limits.
- **Scripts:** `npm run dev` runs `tsx server.ts`; `npm run lint` runs `tsc --noEmit`; `npm run build` runs TypeScript checking then Vite; `npm start` runs the TypeScript server with tsx; `npm test` runs grading, startup and reliability tests. Set `NODE_ENV=production` for production serving. `npm run preview` alone is Vite preview, not the complete Express/Gemini backend.

## Server API and Gemini boundary

| Route | Actual responsibility |
|---|---|
| `GET /api/health` | Server health and whether a key is configured. It does not prove successful generation. |
| `GET /api/gemini/models` | Calls model discovery for the server key, filters supported generation actions, and reports a selected model or actionable error. |
| `POST /api/gemini/summarize` | Sends supplied document text to Gemini with a structured summary schema. |
| `POST /api/gemini/flashcards` | Requests a bounded number of cards, then validates their shape, count and difficulty. |
| `POST /api/gemini/quiz` | Requests questions, four distinct choices, answer indices, explanations and topic tags. |
| `POST /api/gemini/revision-plan` | Requests days and study blocks from supplied course context, missed topics, general topics and available time. |
| `POST /api/gemini/tutor` | Sends the selected document text, question and last six conversation messages to a tutor prompt. |

`server/gemini.ts` contains `client`, `discoverModels`, `selectModel`, `validateRequest`, `checkedGenerate`, `validateOutput` and `publicAiError`. `client()` reads only the server environment's `GEMINI_API_KEY`. No key is needed in a browser setting or a `VITE_` variable.

`discoverModels()` uses the SDK catalogue and keeps Gemini entries whose `supportedActions` includes `generateContent`. `GEMINI_MODEL`, when set, takes precedence over a saved browser preference. Otherwise the preference must appear in the catalogue, or the helper selects a listed text-oriented model. The filtering is heuristic: catalogue presence does not prove every model supports every requested structured-output feature or that paid quota is available. Access is discovered on requests, not assumed from a hardcoded name.

`checkedGenerate()` supplies a grounding instruction, rejects empty text, parses requested JSON and validates required fields. `validateOutput()` checks generated item counts, distinct quiz choices, integer answer indices from zero through three, permitted card difficulty and revision-plan constraints. Revision days must match the requested count and ordering; session course codes must be supplied; durations must fit daily capacity and agree with totalHours. Card/question IDs are assigned on the server. Structural validity is not semantic correctness: generated explanations and answer keys still need source review.

The server SDK uses a 35-second HTTP timeout; browser POST requests use a 90-second abort timeout. Error handling distinguishes missing configuration, invalid input, quota/rate limits, rejected credentials/access, invalid JSON/response shape and generic network/provider failures. It returns friendly errors without raw provider exception content. There is no success-shaped fallback answer. Public deployment authentication and per-user AI rate limits are not implemented in this sprint.

In `AcademicContext.tsx`, `generateSummary`, `generateFlashcards`, `generateQuiz`, `generateAdaptiveRevisionPlan`, and `askTutor` coordinate loading/error state and requests. Successful document results merge into the current matching document only while its source text still matches the request snapshot. A failed operation retains existing saved content. Tutor conversation UI state lives in `StudyAIView.tsx`, not the academic export.

## PDF and document pipeline

`src/utils/pdfExtractor.ts` exports `extractTextFromPdf(file)`:

1. Dynamically load `pdfjs-dist` and its matching worker URL, keeping browser PDF initialization off the startup path.
2. Read the selected file into an ArrayBuffer and pass bytes to `pdfjsLib.getDocument`.
3. Read `numPages`; loop over each page and call `getTextContent()`.
4. Join text items and insert `--- Page N ---` separators.
5. Count pages with more than ten characters; flag a document if extracted text is very short or no page has meaningful selectable text.
6. Optionally read title/author metadata and destroy the loading task in `finally`.

`StudyAIView.handleFileUpload` shows page count and extraction notice and fills an editable text area. `handleSaveDocument` calls the provider's `addDocument`, which computes a word count and saves the text. The page count is extraction-preview state rather than a stored `DocumentNote` page-count field. File reading for TXT/MD/JSON uses FileReader.

There is **no OCR**. A scanned PDF needs external text recognition or pasted text. There is no automatic long-document chunking: generation endpoints accept at most 45,000 characters. This package verified a two-page searchable fixture, not corrupted, encrypted, image-only, enormous or mixed-layout PDFs. Request evidence verifies the extracted text was sent to four relevant Express routes. Gemini did not receive successful generation calls because configuration was missing.

## Deterministic academic calculations

`src/utils/calculations.ts` owns the calculations. The AI service does not determine GPA, attendance or Grade Rescue mathematics.

For completed valid assessments, `calculateCourseScore()` accumulates:

`earnedWeightPoints = sum((currentScore / maxScore) * weightPercent)`

`currentPercentage = earnedWeightPoints / completedWeight * 100`, when there is eligible completed weight.

The result describes current performance and remaining weight. It validates finite weights and score bounds. A finalized course needs a valid total weight of 100%, completed assessments and valid recorded marks. It must not become final merely because an overweight plan exceeds 100%. Values are formatted/rounded in the calculation summaries; do not describe all intermediate arithmetic as arbitrary-precision computation.

`percentageToGrade()` uses the selected scale and rounding policy. The encoded MAJU preset is A 86/4.00, A-minus 82/3.67, B-plus 78/3.33, B 74/3.00, B-minus 70/2.67, C-plus 66/2.33, C 62/2.00, C-minus 58/1.67, D-plus 54/1.33, D 50/1.00 and F 0/0.00. The default is raw boundary comparison; other rounding modes are configurable. D-plus includes an explanatory policy note. This is the application's preset, not a fresh external verification of university rules.

`validateCourseAssessmentWeights()` checks total weight and the configured category limits. The MAJU defaults are midterm 20–25%, coursework 10–35% and final 40–50%. Course policy warnings and score finalization are related but distinct checks; do not claim every departmental exception is encoded.

`calculateSemesterGPA()` weights eligible grade points by credits. Courses with no recorded marks do not add assumed A grades to its projection. `projectedCredits` explains the included denominator. Finalized GPA uses only finalized courses and is null if none exist.

`calculateCGPA()` combines prior quality points (`priorCredits * priorCgpa`) with eligible projected or finalized semester quality points and their corresponding credit denominators. Enrolled credits are also reported separately. Incomplete-course estimates are not transcript results.

`simulateGradeRescue()` computes `(targetPercent - earnedWeightPoints) / remainingWeight * 100`. It returns incomplete-plan, secured, feasible, challenging, extreme or impossible statuses as appropriate. `GradeRescueView` also provides a local final-assessment what-if slider and a separate assumed-grade semester scenario. Its suggest-scenario button selects a grade-scale outcome; it is not a constraint solver that proves the target is achievable for every course.

## Attendance

`calculateAttendance(totalClasses, attendedClasses, thresholdPercent)` computes the fraction attended, warning state, safe future misses and required consecutive attendance. For threshold ratio `t`, safe misses use `floor((attended - t*total)/t)`, bounded below by zero. Below the threshold, required consecutive attendance uses `ceil((t*total - attended)/(1-t))`. These formulas require sensible counts and a sensible threshold. The UI should show no recorded attendance when there are zero classes; the utility itself has a historical 100% zero-class sentinel. Do not treat that sentinel as evidence of actual attendance.

The course view updates entered counts with its attended/missed controls. This is manual tracking, not an integration with an institutional attendance system. The capture verified one attended increment in a disposable profile; it was not a complete attendance edge-case audit.

## Quiz scoring and weak topics

`src/utils/quiz.ts::gradeQuiz()` rejects empty quizzes, duplicate IDs, invalid answer indices, wrong option counts and unanswered questions. It compares answer indices, returns score/total/percentage and deduplicates the topic labels of missed questions. `StudyAIView.handleGradeQuiz` records the result via `recordQuizResult` and guards a repeated submit in that attempt. Feedback explanations are stored quiz content, not an extra AI grading call.

`AcademicContext` combines saved attempts' `weakTopics` for revision requests. Document titles are supplied separately as general study topics. The current algorithm does not weight recency, estimate mastery, forget old mistakes or remove a topic automatically after a later correct answer. `DashboardView` chooses an unfinished revision session first, then a saved missed topic. There is no standalone weak-topic analytics page.

`updateFlashcardRating()` stores the rating and lastReviewed timestamp. The visible day labels do not implement a complete future review queue.

## Revision planning

The client supplies all collected missed-topic tags, general document titles, course code/name/credits and assessment details, plus requested days and daily hours. The backend's Gemini prompt and schema produce a structured roadmap; this is generative planning, not a deterministic optimization engine. `toggleRevisionSession()` toggles saved completion flags. Existing plans remain available when generation fails. The preloaded sample plan in this package contains illustrative academic language and dates; it is not newly inferred from the uploaded logic handout or the captured quiz result.

## Persistence, setup and errors

`src/utils/academicStorage.ts` defines and validates these localStorage keys:

- `gradia_courses_v3`, `gradia_documents_v3`, `gradia_quiz_results_v3`
- `gradia_revision_plan_v3`, `gradia_focus_history_v3`, `gradia_settings_v3`

`TasksWidget.tsx` independently uses `gradia_student_tasks_v1`. Setup completion uses `gradia_setup_done`. The provider's `exportDataJson` exports academic state and metadata; it omits the separate tasks collection. `importDataJson` validates a bundle before applying its supplied fields. No database, login service, automatic cross-device sync or encrypted storage is implemented.

`src/data/defaultSettings.ts` supplies neutral personal defaults; `src/data/mockData.ts` supplies explicit demo data. `OnboardingView` creates the optional personal profile or explicitly loads that demo. Existing saved data is not silently reset for capture. The UI's sample banner identifies unverified marks/history and approximate attendance counts.

`AppErrorBoundary.tsx` provides recovery feedback and a non-destructive backup option. Storage validation rejects malformed structures instead of silently inventing records. Task storage has its own read/write feedback. Provider persistence catches storage errors, but a comprehensive storage-full/cross-tab durability audit was not part of this capture task.

## Focus timer

`FocusTimerView.tsx` contains 25/50/5/15-minute modes. A wall-clock `endAt` deadline and 250 ms polling compute remaining seconds; start/pause/reset and mode changes manage this state. At zero it stops, plays a chime and calls `recordFocusSession`. `App.tsx` keeps the timer mounted while switching compact/full views. Countdown state is in memory, not restored after reload. Completed records persist. Today's focused-minute totals include only Pomodoro/deep-work modes, excluding breaks.

`src/utils/audio.ts` synthesizes ambient noise and chimes through Web Audio. No external music service is involved. The captured completion was an actual five-minute short break. Audible sound quality was not tested, and the clips have no audio track.

## Evidence and outstanding work

Read `VERIFICATION.md`, `request-evidence.json`, `quiz-evidence.json`, `timer-evidence.json`, and the screenshot index. Prior sprint automated checks passed, but were not rerun for this documentation-only task. This task verified real UI interactions and PDF extraction. It did not complete live Gemini generation, a full PDF-to-new-AI-quiz-to-new-plan flow, scanned-PDF testing, course-save/delete testing, export/import restoration or all-device QA. No changes were made to application functionality to hide these limitations.
