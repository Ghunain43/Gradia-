# Start here: Gradia video preparation package

Use this package to create a beginner-friendly narrated training video and prepare a hackathon presentation. It documents the existing app; it does not contain a redesigned app or a finished narrated movie.

## Contents

- **54 real PNG captures:** `screenshots/01-...png` through `54-...png`.
- **7 silent WebM recordings:** `recordings/01-dashboard-navigation.webm` through `07-focus-timer.webm`.
- **VIDEO_SCRIPT.md:** 28 scenes, 2,281 narration words, target duration **14 minutes 56 seconds**.
- **video_timeline.json:** machine-readable scene timings, narration, captions and valid asset references.
- **TECHNICAL_WALKTHROUGH.md:** implementation, formulas, routes, source files and actual limits.
- **HACKATHON_DEMO.md:** 30-second opener, exact three-minute click path, fallback plan and ten judge questions.
- **SCREENSHOT_INDEX.md:** action, evidence, suggested narration and limitation for every capture.
- **VERIFICATION.md:** what was actually checked and what remains unavailable.
- **fixtures/Gradia-Demo-Logic-Gates.pdf:** the two-page searchable handout used in the real upload.
- Sanitized JSON evidence and extracted fixture text; no credentials or personal browser-state exports.

## Essential editorial rules

1. Gemini was **not configured** during capture. Fresh summaries, flashcards, quizzes, revision plans and tutor answers were unavailable. Actual error states are included.
2. Use the on-screen caption **PRELOADED DEMO SAMPLE — NOT LIVE GEMINI OUTPUT** whenever showing built-in study material. Do not imply it came from the uploaded PDF.
3. The PDF upload/extraction and local sample-quiz scoring were genuinely executed. The complete PDF-to-new-AI-material-to-new-plan chain was not.
4. Screenshot 31 shows a real five-minute **break** completing; do not call it a completed 25-minute study session.
5. Screenshots are not mockups. Desktop viewport was 1920×1080, with selected native feature crops. Mobile viewport was 390×844. Do not stretch narrow crops to fill the screen; use them as close-ups or picture-in-picture.
6. The original user profile was not used. Demonstration records were loaded into fresh isolated browser contexts. There are no `.env` files, API keys, node_modules, raw browser-state files or unrelated project data in the ZIP.

## Suggested prompt for the video-producing assistant

“Use VIDEO_SCRIPT.md and video_timeline.json as the source of truth to prepare a 14:56 beginner-friendly Gradia training video. Match each scene to the existing image files, add the specified captions, and optionally use the seven silent recordings as short inserts. Narrate clearly at approximately 153 words per minute. Preserve the distinction between verified local behavior, preloaded demo examples and unavailable Gemini generation. Do not invent screen actions or claim live AI success. Read VERIFICATION.md before writing promotional claims. If you cannot render a narrated video, provide a complete editor-ready storyboard and voice-over track script rather than claiming to have produced a movie.”

The recordings total roughly 178 seconds and contain no audio. The timeline's still-image holds provide the rest of the training-video structure. No GitHub upload or deployment was performed.
