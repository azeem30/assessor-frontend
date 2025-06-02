"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, BarChart3, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/navbar"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [submittedTests, setSubmittedTests] = useState<int>(0)
  const [averageScore, setAverageScore] = useState<double>(0)
  
  const fetchAnalytics = async (email: String) => {
    try {
	const responseST = await fetch( `${process.env.NEXT_PUBLIC_API_URL}/submitted_tests?email=${email}` )
	const dataST = await responseST.json()
	if(dataST.submitted_tests) {
	   localStorage.setItem("submitted_tests", dataST.submitted_tests)
	   setSubmittedTests(dataST.submitted_tests)
	}
	const responseAS = await fetch( `${process.env.NEXT_PUBLIC_API_URL}/average_score?email=${email}` )
	const dataAS = await responseAS.json()
	if(dataAS.average_score) {
	   localStorage.setItem("average_score", dataAS.average_score.toFixed(2))
	   setAverageScore(dataAS.average_score)
	}
    }
    catch(error) {
	console.error("Error fetching analytics", error)
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
    fetchAnalytics(parsedUserData?.email)
  }, [router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <Navbar />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back, {user.name}! <Sparkles className="inline h-8 w-8 text-yellow-500" />
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Ready to continue your assessment journey?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Tests Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Tests</CardTitle>
              <CardDescription className="text-lg">Access and take your scheduled assessments</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                View available tests, check schedules, and start your assessments when ready. Track your progress and
                manage your test-taking experience.
              </p>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => router.push("/tests")}
              >
                Give Tests <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Results</CardTitle>
              <CardDescription className="text-lg">Review your performance and detailed analytics</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Analyze your test results, view detailed feedback, and track your improvement over time. Download
                comprehensive reports.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white dark:border-green-400 dark:text-green-400"
                onClick={() => router.push("/results")}
              >
                View Results <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{submittedTests}</div>
            <div className="text-gray-600 dark:text-gray-300">Tests Completed</div>
          </div>
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{averageScore}%</div>
            <div className="text-gray-600 dark:text-gray-300">Average Score</div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
