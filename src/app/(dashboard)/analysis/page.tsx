'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { quizQuestions } from "@/data/quizData";
import { LivePhotoCapture } from "@/components/analysis/LivePhotoCapture";
import type { AnalysisPhotoFiles } from "@/components/analysis/LivePhotoCapture";
import { AnalysisProcessing } from "@/components/analysis/AnalysisProcessing";
import { analysisApi } from "@/api/analysis.api";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import type { UserProfile } from "@/lib/schemas/analysis";

type DiagnosisStep = "intro" | "quiz" | "about-you" | "camera" | "processing";

type AboutYouQuestionId = keyof UserProfile;

interface AboutYouQuestion {
  id: AboutYouQuestionId;
  question: string;
  emoji: string;
  options?: string[];
  skippable?: boolean;
  skipValue?: string;
  helpText?: string;
}

const aboutYouQuestions: AboutYouQuestion[] = [
  {
    id: "age_range",
    question: "What is your age range?",
    emoji: "🌿",
    options: ["Teen (13-19)", "20s", "30s", "40s", "50+"],
  },
  {
    id: "gender",
    question: "How do you identify?",
    emoji: "✨",
    options: ["Male", "Female", "Prefer not to say"],
    skippable: true,
    skipValue: "",
  },
  {
    id: "pregnant_or_breastfeeding",
    question: "Are you currently pregnant or breastfeeding?",
    emoji: "🤍",
    options: ["Yes", "No", "Prefer not to say"],
    helpText: "This helps us keep your product recommendations safe.",
  },
  {
    id: "fragrance_preference",
    question: "What is your fragrance preference?",
    emoji: "🌸",
    options: ["Fragrance-free only", "No preference"],
    skippable: true,
    skipValue: "No preference",
  },
  {
    id: "budget_range",
    question: "What is your preferred budget per product?",
    emoji: "🛍️",
    options: ["Under ₹500", "₹500-1500", "₹1500-3000", "No preference"],
    skippable: true,
    skipValue: "No preference",
  },
  {
    id: "allergies",
    question: "Any allergies or ingredients to avoid?",
    emoji: "📝",
    skippable: true,
    skipValue: "",
  },
];

const SkinQuiz = () => {
  const [step, setStep] = useState<DiagnosisStep>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [aboutYouQuestion, setAboutYouQuestion] = useState(0);
  const [aboutYouAnswers, setAboutYouAnswers] = useState<Partial<Record<AboutYouQuestionId, string>>>({});
  
  // Optional skin notes
  const [freeText, setFreeText] = useState<string>("");
  const [showFreeText, setShowFreeText] = useState<boolean>(false);
  const [processingAnalysisId, setProcessingAnalysisId] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingTimedOut, setProcessingTimedOut] = useState(false);
  
  const router = useRouter();

  // Ping backend on mount to wake up free tiers
  useEffect(() => {
    const API_URL = "";
    fetch(`${API_URL}/api/wake`, { method: "GET" }).catch(() => {
      /* warm-up is best-effort */
    });
  }, []);

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;

  const handleStart = () => {
    setStep("quiz");
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedOption(null);
    setAboutYouQuestion(0);
    setAboutYouAnswers({});
    setFreeText("");
    setShowFreeText(false);
    setProcessingAnalysisId(null);
    setProcessingError(null);
    setProcessingTimedOut(false);
  };

  const handleOptionSelect = (questionId: string, value: number, index: number) => {
    setSelectedOption(index);

    const newAnswers = { ...answers, [questionId]: value };

    setTimeout(() => {
      setAnswers(newAnswers);

      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      }
    }, 350);
  };

  const handlePrevious = () => {
    if (currentQuestion === 0) {
      setStep("intro");
      return;
    }
    const prevQuestionId = quizQuestions[currentQuestion - 1].id;
    const newAnswers = { ...answers };
    delete newAnswers[prevQuestionId];
    setAnswers(newAnswers);
    setCurrentQuestion(currentQuestion - 1);
    setSelectedOption(null);
  };

  const handleQuizSubmit = () => {
    setStep("about-you");
    setAboutYouQuestion(0);
    setAboutYouAnswers({});
  };

  const returnToPhysiologyQuiz = () => {
    const lastQuestion = quizQuestions[quizQuestions.length - 1];
    setStep("quiz");
    setCurrentQuestion(quizQuestions.length - 1);
    setSelectedOption(lastQuestion.options.findIndex((option) => answers[lastQuestion.id] === option.value));
  };

  const advanceAboutYou = () => {
    if (aboutYouQuestion < aboutYouQuestions.length - 1) {
      setAboutYouQuestion(aboutYouQuestion + 1);
    } else {
      setStep("camera");
    }
  };

  const handleAboutYouSelect = (value: string) => {
    const question = aboutYouQuestions[aboutYouQuestion];
    setAboutYouAnswers((current) => ({ ...current, [question.id]: value }));
    setTimeout(advanceAboutYou, 350);
  };

  const handleAboutYouSkip = () => {
    const question = aboutYouQuestions[aboutYouQuestion];
    setAboutYouAnswers((current) => ({ ...current, [question.id]: question.skipValue ?? "" }));
    setTimeout(advanceAboutYou, 350);
  };

  const buildUserProfile = (): UserProfile => {
    const pregnancyAnswer = aboutYouAnswers.pregnant_or_breastfeeding;

    return {
      age_range: aboutYouAnswers.age_range ?? null,
      gender: aboutYouAnswers.gender || null,
      pregnant_or_breastfeeding:
        pregnancyAnswer === "Yes" ? true : pregnancyAnswer === "No" ? false : null,
      fragrance_preference: aboutYouAnswers.fragrance_preference || "No preference",
      budget_range: aboutYouAnswers.budget_range || "No preference",
      allergies: aboutYouAnswers.allergies?.trim() || null,
    };
  };

  const handleCameraComplete = async (capturedPhotos: AnalysisPhotoFiles) => {
    setStep("processing");
    setProcessingError(null);
    setProcessingTimedOut(false);

    try {
      const formData = new FormData();
      for (const field of Object.keys(capturedPhotos) as Array<keyof AnalysisPhotoFiles>) {
        formData.append(field, capturedPhotos[field]);
      }
      formData.append("quizAnswers", JSON.stringify(answers));
      formData.append("userProfile", JSON.stringify(buildUserProfile()));
      if (freeText.trim()) formData.append("skinNotes", freeText.trim());

      const data = await analysisApi.createMultipart(formData);
      setProcessingAnalysisId(data.analysisId);

      if (data.status === "completed") {
        router.push(`/analysis/results/${data.analysisId}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("API Diagnostic failed:", message);

      const isLimitReached =
        err instanceof Error && "code" in err && (err as { code: string }).code === "ANALYSIS_LIMIT_REACHED";

      toast.error(
        isLimitReached
          ? "Free tier analysis limit reached. Upgrade to continue."
          : "Failed to generate analysis. Please try again."
      );

      setTimeout(() => {
        setStep("camera");
      }, 500);
    }
  };

  useEffect(() => {
    if (step !== "processing" || !processingAnalysisId) return;

    let unsubscribe = () => {};
    let finished = false;
    const timeoutId = window.setTimeout(() => {
      if (!finished) setProcessingTimedOut(true);
    }, 180_000);

    unsubscribe = onSnapshot(
      doc(db, "analyses", processingAnalysisId),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const status = snapshot.data().status;

        if (status === "completed") {
          finished = true;
          window.clearTimeout(timeoutId);
          unsubscribe();
          router.push(`/analysis/results/${processingAnalysisId}`);
        } else if (status === "failed") {
          finished = true;
          window.clearTimeout(timeoutId);
          unsubscribe();
          setProcessingError("The analysis could not be completed. Please try the photo step again.");
        }
      },
      () => {
        setProcessingError("We lost the live analysis status. Please try the photo step again.");
      }
    );

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [processingAnalysisId, router, step]);

  const retryProcessing = () => {
    setProcessingAnalysisId(null);
    setProcessingError(null);
    setProcessingTimedOut(false);
    setStep("camera");
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center relative bg-contain bg-center bg-no-repeat" style={{ backgroundImage: 'url(/analysis-bg.jpg)', backgroundColor: '#f5f0eb' }}>
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      <div className="container mx-auto px-4 w-full relative z-10">
          <AnimatePresence mode="wait">
            {/* Step 1: Intro Panel */}
            {step === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto text-center"
              >
                <div className="mb-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-card border border-white/20">
                    <Sparkles className="h-10 w-10 text-primary animate-float" />
                  </div>
                  <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-lg">
                    Unified Skin Analysis
                  </h1>
                  <p className="text-white/80 text-base max-w-lg mx-auto leading-relaxed drop-shadow">
                    Identify your clinical skin type and get a personalized routine. This unified 3-step flow combines a lifestyle quiz, a few personal details, and live multi-angle facial camera scans.
                  </p>
                </div>

                <Card className="mb-8 rounded-gg relative overflow-hidden border-0 shadow-elevated">
                  <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-[8px]" style={{ backgroundImage: 'url(/analysis-bg.jpg)' }} />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                  <CardContent className="p-6 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-white/90">
                      <div className="relative">
                        <div className="text-2xl mb-2">⏱️</div>
                        <span className="font-bold block text-white text-base">Quiz Flow</span>
                        <span className="text-[10px] text-white/80 font-semibold block uppercase tracking-wider mt-1">Step 1 — 7 Questions</span>
                      </div>
                       <div className="relative sm:border-x sm:border-white/15 sm:px-4">
                         <div className="text-2xl mb-2">✨</div>
                         <span className="font-bold block text-white text-base">A Few Quick Details</span>
                         <span className="text-[10px] text-white/80 font-semibold block uppercase tracking-wider mt-1">Step 2 — 6 Questions</span>
                       </div>
                       <div className="relative">
                         <div className="text-2xl mb-2">📷</div>
                         <span className="font-bold block text-white text-base">Photo Scan</span>
                         <span className="text-[10px] text-white/80 font-semibold block uppercase tracking-wider mt-1">Step 3 — 6 Angles</span>
                       </div>
                     </div>
                     <p className="mt-5 text-[10px] text-white/75 font-semibold uppercase tracking-wider">
                       AI Diagnostic — Fused Image + Quiz Analysis
                     </p>
                  </CardContent>
                </Card>

                <button
                  onClick={handleStart}
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full border border-white/30 bg-transparent text-white text-base font-bold tracking-wide hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
                >
                  Begin Diagnostic Flow
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Quiz Form */}
            {step === "quiz" && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold text-white/80 uppercase mb-1.5">
                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-1.5 bg-white/20" />
                </div>

                {/* Question Card */}
                <Card className="rounded-gg-lg overflow-hidden relative border-0 shadow-elevated">
                  <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-[8px]" style={{ backgroundImage: 'url(/analysis-bg.jpg)' }} />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                  <CardContent className="p-8 relative z-10">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="text-3xl">{quizQuestions[currentQuestion].emoji}</span>
                          {quizQuestions[currentQuestion].importance === "critical" && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/20 text-primary uppercase tracking-wider">
                              ⭐ Key Question
                            </span>
                          )}
                        </div>

                        <h2 className="font-heading text-2xl font-bold text-white text-center mb-2">
                          {quizQuestions[currentQuestion].question}
                        </h2>

                        {quizQuestions[currentQuestion].helpText && (
                          <p className="text-xs text-white/80 font-semibold text-center mb-6 max-w-md mx-auto">
                            {quizQuestions[currentQuestion].helpText}
                          </p>
                        )}

                        <div className="mb-6" />

                        {/* Options */}
                        <div className="space-y-2.5">
                          {quizQuestions[currentQuestion].options.map((option, index) => (
                            <motion.button
                              key={index}
                              onClick={() =>
                                handleOptionSelect(
                                  quizQuestions[currentQuestion].id,
                                  option.value,
                                  index
                                )
                              }
                              className={`w-full p-4 rounded-gg border-2 text-left transition-all ${
                                selectedOption === index
                                  ? "border-primary bg-primary/20"
                                  : "border-white/20 hover:border-primary/40 hover:bg-white/10"
                              }`}
                              whileHover={{ scale: 1.005 }}
                              whileTap={{ scale: 0.995 }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                    selectedOption === index
                                      ? "border-primary bg-primary"
                                      : "border-white/40"
                                  }`}
                                >
                                  {selectedOption === index && (
                                    <CheckCircle className="h-3 w-3 text-primary-foreground" />
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-white text-sm font-semibold block">{option.label}</span>
                                  <p className="text-xs text-white/80 font-semibold">{option.sublabel}</p>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        {/* Last Question Submit Panel */}
                        {isLastQuestion && selectedOption !== null && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 pt-5 border-t border-white/20 space-y-3"
                          >
                              <button
                                onClick={handleQuizSubmit}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-white/30 bg-transparent text-white text-sm font-bold tracking-wide hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
                              >
                                Continue
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </button>

                            <button
                              type="button"
                              onClick={() => setShowFreeText(!showFreeText)}
                              className="w-full text-[11px] text-white/80 hover:text-white font-semibold flex items-center justify-center gap-1 py-1 transition-colors"
                            >
                              <span>{showFreeText ? "▲" : "▼"}</span>
                              {showFreeText ? "Hide optional notes" : "Add skin notes (optional)"}
                            </button>

                            {showFreeText && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-1.5"
                              >
                                <textarea
                                  value={freeText}
                                  onChange={(e) => setFreeText(e.target.value.slice(0, 200))}
                                  placeholder="Type notes e.g., 'red patches near chin', 'flaky near nose in winter'..."
                                  rows={3}
                                  className="w-full rounded-gg border border-white/20 bg-white/10 px-4 py-3 text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                />
                                <div className="text-[10px] text-white/80 font-semibold text-right">{freeText.length}/200</div>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Footer Controls */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevious}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-white/30 bg-transparent text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleStart}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-white/30 bg-transparent text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restart
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: About You */}
            {step === "about-you" && (
               <motion.div
                 key="about-you"
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -15 }}
                 className="max-w-2xl mx-auto space-y-6"
               >
                 <div className="text-center text-white">
                   <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Step 2 of 2</p>
                   <h2 className="font-heading text-3xl font-bold mt-2">A Few Quick Details</h2>
                   <p className="text-sm text-white/75 mt-2">Almost done — these details help us tailor safer recommendations.</p>
                 </div>

                 <div className="mb-4">
                   <div className="flex justify-between text-xs font-semibold text-white/80 uppercase mb-1.5">
                     <span>Question {aboutYouQuestion + 1} of {aboutYouQuestions.length}</span>
                     <span>{Math.round(((aboutYouQuestion + 1) / aboutYouQuestions.length) * 100)}% Complete</span>
                   </div>
                   <Progress value={((aboutYouQuestion + 1) / aboutYouQuestions.length) * 100} className="h-1.5 bg-white/20" />
                 </div>

                 <Card className="rounded-gg-lg overflow-hidden relative border-0 shadow-elevated">
                   <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-[8px]" style={{ backgroundImage: 'url(/analysis-bg.jpg)' }} />
                   <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
                   <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                   <CardContent className="p-8 relative z-10">
                     <AnimatePresence mode="wait">
                       <motion.div
                         key={aboutYouQuestion}
                         initial={{ opacity: 0, x: 15 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -15 }}
                         transition={{ duration: 0.2 }}
                       >
                         <div className="flex items-center justify-center gap-2 mb-3">
                           <span className="text-3xl">{aboutYouQuestions[aboutYouQuestion].emoji}</span>
                         </div>
                         <h3 className="font-heading text-2xl font-bold text-white text-center mb-2">
                           {aboutYouQuestions[aboutYouQuestion].question}
                         </h3>
                         {aboutYouQuestions[aboutYouQuestion].helpText && (
                           <p className="text-xs text-white/80 font-semibold text-center mb-6 max-w-md mx-auto">
                             {aboutYouQuestions[aboutYouQuestion].helpText}
                           </p>
                         )}

                         {aboutYouQuestions[aboutYouQuestion].options ? (
                           <div className="flex flex-wrap justify-center gap-2.5 mt-6">
                             {aboutYouQuestions[aboutYouQuestion].options.map((option) => {
                               const isSelected = aboutYouAnswers[aboutYouQuestions[aboutYouQuestion].id] === option;
                               return (
                                 <motion.button
                                   key={option}
                                   onClick={() => handleAboutYouSelect(option)}
                                   className={`inline-flex items-center gap-2 px-4 py-3 rounded-full border-2 text-sm font-semibold transition-all ${
                                     isSelected
                                       ? "border-primary bg-primary/20 text-white"
                                       : "border-white/20 text-white hover:border-primary/40 hover:bg-white/10"
                                   }`}
                                   whileHover={{ scale: 1.02 }}
                                   whileTap={{ scale: 0.98 }}
                                 >
                                   <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                     isSelected ? "border-primary bg-primary" : "border-white/40"
                                   }`}>
                                     {isSelected && <CheckCircle className="h-2.5 w-2.5 text-primary-foreground" />}
                                   </span>
                                   {option}
                                 </motion.button>
                               );
                             })}
                           </div>
                         ) : (
                           <div className="mt-6 space-y-2">
                             <label htmlFor="allergies" className="block text-xs text-white/80 font-semibold">
                               Optional — leave blank if none
                             </label>
                             <textarea
                               id="allergies"
                               value={aboutYouAnswers.allergies ?? ""}
                               onChange={(event) => setAboutYouAnswers((current) => ({ ...current, allergies: event.target.value.slice(0, 200) }))}
                               placeholder="Optional — leave blank if none"
                               aria-label="Optional allergies or ingredients to avoid"
                               rows={4}
                               className="w-full rounded-gg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                             />
                             <div className="text-[10px] text-white/80 font-semibold text-right">{(aboutYouAnswers.allergies ?? "").length}/200</div>
                             <button
                               type="button"
                               onClick={advanceAboutYou}
                               className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/30 bg-transparent text-white text-sm font-bold tracking-wide hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
                             >
                               Proceed to Face Camera Scans
                               <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                             </button>
                           </div>
                         )}

                         {aboutYouQuestions[aboutYouQuestion].skippable && (
                           <button
                             type="button"
                             onClick={handleAboutYouSkip}
                             className="w-full mt-5 text-xs text-white/75 hover:text-white font-semibold transition-colors"
                           >
                             Skip
                           </button>
                         )}
                       </motion.div>
                     </AnimatePresence>
                   </CardContent>
                 </Card>

                 <div className="flex justify-between items-center">
                   <button
                     onClick={() => aboutYouQuestion === 0 ? returnToPhysiologyQuiz() : setAboutYouQuestion(aboutYouQuestion - 1)}
                     className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-white/30 bg-transparent text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer"
                   >
                     <ArrowLeft className="h-4 w-4" />
                     Previous
                   </button>
                   <button
                     onClick={handleStart}
                     className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-white/30 bg-transparent text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer"
                   >
                     <RotateCcw className="h-4 w-4" />
                     Restart
                   </button>
                 </div>
               </motion.div>
             )}

            {/* Step 4: Camera capture */}
            {step === "camera" && (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <LivePhotoCapture
                  onComplete={handleCameraComplete}
                  onBack={() => setStep("about-you")}
                />
              </motion.div>
            )}

            {/* Step 5: Loading progress */}
            {step === "processing" && (
              <motion.div key="processing" className="w-full">
                {processingError ? (
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <Card className="w-full max-w-md rounded-gg-lg border-0 shadow-elevated">
                      <CardContent className="p-8 text-center space-y-5">
                        <h2 className="font-heading text-2xl font-bold text-white">Analysis stopped</h2>
                        <p className="text-sm text-white/75">{processingError}</p>
                        <Button onClick={retryProcessing}>Retry photos</Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : processingTimedOut ? (
                  <div className="min-h-[50vh] flex items-center justify-center">
                    <Card className="w-full max-w-md rounded-gg-lg border-0 shadow-elevated">
                      <CardContent className="p-8 text-center space-y-5">
                        <h2 className="font-heading text-2xl font-bold text-white">Taking longer than expected</h2>
                        <p className="text-sm text-white/75">The listener is still active. Keep this page open; retrying now could start a second analysis and use another quota slot.</p>
                        <div className="flex justify-center">
                          <Button variant="outline" className="border-white/30 text-white" onClick={() => setProcessingTimedOut(false)}>Keep waiting</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <AnalysisProcessing statusText="Analyzing your skin..." />
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
  );
};

export default SkinQuiz;
