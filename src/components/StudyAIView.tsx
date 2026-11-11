import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  ListChecks,
  MessageSquare,
  Play,
  Plus,
  RefreshCw,
  RotateCw,
  Send,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { DocumentNote, Flashcard, QuizQuestion } from '../types';
import { extractTextFromPdf } from '../utils/pdfExtractor';

export const StudyAIView: React.FC = () => {
  const {
    documents,
    courses,
    addDocument,
    updateDocument,
    deleteDocument,
    isGenerating,
    generationStatus,
    error,
    clearError,
    generateSummary,
    generateFlashcards,
    generateQuiz,
    generateAdaptiveRevisionPlan,
    revisionPlan,
    toggleRevisionSession,
    recordQuizResult,
    updateFlashcardRating,
    askTutor,
  } = useAcademic();

  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'flashcards' | 'quiz' | 'plan' | 'tutor'>('summary');

  // New Note Modal state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCourseId, setUploadCourseId] = useState<string>(courses[0]?.id || '');
  const [uploadContent, setUploadContent] = useState('');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Socratic Tutor Chat state
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorMessages, setTutorMessages] = useState<Array<{ role: 'user' | 'tutor'; text: string }>>([
    {
      role: 'tutor',
      text: 'Hello! I am your Gradia Socratic Academic Tutor. Ask me to break down an elusive theorem, test your mental models, or explain an exam trap.',
    },
  ]);
  const [isTutorThinking, setIsTutorThinking] = useState(false);

  // Plan generation parameters
  const [planDays, setPlanDays] = useState(7);
  const [planHours, setPlanHours] = useState(3);

  // PDF processing states
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfExtractionNotice, setPdfExtractionNotice] = useState<string | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];
  const linkedCourse = selectedDoc ? courses.find((c) => c.id === selectedDoc.courseId) : null;

  // Handle file drop / file select for PDF, TXT, MD
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setUploadTitle(fileNameWithoutExt);
    setPdfExtractionNotice(null);
    setPdfPageCount(null);

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setIsExtractingPdf(true);
      try {
        const result = await extractTextFromPdf(file);
        setPdfPageCount(result.pageCount);
        setUploadContent(result.text);

        if (result.isScannedOrEmpty) {
          setPdfExtractionNotice(
            result.warning ||
              'Scanned / Image-Only PDF: Little or no selectable text found. For optimal Gemini processing, please use a searchable text PDF or paste notes directly.'
          );
        } else {
          setPdfExtractionNotice(
            `Extracted ${result.text.length.toLocaleString()} characters across ${result.pageCount} pages using PDF.js engine.`
          );
        }
      } catch (err: any) {
        console.error('PDF extraction failed:', err);
        setPdfExtractionNotice(`PDF extraction error: ${err.message}. You can still paste lecture notes manually below.`);
      } finally {
        setIsExtractingPdf(false);
      }
    } else {
      // Regular text/markdown/json file
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setUploadContent(text || '');
        setPdfExtractionNotice(`Loaded text file (${(text || '').length.toLocaleString()} characters).`);
      };
      reader.readAsText(file);
    }
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) return;

    const newDoc = addDocument({
      title: uploadTitle.trim(),
      courseId: uploadCourseId,
      content: uploadContent.trim(),
    });

    setIsUploading(false);
    setUploadTitle('');
    setUploadContent('');
    setSelectedDocId(newDoc.id);
    setActiveSubTab('summary');
  };

  // Trigger Gemini Summary
  const handleGenerateSummary = async () => {
    if (!selectedDoc) return;
    await generateSummary(selectedDoc.id);
  };

  // Trigger Gemini Flashcards
  const handleGenerateFlashcards = async () => {
    if (!selectedDoc) return;
    await generateFlashcards(selectedDoc.id, 6);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
  };

  // Trigger Gemini Quiz
  const handleGenerateQuiz = async () => {
    if (!selectedDoc) return;
    await generateQuiz(selectedDoc.id, 5, 'Mixed');
    setQuizActive(false);
    setQuizSubmitted(false);
    setQuizAnswers({});
  };

  // Submit Quiz
  const handleGradeQuiz = () => {
    if (!selectedDoc || !selectedDoc.quiz) return;
    setQuizSubmitted(true);

    let score = 0;
    const weakTopics: string[] = [];

    selectedDoc.quiz.forEach((q) => {
      const selected = quizAnswers[q.id];
      if (selected === q.correctIndex) {
        score++;
      } else {
        if (q.topic) weakTopics.push(q.topic);
      }
    });

    recordQuizResult({
      courseId: selectedDoc.courseId,
      docTitle: selectedDoc.title,
      score,
      total: selectedDoc.quiz.length,
      percentage: Number(((score / selectedDoc.quiz.length) * 100).toFixed(1)),
      weakTopics: Array.from(new Set(weakTopics)),
    });
  };

  // Socratic Tutor Send Message
  const handleSendTutorMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuery.trim() || isTutorThinking) return;

    const query = tutorQuery.trim();
    setTutorQuery('');
    setTutorMessages((prev) => [...prev, { role: 'user', text: query }]);
    setIsTutorThinking(true);

    try {
      const reply = await askTutor(
        linkedCourse ? `${linkedCourse.code}: ${linkedCourse.name}` : 'General Academic',
        selectedDoc ? selectedDoc.title : 'Study Topic',
        query,
        tutorMessages
      );
      setTutorMessages((prev) => [...prev, { role: 'tutor', text: reply }]);
    } catch (err: any) {
      setTutorMessages((prev) => [
        ...prev,
        { role: 'tutor', text: `Apologies, I encountered an issue: ${err.message || 'Please retry in a moment.'}` },
      ]);
    } finally {
      setIsTutorThinking(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-500" />
            <span>AI Study & Knowledge Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gemini-powered executive summaries, active recall flashcards, scored MCQs, and adaptive revision schedules
          </p>
        </div>

        <button
          onClick={() => setIsUploading(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-xs w-fit"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Notes / PDF</span>
        </button>
      </div>

      {/* Global Status / Loader */}
      {isGenerating && (
        <div className="p-4 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/30 flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
          <div className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">
            {generationStatus || 'Connecting to Gemini model on server...'}
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/20 flex items-start justify-between gap-3 text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Gemini API Notice:</span> {error}
            </div>
          </div>
          <button onClick={clearError} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Document Upload Modal */}
      {isUploading && (
        <div className="p-5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-slate-900/90 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>Upload or Paste Academic Lecture Material</span>
            </h3>
            <button
              onClick={() => setIsUploading(false)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveDocument} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Document / Lecture Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4: Neural Backpropagation & Vector Gradients"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Associated Course
                </label>
                <select
                  value={uploadCourseId}
                  onChange={(e) => setUploadCourseId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Lecture Notes, Transcript, or PDF Content
                </label>
                <div className="flex items-center gap-3">
                  {uploadContent && (
                    <span className="text-[11px] font-mono text-slate-500">
                      {uploadContent.length.toLocaleString()} chars {pdfPageCount ? `· ${pdfPageCount} pages` : ''}
                    </span>
                  )}
                  <label className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Choose PDF / Text file</span>
                    <input
                      type="file"
                      accept=".pdf,.txt,.md,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {isExtractingPdf && (
                <div className="p-3 mb-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Extracting text page-by-page with PDF.js engine...</span>
                </div>
              )}

              {pdfExtractionNotice && (
                <div className={`p-2.5 mb-2 rounded-lg text-xs flex items-start gap-2 border ${
                  pdfExtractionNotice.includes('Scanned') || pdfExtractionNotice.includes('error')
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{pdfExtractionNotice}</span>
                </div>
              )}

              <textarea
                rows={6}
                placeholder="Paste textbook excerpt, lecture notes, formula derivations, or syllabi here..."
                value={uploadContent}
                onChange={(e) => setUploadContent(e.target.value)}
                required
                className="w-full p-3 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                PDF text is extracted client-side with PDF.js and previewed above before saving. You can edit or augment notes before submitting to Gemini.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsUploading(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
              >
                Save Document & Open
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Study Hub Interface: Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar (1 Col): Document / Material Library */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Course Materials ({documents.length})
              </h3>
              <button
                onClick={() => setIsUploading(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                + New
              </button>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => {
                const c = courses.find((crs) => crs.id === doc.courseId);
                const isSelected = selectedDocId === doc.id;

                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setQuizActive(false);
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                      setCurrentCardIndex(0);
                      setIsCardFlipped(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-400 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mb-1">
                      <span>{c?.code || 'General'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{doc.wordCount} words</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                      {doc.title}
                    </div>

                    {/* Indicators */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2">
                      {doc.summary && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Summary
                        </span>
                      )}
                      {doc.flashcards && doc.flashcards.length > 0 && (
                        <span className="font-mono">
                          {doc.flashcards.length} cards
                        </span>
                      )}
                      {doc.quiz && doc.quiz.length > 0 && (
                        <span className="font-mono">
                          {doc.quiz.length} MCQs
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Area (3 Cols): Multi-Tab Study Workspace */}
        <div className="lg:col-span-3 space-y-4">
          
          {selectedDoc ? (
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
              
              {/* Document Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {linkedCourse?.code}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{linkedCourse?.name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedDoc.wordCount} words</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedDoc.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Delete document "${selectedDoc.title}"?`)) {
                        deleteDocument(selectedDoc.id);
                        if (documents.length > 1) {
                          setSelectedDocId(documents.filter((d) => d.id !== selectedDoc.id)[0].id);
                        }
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg overflow-x-auto">
                <button
                  onClick={() => setActiveSubTab('summary')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeSubTab === 'summary'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Executive Summary</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveSubTab('flashcards')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeSubTab === 'flashcards'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Flashcards ({selectedDoc.flashcards?.length || 0})</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveSubTab('quiz')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeSubTab === 'quiz'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Scored MCQs ({selectedDoc.quiz?.length || 0})</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveSubTab('plan')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeSubTab === 'plan'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>Adaptive Revision Plan</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveSubTab('tutor')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeSubTab === 'tutor'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Socratic AI Tutor</span>
                  </span>
                </button>
              </div>

              {/* TAB 1: EXECUTIVE SUMMARY */}
              {activeSubTab === 'summary' && (
                <div className="space-y-6">
                  {selectedDoc.summary ? (
                    <div className="space-y-5">
                      {/* Overview */}
                      <div className="p-4 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/20">
                        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1">
                          Academic Synthesis
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {selectedDoc.summary.overview}
                        </p>
                      </div>

                      {/* Key Takeaways */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                          High-Yield Exam Takeaways
                        </h4>
                        <div className="space-y-1.5">
                          {selectedDoc.summary.keyTakeaways.map((point, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Core Concepts Grid */}
                      {selectedDoc.summary.coreConcepts && selectedDoc.summary.coreConcepts.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Essential Terminology & Mechanics
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedDoc.summary.coreConcepts.map((c, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
                              >
                                <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                                  {c.term}
                                </div>
                                <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                  {c.definition}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Formulas and Theorems */}
                      {selectedDoc.summary.formulasAndTheorems && selectedDoc.summary.formulasAndTheorems.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Governing Formulas & Theorems
                          </h4>
                          <div className="space-y-2">
                            {selectedDoc.summary.formulasAndTheorems.map((f, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-slate-900 dark:text-slate-100">{f.title}</span>
                                  <span className="text-[11px] text-slate-500">{f.application}</span>
                                </div>
                                <div className="p-2 rounded bg-white dark:bg-slate-900 font-mono text-indigo-700 dark:text-indigo-300 text-xs border border-slate-200 dark:border-slate-800">
                                  {f.formulaOrRule}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exam Traps & Misconceptions */}
                      {selectedDoc.summary.examTraps && selectedDoc.summary.examTraps.length > 0 && (
                        <div className="p-4 rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/20">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-2">
                            Common Pitfalls & Exam Traps
                          </h4>
                          <div className="space-y-1.5 text-xs text-rose-900 dark:text-rose-200">
                            {selectedDoc.summary.examTraps.map((trap, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-rose-500 font-bold">✕</span>
                                <span>{trap}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Active Recall Tip */}
                      {selectedDoc.summary.studyTip && (
                        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
                          <span><strong>Pro Study Tip:</strong> {selectedDoc.summary.studyTip}</span>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleGenerateSummary}
                          disabled={isGenerating}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Regenerate Summary with Gemini</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                      <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          No Summary Generated Yet
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                          Gradia will extract key takeaways, core concepts, formulas, and subtle test traps directly from your material.
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateSummary}
                        disabled={isGenerating}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-colors"
                      >
                        Generate Academic Summary with Gemini
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: FLASHCARDS ARENA */}
              {activeSubTab === 'flashcards' && (
                <div className="space-y-6">
                  {selectedDoc.flashcards && selectedDoc.flashcards.length > 0 ? (
                    <div>
                      {/* Counter & Action */}
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="font-mono text-slate-500">
                          Card {currentCardIndex + 1} of {selectedDoc.flashcards.length}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleGenerateFlashcards}
                            disabled={isGenerating}
                            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Add / Refresh Flashcards</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive 3D Flip Flashcard */}
                      {selectedDoc.flashcards[currentCardIndex] && (
                        <div
                          onClick={() => setIsCardFlipped(!isCardFlipped)}
                          className="w-full min-h-[220px] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:border-indigo-400 dark:hover:border-indigo-700 transition-all cursor-pointer flex flex-col justify-between shadow-xs select-none relative group"
                        >
                          {/* Card Top Metadata */}
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
                              {selectedDoc.flashcards[currentCardIndex].topic}
                            </span>
                            <span className="text-[11px] font-mono">
                              {isCardFlipped ? 'Answer (Click to Flip)' : 'Question (Click to Reveal)'}
                            </span>
                          </div>

                          {/* Card Content */}
                          <div className="py-6 text-center">
                            {isCardFlipped ? (
                              <p className="text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed max-w-xl mx-auto">
                                {selectedDoc.flashcards[currentCardIndex].back}
                              </p>
                            ) : (
                              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug max-w-xl mx-auto">
                                {selectedDoc.flashcards[currentCardIndex].front}
                              </h3>
                            )}
                          </div>

                          {/* Flip Hint */}
                          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Click anywhere to flip card</span>
                          </div>
                        </div>
                      )}

                      {/* Spaced Repetition Rating Buttons */}
                      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                              setIsCardFlipped(false);
                            }}
                            disabled={currentCardIndex === 0}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setCurrentCardIndex((prev) =>
                                Math.min((selectedDoc.flashcards?.length || 1) - 1, prev + 1)
                              );
                              setIsCardFlipped(false);
                            }}
                            disabled={currentCardIndex === (selectedDoc.flashcards?.length || 1) - 1}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Spaced repetition buttons */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Rate Recall:</span>
                          <button
                            onClick={() => {
                              if (selectedDoc.flashcards?.[currentCardIndex]) {
                                updateFlashcardRating(selectedDoc.id, selectedDoc.flashcards[currentCardIndex].id, 'again');
                                if (currentCardIndex < (selectedDoc.flashcards.length - 1)) {
                                  setCurrentCardIndex(currentCardIndex + 1);
                                  setIsCardFlipped(false);
                                }
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                          >
                            Again (1d)
                          </button>
                          <button
                            onClick={() => {
                              if (selectedDoc.flashcards?.[currentCardIndex]) {
                                updateFlashcardRating(selectedDoc.id, selectedDoc.flashcards[currentCardIndex].id, 'hard');
                                if (currentCardIndex < (selectedDoc.flashcards.length - 1)) {
                                  setCurrentCardIndex(currentCardIndex + 1);
                                  setIsCardFlipped(false);
                                }
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
                          >
                            Hard (3d)
                          </button>
                          <button
                            onClick={() => {
                              if (selectedDoc.flashcards?.[currentCardIndex]) {
                                updateFlashcardRating(selectedDoc.id, selectedDoc.flashcards[currentCardIndex].id, 'good');
                                if (currentCardIndex < (selectedDoc.flashcards.length - 1)) {
                                  setCurrentCardIndex(currentCardIndex + 1);
                                  setIsCardFlipped(false);
                                }
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                          >
                            Good (7d)
                          </button>
                          <button
                            onClick={() => {
                              if (selectedDoc.flashcards?.[currentCardIndex]) {
                                updateFlashcardRating(selectedDoc.id, selectedDoc.flashcards[currentCardIndex].id, 'easy');
                                if (currentCardIndex < (selectedDoc.flashcards.length - 1)) {
                                  setCurrentCardIndex(currentCardIndex + 1);
                                  setIsCardFlipped(false);
                                }
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                          >
                            Easy (14d)
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                      <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          No Flashcards Generated Yet
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                          Gemini will generate high-retention active recall cards testing core causal mechanisms and definitions.
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateFlashcards}
                        disabled={isGenerating}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-colors"
                      >
                        Generate 6 Flashcards with Gemini
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SCORED MCQs QUIZ ARENA */}
              {activeSubTab === 'quiz' && (
                <div className="space-y-6">
                  {selectedDoc.quiz && selectedDoc.quiz.length > 0 ? (
                    <div className="space-y-5">
                      
                      {/* Top quiz bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            Scored Multiple Choice Assessment
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {selectedDoc.quiz.length} Questions · Scored & Tracked
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {quizSubmitted && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 font-medium">Final Score:</span>
                              <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
                                {Object.keys(quizAnswers).filter(
                                  (qId) =>
                                    quizAnswers[qId] ===
                                    selectedDoc.quiz?.find((q) => q.id === qId)?.correctIndex
                                ).length} / {selectedDoc.quiz.length}
                              </span>
                            </div>
                          )}

                          <button
                            onClick={handleGenerateQuiz}
                            disabled={isGenerating}
                            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>New Quiz</span>
                          </button>
                        </div>
                      </div>

                      {/* Question List */}
                      <div className="space-y-6">
                        {selectedDoc.quiz.map((q, idx) => {
                          const selectedOption = quizAnswers[q.id];
                          const isCorrect = selectedOption === q.correctIndex;

                          return (
                            <div
                              key={q.id}
                              className={`p-4 rounded-xl border text-xs space-y-3 ${
                                quizSubmitted
                                  ? isCorrect
                                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20'
                                    : 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20'
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                                  <span className="font-mono text-slate-500 mr-1.5">{idx + 1}.</span>
                                  {q.question}
                                </h4>
                                <span className="font-mono text-[10px] text-slate-500 shrink-0">
                                  {q.topic}
                                </span>
                              </div>

                              {/* 4 Choices */}
                              <div className="space-y-1.5">
                                {q.options.map((opt, optIdx) => {
                                  const isSelected = selectedOption === optIdx;
                                  const isCorrectChoice = optIdx === q.correctIndex;

                                  let optClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300';
                                  if (quizSubmitted) {
                                    if (isCorrectChoice) {
                                      optClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold';
                                    } else if (isSelected && !isCorrectChoice) {
                                      optClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 line-through';
                                    }
                                  } else if (isSelected) {
                                    optClass = 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold';
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      disabled={quizSubmitted}
                                      onClick={() =>
                                        setQuizAnswers({
                                          ...quizAnswers,
                                          [q.id]: optIdx,
                                        })
                                      }
                                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${optClass}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono text-[10px] shrink-0">
                                          {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        <span>{opt}</span>
                                      </div>
                                      {quizSubmitted && isCorrectChoice && (
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Explanation after submission */}
                              {quizSubmitted && (
                                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                  <strong>Concept Explanation:</strong> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Submit / Retake Button */}
                      <div className="flex items-center justify-between pt-2">
                        {quizSubmitted ? (
                          <button
                            onClick={() => {
                              setQuizSubmitted(false);
                              setQuizAnswers({});
                            }}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200"
                          >
                            Retake Quiz
                          </button>
                        ) : (
                          <button
                            onClick={handleGradeQuiz}
                            disabled={Object.keys(quizAnswers).length < selectedDoc.quiz.length}
                            className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                          >
                            Submit & Score Quiz ({Object.keys(quizAnswers).length} / {selectedDoc.quiz.length} answered)
                          </button>
                        )}

                        <span className="text-[11px] text-slate-500 font-mono">
                          Missed topics are automatically fed to the Adaptive Revision Planner.
                        </span>
                      </div>

                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                      <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          No Quiz Generated Yet
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                          Gemini will generate 5 scored exam-grade questions with 4 choices and in-depth conceptual explanations.
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateQuiz}
                        disabled={isGenerating}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-colors"
                      >
                        Generate 5 Scored MCQs with Gemini
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ADAPTIVE REVISION PLAN */}
              {activeSubTab === 'plan' && (
                <div className="space-y-6">
                  {/* Pacing Configuration Strip */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                        Cognitive Revision Pacing Engine
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Synthesizes course credit weights + identified quiz weaknesses into a prioritized roadmap.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span>Days:</span>
                        <input
                          type="number"
                          min={3}
                          max={30}
                          value={planDays}
                          onChange={(e) => setPlanDays(Number(e.target.value))}
                          className="w-14 px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span>Hrs/day:</span>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={planHours}
                          onChange={(e) => setPlanHours(Number(e.target.value))}
                          className="w-14 px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <button
                        onClick={() => generateAdaptiveRevisionPlan(planDays, planHours)}
                        disabled={isGenerating}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span>Recompute Plan</span>
                      </button>
                    </div>
                  </div>

                  {/* Plan Content */}
                  {revisionPlan ? (
                    <div className="space-y-6">
                      {/* Strategy Overview */}
                      <div className="p-4 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/20 text-xs">
                        <div className="font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider mb-1">
                          Cognitive Strategy
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {revisionPlan.strategyOverview}
                        </p>
                      </div>

                      {/* Daily Schedules */}
                      <div className="space-y-4">
                        {revisionPlan.dailySchedules.map((day, dIdx) => (
                          <div
                            key={day.dayNumber}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                                  {day.dayNumber}
                                </span>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                                  {day.dayTitle}
                                </h4>
                              </div>
                              <span className="font-mono text-slate-500">
                                {day.totalHours} hours total
                              </span>
                            </div>

                            {/* Sessions */}
                            <div className="space-y-2">
                              {day.sessions.map((session, sIdx) => (
                                <div
                                  key={sIdx}
                                  onClick={() => toggleRevisionSession(dIdx, sIdx)}
                                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                                    session.completed
                                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 opacity-70'
                                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(session.completed)}
                                      onChange={() => {}} // handled by parent div
                                      className="mt-0.5 accent-indigo-600 cursor-pointer"
                                    />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                          {session.courseCode}
                                        </span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                          {session.topic}
                                        </span>
                                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                          {session.technique}
                                        </span>
                                      </div>
                                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                                        {session.specificGoal}
                                      </p>
                                    </div>
                                  </div>

                                  <span className="font-mono text-[11px] text-slate-500 shrink-0">
                                    {session.durationMinutes}m
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* High Yield Checklist */}
                      {revisionPlan.highYieldChecklist && (
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            High-Yield Grade Turnaround Checkpoints
                          </h4>
                          <div className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                            {revisionPlan.highYieldChecklist.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="font-mono text-indigo-500 font-bold">0{idx + 1}.</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                      <ListChecks className="w-8 h-8 text-slate-400 mx-auto" />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          No Adaptive Plan Generated Yet
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                          Gemini will analyze your course credit weights, exam dates, and quiz weak spots to construct a personalized day-by-day roadmap.
                        </p>
                      </div>
                      <button
                        onClick={() => generateAdaptiveRevisionPlan(planDays, planHours)}
                        disabled={isGenerating}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-colors"
                      >
                        Generate Adaptive Revision Plan with Gemini
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SOCRATIC AI TUTOR */}
              {activeSubTab === 'tutor' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">Active Study Session:</span>{' '}
                    <span className="text-slate-600 dark:text-slate-400">
                      {linkedCourse ? `${linkedCourse.code}: ${linkedCourse.name}` : 'General'} — "{selectedDoc.title}"
                    </span>
                  </div>

                  {/* Chat messages */}
                  <div className="space-y-3 max-h-[420px] overflow-y-auto p-2">
                    {tutorMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 text-xs leading-relaxed ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.role === 'tutor' && (
                          <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            G
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] p-3.5 rounded-xl ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-none shadow-xs'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                      </div>
                    ))}

                    {isTutorThinking && (
                      <div className="flex gap-3 text-xs justify-start">
                        <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          G
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-500 flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Tutor is formulating conceptual breakdown...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendTutorMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask the tutor: 'Can you give me an intuitive example of...' or 'Why does...'"
                      value={tutorQuery}
                      onChange={(e) => setTutorQuery(e.target.value)}
                      disabled={isTutorThinking}
                      className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={isTutorThinking || !tutorQuery.trim()}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <p className="text-xs text-slate-500">No documents found. Click "Upload Notes / PDF" above.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
