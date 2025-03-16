"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Users, BookOpen, Award } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminPage() {
  // Mock data for pending words
  const pendingWords = [
    {
      id: 1,
      word: "Mashi",
      contributor: "Omar",
      date: "2025-03-14",
      definition: "To go or to walk",
    },
    {
      id: 2,
      word: "Galli",
      contributor: "Aisha",
      date: "2025-03-13",
      definition: "To tell or to say to someone",
    },
    {
      id: 3,
      word: "Shuf",
      contributor: "Khalid",
      date: "2025-03-12",
      definition: "To see or to look",
    },
  ]

  // Mock data for users
  const users = [
    {
      id: 1,
      name: "Ahmed Mohammed",
      email: "ahmed@example.com",
      role: "admin",
      contributions: 45,
      joined: "2025-01-15",
    },
    {
      id: 2,
      name: "Fatima Ali",
      email: "fatima@example.com",
      role: "moderator",
      contributions: 78,
      joined: "2025-01-20",
    },
    {
      id: 3,
      name: "Omar Ibrahim",
      email: "omar@example.com",
      role: "contributor",
      contributions: 23,
      joined: "2025-02-05",
    },
  ]

  // Mock data for statistics
  const statistics = {
    totalWords: 1245,
    pendingApproval: 37,
    totalUsers: 156,
    wordsThisMonth: 124,
    challengeProgress: 350,
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Words</p>
                  <p className="text-2xl font-bold">{statistics.totalWords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{statistics.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Challenge Progress</p>
                  <p className="text-2xl font-bold">{statistics.challengeProgress}/1000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending-words">
          <TabsList className="mb-6">
            <TabsTrigger value="pending-words">Pending Words</TabsTrigger>
            <TabsTrigger value="user-management">User Management</TabsTrigger>
            <TabsTrigger value="challenge-management">Challenge Management</TabsTrigger>
          </TabsList>

          <TabsContent value="pending-words">
            <Card>
              <CardHeader>
                <CardTitle>Words Pending Approval</CardTitle>
                <CardDescription>Review and approve new word submissions from contributors.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingWords.map((word) => (
                    <div key={word.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{word.word}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {word.contributor} on {word.date}
                          </p>
                        </div>
                        <Badge>Pending</Badge>
                      </div>
                      <p className="mb-4">{word.definition}</p>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="gap-1">
                          <AlertCircle className="h-4 w-4" /> Request Changes
                        </Button>
                        <Button variant="destructive" size="sm" className="gap-1">
                          <XCircle className="h-4 w-4" /> Reject
                        </Button>
                        <Button variant="default" size="sm" className="gap-1">
                          <CheckCircle className="h-4 w-4" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-management">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and permissions for the dictionary platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Contributions</th>
                        <th className="text-left p-3">Joined</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t">
                          <td className="p-3">{user.name}</td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3">
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : user.role === "moderator" ? "outline" : "secondary"
                              }
                            >
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-3">{user.contributions}</td>
                          <td className="p-3">{user.joined}</td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenge-management">
            <Card>
              <CardHeader>
                <CardTitle>1000 Root Words Challenge</CardTitle>
                <CardDescription>Manage the 1000 Root Words Challenge and track progress.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Challenge Progress</h3>
                  <div className="h-4 bg-muted rounded-full mb-2">
                    <div
                      className="h-4 bg-primary rounded-full"
                      style={{ width: `${(statistics.challengeProgress / 1000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{statistics.challengeProgress} words completed</span>
                    <span>{1000 - statistics.challengeProgress} words remaining</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Manage Challenge Words</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

