# Gradia reliability audit: Stages 1 and 2

Date: 11 November 2026. UI design preserved. No GitHub push. Stages 3–5 have not been completed.

## Confirmed bugs and fixes

- Unmarked courses received a 100%/A assumption in the calculation engine. Forecasts now exclude unmarked or invalid courses and use only their eligible credits in GPA/CGPA denominators. Dashboard explains covered credits. Prior confirmed results remain intact.
- A completed weight >=100 could finalize invalid assessment plans. Finalization now requires a valid 100% plan, every assessment completed, and finite scores within bounds. Grade Rescue and its assessment simulation do not forecast invalid/incomplete plans.
- Partial saved settings inherited Ghunain's identity and prior results. Missing values now use neutral defaults; existing values and legacy grading policies are retained. No storage keys were changed and no saved records were deleted.
- Demo provenance was unclear outside the dashboard. Explicit demo mode now carries an application-wide notice identifying sample marks, dates, rooms, schedules, study history, AI examples and sample-dependent predictions. The confirmed profile, eight course names/credits, 53 completed credits, 17 enrolled credits, prior 4.00 CGPA and existing attendance values remain unchanged. Constructed attendance counts are disclosed as approximations of supplied percentages. New personal profiles continue to start empty.
- The server presumed a model name was accessible and browser preferences could override server configuration. Model discovery now checks the key's generateContent catalogue. GEMINI_MODEL takes precedence, otherwise a saved available model or an available text model is selected. Settings lists discovered models. Catalogue access is not represented as successful generation or sufficient quota.
- Malformed quizzes received invented options and clamped answer indices; empty tutor responses received canned replies. These substitutions were removed. Schema, item counts, answer choices/indices, flashcard difficulty and revision durations/course references are validated before returning results.
- Requests accepted invalid counts, history and study capacity. They now receive actionable 400 responses. Missing configuration, access failures, quota limits, invalid JSON and network/provider failures produce safe errors without raw provider details. Server calls and browser requests have finite timeouts. The key remains server-side.
- Tutor requests lacked the selected document; source text is now included. The previous silent 40,000-character truncation is removed: sources up to 45,000 characters are sent intact, larger sources receive a clear split-document instruction.
- Document titles were mislabeled as diagnosed weak topics and revision prompts implied nonexistent exam dates. General study topics and missed quiz topics are now separate; the planning horizon is not described as a known exam deadline.
- Quiz grading now rejects empty, malformed or unanswered attempts and derives weak topic tags only from missed questions. Repeated submission is guarded. Failed quiz generation retains the existing attempt. AI results merge into the current unchanged-source document instead of overwriting unrelated concurrent edits.
- Production start now uses the existing tsx runtime consistently with the server's TypeScript imports.

## Verification performed

- TypeScript: `npm run lint` passed; production build also runs `tsc --noEmit`.
- `npm run build`: passed. Existing Vite warning about future native config support for __dirname remains non-blocking.
- `npm test`: 69/69 grading assertions, 15/15 startup tests, 9/9 new reliability tests passed.
- New HTTP integration tests executed all five real Express routes with a simulated Gemini provider: summary, flashcards, quiz, revision plan and tutor. Quiz results/weak topics were checked between quiz and plan calls. Source text reaching prompts was asserted. Missing-key, invalid inputs and malformed-output paths were executed. Provider quota/access/network error mapping was tested independently.
- An isolated production server on port 3002 started successfully. Actual health response: hasGeminiKey=false, model=null, modelVerified=false.
- Desktop browser: production onboarding rendered, explicitly selected demo dashboard rendered with the provenance notice, and Settings displayed the missing-key message and server-default model option. This was a smoke check, not comprehensive desktop/mobile QA.
- No live Gemini generation or live model discovery was possible without a configured key. No claim of AI semantic accuracy is made from simulated responses.
- No PDF upload/extraction-to-AI end-to-end test was executed in this stage. PDF workflow and mobile/full functional QA remain for subsequent stages.

## Files changed in this sprint

- `.env.example`, `package.json`, `server.ts`, new `server/gemini.ts`
- `src/App.tsx`
- `src/components/CoursesView.tsx`, `DashboardView.tsx`, `GradeRescueView.tsx`, `SettingsModal.tsx`, `StudyAIView.tsx`
- `src/context/AcademicContext.tsx`
- `src/data/mockData.ts`, new `src/data/defaultSettings.ts`
- `src/utils/academicStorage.ts`, `calculations.ts`, `onboarding.ts`, new `quiz.ts`
- `test/startup.test.tsx`, new `test/reliability.test.ts`
- This report. Other pre-existing workspace changes belong to the earlier UI work.

## Remaining blockers and deployment steps

1. Configure GEMINI_API_KEY in the server environment (never a VITE variable or client bundle). Optionally set GEMINI_MODEL to an ID returned by that key's catalogue, restart the server, then check Settings. The server runtime needs tsx installed.
2. Execute all live AI flows with real supported model access and quota. Catalogue availability does not guarantee structured-output support or generation quota; generation failures remain explicit errors. AI answer correctness still requires source review.
3. Continue Stage 3: text/scanned PDF extraction, page counts and a real upload-to-quiz-to-revision demonstration. Current text limit is 45,000 characters; automatic chunking is not implemented.
4. Continue Stage 4 and remaining Stage 5: CRUD, attendance, tasks/timer, settings/onboarding, import/export, empty/invalid states, both themes and mobile navigation. This audit has not certified those workflows.
5. Legacy/imported records have no reliable provenance metadata. They are preserved and described as unverified; do not claim those records were retrospectively authenticated. Review/export existing data before demonstrating a personal profile. Use explicit demo mode for the supplied sample assessments/history.
6. Before public hosting, decide access control/rate limits for the paid AI endpoints; this sprint did not add public-user authentication or application-level quota limits. Build and run with NODE_ENV=production on a host that supports the Node server, not static-only hosting.

Implementation guidance checked against Google's official [model catalogue API](https://ai.google.dev/api/models), [structured output guidance](https://ai.google.dev/gemini-api/docs/structured-output), and [error troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting). Model availability must still be verified with the actual deployment key.
