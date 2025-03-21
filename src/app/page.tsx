"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function Home() {
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setIsLoading(true)
    // In a real app, we might want to validate or process the topic first
    router.push(`/learn/${encodeURIComponent(topic)}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Microlearning AI</h1>
        <p className="text-muted-foreground text-lg">
          Learn anything, one step at a time. AI-powered microlearning that adapts to you.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-xl">
              <Input
                type="text"
                placeholder="What do you want to learn today?"
                className="pr-12 py-6 text-lg"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                disabled={isLoading || !topic.trim()}
              >
                <ArrowRight className="h-5 w-5" />
                <span className="sr-only">Start Learning</span>
              </Button>
            </div>
            <Button type="submit" size="lg" className="px-8 py-6 text-lg h-auto" disabled={isLoading || !topic.trim()}>
              {isLoading ? "Generating..." : "Start Learning"}
            </Button>
          </div>
        </form>

        <div className="mt-12 text-muted-foreground">
          <p>
            Popular topics: <span className="underline cursor-pointer">Machine Learning</span> ·{" "}
            <span className="underline cursor-pointer">JavaScript</span> ·{" "}
            <span className="underline cursor-pointer">Data Science</span>
          </p>
        </div>
      </div>
    </main>
  )
}

