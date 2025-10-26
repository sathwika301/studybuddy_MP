# TODO: Modify Flashcard Generation for Natural, Diverse Output

## Tasks
- [ ] Add a new `/generate` route in `backend/routes/flashcardRoutes.js` that uses `generateAIResponse` to create diverse flashcards
- [ ] Design AI prompt to generate topic-relevant, diverse flashcards (factual, conceptual, comparison-based, example-based) without fixed patterns
- [ ] Update `generateAIFlashcards` function in `frontend/src/components/Flashcards.jsx` to call the new backend API instead of mock code
- [ ] Ensure generated flashcards are concise and learner-friendly
- [ ] Test the AI flashcard generation with different topics and verify diverse question types

## Details
- The new route should accept topic, subject, difficulty, and number of cards
- AI prompt should instruct generating varied question types based on the input text/topic
- Frontend should handle API response and populate cards array
- Maintain existing error handling and loading states
