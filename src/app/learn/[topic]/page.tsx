"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowChart } from "@/components/flow-chart";
import { QuizModal } from "@/components/quiz-modal";
import { UserAuthForm } from "@/components/user-auth-form";
import { BookOpen, Brain, CheckCircle, ChevronLeft, Home, Save, User } from "lucide-react";
import Link from "next/link";

interface LearningNode {
  id: string;
  label: string;
  description: string;
  completed?: boolean;
  completedAt?: Date | null;
}

interface LearningPath {
  nodes: LearningNode[];
  edges: { id: string; source: string; target: string }[];
  quizzes: { [key: string]: QuizQuestion[] };
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export default function LearnPage() {
  const params = useParams();
  const topic = decodeURIComponent(params.topic as string);

  const [isLoading, setIsLoading] = useState(true);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const generateLearningPath = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/generate-learning-path?topic=${encodeURIComponent(topic)}`);
        const data = await response.json();
        setLearningPath(data);
      } catch (error) {
        console.error("Error generating learning path:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateLearningPath();
  }, [topic]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const handleCloseQuiz = () => {
    setSelectedNode(null);
  };

  const calculateStreak = () => {
    if (!learningPath || !learningPath.nodes) return 0;

    const completedNodes = learningPath.nodes.filter((node: LearningNode) => node.completed && node.completedAt);
    if (completedNodes.length === 0) return 0;

    completedNodes.sort((a: LearningNode, b: LearningNode) => {
      const aCompletedDate = new Date(a.completedAt!);
      const bCompletedDate = new Date(b.completedAt!);
      return aCompletedDate.getTime() - bCompletedDate.getTime();
    });

    let streak = 1;
    for (let i = 1; i < completedNodes.length; i++) {
      const prevDate = new Date(completedNodes[i - 1].completedAt!);
      const currDate = new Date(completedNodes[i].completedAt!);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);

      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        streak = 1;
      }
    }

    return streak;
  };

  const handleSaveProgress = async () => {
    if (isAuthenticated && user) {
      const completedModules = learningPath.nodes.filter((node: LearningNode) => node.completed);
      const progressData = {
        completedModules: completedModules.map((node: LearningNode) => ({
          id: node.id,
          completedAt: node.completedAt ? node.completedAt : serverTimestamp(),
        })),
        lastActiveModule: selectedNode,
        streakCount: calculateStreak(),
        totalModules: learningPath.nodes.length,
        totalCompletedModules: completedModules.length,
        completionPercentage: (completedModules.length / learningPath.nodes.length) * 100,
        lastCompletedModule: completedModules.length > 0 ? completedModules[completedModules.length - 1].id : null,
      };

      try {
        const userProgressRef = doc(db, "userProgress", user.uid);
        const userProgressDoc = await getDoc(userProgressRef);

        if (userProgressDoc.exists()) {
          await setDoc(userProgressRef, progressData, { merge: true });
        } else {
          await setDoc(userProgressRef, progressData);
        }

        console.log("Progress saved");
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-2">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg font-semibold">Learning: {topic}</h1>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleSaveProgress}>
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            {!isAuthenticated && (
              <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-lg">Generating your personalized learning path...</p>
          </div>
        ) : (
          <Tabs defaultValue="flowchart">
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="flowchart">
                  <Brain className="h-4 w-4 mr-2" />
                  Learning Path
                </TabsTrigger>
                <TabsTrigger value="progress">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="resources">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Resources
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="flowchart" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="h-[60vh] w-full">
                    {learningPath && (
                      <FlowChart nodes={learningPath.nodes} edges={learningPath.edges} onNodeClick={handleNodeClick} />
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="mt-4 text-center text-muted-foreground">
                <p>Click on any node to start learning that topic</p>
              </div>
            </TabsContent>

            <TabsContent value="progress">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    {isAuthenticated ? (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Your Learning Progress</h3>
                        <div className="space-y-4">
                          {learningPath?.nodes.map((node: any) => (
                            <div key={node.id} className="flex items-center justify-between p-3 border rounded-lg" >
                              <span>{node.label}</span>
                              <span className="text-muted-foreground">Not started</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <h3 className="text-xl font-semibold mb-4">Sign in to track your progress</h3>
                        <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
                  <div className="space-y-4">
                    <p>Here are some recommended resources to deepen your understanding of {topic}:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Interactive tutorials</li>
                      <li>Recommended books</li>
                      <li>Online courses</li>
                      <li>Practice exercises</li>
                    </ul>
                    <p className="text-muted-foreground">
                      This section would be populated with AI-recommended resources based on your learning style and
                      progress.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {selectedNode && learningPath && (
        <QuizModal
          isOpen={!!selectedNode}
          onClose={handleCloseQuiz}
          title={learningPath.nodes.find((n: any) => n.id === selectedNode)?.label || ""}
          quizData={learningPath.quizzes[selectedNode] || []}
        />
      )}

      {showAuthModal && (
        <UserAuthForm
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setIsAuthenticated(true);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}
