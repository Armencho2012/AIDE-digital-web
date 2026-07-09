# Aide Todo List

## Completed

### SEO and metadata
- [x] Shortened landing page title to `Aide | AI Study Assistant`
- [x] Updated description and social metadata to mention YouTube videos
- [x] Refreshed sitemap dates
- [x] Tightened robots rules for private app routes

### Accessibility
- [x] Added aria labels to icon-only buttons
- [x] Added accessible state to language selector
- [x] Cleaned up FAQ heading text

### Landing page content
- [x] Added a YouTube Video Summarizer feature card

### Security findings
- [x] Require authentication and JWT verification for podcast generation
- [x] Store podcast files privately under owner-scoped storage paths
- [x] Verify Gumroad webhook email against the verified sale buyer email
- [x] Sanitize edge function error responses
- [x] Revoke public execution from exposed `SECURITY DEFINER` functions

### Existing implementation work
- [x] Updated types.ts with quantity types (n_questions, n_flashcards)
- [x] Updated BottomInputBar.tsx with quantity sliders
- [x] Sliders respect plan limits (Free: 1-5 quiz, 1-10 flashcards; Pro: 1-50 quiz, 1-20 flashcards)
- [x] Update analyze-text/index.ts with conditional prompts
- [x] Only include JSON fields for checked options
- [x] Skip generation modules when not checked
- [x] Add content_type filter in useContent.ts
- [x] Add Course tab in Library.tsx
- [x] Courses filter by content_type='course' or generation_status.course=true

## Still To Do

### YouTube summarizer
- [ ] Add a YouTube URL input in the app UI
- [ ] Extract transcript text from YouTube or captions
- [ ] Summarize the transcript into study notes
- [ ] Optionally generate quiz cards and flashcards from the summary
- [ ] Save YouTube summaries into the library
- [ ] Handle errors for missing captions, private videos, and invalid URLs

### SEO follow-up
- [ ] Expand sitemap when more public pages should be indexed
- [ ] Re-check Google Search Console coverage after any new public routes are added
- [ ] Add structured data for any new content types if they become public

### Accessibility follow-up
- [ ] Run a keyboard-only pass through landing, dashboard, and study pages
- [ ] Check focus order and focus visibility in modals and dropdowns
- [ ] Review color contrast for any remaining low-contrast text areas
- [ ] Audit heading hierarchy across public pages

## Notes
- Chatbot module uses gemini-3-flash (lightweight model) for fast responses
- Full analysis uses gemini-3-flash-preview with conditional prompts for optimization
- The Deno function errors are expected (not TypeScript)
