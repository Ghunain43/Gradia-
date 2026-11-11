# Capture verification

Date: 11 November 2026. Workspace: Gradia. Application functionality and visual design were not modified for this documentation task. An existing Playwright/Chromium installation was reused; no project dependencies were installed and no production build was changed.

## Capture isolation and environment

- Separate local development server on port 3003.
- Newly created nonpersistent Playwright browser contexts; original user browser profiles were not read, reset, imported over or deleted.
- Desktop 1920×1080, device scale factor 1. Mobile 390×844, touch/mobile emulation.
- Fonts and visible images were allowed to finish loading; feature captures included a short render-settling interval. Some desktop outputs are intentional native feature crops.
- Only the supplied explicit demo profile and temporary task/course-form inputs were used. The included PDF was authored as clearly labeled testing material, not private coursework.
- An existing development HMR port was already occupied. The separate HTTP capture server still served the app successfully; no app edits or hot reload were needed.

## Directly observed successes

- First-launch onboarding, explicit demo selection, personal setup through all five steps, and an empty personal dashboard.
- Desktop module navigation, mobile navigation at one viewport, and both theme appearances.
- Task creation, priority selection and completion.
- Expanding a course and recording one attended class: 19/20 to 20/21, displayed 95.2%.
- Course and assessment forms opened; temporary course values were canceled, not saved.
- Grade Rescue target changes and a 75/100 hypothetical final-exam slider scenario.
- Searchable PDF selected through the real upload control; PDF.js reported two pages and 1,131 characters. Saved document displayed 205 words. The extracted text is included.
- Actual generation attempts for summary, flashcards, quiz, revision and tutor all produced the missing-key failure. Request metadata proves the uploaded text reached the summary/flashcard/quiz/tutor Express endpoints. Revision requests intentionally use planning context rather than source text.
- Built-in sample flashcard flip and sample quiz completion: 2/3, 66.7%, missed topic Space Optimization. The sample questions were not generated live.
- The new missed-topic tag was persisted. After the sample plan blocks were marked complete for demonstration, Overview showed Space Optimization as the next-study fallback.
- Timer start/pause. A separate timer ran a real five-minute short break to zero without time acceleration and saved a shortbreak durationMinutes=5 record. This is not study-session completion.
- Settings, MAJU/custom-policy previews, help and the footer guided tour.

## Unavailable or not established

- **Fresh Gemini content:** unavailable because there was no server API key. No live model catalogue or successful generation claims.
- **Complete new-PDF → AI-summary → AI-quiz → new revision plan:** not completed. Local extraction and sample-based learning interactions are separate evidence.
- **Dedicated weak-topic report:** absent. The app provides topic tagging and a dashboard fallback, not a standalone analytical report.
- **25-minute study completion:** not captured; the real completion screenshot is a five-minute break. Focused-minute totals exclude breaks.
- **OCR/scanned-PDF success:** not implemented. Scanned/corrupt/encrypted PDF error paths were not exercised in this capture task.
- **Flashcard due-date scheduling:** partial; rating/timestamp persistence exists, a complete scheduled-review queue does not.
- Course-save/delete and assessment-save/delete flows, backup restore, audible sound quality, exhaustive mobile/browser/accessibility behavior and all invalid inputs were not verified in this task.
- Automated tests were not rerun because this was documentation/capture work with no application source changes. Prior sprint results are historical evidence, not a new test run.

## Artifact validation

- Exactly **54** numbered PNG files are in `screenshots/`, covering requested slots 01–42 and twelve additional states. Slots 21–23/27 show labeled sample interfaces rather than unavailable live AI results; slot 31 uses the explicitly documented break-completion alternative.
- Every PNG was decoded by Chromium with positive natural dimensions. All images were visually reviewed in contact sheets; mobile and tour captures were corrected during quality review. `image-validation.json` records dimensions.
- Exactly **7** final WebM clips are in `recordings/`. All opened in Chromium, exposed valid 1920×1080 video dimensions and finite durations, and were seekable to representative frames. No audio tracks were captured. `video-validation.json` records measured durations. A separate all-frame null-output decoder check was unsupported by the minimal bundled FFmpeg; it is not claimed as passed.
- All 28 timeline scenes have consecutive 32-second durations, totaling 896 seconds (14:56). All primary/supporting screenshot references exist.
- Documentation was checked against the actual source files/functions named in TECHNICAL_WALKTHROUGH.md. Capture findings distinguish source implementation from directly observed behavior.
- The final ZIP is created from this curated package only. Its member list and CRC integrity are checked; API secrets, `.env` files, node_modules, raw recordings and working capture files are excluded.

See `package-validation.json` for final counts, timeline-reference checks and archive-member information.
