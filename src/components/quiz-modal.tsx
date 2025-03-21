"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle } from "lucide-react"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  quizData: QuizQuestion[]
}

export function QuizModal({ isOpen, onClose, title, quizData }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [completed, setCompleted] = useState(false)

  const currentQuestion = quizData[currentQuestionIndex]
  const progress = (currentQuestionIndex / quizData.length) * 100

  const handleOptionSelect = (value: string) => {
    setSelectedOption(Number.parseInt(value))
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null) return

    setHasAnswered(true)
    if (selectedOption === currentQuestion.correctAnswer) {
      setCorrectAnswers((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption(null)
      setHasAnswered(false)
    } else {
      setCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setHasAnswered(false)
    setCorrectAnswers(0)
    setCompleted(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {!completed ? (
          <>
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>
                  Question {currentQuestionIndex + 1} of {quizData.length}
                </span>
                <span>{correctAnswers} correct</span>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">{currentQuestion.question}</h3>

                  <RadioGroup
                    value={selectedOption?.toString()}
                    onValueChange={handleOptionSelect}
                    disabled={hasAnswered}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-2 p-3 rounded-md border ${
                          hasAnswered && index === currentQuestion.correctAnswer
                            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                            : hasAnswered && index === selectedOption
                              ? index !== currentQuestion.correctAnswer
                                ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                : ""
                              : ""
                        }`}
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                        {hasAnswered && index === currentQuestion.correctAnswer && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {hasAnswered && index === selectedOption && index !== currentQuestion.correctAnswer && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              {!hasAnswered ? (
                <Button onClick={handleCheckAnswer} disabled={selectedOption === null}>
                  Check Answer
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {currentQuestionIndex < quizData.length - 1 ? "Next Question" : "See Results"}
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 text-center space-y-4">
            <h3 className="text-xl font-semibold">Quiz Completed!</h3>
            <div className="text-4xl font-bold">
              {correctAnswers} / {quizData.length}
            </div>
            <p className="text-muted-foreground">
              {correctAnswers === quizData.length
                ? "Perfect score! You've mastered this topic."
                : correctAnswers >= quizData.length / 2
                  ? "Good job! You're making progress."
                  : "Keep practicing to improve your understanding."}
            </p>
            <div className="pt-4 flex justify-center space-x-3">
              <Button variant="outline" onClick={handleRestart}>
                Restart Quiz
              </Button>
              <Button onClick={onClose}>Continue Learning</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

