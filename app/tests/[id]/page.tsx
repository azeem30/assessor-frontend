"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Clock, ChevronLeft, ChevronRight, FileText, User, Star, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Test } from "@/app/tests/page"

export default function TestPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams() 
  const testId = params.id ? Number(params.id) : null 
  const [user, setUser] = useState<any>(null)
  const [test, setTest] = useState<Test | null>(null) 
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Array<{
    question: string;
    sampleAnswer: string;
    userAnswer: string;
  }>>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  useEffect(() => {
    if (!searchParams) return 

    // Load test data
    const testData = searchParams.get("testData")
    if (testData) {
      try {
        const parsedTestData = JSON.parse(decodeURIComponent(testData)) as Test
        const questions = parsedTestData.questions_and_answers || []
        
        setTest({
          ...parsedTestData,
          scheduled_at: new Date(parsedTestData.scheduled_at)
        })
        
        setTimeLeft(parsedTestData.duration * 60)
        
        // Initialize answers array
        const initialAnswers = questions.map((q) => ({
          question: q.question,
          sampleAnswer: q.answer,
          userAnswer: "",
        }))
        setAnswers(initialAnswers)
      } catch (error) {
        console.error("Failed to parse test data:", error)
        router.push("/tests") 
      } finally {
        setLoading(false)
      }
    } else {
      router.push("/tests") 
    }
  }, [testId, router, searchParams])

  // Timer effect
  useEffect(() => {
    if (!test || isSubmitted) return // Don't run timer if no test or already submitted

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      handleSubmit() // Auto-submit when time runs out
    }
  }, [timeLeft, isSubmitted, test])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (value: string) => {
    if (currentQuestion >= answers.length) return // Safety check
    
    const updatedAnswers = [...answers]
    updatedAnswers[currentQuestion].userAnswer = value
    setAnswers(updatedAnswers)
  }

  const handleSubmit = async () => {
    if (!test) return 

    const userResponse = {
      test_id: test.id,
      email: user.email,
      questions_and_answers: answers,
    }

    // API call to save user response
    try {
	const response = await fetch( `${process.env.NEXT_PUBLIC_API_URL}/save_response`, {
         method: "POST",
	 headers: {
		"Content-Type": "application/json"
	 },
	 body: JSON.stringify(userResponse)
	} )
	const data = await response.json()
	
	// Redirect to results after a delay
    	setTimeout(() => {
      		router.push("/results")
    	}, 3000)
    }
    catch(error) {
	console.error("Error saving user response:", error)
    }
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < (test?.questions_and_answers?.length || 0)) {
      setCurrentQuestion(index)
    }
  }

  const nextQuestion = () => {
    if (test && currentQuestion < (test.questions_and_answers?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Test Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/tests")}>Back to Tests</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">Test Submitted!</CardTitle>
            <CardDescription>Your responses have been recorded successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Redirecting to results page...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = test.questions_and_answers?.length 
    ? ((currentQuestion + 1) / test.questions_and_answers.length) * 100 
    : 0
  const isLastQuestion = currentQuestion === (test.questions_and_answers?.length || 0) - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{test.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{test.subject}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{test.marks} marks</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{test.teacher_email}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge
                className={
                  timeLeft < 300
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                }
              >
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
              <Badge variant="outline">
                Question {currentQuestion + 1} of {test.questions_and_answers?.length || 0}
              </Badge>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {timeLeft < 300 && (
          <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-700 dark:text-red-400">
              Warning: Less than 5 minutes remaining!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                  {test.questions_and_answers?.map((_, index) => (
                    <Button
                      key={index}
                      variant={
                        currentQuestion === index 
                          ? "default" 
                          : answers[index]?.userAnswer 
                            ? "outline" 
                            : "ghost"
                      }
                      size="sm"
                      onClick={() => goToQuestion(index)}
                      className={`
                        ${currentQuestion === index ? "bg-blue-600 text-white" : ""} 
                        ${answers[index]?.userAnswer ? "border-green-500 text-green-600" : ""}
                      `}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed">
                    {test.questions_and_answers[currentQuestion]?.question || "Question not available"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Answer:
                  </label>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion]?.userAnswer || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    variant="outline" 
                    onClick={prevQuestion} 
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex space-x-4">
                    {isLastQuestion ? (
                      <Button 
                        onClick={handleSubmit} 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Submit Test
                      </Button>
                    ) : (
                      <Button onClick={nextQuestion}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
