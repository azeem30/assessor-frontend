"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, SortAsc, Eye, Calendar, BookOpen, User, TrendingUp, BarChart3, Clock, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"

export type Response = {
  id: string;
  test_id: string;
  title: string;
  subject: string;
  marks_obtained: number;
  total_marks: number;
  duration: number;
  difficulty: string;
  pairs: number;
  submitted_at: Date;
  teacher_email: string;
  questions_and_answers: Array<{
    question: string;
    sample_answer: string;
    user_answer: string;
    similarity: number;
    marks: number;
  }>;
}

export default function ResultsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [results, setResults] = useState<Response[]>([])
  const [filteredResults, setFilteredResults] = useState<Response[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("submittedAt")
  const [filterBy, setFilterBy] = useState("all")

  const fetchResponses = async (email: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/responses?email=${email}`)
      const data = await response.json()
      setResults(data?.responses)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUserData = JSON.parse(userData)
    setUser(parsedUserData)

    // Load test responses
    fetchResponses(parsedUserData?.email)
  }, [router])

  useEffect(() => {
    let filtered = results

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (result) =>
          result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
	  result.teacher_email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Difficulty filter
    if (filterBy !== "all") {
      filtered = filtered.filter((result) => result.difficulty.toLowerCase() === filterBy)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "marks_obtained":
          return b.marks_obtained - a.marks_obtained
        case "difficulty":
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 }
          return (
            difficultyOrder[a.difficulty as keyof typeof difficultyOrder] -
            difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
          )
        case "submitted_at":
        default:
          return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      }
    })

    setFilteredResults(filtered)
  }, [searchTerm, sortBy, filterBy, results])

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

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours > 0 ? `${hours}h ` : ""}${mins}m`
  }

  const handleViewDetails = (resultId: string, result: Response) => {
    try {
      if(!result) {
	return
      }
      const resultCopy = { ...result }
      if(resultCopy.submitted_at instanceof Date) {
	resultCopy.submitted_at = resultCopy.submitted_at.toISOString()
      }
      const resultData = encodeURIComponent(JSON.stringify(resultCopy))
      router.push(`/results/${resultId}?resultData=${resultData}`)
    }
    catch(error) {
      console.error("Failed to view details", error)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Test Results</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Review your performance and detailed analytics</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search results by test title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submitted_at">Submission Date</SelectItem>
              <SelectItem value="title">Test Title</SelectItem>
              <SelectItem value="marks_obtained">Score</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResults.map((result) => (
            <Card
              key={result.id}
              className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-2">{result.title}</CardTitle>
                  <Badge className={getDifficultyColor(result.difficulty)}>{result.difficulty}</Badge>
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{result.subject}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(result.marks_obtained, result.total_marks)}`}>
                    {result.marks_obtained}/{result.total_marks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {Math.round((result.marks_obtained / result.total_marks) * 100)}% Score
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-blue-500" />
                    <span>{result.questions_and_answers.length} questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span>{formatDuration(result.duration)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Submitted: {formatDate(result.submitted_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Creator: {result.teacher_email.split("@")[0]}</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline" onClick={() => handleViewDetails(result.id, result)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No results found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {results.length === 0
                ? "You haven't completed any tests yet. Take a test to see your results here."
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
