
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Job, User } from "../types";

// NOTE: In a real production app, API calls should be routed through a backend to secure the API Key.
// For this frontend demo, read Vite env variables (import.meta.env) and support process.env fallback for SSR/tests.
const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY)
  || (typeof process !== 'undefined' ? (process.env.API_KEY || process.env.VITE_GEMINI_API_KEY) : '')
  || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeResume = async (
  base64File: string,
  mimeType: string,
  jobDescription?: string,
  targetRole?: string
): Promise<AnalysisResult> => {
  const analyzedRoleLabel = jobDescription
    ? "Targeted Job"
    : targetRole || "General Professional Role";

  if (!apiKey) {
    console.warn("No API Key provided. Returning mock data.");
    return { ...mockAnalysis(), analyzedRole: analyzedRoleLabel };
  }


  const model = "gemini-2.5-flash";

  let prompt = "";

  if (jobDescription) {
    prompt = `Analyze this resume against the following job description: "${jobDescription}". Provide a match score (0-100), list key strengths, weaknesses, missing skills relative to the job, and a recommendation. Return JSON.`;
  } else if (targetRole) {
    prompt = `You are an expert recruiter and career coach specializing in ${targetRole}. 
     Analyze the provided resume specifically for a position in ${targetRole}.
     Provide a match score (0-100) assessing how well the candidate fits this specific role or industry standards.
     List key strengths, specific weaknesses, and critical missing skills relative to ${targetRole}.
     Provide a tailored recommendation and specific career path advice to succeed in ${targetRole}.
     Return JSON matching the schema.`;
  } else {
    prompt = `Analyze this resume for a general professional role based on its content. Identify the candidate's primary expertise, provide a generic match score (0-100) for that expertise, key strengths, weaknesses, suggested skills to learn, and general career advice. Return JSON.`;
  }

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 15000)
    );

    const apiCall = ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64File
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING },
            careerPathAdvice: { type: Type.STRING }
          },
          required: ["matchScore", "strengths", "weaknesses", "missingSkills", "recommendation", "careerPathAdvice"]
        }
      }
    });

    const response = await Promise.race([apiCall, timeoutPromise]) as any;

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as AnalysisResult;
    return { ...result, analyzedRole: analyzedRoleLabel };

  } catch (error) {
    console.error("Analysis failed or timed out", error);
    // Fallback for demo if API fails
    return { ...mockAnalysis(), analyzedRole: analyzedRoleLabel };
  }
};

export const getCareerChatResponse = async (history: { role: string, text: string }[], newMessage: string) => {
  if (!apiKey) {
    return "I'm currently in offline mode (No API Key). But I'd normally tell you how great you're doing!";
  }



  // Rate Limiter to prevent 429 errors (15 RPM = 1 req / 4000ms)
  // We'll be conservative and use 1 req / 5000ms
  const MIN_REQUEST_INTERVAL = 5000;
  let lastRequestTime = 0;
  let requestQueue: Promise<void> = Promise.resolve();

  const throttleRequest = async <T>(fn: () => Promise<T>): Promise<T> => {
    // Chain requests to ensure they run sequentially with delay
    const currentRequest = requestQueue.then(async () => {
      const now = Date.now();
      const timeSinceLast = now - lastRequestTime;

      if (timeSinceLast < MIN_REQUEST_INTERVAL) {
        const delay = MIN_REQUEST_INTERVAL - timeSinceLast;
        console.log(`[Rate Limiter] Throttling request by ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      lastRequestTime = Date.now();
      return fn();
    });

    // Update queue pointer (catch errors so queue doesn't stall)
    requestQueue = currentRequest.then(() => { }).catch(() => { });

    return currentRequest;
  };

  const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
    try {
      // Wrap the API call in our throttler
      return await throttleRequest(fn);
    } catch (error) {
      const errorMessage = (error as any).message || String(error);
      const isRetryable =
        errorMessage.includes("Quota exceeded") ||
        errorMessage.includes("429") ||
        errorMessage.includes("503") ||
        errorMessage.includes("overloaded");

      if (isRetryable && retries > 0) {
        // Increased delay to 4000ms start to better handle strict free tier rate limits
        console.warn(`Gemini API busy/overloaded ("${errorMessage}"), retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a professional expert career counselor. Do not use asterisks (*) or markdown bolding. Use simple paragraphs and dash (-) bullets for lists. Keep the tone professional, concise, and direct."
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    // Start with higher initial delay (3000ms) for rate limit safety
    const result = await retryWithBackoff(() => chat.sendMessage({ message: newMessage }), 3, 3000);
    return result.text;
  } catch (error) {
    console.error("Chat error", error);
    const errorMessage = (error as any).message || String(error);

    if (errorMessage.includes("Quota exceeded") || errorMessage.includes("429") || errorMessage.includes("Too Many Requests")) {
      return `I've hit the speed limit! (Error: ${errorMessage}). The free AI tier allows a limited number of messages per minute. Please give me a 60-second break.`;
    }

    if (errorMessage.includes("503") || errorMessage.includes("overloaded")) {
      return `I'm thinking very hard right now! (System Overloaded). Please wait 10 seconds and try again.`;
    }

    return `Connection Error: ${errorMessage}`;
  }
};

export interface RecommendedJobData {
  jobId: string;
  matchScore: number;
  reason: string;
}

// Simple in-memory cache to prevent quota exhaustion from StrictMode/Navigation
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = {
  recommendations: { data: [] as RecommendedJobData[], timestamp: 0, userId: '' },
  interviewQuestions: {} as Record<string, { data: InterviewQuestion[], timestamp: number }>
};

export const getJobRecommendations = async (user: User, jobs: Job[]): Promise<RecommendedJobData[]> => {
  // Check cache
  if (cache.recommendations.userId === user.id &&
    (Date.now() - cache.recommendations.timestamp < CACHE_TTL) &&
    cache.recommendations.data.length > 0) {
    console.log("Using cached job recommendations");
    return cache.recommendations.data;
  }

  if (!apiKey) {
    console.warn("No API Key. Returning mock recommendations.");
    return jobs.slice(0, 3).map(j => ({ jobId: j.id, matchScore: Math.floor(Math.random() * 30) + 70, reason: "Matches your general profile based on mock data." }));
  }

  const userProfile = {
    name: user.name,
    title: user.title,
    bio: user.bio,
    role: user.role
  };

  const jobsData = jobs.map(j => ({
    id: j.id,
    title: j.title,
    company: j.company,
    description: j.description.substring(0, 200), // Truncate for token efficiency
    requirements: j.requirements
  }));

  const prompt = `
    You are an expert recruitment AI. 
    User Profile: ${JSON.stringify(userProfile)}
    Available Jobs: ${JSON.stringify(jobsData)}

    Analyze the user's profile against the available jobs.
    Identify the best matches (up to 5).
    Return a JSON object with a property "recommendations" which is an array.
    Each item in the array must have:
    - "jobId": string (must match the job's id)
    - "matchScore": number (0-100)
    - "reason": string (a concise 1-sentence explanation of why this job fits the user)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  jobId: { type: Type.STRING },
                  matchScore: { type: Type.INTEGER },
                  reason: { type: Type.STRING }
                },
                required: ["jobId", "matchScore", "reason"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    const results = data.recommendations || [];

    // Update cache
    cache.recommendations = {
      data: results,
      timestamp: Date.now(),
      userId: user.id
    };

    return results;

  } catch (error) {
    console.error("Recommendation failed", error);
    return [];
  }
};

const mockAnalysis = (): AnalysisResult => ({
  matchScore: 78,
  strengths: ["Strong React experience", "Good communication skills", "Project management history"],
  weaknesses: ["Lack of backend scaling experience", "No recent cloud certifications"],
  missingSkills: ["Kubernetes", "Go", "System Design"],
  recommendation: "You are a strong candidate for Senior Frontend roles. To aim for Full Stack or Tech Lead, focus on system design concepts.",
  careerPathAdvice: "Consider taking a course on Docker and Kubernetes to round out your profile."
});

// ============= AI RECRUITMENT ASSISTANT =============
export interface RecruitmentAnalysisResult {
  skillMatchPercentage: number;
  missingSkills: string[];
  experienceRelevanceScore: number;
  atsCompatibilityScore: number;
  strengths: string[];
  weakAreas: string[];
  verdict: 'Highly Suitable' | 'Suitable' | 'Not Suitable';
  detailedSummary: string;
}

/**
 * AI Recruitment Assistant - Analyzes resume against job description
 * Returns comprehensive matching analysis for employer dashboard
 */
export const analyzeResumeForJob = async (
  base64File: string,
  mimeType: string,
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string[]
): Promise<RecruitmentAnalysisResult> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock recruitment analysis.");
    return mockRecruitmentAnalysis();
  }

  const prompt = `You are an expert AI recruitment assistant analyzing a candidate's resume for the following position:

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Required Skills: ${jobRequirements.join(', ')}

Analyze the provided resume and generate a comprehensive recruitment report with:

1. Skill Match Percentage (0-100): How well candidate's skills align with required skills
2. Missing Skills: List specific skills from job requirements that candidate lacks
3. Experience Relevance Score (0-100): How relevant is candidate's work experience to this role
4. ATS Compatibility Score (0-100): How well-formatted is resume for Applicant Tracking Systems
5. Strengths: Top 3-5 strengths that make candidate suitable
6. Weak Areas: Top 3-5 areas where candidate needs improvement
7. Final Verdict: "Highly Suitable" (>80% match), "Suitable" (60-80%), or "Not Suitable" (<60%)
8. Detailed Summary: 2-3 sentence overall assessment

Return JSON matching the exact schema.`;

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 20000)
    );

    const apiCall = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64File
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skillMatchPercentage: { type: Type.INTEGER },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experienceRelevanceScore: { type: Type.INTEGER },
            atsCompatibilityScore: { type: Type.INTEGER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            verdict: { type: Type.STRING },
            detailedSummary: { type: Type.STRING }
          },
          required: ["skillMatchPercentage", "missingSkills", "experienceRelevanceScore", "atsCompatibilityScore", "strengths", "weakAreas", "verdict", "detailedSummary"]
        }
      }
    });

    const response = await Promise.race([apiCall, timeoutPromise]) as any;
    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as RecruitmentAnalysisResult;
    return result;

  } catch (error) {
    console.error("Recruitment analysis failed or timed out", error);
    return mockRecruitmentAnalysis();
  }
};

const mockRecruitmentAnalysis = (): RecruitmentAnalysisResult => ({
  skillMatchPercentage: 75,
  missingSkills: ["Kubernetes", "AWS Lambda", "GraphQL"],
  experienceRelevanceScore: 82,
  atsCompatibilityScore: 88,
  strengths: [
    "Strong React and TypeScript expertise with 4+ years experience",
    "Proven track record in building scalable web applications",
    "Excellent communication and team collaboration skills",
    "Active open-source contributor with strong GitHub presence"
  ],
  weakAreas: [
    "Limited experience with cloud infrastructure (AWS/GCP)",
    "No formal certifications in required technologies",
    "Lacks hands-on experience with containerization tools"
  ],
  verdict: 'Suitable',
  detailedSummary: "Candidate demonstrates strong frontend development skills and relevant project experience. While missing some cloud/DevOps skills, their core technical abilities and proven delivery track record make them a suitable match for this role."
});

// ============= AI INTERVIEWER =============
export interface InterviewQuestion {
  id: number;
  type: 'technical' | 'behavioral' | 'scenario' | 'coding';
  question: string;
  expectedPoints?: string[];
}

export interface InterviewEvaluation {
  technicalScore: number;
  communicationScore: number;
  confidenceLevel: 'Low' | 'Medium' | 'High';
  overallScore: number;
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Consider' | 'Reject';
  detailedFeedback: string;
  questionScores: Array<{ questionId: number; score: number; feedback: string }>;
  // Comprehensive Report Fields
  strengthsObserved: string[];
  weaknessesObserved: string[];
  skillsToImprove: string[];
  readinessLevel: 'Ready' | 'Nearly Ready' | 'Needs Development' | 'Not Ready';
  questionWiseAnalysis: Array<{
    questionId: number;
    performance: string;
    keyTakeaways: string;
  }>;
}

export interface InterviewSession {
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: Array<{ questionId: number; answer: string }>;
  evaluation?: InterviewEvaluation;
}

/**
 * Generate structured interview questions based on job role and resume
 */
export const generateInterviewQuestions = async (
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string[],
  _resumeSummary?: string
): Promise<InterviewQuestion[]> => {
  if (!apiKey) {
    console.warn("No API Key. Returning mock interview questions.");
    return mockInterviewQuestions();
  }

  const cacheKey = `${jobTitle}-${jobDescription.length}`;

  // Check cache
  if (cache.interviewQuestions[cacheKey] &&
    (Date.now() - cache.interviewQuestions[cacheKey].timestamp < CACHE_TTL)) {
    console.log("Using cached interview questions");
    return cache.interviewQuestions[cacheKey].data;
  }

  const prompt = `You are an expert AI interviewer. Generate a comprehensive interview for:

    Generate 5 interview questions for a ${jobTitle} role.
    Job Description: ${jobDescription.substring(0, 300)}...
    Requirements: ${jobRequirements.join(', ')}

    Return a JSON array of objects with:
    - "id": number (1-5)
    - "type": string (technical, behavioral, scenario, or coding)
    - "question": string
    - "expectedPoints": string[] (3-4 bullet points of what a good answer should cover)

    Ensure questions are diverse and relevant to the specific role.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              type: { type: Type.STRING },
              question: { type: Type.STRING },
              expectedPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["id", "type", "question", "expectedPoints"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const questions = JSON.parse(text) as InterviewQuestion[];

    // Update cache
    cache.interviewQuestions[cacheKey] = {
      data: questions,
      timestamp: Date.now()
    };

    return questions;
  } catch (error) {
    console.error("Failed to generate questions", error);
    // Fallback questions if AI fails
    return [
      {
        id: 1,
        type: 'behavioral',
        question: "Tell me about a challenging project you worked on recently.",
        expectedPoints: ["Situation/Task", "Action taken", "Result/Outcome"]
      },
      {
        id: 2,
        type: 'technical',
        question: `How would you approach a task related to ${jobTitle}?`,
        expectedPoints: ["Technical understanding", "Methodology", "Problem-solving"]
      }
    ];
  }
};

/**
 * Evaluate a single answer during the interview
 */
export const evaluateInterviewAnswer = async (
  question: InterviewQuestion,
  answer: string,
  jobContext: string
): Promise<{ score: number; feedback: string }> => {
  if (!apiKey) {
    return { score: 7, feedback: "Good answer demonstrating understanding." };
  }

  const prompt = `You are evaluating an interview answer.

Question Type: ${question.type}
  Question: ${question.question}
Job Context: ${jobContext}
Candidate's Answer: ${answer}

Evaluate this answer on a scale of 0 - 10 considering:
  - Relevance and accuracy
    - Depth of knowledge
      - Communication clarity
        - Completeness

  Provide: score(0 - 10) and brief feedback(1 - 2 sentences).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING }
          },
          required: ["score", "feedback"]
        }
      }
    });

    const text = response.text;
    if (!text) return { score: 7, feedback: "Answer received." };

    return JSON.parse(text);
  } catch (error) {
    console.error("Answer evaluation failed", error);
    return { score: 7, feedback: "Answer received." };
  }
};

/**
 * Generate final interview evaluation after all questions
 */
export const generateFinalEvaluation = async (
  questions: InterviewQuestion[],
  answers: Array<{ questionId: number; answer: string }>,
  questionScores: Array<{ questionId: number; score: number; feedback: string }>,
  jobTitle: string
): Promise<InterviewEvaluation> => {
  if (!apiKey) {
    return mockInterviewEvaluation(questionScores);
  }

  const prompt = `You are an expert hiring manager evaluating a complete interview for the role of ${jobTitle}.

  Interview Performance Summary:
  ${questionScores.map((qs) => {
    const q = questions.find(q => q.id === qs.questionId);
    const a = answers.find(ans => ans.questionId === qs.questionId);
    return `Q${qs.questionId} [${q?.type}]:\nQuestion: ${q?.question}\nCandidate Answer: ${a?.answer}\nScore: ${qs.score}/10\nFeedback: ${qs.feedback}`;
  }).join('\n\n')}

  Generate a comprehensive professional evaluation report with:

  1. SCORES:
  - technicalScore (0-100): Weighted average of technical questions
  - communicationScore (0-100): Clarity, articulation, structure of responses
  - confidenceLevel: Low / Medium / High based on answer depth and conviction
  - overallScore (0-100): Weighted overall performance

  2. STRENGTHS & WEAKNESSES:
  - strengthsObserved: Array of 3-5 specific strengths demonstrated
  - weaknessesObserved: Array of 3-5 specific weaknesses or areas of concern
  - skillsToImprove: Array of 3-5 actionable skills the candidate should develop

  3. ANALYSIS:
  - questionWiseAnalysis: For each question, provide:
       * performance: Brief assessment (1-2 sentences)
       * keyTakeaways: What this reveals about the candidate

  4. ASSESSMENT:
  - readinessLevel: Ready (>85) | Nearly Ready (70-85) | Needs Development (50-70) | Not Ready (<50)
  - hiringRecommendation: Strong Hire (exceptional) | Hire (good fit) | Consider (potential with reservations) | Reject (not suitable)
  - detailedFeedback: 3-4 paragraph professional summary covering overall performance, key strengths, main concerns, and final recommendation

  Be specific, professional, and actionable in all feedback.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            technicalScore: { type: Type.INTEGER },
            communicationScore: { type: Type.INTEGER },
            confidenceLevel: { type: Type.STRING },
            overallScore: { type: Type.INTEGER },
            hiringRecommendation: { type: Type.STRING },
            detailedFeedback: { type: Type.STRING },
            strengthsObserved: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknessesObserved: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillsToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
            readinessLevel: { type: Type.STRING },
            questionWiseAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionId: { type: Type.INTEGER },
                  performance: { type: Type.STRING },
                  keyTakeaways: { type: Type.STRING }
                },
                required: ["questionId", "performance", "keyTakeaways"]
              }
            }
          },
          required: ["technicalScore", "communicationScore", "confidenceLevel", "overallScore", "hiringRecommendation", "detailedFeedback", "strengthsObserved", "weaknessesObserved", "skillsToImprove", "readinessLevel", "questionWiseAnalysis"]
        }
      }
    });

    const text = response.text;
    if (!text) return mockInterviewEvaluation(questionScores);

    const evaluation = JSON.parse(text);
    return { ...evaluation, questionScores };
  } catch (error) {
    console.error("Final evaluation failed", error);
    return mockInterviewEvaluation(questionScores);
  }
};

const mockInterviewQuestions = (): InterviewQuestion[] => [
  { id: 1, type: 'technical', question: 'Explain the difference between var, let, and const in JavaScript.', expectedPoints: ['Block scope', 'Hoisting', 'Reassignment'] },
  { id: 2, type: 'technical', question: 'What is the Virtual DOM and how does React use it?', expectedPoints: ['Performance', 'Reconciliation', 'Diffing algorithm'] },
  { id: 3, type: 'technical', question: 'Describe the difference between SQL and NoSQL databases.', expectedPoints: ['Schema', 'Scalability', 'Use cases'] },
  { id: 4, type: 'technical', question: 'What are RESTful APIs and what are the common HTTP methods?', expectedPoints: ['GET, POST, PUT, DELETE', 'Stateless', 'Resource-based'] },
  { id: 5, type: 'technical', question: 'Explain asynchronous programming in JavaScript (Promises, async/await).', expectedPoints: ['Non-blocking', 'Error handling', 'Callbacks'] },
  { id: 6, type: 'behavioral', question: 'Tell me about a time you faced a significant technical challenge. How did you overcome it?', expectedPoints: ['Problem-solving', 'Persistence', 'Learning'] },
  { id: 7, type: 'behavioral', question: 'Describe a situation where you had to work with a difficult team member.', expectedPoints: ['Communication', 'Conflict resolution', 'Teamwork'] },
  { id: 8, type: 'behavioral', question: 'Give an example of when you had to learn a new technology quickly.', expectedPoints: ['Adaptability', 'Self-learning', 'Application'] },
  { id: 9, type: 'scenario', question: 'Your application is experiencing slow performance. Walk me through how you would debug and optimize it.', expectedPoints: ['Profiling', 'Bottleneck identification', 'Optimization strategies'] },
  { id: 10, type: 'scenario', question: 'A client requests a feature that conflicts with best practices. How would you handle this?', expectedPoints: ['Communication', 'Trade-offs', 'Alternative solutions'] },
  { id: 11, type: 'coding', question: 'Write a function to reverse a string without using built-in reverse methods.', expectedPoints: ['Loop logic', 'String manipulation', 'Edge cases'] }
];

const mockInterviewEvaluation = (questionScores: Array<{ questionId: number; score: number; feedback: string }>): InterviewEvaluation => {
  const avgScore = questionScores.reduce((sum, qs) => sum + qs.score, 0) / questionScores.length;
  const overall = Math.round(avgScore * 10);

  return {
    technicalScore: 78,
    communicationScore: 82,
    confidenceLevel: 'Medium',
    overallScore: overall,
    hiringRecommendation: overall >= 85 ? 'Strong Hire' : overall >= 70 ? 'Hire' : overall >= 50 ? 'Consider' : 'Reject',
    detailedFeedback: `The candidate demonstrated solid technical knowledge and good communication skills throughout the interview.Their responses showed a clear understanding of core concepts and practical application experience.Communication was clear and structured, though some answers could benefit from more specific examples.Overall performance indicates readiness for the role with minor areas for growth.`,
    strengthsObserved: [
      'Strong foundational knowledge in core technologies',
      'Clear and structured communication style',
      'Good problem-solving approach demonstrated',
      'Positive attitude and willingness to learn'
    ],
    weaknessesObserved: [
      'Limited experience with some advanced concepts',
      'Could provide more specific real-world examples',
      'Some hesitation on complex technical questions'
    ],
    skillsToImprove: [
      'Deepen knowledge of system design patterns',
      'Gain more hands-on experience with cloud platforms',
      'Practice articulating solutions with concrete examples',
      'Strengthen understanding of performance optimization'
    ],
    readinessLevel: overall >= 85 ? 'Ready' : overall >= 70 ? 'Nearly Ready' : overall >= 50 ? 'Needs Development' : 'Not Ready',
    questionWiseAnalysis: questionScores.map(qs => ({
      questionId: qs.questionId,
      performance: qs.feedback,
      keyTakeaways: `Score ${qs.score}/10 reflects understanding with room for deeper expertise.`
    })),
    questionScores
  };
};
