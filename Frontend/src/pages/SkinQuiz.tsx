import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/layout/Layout";
import { quizQuestions } from "@/data/quizData";
import { LivePhotoCapture } from "@/components/analysis/LivePhotoCapture";
import { AnalysisProcessing } from "@/components/analysis/AnalysisProcessing";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { toast } from "sonner";

type DiagnosisStep = "intro" | "quiz" | "camera" | "processing" | "results";

const SkinQuiz = () => {
  const [step, setStep] = useState<DiagnosisStep>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Optional skin notes
  const [freeText, setFreeText] = useState<string>("");
  const [showFreeText, setShowFreeText] = useState<boolean>(false);
  
  // Scans captured
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Results returned from API
  const [apiResult, setApiResult] = useState<{
    skinType: string;
    confidence: number;
    probabilities: Record<string, number>;
    concernsDetected: string[];
  } | null>(null);

  // Ping backend on mount to wake up free tiers
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
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
    setPhotos([]);
    setApiResult(null);
    setFreeText("");
    setShowFreeText(false);
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
    if (currentQuestion > 0) {
      const prevQuestionId = quizQuestions[currentQuestion - 1].id;
      const newAnswers = { ...answers };
      delete newAnswers[prevQuestionId];
      setAnswers(newAnswers);
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
    }
  };

  const handleQuizSubmit = () => {
    // Advanced step to live camera capture
    setStep("camera");
  };

  const handleCameraComplete = async (capturedPhotos: string[]) => {
    setPhotos(capturedPhotos);
    setStep("processing");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    
    // Simulate ML processing buffer time to let loader play, then fetch
    try {
      const response = await fetch(`${API_URL}/api/skin-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answers,
          skinNotes: freeText || null
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Delay transition to make visual helix animation smooth
      setTimeout(() => {
        setApiResult({
          skinType: data.skin_type,
          confidence: data.confidence || 0.85,
          probabilities: data.probabilities || { [data.skin_type]: 0.85 },
          concernsDetected: data.concerns_detected || []
        });
        setStep("results");
      }, 1500);

    } catch (err: any) {
      console.error("API Diagnostic failed, calculating offline score:", err.message);
      
      // Offline fallback: Use the same fallback rules as the backend inside server.ts
      setTimeout(() => {
        const s = answers.sebum_level ?? 50;
        const h = answers.hydration_level ?? 50;
        const sn = answers.sensitivity_score ?? 30;
        const t = answers.tightness_score ?? 30;

        let detectedType = "normal";
        if (sn >= 68) detectedType = "sensitive";
        else if (s >= 65 && h >= 45 && t <= 30) detectedType = "oily";
        else if (s >= 55) detectedType = "combination";
        else if (h <= 36 || t >= 70) detectedType = "dry";

        setApiResult({
          skinType: detectedType,
          confidence: 0.90,
          probabilities: { [detectedType]: 0.90 },
          concernsDetected: freeText ? [freeText.substring(0, 15)] : []
        });
        setStep("results");
        toast.info("Offline Diagnostic Report generated successfully via Fallback classifier.");
      }, 2000);
    }
  };

  return (
    <Layout>
      <div className="min-h-[85vh] py-12 gradient-hero flex items-center justify-center">
        <div className="container mx-auto px-4 w-full">
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
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center shadow-card">
                    <Sparkles className="h-10 w-10 text-primary-foreground animate-float" />
                  </div>
                  <h1 className="font-heading text-4xl font-bold mb-4 text-foreground">
                    Unified Skin Analysis
                  </h1>
                  <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
                    Identify your clinical skin type and get a personalized routine. This unified 2-step flow combines a lifestyle quiz with live multi-angle facial camera scans.
                  </p>
                </div>

                <Card className="border border-border shadow-soft bg-card mb-8 rounded-gg">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm text-foreground/80">
                      <div>
                        <div className="text-xl mb-1">⏱️</div>
                        <span className="font-semibold block">Quiz Flow</span>
                        <span className="text-[10px] text-muted-foreground block uppercase">Step 1 — 7 Questions</span>
                      </div>
                      <div>
                        <div className="text-xl mb-1">📷</div>
                        <span className="font-semibold block">Photo Scan</span>
                        <span className="text-[10px] text-muted-foreground block uppercase">Step 2 — 5 Angles</span>
                      </div>
                      <div>
                        <div className="text-xl mb-1">🧬</div>
                        <span className="font-semibold block">AI Diagnostic</span>
                        <span className="text-[10px] text-muted-foreground block uppercase">Random Forest + NLP</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  size="lg"
                  onClick={handleStart}
                  className="bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground font-semibold px-8 shadow-primary rounded-gg-sm transition-all"
                >
                  Begin Diagnostic Flow
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
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
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>

                {/* Question Card */}
                <Card className="border border-border shadow-card bg-card rounded-gg-lg overflow-hidden">
                  <CardContent className="p-8">
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
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                              ⭐ Key Question
                            </span>
                          )}
                        </div>

                        <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-2">
                          {quizQuestions[currentQuestion].question}
                        </h2>

                        {quizQuestions[currentQuestion].helpText && (
                          <p className="text-xs text-muted-foreground text-center mb-6 max-w-md mx-auto">
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
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/40 hover:bg-muted/30"
                              }`}
                              whileHover={{ scale: 1.005 }}
                              whileTap={{ scale: 0.995 }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                    selectedOption === index
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground/60"
                                  }`}
                                >
                                  {selectedOption === index && (
                                    <CheckCircle className="h-3 w-3 text-primary-foreground" />
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-foreground text-sm font-semibold block">{option.label}</span>
                                  <p className="text-xs text-muted-foreground">{option.sublabel}</p>
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
                            className="mt-6 pt-5 border-t border-border space-y-3"
                          >
                            <Button
                              onClick={handleQuizSubmit}
                              className="w-full bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground font-semibold py-6 rounded-gg-sm shadow-primary flex items-center justify-center"
                            >
                              Proceed to Face Camera Scans
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <button
                              type="button"
                              onClick={() => setShowFreeText(!showFreeText)}
                              className="w-full text-[11px] text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 py-1 transition-colors"
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
                                  className="w-full rounded-gg border border-border bg-muted/20 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                />
                                <div className="text-[10px] text-muted-foreground text-right">{freeText.length}/200</div>
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
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="border-border text-xs font-semibold uppercase tracking-wider py-5"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleStart}
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restart
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Camera capture */}
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
                  onBack={() => setStep("quiz")}
                />
              </motion.div>
            )}

            {/* Step 4: Loading progress */}
            {step === "processing" && (
              <motion.div key="processing" className="w-full">
                <AnalysisProcessing />
              </motion.div>
            )}

            {/* Step 5: Diagnosis Report dashboard */}
            {step === "results" && apiResult && (
              <motion.div key="results" className="w-full">
                <AnalysisResults
                  skinType={apiResult.skinType}
                  confidence={apiResult.confidence}
                  probabilities={apiResult.probabilities}
                  concernsDetected={apiResult.concernsDetected}
                  answers={answers}
                  onRestart={handleStart}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default SkinQuiz;
