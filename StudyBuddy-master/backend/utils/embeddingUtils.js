const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

let gemini = null;

// Initialize Gemini client
if (process.env.GEMINI_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("✅ Gemini client initialized successfully for embeddings");
} else {
    console.warn("⚠️  Gemini API key not provided. Embedding features will be disabled.");
}

/**
 * Generate embedding for a given text.
 * Returns null if Gemini is not available or quota exceeded.
 */
async function generateEmbedding(text) {
    if (!gemini) {
        console.warn("Gemini client not initialized. Skipping embedding generation.");
        return null;
    }

    try {
        const model = gemini.getGenerativeModel({ model: "text-embedding-004" });

        // Correctly format the text into a Content object
        const content = { parts: [{ text: text }] };
        console.log("content",content);
        

        const result = await model.embedContent(text);
        console.log(result);
        
        // embedding vector
        return result.embedding.values;
    } catch (error) {
        if (error.status === 429) {
            console.warn("Gemini embedding quota exceeded. Skipping embeddings for now.");
            return null; // fallback to storing document without embeddings
        }
        console.error("Error generating embedding:", error);
        return null;
    }
}

/**
 * Wrapper for query embedding (same as text embedding)
 */
async function generateQueryEmbedding(query) {
    return await generateEmbedding(query);
}

module.exports = {
    generateEmbedding,
    generateQueryEmbedding,
};