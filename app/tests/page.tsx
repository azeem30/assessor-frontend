"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, SortAsc, Clock, User, BookOpen, Star, Calendar, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"

// Define Test type
export type Test = {
  id: string;
  title: string;
  subject: string;
  marks: number;
  duration: number;
  difficulty: string;
  scheduled_at: Date;
  teacher_email: string;
  pairs: number;
  questions_and_answers: Array<{
    question: string;
    answer: string;
  }>;
};

// Mock test data
const mockTests: Test[] = [
  {
    id: "1",
    title: "Data Structures and Algorithms",
    subject: "Computer Science",
    marks: 100,
    difficulty: "Hard",
    scheduled_at: new Date("2024-01-15T10:00:00"),
    duration: 120,
    pairs: 20,
    teacher_email: "prof.smith@university.edu",
    questions_and_answers: [],
  },
  {
    id: "2",
    title: "Database Management Systems",
    subject: "Information Technology",
    marks: 80,
    difficulty: "Medium",
    scheduled_at: new Date("2024-01-10T14:00:00"),
    duration: 90,
    pairs: 15,
    teacher_email: "prof.johnson@university.edu",
    questions_and_answers: [],
  },
  {
    id: "3",
    title: "Machine Learning Fundamentals",
    subject: "Computer Science",
    marks: 120,
    difficulty: "Hard",
    scheduled_at: new Date("2024-01-20T09:00:00"),
    duration: 150,
    pairs: 25,
    teacher_email: "prof.davis@university.edu",
    questions_and_answers: [],
  },
  {
    id: "4",
    title: "Web Development Basics",
    subject: "Information Technology",
    marks: 60,
    difficulty: "Easy",
    scheduled_at: new Date("2024-01-08T11:00:00"),
    duration: 60,
    pairs: 12,
    teacher_email: "prof.wilson@university.edu",
    questions_and_answers: [],
  },
]

export default function TestsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tests, setTests] = useState<Test[]>(mockTests)
  const [filteredTests, setFilteredTests] = useState<Test[]>(mockTests)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("schedule")
  const [filterBy, setFilterBy] = useState("all")

  const fetchTests = async (email: String, department: String) => {
    try {
      const response = await fetch( `${process.env.NEXT_PUBLIC_API_URL}/tests?email=${encodeURIComponent(email)}&department=${encodeURIComponent(department)}` )
      const data = await response.json()
      if(data?.tests){
	setTests(data.tests)
      }
    }
    catch(error) {
	console.error(error)
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
    fetchTests(JSON.parse(userData)?.email, JSON.parse(userData)?.department)
  }, [router])

  useEffect(() => {
    let filtered = tests

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.teacher_email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Difficulty filter
    if (filterBy !== "all") {
      filtered = filtered.filter((test) => test.difficulty.toLowerCase() === filterBy)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "difficulty":
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 }
          return (
            difficultyOrder[a.difficulty as keyof typeof difficultyOrder] -
            difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
          )
        case "marks":
          return b.marks - a.marks
        case "schedule":
        default:
          return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      }
    })

    setFilteredTests(filtered)
  }, [searchTerm, sortBy, filterBy, tests])

  const isTestAvailable = (scheduleDate: Date) => {
    return new Date() >= new Date(scheduleDate)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  const handleStartTest = (testId: string, test: Test) => {
    try {
      if (!test) return
      const testCopy = {...test}
      if (testCopy.scheduled_at instanceof Date) {
        testCopy.scheduled_at = testCopy.scheduled_at.toISOString()
      }
      const testData = encodeURIComponent(JSON.stringify(testCopy))
      router.push(`/tests/${testId}?testData=${testData}`)
    } 
    catch(error) {
      console.error("Failed to start test:", error)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Available Tests</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Browse and take your scheduled assessments</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tests by title, subject, or teacher..."
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
              <SelectItem value="schedule">Schedule</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="marks">Marks</SelectItem>
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

        {/* Tests Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => (
            <Card
              key={test.id}
              className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-2">{test.title}</CardTitle>
                  <Badge className={getDifficultyColor(test.difficulty)}>{test.difficulty}</Badge>
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{test.subject}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{test.marks} marks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{test.duration} min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <span>{test.pairs} questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-purple-500" />
                    <span className="truncate">{test.teacher_email.split("@")[0]}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(test.scheduled_at)}</span>
                </div>

                <Button
                  className="w-full"
                  disabled={!isTestAvailable(test.scheduled_at)}
                  onClick={() => handleStartTest(test.id, test)}
                >
                  {isTestAvailable(test.scheduled_at) ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Test
                    </>
                  ) : (
                    "Not Available Yet"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No tests found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  )
}
