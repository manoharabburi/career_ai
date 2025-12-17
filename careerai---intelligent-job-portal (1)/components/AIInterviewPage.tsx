import React, { useState, useEffect } from 'react';
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateFinalEvaluation,
  InterviewQuestion,
  InterviewEvaluation
} from '../services/geminiService';
import { saveInterviewResult, fetchStudentApplications, fetchJob } from '../services/api';
import { Job } from '../types';

interface AIInterviewPageProps {
  selectedJob: Job | null;
  applicationId?: string;
  onBack: () => void;
  onSelectJob?: (job: Job) => void;
}

interface QuestionScore {
  questionId: number;
  score: number;
  feedback: string;
}

const AIInterviewPage: React.FC<AIInterviewPageProps> = ({ selectedJob, applicationId, onBack, onSelectJob }) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: number; answer: string }>>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionScores, setQuestionScores] = useState<QuestionScore[]>([]);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);

  // Job Selection State
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    if (selectedJob) {
      const loadQuestions = async () => {
        setIsLoading(true);
        try {
          const generatedQuestions = await generateInterviewQuestions(
            selectedJob.title,
            selectedJob.description,
            selectedJob.requirements
          );
          setQuestions(generatedQuestions);
        } catch (error) {
          console.error('Failed to generate questions:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadQuestions();
    } else {
      // If no job selected, load available applications
      const loadApplications = async () => {
        setLoadingJobs(true);
        try {
          const apps = await fetchStudentApplications();
          setAvailableJobs(apps);
        } catch (error) {
          console.error('Failed to load applications:', error);
        } finally {
          setLoadingJobs(false);
        }
      };
      loadApplications();
    }
  }, [selectedJob]);

  const handleJobSelect = async (jobId: string) => {
    if (!onSelectJob) return;
    setLoadingJobs(true);
    try {
      const fullJob = await fetchJob(jobId);
      onSelectJob(fullJob);
    } catch (error) {
      console.error('Failed to load full job:', error);
      alert('Failed to load full job details. Please try again.');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before proceeding.');
      return;
    }

    if (!selectedJob) return;

    setIsEvaluating(true);

    const currentQuestion = questions[currentIndex];
    const newAnswer = { questionId: currentQuestion.id, answer: currentAnswer };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    try {
      // Evaluate the answer
      const result = await evaluateInterviewAnswer(
        currentQuestion,
        currentAnswer,
        `${selectedJob.title} - ${selectedJob.description}`
      );

      const newScore: QuestionScore = {
        questionId: currentQuestion.id,
        score: result.score,
        feedback: result.feedback
      };

      const updatedScores = [...questionScores, newScore];
      setQuestionScores(updatedScores);

      // Move to next question or generate final evaluation
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentAnswer('');
        setIsEvaluating(false);
      } else {
        // Interview complete - generate final evaluation
        setIsGeneratingFinal(true);
        const finalEval = await generateFinalEvaluation(
          questions,
          updatedAnswers,
          updatedScores,
          selectedJob.title
        );
        setEvaluation(finalEval);

        // Save to backend if applicationId is provided
        if (applicationId) {
          try {
            await saveInterviewResult({
              application_id: applicationId,
              job_title: selectedJob.title,
              questions: questions,
              answers: updatedAnswers,
              technical_score: finalEval.technicalScore,
              communication_score: finalEval.communicationScore,
              confidence_level: finalEval.confidenceLevel,
              overall_score: finalEval.overallScore,
              strengths_observed: finalEval.strengthsObserved,
              weaknesses_observed: finalEval.weaknessesObserved,
              skills_to_improve: finalEval.skillsToImprove,
              readiness_level: finalEval.readinessLevel,
              question_wise_analysis: finalEval.questionWiseAnalysis,
              question_scores: updatedScores,
              hiring_recommendation: finalEval.hiringRecommendation,
              detailed_feedback: finalEval.detailedFeedback,
            });
            console.log('Interview results saved to backend');
          } catch (err) {
            console.error('Failed to save interview to backend:', err);
          }
        }

        setIsEvaluating(false);
        setIsGeneratingFinal(false);
      }
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
      setIsEvaluating(false);
      setIsGeneratingFinal(false);
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'text-blue-600 bg-blue-50';
      case 'behavioral': return 'text-green-600 bg-green-50';
      case 'scenario': return 'text-purple-600 bg-purple-50';
      case 'coding': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationColor = (rec: string) => {
    if (rec === 'Strong Hire') return 'bg-green-100 text-green-800 border-green-300';
    if (rec === 'Hire') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (rec === 'Consider') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getReadinessColor = (level: string) => {
    if (level === 'Ready') return 'bg-green-50 text-green-700 border-green-300';
    if (level === 'Nearly Ready') return 'bg-blue-50 text-blue-700 border-blue-300';
    if (level === 'Needs Development') return 'bg-yellow-50 text-yellow-700 border-yellow-300';
    return 'bg-red-50 text-red-700 border-red-300';
  };

  if (!selectedJob) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">🎙️</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Job to Practice</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Choose one of your applied jobs to start a personalized AI interview session.
          </p>

          {loadingJobs ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : availableJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {availableJobs.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleJobSelect(app.job_id)}
                  className="p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                >
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-700">{app.job_title}</h3>
                  <p className="text-sm text-slate-500">{app.company_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${app.status === 'PENDING' || app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {app.status}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 bg-slate-50 rounded-lg">
              <p className="text-slate-500 mb-4">You haven't applied to any jobs yet.</p>
              <button
                onClick={onBack}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Find Jobs
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Generating personalized interview questions...</p>
        </div>
      </div>
    );
  }

  if (evaluation) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Interview Evaluation Report</h1>
              <p className="text-sm text-gray-600">{selectedJob.title} at {selectedJob.company}</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Close
            </button>
          </div>

          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">Technical</p>
              <p className={`text-4xl font-bold ${getScoreColor(evaluation.technicalScore)}`}>
                {evaluation.technicalScore}
              </p>
              <p className="text-xs text-blue-600 mt-1">/ 100</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
              <p className="text-xs text-green-600 font-semibold mb-1 uppercase tracking-wide">Communication</p>
              <p className={`text-4xl font-bold ${getScoreColor(evaluation.communicationScore)}`}>
                {evaluation.communicationScore}
              </p>
              <p className="text-xs text-green-600 mt-1">/ 100</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600 font-semibold mb-1 uppercase tracking-wide">Confidence</p>
              <p className="text-3xl font-bold text-purple-800">{evaluation.confidenceLevel}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border border-orange-200">
              <p className="text-xs text-orange-600 font-semibold mb-1 uppercase tracking-wide">Overall</p>
              <p className={`text-4xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                {evaluation.overallScore}
              </p>
              <p className="text-xs text-orange-600 mt-1">/ 100</p>
            </div>
          </div>

          {/* Hiring Recommendation & Readiness */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className={`p-6 rounded-lg border-2 ${getRecommendationColor(evaluation.hiringRecommendation)}`}>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wide opacity-75">Final Recommendation</p>
              <p className="text-3xl font-bold">{evaluation.hiringRecommendation}</p>
            </div>
            <div className={`p-6 rounded-lg border-2 ${getReadinessColor(evaluation.readinessLevel)}`}>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wide opacity-75">Readiness Level</p>
              <p className="text-3xl font-bold">{evaluation.readinessLevel}</p>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded"></span>
              Executive Summary
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              {evaluation.detailedFeedback.split('\\n\\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Strengths Observed
              </h3>
              <ul className="space-y-2">
                {evaluation.strengthsObserved.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
              <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Areas of Concern
              </h3>
              <ul className="space-y-2">
                {evaluation.weaknessesObserved.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skills to Improve */}
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200 mb-8">
            <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Recommended Skills Development
            </h3>
            <ul className="space-y-2">
              {evaluation.skillsToImprove.map((skill, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-yellow-800">
                  <span className="text-yellow-600 mt-0.5 font-bold">→</span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Question-Wise Performance Analysis */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded"></span>
              Question-Wise Performance Analysis
            </h2>
            <div className="space-y-4">
              {evaluation.questionWiseAnalysis.map((analysis, idx) => {
                const question = questions.find(q => q.id === analysis.questionId);
                const scoreData = evaluation.questionScores.find(qs => qs.questionId === analysis.questionId);
                return (
                  <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-500">Q{analysis.questionId}</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${getQuestionTypeColor(question?.type || 'technical')}`}>
                            {question?.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-2">{question?.question}</p>
                      </div>
                      <div className="ml-4 text-center">
                        <span className={`text-2xl font-bold ${getScoreColor((scoreData?.score || 0) * 10)}`}>
                          {scoreData?.score}
                        </span>
                        <span className="text-gray-500 text-sm">/10</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400 mb-2">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Performance:</p>
                      <p className="text-sm text-blue-800">{analysis.performance}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                      <p className="text-xs font-semibold text-purple-900 mb-1">Key Takeaways:</p>
                      <p className="text-sm text-purple-800">{analysis.keyTakeaways}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="px-10 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where questions failed to load or are empty
  if (!questions || questions.length === 0) {
    if (isLoading) return null; // Should be handled by loading view above, but just in case

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">⚠️</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Generate Interview</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            We couldn't generate interview questions for this job. This might be due to a connection issue or high traffic.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                // Trigger retry by forcing effect re-run or manual call
                // For simplicity, we can reload or call internal retry if refactored
                // Simplest is to just reload the page or re-select
                window.location.reload();
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">AI Interview</h1>
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700"
              disabled={isEvaluating || isGeneratingFinal}
            >
              ✕
            </button>
          </div>
          <div className="mb-2">
            <p className="text-sm text-gray-600 font-medium">
              {selectedJob.title} at {selectedJob.company}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getQuestionTypeColor(currentQuestion.type)}`}>
              {currentQuestion.type.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {currentQuestion.question}
          </h2>

          {currentQuestion.expectedPoints && currentQuestion.expectedPoints.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Consider covering:</p>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                {currentQuestion.expectedPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Answer Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer
          </label>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isEvaluating || isGeneratingFinal}
          />
          <p className="text-sm text-gray-500 mt-2">
            {currentAnswer.length} characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
            disabled={isEvaluating || isGeneratingFinal}
          >
            Cancel Interview
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={!currentAnswer.trim() || isEvaluating || isGeneratingFinal}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
          >
            {isEvaluating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Evaluating...
              </>
            ) : isGeneratingFinal ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Report...
              </>
            ) : currentIndex < questions.length - 1 ? (
              'Next Question →'
            ) : (
              'Complete Interview'
            )}
          </button>
        </div>

        {/* Already Answered Questions Preview */}
        {questionScores.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Previous Answers</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {questionScores.map((qs, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                  <span className="text-gray-600">Q{qs.questionId}</span>
                  <span className={`font-semibold ${getScoreColor(qs.score * 10)}`}>
                    {qs.score}/10
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInterviewPage;
