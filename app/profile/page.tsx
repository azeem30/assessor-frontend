"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Building, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "@/components/navbar"

const departments = [
  "Information Technology",
  "Computer Science",
  "Mechanical",
  "Electrical",
  "Electronics and Telecommunication",
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    department: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState({ type: "", text: "" })
  const [submittedTests, setSubmittedTests] = useState<int>(0)
  const [averageScore, setAverageScore] = useState<double>(0.0)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setFormData({
      email: parsedUser.email,
      name: parsedUser.name,
      department: parsedUser.department,
    })
    
    const submittedTestsData = localStorage.getItem("submitted_tests")
    if(submittedTestsData) {
      const parsedSubmittedTestsData = parseInt(submittedTestsData, 10)
      setSubmittedTests(parsedSubmittedTestsData)
    }

    const averageScoreData = localStorage.getItem("average_score")
    if(averageScoreData) {
      const parsedAverageScoreData = parseFloat(averageScoreData)
      setAverageScore(parsedAverageScoreData)
    }
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.name) {
      newErrors.name = "Name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters long"
    }

    if (!formData.department) {
      newErrors.department = "Department is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    setMessage({ type: "", text: "" })
    setIsEditing(true)

    if (!validateForm()) {
      return
    }

    try {
      // API call to update the profile data of the user
      	const response = await fetch( `${process.env.NEXT_PUBLIC_API_URL}/update_user/${user.email}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify( formData )
      	} )
      	const data = await response.json()
      	if(data.message) {
		setMessage({
			type: "success",
			text: data.message
		})
		localStorage.setItem("user", JSON.stringify(formData))
      		}
 	}
  	catch(error) {
		const newErrors: Record<string, string> = {}
		newErrors.error = error?.message ? error.message : "An unexpected error has occured"
		setErrors(newErrors)
  	}
  	finally {
		setIsEditing(false)
  	}
  }

  const handleCancel = () => {
    setFormData({
      email: user.email,
      name: user.name,
      department: user.department,
    })
    setErrors({})
    setMessage({ type: "", text: "" })
    setIsEditing(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Profile</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Manage your account information</p>
          </div>

          <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Account Information</CardTitle>
                  <CardDescription>View and edit your personal details</CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {message.text && (
                <Alert
                  className={
                    message.type === "error"
                      ? "border-red-500 text-red-700 dark:text-red-400"
                      : "border-green-500 text-green-700 dark:text-green-400"
                  }
                >
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">{user.email}</div>
                  )}
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Full Name</span>
                  </Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">{user.name}</div>
                  )}
                </div>

                {/* Department Field */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Department</span>
                  </Label>
                  {isEditing ? (
                    <>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData({ ...formData, department: value })}
                      >
                        <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">{user.department}</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}

              {/* Account Stats */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{submittedTests}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Tests Completed</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{averageScore}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Average Score</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
