import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  Sun,
  Moon,
  Droplets,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/layout/Layout";
import {
  quizQuestions,
  skinTypeResults,
  getSkinTypeFromAnswers,
  QuizResult,
  QuizAnswers,
} from "@/data/quizData";

type QuizState = "intro" | "quiz" | "result";

const SkinQuiz = () => {
  const [quizState, setQuizState] = useState<QuizState>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleStart = () => {
    setQuizState("quiz");
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedOption(null);
  };

  const handleOptionSelect = (questionId: string, value: number, index: number) => {
    setSelectedOption(index);

    // Save the numeric value keyed by feature name (e.g. { sebum_level: 80 })
    const newAnswers: QuizAnswers = { ...answers, [questionId]: value };

    setTimeout(() => {
      setAnswers(newAnswers);

      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        // Local prediction — replaced with ML backend call in Phase 1 backend
        const resultType = getSkinTypeFromAnswers(newAnswers);
        setResult(skinTypeResults[resultType]);
        setQuizState("result");
      }
    }, 400);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      // Remove the previous question's answer from the dict
      const prevQuestionId = quizQuestions[currentQuestion - 1].id;
      const newAnswers = { ...answers };
      delete newAnswers[prevQuestionId];
      setAnswers(newAnswers);
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
    }
  };

  const handleRestart = () => {
    setQuizState("intro");
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedOption(null);
    setResult(null);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] py-12 gradient-hero">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {/* Intro Screen */}
            {quizState === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto text-center"
              >
                <div className="mb-8">
                  <motion.div
                    className="w-24 h-24 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center shadow-card"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Sparkles className="h-12 w-12 text-primary-foreground" />
                  </motion.div>
                  <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                    Discover Your Skin Type
                  </h1>
                  <p className="text-muted-foreground text-lg mb-6">
                    Answer 6 quick questions to identify your skin type and get
                    personalized routine recommendations.
                  </p>
                </div>

                <Card className="border-0 shadow-card mb-8">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">⏱️</span>
                        </div>
                        <p className="text-sm text-muted-foreground">2 Minutes</p>
                      </div>
                      <div>
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">❓</span>
                        </div>
                        <p className="text-sm text-muted-foreground">6 Questions</p>
                      </div>
                      <div>
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">✨</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Personalized</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  size="lg"
                  onClick={handleStart}
                  className="gradient-primary border-0 text-primary-foreground shadow-soft hover:shadow-hover transition-shadow px-8"
                >
                  Start the Quiz
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Quiz Questions */}
            {quizState === "quiz" && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Question */}
                <Card className="border-0 shadow-card mb-6">
                  <CardContent className="p-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        {/* Question header with emoji and importance badge */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="text-3xl">{quizQuestions[currentQuestion].emoji}</span>
                          {quizQuestions[currentQuestion].importance === 'critical' && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                              ⭐ Key Question
                            </span>
                          )}
                        </div>

                        <h2 className="font-heading text-xl md:text-2xl font-semibold mb-3 text-center">
                          {quizQuestions[currentQuestion].question}
                        </h2>

                        {/* Optional help text for critical questions */}
                        {quizQuestions[currentQuestion].helpText && (
                          <p className="text-sm text-muted-foreground text-center mb-6">
                            {quizQuestions[currentQuestion].helpText}
                          </p>
                        )}

                        {!quizQuestions[currentQuestion].helpText && <div className="mb-6" />}

                        <div className="space-y-3">
                          {quizQuestions[currentQuestion].options.map((option, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handleOptionSelect(
                                quizQuestions[currentQuestion].id,
                                option.value,
                                index
                              )}
                              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                selectedOption === index
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                              }`}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                    selectedOption === index
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground"
                                  }`}
                                >
                                  {selectedOption === index && (
                                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                                  )}
                                </div>
                                <div>
                                  <span className="text-foreground font-medium">{option.label}</span>
                                  <p className="text-xs text-muted-foreground mt-0.5">{option.sublabel}</p>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button variant="ghost" onClick={handleRestart}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restart
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Results */}
            {quizState === "result" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                {/* Result Header */}
                <div className="text-center mb-8">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-card"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <Star className="h-10 w-10 text-primary-foreground" />
                  </motion.div>
                  <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
                    Your Skin Type: <span className="text-gradient">{result.skinType}</span>
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {result.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Characteristics */}
                  <Card className="border-0 shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Droplets className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold">Characteristics</h3>
                      </div>
                      <ul className="space-y-2">
                        {result.characteristics.map((char, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{char}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Recommended Products */}
                  <Card className="border-0 shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold">Recommended Products</h3>
                      </div>
                      <ul className="space-y-2">
                        {result.recommendedProducts.map((product, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary">•</span>
                            <span>{product}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Morning Routine */}
                  <Card className="border-0 shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                          <Sun className="h-5 w-5 text-amber-600" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold">Morning Routine</h3>
                      </div>
                      <ol className="space-y-2">
                        {result.morningRoutine.map((step, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-medium">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>

                  {/* Night Routine */}
                  <Card className="border-0 shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                          <Moon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold">Night Routine</h3>
                      </div>
                      <ol className="space-y-2">
                        {result.nightRoutine.map((step, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={handleRestart}
                    variant="outline"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retake Quiz
                  </Button>
                  <Link to={`/skin-types/${result.skinType.split(" ")[0].toLowerCase()}`}>
                    <Button
                      size="lg"
                      className="gradient-primary border-0 text-primary-foreground shadow-soft"
                    >
                      Learn More About {result.skinType}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default SkinQuiz;
