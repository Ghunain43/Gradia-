# Hackathon demo: Gradia

## Thirty-second introduction

“Students do not just need more notes. They need to know what to do next. Gradia connects course marks, attendance, grade planning, lecture material and focused study in one workspace. Its academic calculations are deterministic; Gemini supports learning from your own material. I will show the path from a readable PDF to practice and revision, and clearly separate what is verified today from what still needs a live API connection.”

## Before the judges arrive

1. Use a separate browser profile or a disposable context. Do not reset your personal academic data to make the demo attractive.
2. Start the complete app with `npm run dev`. For a built deployment, run `npm run build`, set `NODE_ENV=production`, then `npm start`. The server requires tsx at runtime. Static Vite preview is not the AI backend.
3. In a fresh profile, choose **Explore with sample data**. The demo notice must remain visible or be stated aloud.
4. Keep `fixtures/Gradia-Demo-Logic-Gates.pdf` ready. It is the exact two-page searchable handout tested in this package.
5. If you have a server key, configure `GEMINI_API_KEY` privately in the server environment and restart. Optionally set `GEMINI_MODEL` to an available model ID. In Settings, inspect actual model discovery; then rehearse all generation calls. A key-present badge alone does not prove generation will work. Never show an environment file or token to the audience.
6. Keep the screenshot package open as a backup. This capture run had no configured Gemini key. **Use the verified offline script below unless a new rehearsal establishes live success.**
7. Rehearse the click path at the display size used on stage. The three-minute schedule includes a sample fallback because live AI latency is not guaranteed.

## Complete three-minute live presentation: verified offline route

| Time | Exact action | Say this | Expected evidence |
|---|---|---|---|
| 0:00–0:20 | Open Overview in the explicit demo profile. Point to progress and attendance. | “This is clearly labeled sample data. Grades and attendance come from entered records; they are not AI guesses.” | Dashboard, screenshots 01 and 03. |
| 0:20–0:40 | Click sidebar **Grade Rescue**. Choose **CS 204** and target **A**. | “Given these sample marks and remaining weight, the calculator tells me what average I need next. This is a conditional mathematical scenario.” | About 81.6% needed on the remaining 45% with the unmodified sample marks. Screenshot 14. |
| 0:40–1:05 | Click **Study & AI → Upload Notes / PDF → Choose PDF / Text file**. Select the included fixture. | “PDF.js extracts selectable text in the browser. Here are two pages and the extracted notes, ready for review.” | Extraction notice: 2 pages, 1,131 characters. Screenshot 20. |
| 1:05–1:25 | Click **Save Document & Open → Generate Academic Summary with Gemini**. | “This environment has no server key. The request fails clearly instead of creating an invented answer. The document remains saved.” | Actual missing-key notice. Screenshot 43. Do not wait repeatedly. |
| 1:25–1:40 | Click the material titled **Dynamic Programming: Optimal Substructure & 0/1 Knapsack**, then **Summary**. | “For the next controls I am switching to the built-in sample, not pretending the uploaded PDF generated this.” | Sample summary. Screenshot 21. |
| 1:40–2:10 | Click **Practice quiz (3)**. Choose question 1 **A**, question 2 **C**, question 3 **B**. Scroll and click **Submit & Score Quiz**. | “I intentionally miss one answer. Local scoring gives two out of three, and the missed topic is Space Optimization.” | Score 2/3, explanations and saved weak-topic evidence. Screenshots 24–25 and `quiz-evidence.json`. |
| 2:10–2:35 | Click **Revision plan**. Point to Days, Hrs/day and the existing blocks. | “The planner accepts available time and missed topics. This displayed roadmap is a preloaded example; a fresh personalized plan needs the server connection.” | Sample plan. Do not call it newly generated. Screenshot 27; real error in 46. |
| 2:35–2:50 | Click **Focus → Start Focus Session**, wait one second, click **Pause**. | “I can turn the next study action into a focused block. Start and pause work locally.” | Real countdown/pause; screenshots 30 and 48. |
| 2:50–3:00 | Return to **Overview**. | “Gradia connects tracking, planning, practice and action. Our verified local workflow works; live AI is the remaining setup requirement for the complete learning loop.” | Dashboard and honest closing statement. |

Do not claim that “Space Optimization” appears automatically in a separate results report: no such screen exists. The screenshot package independently verified the saved topic. The dashboard prioritizes unfinished plan sessions; only after the sample plan blocks were checked complete did it display the missed-topic fallback in screenshot 26. If showing that screenshot, explain those completion clicks were illustrative.

## Optional live-AI route after a successful rehearsal

Use the same PDF, then **Generate Academic Summary with Gemini → Practice quiz (0) → Generate 5 Practice quiz with Gemini**. Answer all five questions, submit, and open **Revision plan → Recompute Plan** with a short valid time budget. Explain that question explanations come with the generated quiz, while score and missed-topic detection are local calculations. Ask a document-based tutor question only if time permits.

This exact end-to-end route was **not successfully executed** during capture. Allow extra time for model discovery and generation. If a call fails, stop retrying on stage and use the offline route above. If pre-generating material for reliability, label it “generated during rehearsal,” keep source verification evidence, and do not pretend it was created live.

## Strongest features to emphasize

- Transparent deterministic Grade Rescue and GPA calculations with unmarked-course safeguards.
- Real browser-side PDF extraction and an editable text preview.
- A complete local quiz attempt with traceable missed-topic tags.
- Clear distinction between academic records, hypothetical scenarios, sample content and AI assistance.
- A connected workflow that ends with a next action and focus tools, not just a long AI answer.

## Failure and backup plan

| Failure | What to do | What not to claim |
|---|---|---|
| Missing key | Show the real notice once; use screenshots 21–27 as labeled samples. | Do not say a sample was just generated from the uploaded PDF. |
| Quota/network/model rejection | Explain the unavailable external service; retain saved work and switch to deterministic features. | A model catalogue entry does not prove sufficient quota. |
| Image-only PDF | Use searchable fixture or paste genuine text; explain there is no OCR. | Do not call a scanned page successfully understood. |
| No internet on stage | Use pre-captured stills/video and local calculations; identify recordings as recordings. | Do not pretend a recorded interaction is live. |
| Incomplete assessment weights | Use a valid explicit demo course or explain why forecasting is blocked. | Do not promise a grade from an incomplete course outline. |
| Timer takes too long | Show start/pause and the actual five-minute-break completion screenshot. | Do not label it a completed 25-minute study block. |
| Personal data at risk | Switch to a disposable profile; use this package. | Do not reset or import over a real profile for presentation convenience. |

## Ten challenging judge questions

1. **Which parts are genuinely AI?** Summary, flashcard and question generation, revision-plan generation and tutoring use server-side Gemini calls. GPA, CGPA, attendance, Grade Rescue, quiz scoring, missed-topic tagging, tasks and timer mechanics are deterministic/local.
2. **Did your uploaded PDF actually reach Gemini?** PDF.js extraction succeeded and captured requests contained its 1,131 characters at the relevant Express routes. The server had no key, so we cannot claim successful processing by Gemini. That live stage remains unverified.
3. **How do you prevent hallucinated marks or AI output?** Personal profiles start empty; explicit demo records are labeled. Grade forecasts rely on entered marks and valid weights. The server rejects malformed/empty AI output instead of substituting fake answers. Structural validation does not guarantee factual correctness; users must review AI content.
4. **How are weak topics calculated?** `gradeQuiz` compares each selected answer index with the stored key and collects topic labels on missed questions. It deduplicates tags. This is not a learned mastery model; accumulated old mistakes can remain in revision inputs.
5. **How personalized is revision?** Gemini receives course credits and assessment context, missed topics, general study topics, days and daily hours. The server validates returned course references and durations. It is generative planning, not a proven optimizer or verified exam schedule.
6. **How do GPA and Grade Rescue work?** Marks are converted to weighted course contributions and then to grade points with the selected policy. Credits weight the GPA. Grade Rescue divides needed percentage points by remaining assessment weight. Unmarked courses do not inflate projected GPA, and incomplete plans block finalization/rescue conclusions.
7. **Are MAJU rules official and universally applicable?** The application includes a MAJU undergraduate preset and a configurable custom scale. The package documents what is encoded. It does not independently certify the current university policy or every program exception. Gradia is not presented as an official MAJU service.
8. **Where is student data stored, and can I synchronize it?** Academic data is in browser localStorage. The app has academic JSON export/import but no account-based cloud sync. Tasks use a separate key and are omitted from that export. Local storage is not encrypted institutional storage.
9. **What about scanned PDFs and long books?** Extraction reads selectable text. There is no OCR. AI text is currently capped at 45,000 characters with no automatic chunking; split longer material. Only the included searchable two-page case was verified in this capture task.
10. **What is still required before public deployment?** Configure and verify a server-only key/model/quota, execute the live learning loop, complete broader functional and mobile QA, and decide authentication/rate limits for the paid AI endpoints. The server needs a Node runtime and tsx; a static host alone cannot provide these routes.

## Capability status for this demonstration

| Status | Features |
|---|---|
| Implemented and directly observed in this capture task | Desktop/mobile rendering and navigation; light/dark appearance; task add/complete; course expansion; one attendance increment; Grade Rescue target/slider; text-PDF extraction/save; sample quiz scoring/explanations; persisted missed-topic fallback; focus start/pause; real five-minute break completion; settings, onboarding, help, tour. |
| Implemented; UI shown or source inspected, not comprehensively tested here | Course/assessment save/edit/delete paths, academic JSON backup/restore, all attendance edge cases, audio quality, long-running study sessions. |
| Implemented but live success unavailable | All Gemini generations and the complete new-PDF → new-summary → new-quiz → new-revision flow. Server key missing. |
| Partial | Flashcard rating without a complete due-date scheduler; weak-topic tags without mastery/recency scoring; local-only persistence; in-memory active countdown. |
| Not implemented | OCR, account/cloud synchronization, a dedicated weak-topic report page, website blocking, automatic long-document chunking, and application-level public-user AI authentication/rate limiting. |
