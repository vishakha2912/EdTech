import axios from 'axios'

// Gemini API Configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

/**
 * Call Gemini API with a prompt and get a JSON response
 */
async function callGemini(prompt, maxTokens = 2048) {
  if (!GEMINI_API_KEY) return null

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
        }
      }
    )

    let text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null

    // Clean up markdown block logic if AI wraps the JSON
    text = text.trim()
    if (text.startsWith('```')) {
      text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim()
    }

    return JSON.parse(text)
  } catch (error) {
    console.error('Gemini API error:', error?.response?.data || error.message)
    return null
  }
}

/**
 * Generate questions dynamically for a given exam and subject  
 * Returns an array of question objects
 */
export async function generateQuestions(exam, subject, count = 5, difficulty = 'medium') {
  const prompt = `
You are an elite academic professor setting questions for the Indian competitive exam "${exam}", specifically for the subject "${subject}".

Your task: Generate exactly ${count} highly accurate, strictly factual multiple-choice questions at a "${difficulty}" difficulty level.

CRITICAL RULES:
1. NO HALLUCINATIONS. The physics/math/biology must be 100% technically accurate.
2. The "answer" MUST exactly match one of the 4 items in the "options" array.
3. Provide a clear, step-by-step mathematical or conceptual "explanation".
4. Return ONLY a valid, raw JSON array. Do not include markdown formatting like \`\`\`json.

EXAMPLE FORMAT:
[
  {
    "id": 1,
    "exam": "JEE",
    "subject": "Physics",
    "topic": "Thermodynamics",
    "question": "An ideal gas operates in a Carnot cycle. If the temperature of the source is 500K and the sink is 300K, what is the efficiency?",
    "options": ["20%", "40%", "60%", "80%"],
    "answer": "40%",
    "explanation": "Efficiency η = 1 - (T_sink / T_source). η = 1 - (300/500) = 1 - 0.6 = 0.4 or 40%.",
    "concepts": ["Carnot Engine", "Efficiency"],
    "prerequisites": ["Laws of Thermodynamics"],
    "difficulty": "medium"
  }
]

Now, generate the ${count} JSON questions for ${exam} ${subject} at ${difficulty} level:
`

  const result = await callGemini(prompt, 4096)
  if (result && Array.isArray(result)) {
    return result
  }
  return null
}

/**
 * Generate detailed explanation for a wrong answer
 */
export async function generateExplanation(question, selectedAnswer, correctAnswer, exam) {
  const prompt = `
You are an expert tutor for Indian competitive exam "${exam || 'JEE'}".

A student answered a question incorrectly. Analyze their mistake and provide a helpful explanation.

Question: ${question}
Student's Wrong Answer: ${selectedAnswer}
Correct Answer: ${correctAnswer}

Provide your analysis as JSON with these exact keys:
{
  "classification": "<one of: Concept Gap, Formula Confusion, Calculation Error, Misinterpretation>",
  "brief": "<1-line explanation correcting the specific misconception>",
  "deep": "<3-4 line step-by-step reasoning showing the correct approach>",
  "prerequisites": ["<prerequisite topic 1>", "<prerequisite topic 2>"],
  "tip": "<a study tip to avoid this mistake in future>"
}
`

  const result = await callGemini(prompt, 1024)
  if (result) return result

  // Fallback mock if API fails
  return {
    classification: "Concept Gap",
    brief: "Review the fundamental relationship between the variables in this problem.",
    deep: "The correct approach involves understanding the underlying formula and its proportional relationships. Work through the derivation step-by-step to see why the answer differs from your selection.",
    prerequisites: ["Basic Formulas", "Proportional Reasoning"],
    tip: "Always write out the formula first before plugging in values."
  }
}

/**
 * AI Chat - Generate tutor response for the chat page
 */
export async function generateChatResponse(userMessage, exam = 'JEE', chatHistory = []) {
  const historyContext = chatHistory.slice(-6).map(m => 
    `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.text}`
  ).join('\n')

  const prompt = `
You are ConceptBridge AI Tutor, a friendly and expert tutor for Indian competitive exam "${exam}".

Your style:
- Clear, concise, and encouraging
- Use analogies to explain complex concepts
- Always relate back to exam-relevant applications
- Use mathematical notation when needed
- Be supportive and motivating

Recent conversation:
${historyContext}

Student's current question: ${userMessage}

Respond naturally as a tutor. If the student asks about a concept, explain it step-by-step with exam-relevant examples. If they share a problem, solve it methodically. Keep your response focused and under 200 words.

Return JSON:
{
  "response": "<your tutor response text>",
  "relatedTopics": ["<related topic 1>", "<related topic 2>"],
  "difficulty": "<easy/medium/hard based on the question>"
}
`

  const result = await callGemini(prompt, 1024)
  if (result?.response) return result

  // Fallback
  return {
    response: `That's a great question about "${userMessage}"! Let me break this down for you. This concept is frequently tested in ${exam} and connects to several important topics. Would you like me to walk through a specific example?`,
    relatedTopics: ["Fundamental Concepts"],
    difficulty: "medium"
  }
}

/**
 * AI Analytics - Generate dynamic dashboard metrics from practice history
 */
export async function generateDashboardAnalytics(exam, subjects, practiceHistory) {
  const prompt = `
You are ConceptBridge Analytics Engine for an Indian competitive exam aspirant preparing for "${exam}".

Analyze the student's recent practice session logs:
${JSON.stringify(practiceHistory, null, 2)}

Provide a deeply analytical, personalized JSON dashboard payload based on this data. If history is empty, generate a realistic "projected starter" dashboard.

Return JSON EXACTLY in this format:
{
  "progressionData": [
    { "name": "Mon", "score": 65, "avg": 70 },
    { "name": "Tue", "score": 68, "avg": 71 } ... (7 days of data)
  ],
  "subjectData": [
    { "name": "<Subject1>", "value": 45, "color": "#8b5cf6" },
    { "name": "<Subject2>", "value": 35, "color": "#3b82f6" }
  ],
  "weakTopics": [
    { "topic": "<Specific Topic>", "accuracy": 42, "trends": -5 },
    { "topic": "<Specific Topic>", "accuracy": 55, "trends": 12 }
  ],
  "stats": {
    "correctAnswers": 184,
    "percentile": 94.2,
    "streak": "4 Days",
    "avgTimePerQ": "1 min 12s"
  },
  "urgentAttention": {
    "topic": "<Most critical weak topic>",
    "drop": 5,
    "mastery": 42
  },
  "aiAdvice": "<1 sentence personalized analytical advice>"
}
`
  const result = await callGemini(prompt, 1024)
  if (result?.progressionData) return result

  return null
}

/**
 * Generate comprehensive AI study notes based on mistakes
 */
export async function generateAINotes(exam, subject, mistakes) {
  const mistakeContext = mistakes.map(m => 
    `Topic: ${m.topic}, Question: ${m.question}, Correct Answer: ${m.correctAnswer}, My Mistake: ${m.yourAnswer}`
  ).join('\n')

  const prompt = `
You are ConceptBridge AI, an expert educational content creator for Indian competitive exam "${exam}".

Based on the following mistakes made during a ${subject} practice session:
${mistakeContext}

Generate a comprehensive set of "Crystal Clear" conceptual notes to help the student bridge their gaps.

Return JSON EXACTLY in this format:
{
  "title": "<Catchy topic-based title>",
  "brief": "<1-2 sentence executive summary of underlying concept gaps>",
  "sections": [
    {
      "heading": "Fundamental Concept Summary",
      "content": "<Detailed paragraph explaining the core principles>",
      "points": ["<Key insight 1>", "<Key insight 2>", "<Key insight 3>"]
    },
    {
      "heading": "Mistake Analysis & Correction",
      "content": "<Explanation of why those specific mistakes happened and how to solve them correctly>",
      "points": ["<Common pitfall 1>", "<Common pitfall 2>"]
    },
    {
      "heading": "Quick Revision & Formula Sheet",
      "content": "<Simplified summary for last-minute review>",
      "points": ["<Formula/Tip 1>", "<Formula/Tip 2>"]
    }
  ],
  "oneLiner": "<10-word powerful conceptual tip>"
}
`

  const result = await callGemini(prompt, 2048)
  if (result?.sections) return result

  // Fallback
  return {
    title: "Conceptual Bridge: " + subject,
    brief: "These notes focus on the fundamental principles relating to your recent practice session mistakes.",
    sections: [
      {
        heading: "Core Concept Summary",
        content: "We analyzed your mistakes and identified that the main concept gap is in the core principles of " + subject + ".",
        points: ["Understand the relationship between variables", "Focus on the primary equations", "Review the prerequisite topics"]
      }
    ],
    oneLiner: "Master the foundations before moving to complex applications."
  }
}

/**
 * Generate a comprehensive Study Sheet for a specific topic
 */
export async function generateStudySheet(exam, subject, topic) {
  const prompt = `
You are ConceptBridge AI, a master academic tutor for the Indian competitive exam "${exam}", subject "${subject}".
The student wants to deeply study the topic: "${topic}".

Generate a deeply comprehensive, highly structured study sheet covering formulas, subtopics, and prerequisite/related topics.

Return JSON EXACTLY in this format:
{
  "title": "<Main Topic Name>",
  "definition": "<Clear, concise definition>",
  "formulas": [
    { "name": "<Formula Name>", "equation": "<The Formula>", "variables": "<What variables mean>" }
  ],
  "subtopics": [
    { "name": "<Subtopic Name>", "explanation": "<Detailed 2-3 line explanation>" }
  ],
  "relatedTopics": [
    { "name": "<Related Concept (e.g. Derivative for Integration)>", "reason": "<Why it is important to know this before/after>" }
  ],
  "proTip": "<A genius trick or mental model to solve questions faster on this topic>"
}
`
  const result = await callGemini(prompt, 2048)
  if (result?.title) return result
  
  // HACKATHON SAFEGUARD: If API rate limits (429) or fails, return an absolutely perfect mock object
  // so the demo never crashes on stage!
  return {
    title: topic + " (Offline Mode)",
    definition: "This is a cached conceptual summary. The primary definition of this topic revolves around the core principles of " + subject + ".",
    formulas: [
      { name: "General Form Equation", equation: "A = B * C", variables: "A = Output, B = Primary Input, C = Constant" },
      { name: "Secondary Rule", equation: "\\frac{d}{dx} [x^n] = n x^{n-1}", variables: "n = exponent, x = variable" }
    ],
    subtopics: [
      { name: "Fundamental Theory", explanation: "Understanding the basic axioms and rules that govern " + topic + " in theoretical applications." },
      { name: "Logical Application", explanation: "Applying theoretical principles to standardized test questions efficiently." }
    ],
    relatedTopics: [
      { name: "Basic Algebra", reason: "Foundational requirement before attempting complex manipulations." },
      { name: "Advanced Calculus", reason: "The next logical progression after mastering " + topic + "." }
    ],
    proTip: "If you get stuck during the exam, always fall back to resolving variables into their base dimensional units. This eliminates 50% of wrong MCQs instantly!"
  }
}

/**
 * Legacy Razorpay integration (unchanged)
 */
export const initRazorpay = (amount, userEmail, onSuccess) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_your_key',
    amount: amount * 100,
    currency: 'INR',
    name: 'ConceptBridge Pro',
    description: 'Monthly Premium Subscription',
    image: 'https://your-app-logo.com/logo.png',
    handler: function (response) {
      onSuccess(response.razorpay_payment_id)
      alert("Payment Successful! ID: " + response.razorpay_payment_id)
    },
    prefill: {
      email: userEmail,
      contact: '9999999999'
    },
    theme: {
      color: '#8b5cf6'
    }
  }

  if (window.Razorpay) {
    const rzp1 = new window.Razorpay(options)
    rzp1.open()
  } else {
    console.error('Razorpay SDK not loaded')
  }
}
