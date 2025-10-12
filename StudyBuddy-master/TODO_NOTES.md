# TODO: AI Notes Generator Improvements

## Tasks
- [x] Modify backend /study-notes/generate route to automatically classify topic into subject if not provided
- [x] Enhance the AI prompt for more structured and clear output format
- [x] Update frontend to auto-set subject after generation
- [x] Include all CSE core subjects in alphabetical order in subjects list
- [x] Change subject field to searchable input with datalist
- [ ] Test the auto-subject selection and structured notes generation (requires running the app)
- [ ] Update frontend to display structured notes better (optional: add markdown rendering)

## Details
- In studyNoteRoutes.js, add logic to use AI to classify topic into predefined subjects before generating notes.
- Ensure the classified subject is used in the prompt and returned in metadata.
- Improve prompt structure for clearer sections and formatting.
- Frontend now sets the subject field to the auto-selected one.
- Updated subjects list to include CSE core subjects alphabetically.
- Subject field is now a searchable input with datalist for better UX.
