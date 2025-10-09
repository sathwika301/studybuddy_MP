// Gemini AI Integration
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generateEmbedding } = require("../utils/embeddingUtils"); // optional
require("dotenv").config();

// Initialize Gemini client
let gemini;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your-gemini-api-key-here") {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("✅ Gemini client initialized successfully");
  } else {
    console.warn("⚠️ Gemini API key not provided. AI features will be disabled.");
    gemini = null;
  }
} catch (error) {
  console.error("❌ Error initializing Gemini client:", error.message);
  gemini = null;
}

// AI Configuration
const aiConfig = {
  model: "gemini-2.5-flash", // or "gemini-1.5-pro"
  maxTokens: 1000,
  temperature: 0.7,
  systemPrompt: `You are StudyBuddy AI, a friendly and knowledgeable learning assistant. Your role is to help students understand concepts, provide study guidance, and support their learning journey. You should:

1. Be encouraging and supportive
2. Break down complex concepts into simple terms
3. Provide practical examples and analogies
4. Suggest study techniques and strategies
5. Offer step-by-step explanations
6. Recommend additional resources when appropriate
7. Adapt explanations based on the student's level
8. Ask clarifying questions to better understand needs

Always maintain a positive, patient, and helpful tone. Focus on helping students truly understand concepts rather than just memorizing facts.`,
};

// Helper functions
function extractSuggestedTopics(response) {
  const topics = [];
  const keywords = ["learn", "study", "understand", "concept", "topic", "subject"];
  keywords.forEach((kw) => {
    if (response.toLowerCase().includes(kw)) topics.push(`Explore ${kw} further`);
  });
  return topics.slice(0, 3);
}

function extractFollowUpQuestions() {
  return [
    "Would you like me to explain this in more detail?",
    "Can you tell me more about what you're studying?",
    "Would you like to see some practice problems?",
  ];
}

// Main AI response function
async function generateAIResponse(message, context = [], userProfile = {}, retrievedContext = []) {
  if (!gemini) {
    return {
      message: "AI features are disabled. Add your Gemini API key to enable AI assistance.",
      metadata: { model: "disabled", tokensUsed: 0, confidence: 0, suggestedTopics: [], followUpQuestions: [], error: "Gemini API key not configured" },
    };
  }

  try {
    // Build system instruction
    let systemInstruction = aiConfig.systemPrompt;
    if (retrievedContext.length) {
      systemInstruction += "\n\nRelevant context from your knowledge base:\n";
      retrievedContext.forEach((chunk, i) => {
        systemInstruction += `[${i + 1}] ${chunk.content} (Source: ${chunk.documentName})\n`;
      });
      systemInstruction += "\nUse this context to provide accurate, detailed answers. Cite sources when referencing specific information.";
    } else {
      systemInstruction += "\n\nNo relevant context found in your knowledge base. Answer based on general knowledge and suggest uploading relevant materials.";
    }

    // Build conversation history in Gemini format
    const history = context.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.message }],
    }));
    
    // Add the current message to the conversation
    const contents = [...history, { role: "user", parts: [{ text: message }] }];

    // Call Gemini API with systemInstruction and contents
    const model = gemini.getGenerativeModel({ model: aiConfig.model });
    const result = await model.generateContent({
      contents,
      generationConfig: { maxOutputTokens: aiConfig.maxTokens, temperature: aiConfig.temperature },
      systemInstruction: { parts: [{ text: systemInstruction }] },
    });

    const responseText = result.response.text();

    return {
      message: responseText,
      metadata: {
        model: aiConfig.model,
        tokensUsed: result.response.usageMetadata?.totalTokenCount || 0,
        confidence: 0.9,
        suggestedTopics: extractSuggestedTopics(responseText),
        followUpQuestions: extractFollowUpQuestions(),
        retrievedContext: retrievedContext.map((c) => ({ content: c.content, documentName: c.documentName, similarity: c.similarity })),
      },
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      message: "AI service error. Please check your API key, quota, or try again later.",
      metadata: { model: aiConfig.model, tokensUsed: 0, confidence: 0, suggestedTopics: [], followUpQuestions: [], error: error.message },
    };
  }
}

module.exports = { generateAIResponse, aiConfig, isAIEnabled: () => !!gemini };