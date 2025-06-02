"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Download, ChevronLeft, ChevronRight, FileText, User, Star, CheckCircle, XCircle, Clock, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import Navbar from "@/components/navbar"
import { Response } from "@/app/results/page"

export default function ResultDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const resultId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [result, setResult] = useState<Response | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  useEffect(() => {
    if (!searchParams) {
      return
    }
    const resultData = searchParams.get("resultData")
    if (resultData) {
      try {
        const parsedResultData = JSON.parse(decodeURIComponent(resultData)) as Response
        setResult({
          ...parsedResultData,
          submitted_at: new Date(parsedResultData.submitted_at)
        })
      } catch (error) {
        console.error(error)
        router.push("/results")
      }
    } else {
      router.push("/results")
    }
  }, [resultId, router, searchParams])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getScoreColor = (obtained: number, total: number) => {
    const percentage = (obtained / total) * 100
    if (percentage >= 80) return "text-green-600 dark:text-green-400"
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours > 0 ? `${hours}h ` : ""}${mins}m`
  }

  const downloadReport = () => {
    if (!result || !user) return

    const reportContent = `
INSIGHTQA TEST REPORT
=====================

Student: ${user.name || user.email}
Email: ${user.email}
${user.department ? `Department: ${user.department}` : ''}

TEST DETAILS
============
Test Title: ${result.title}
Subject: ${result.subject}
Difficulty: ${result.difficulty}
Total Questions: ${result.questions_and_answers.length}
Total Marks: ${result.total_marks}
Marks Obtained: ${result.marks_obtained}
Percentage: ${Math.round((result.marks_obtained / result.total_marks) * 100)}%

Duration: ${formatDuration(result.duration)}
Submitted At: ${formatDate(result.submitted_at)}
Question Pairs: ${result.pairs}

QUESTION-WISE ANALYSIS
=====================

${result.questions_and_answers
  .map((qa, index) => {
    return `
Question ${index + 1}:
${qa.question}

Your Answer:
${qa.user_answer || "No answer provided"}

Sample Answer:
${qa.sample_answer}

Similarity Score: ${qa.similarity}%
Marks: ${qa.marks}/${Math.round(result.total_marks / result.questions_and_answers.length)}

${"=".repeat(50)}
`
  })
  .join("")}

Generated on: ${new Date().toLocaleString()}
    `

    // Create and download the file
    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${result.title}_Report_${user.name || user.email}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index)
  }

  const nextQuestion = () => {
    if (result && currentQuestion < result.questions_and_answers.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  if (!user || !result) return null

  const currentQA = result.questions_and_answers[currentQuestion]
  const maxQuestionMarks = Math.round(result.total_marks / result.questions_and_answers.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <Navbar />

      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{result.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{result.subject}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{result.total_marks} marks</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(result.duration)}</span>
                  </span>
                  <Badge className={getDifficultyColor(result.difficulty)}>{result.difficulty}</Badge>
                </div>
              </div>
            </div>

            <Button onClick={downloadReport} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>

          {/* Score Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(result.marks_obtained, result.total_marks)}`}>
                  {result.marks_obtained}/{result.total_marks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Score</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(result.marks_obtained, result.total_marks)}`}>
                  {Math.round((result.marks_obtained / result.total_marks) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Percentage</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.questions_and_answers.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Questions</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatDate(result.submitted_at).split(",")[0]}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Submitted</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                  {result.questions_and_answers.map((_, index) => {
                    const qa = result.questions_and_answers[index]
                    const hasAnswer = qa.user_answer.trim().length > 0

                    return (
                      <Button
                        key={index}
                        variant={currentQuestion === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToQuestion(index)}
                        className={`relative ${currentQuestion === index ? "bg-blue-600 text-white" : ""}`}
                      >
                        {index + 1}
                        {hasAnswer && (
                          <div
                            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                              qa.similarity >= 70 
                                ? "bg-green-500" 
                                : qa.similarity >= 40 
                                  ? "bg-yellow-500" 
                                  : "bg-red-500"
                            }`}
                          />
                        )}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Detail Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {currentQA.marks}/{maxQuestionMarks} marks
                    </Badge>
                    <Badge
                      className={
                        currentQA.similarity >= 70
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : currentQA.similarity >= 40
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }
                    >
                      {currentQA.similarity}% similarity
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Question */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Question:</h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentQA.question}</p>
                  </div>
                </div>

                <Separator />

                {/* Your Answer */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    Your Answer:
                    {currentQA.user_answer.trim() ? (
                      <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 ml-2 text-red-500" />
                    )}
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentQA.user_answer || "No answer provided"}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Sample Answer */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sample Answer:</h3>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentQA.sample_answer}</p>
                  </div>
                </div>

                {/* Similarity Analysis */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Performance Analysis:</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Similarity Score</span>
                        <span>{currentQA.similarity}%</span>
                      </div>
                      <Progress value={currentQA.similarity} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {currentQA.similarity >= 70 && "Excellent! Your answer closely matches the expected response."}
                      {currentQA.similarity >= 40 &&
                        currentQA.similarity < 70 &&
                        "Good effort! Your answer covers some key points but could be more comprehensive."}
                      {currentQA.similarity < 40 &&
                        "Your answer needs improvement. Consider reviewing the topic and sample answer."}
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {currentQuestion + 1} of {result.questions_and_answers.length}
                  </span>

                  <Button
                    variant="outline"
                    onClick={nextQuestion}
                    disabled={currentQuestion === result.questions_and_answers.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
