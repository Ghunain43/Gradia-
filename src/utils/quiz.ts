import type { QuizQuestion } from '../types';
/** Grade only complete, structurally valid attempts. Weaknesses are missed topic tags, not an AI diagnosis. */
export function gradeQuiz(questions: QuizQuestion[], answers: Record<string, number>) {
  if (!questions.length || new Set(questions.map(q => q.id)).size !== questions.length || questions.some(q => q.options.length !== 4 || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3 || !Number.isInteger(answers[q.id]) || answers[q.id] < 0 || answers[q.id] > 3)) throw new Error('Answer every question in a valid quiz before submitting.');
  const missed = questions.filter(q => answers[q.id] !== q.correctIndex);
  const score = questions.length - missed.length;
  return { score, total: questions.length, percentage: Number((score / questions.length * 100).toFixed(1)), weakTopics: [...new Set(missed.map(q => q.topic).filter(Boolean))] };
}
