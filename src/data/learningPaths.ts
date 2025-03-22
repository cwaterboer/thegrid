import { LearningPath } from "@/pages/api/generate-learning-path";

const learningPaths: { [key: string]: LearningPath } = {
  "javascript": {
    nodes: [
      { id: "1", label: "Introduction to JavaScript", description: "Learn the basics of JavaScript.", completed: false, completedAt: null },
      { id: "2", label: "JavaScript Basics", description: "Understand variables, data types, and functions.", completed: false, completedAt: null },
      { id: "3", label: "Advanced JavaScript", description: "Dive into advanced topics like closures and async programming.", completed: false, completedAt: null },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
    ],
    quizzes: {
      "1": [{ question: "What is JavaScript?", options: ["A programming language", "A type of coffee", "A movie"], correctAnswer: 0, explanation: "JavaScript is a programming language." }],
      "2": [{ question: "What is a variable?", options: ["A container for data", "A type of function", "A loop"], correctAnswer: 0, explanation: "A variable is a container for data." }],
      "3": [{ question: "What is a closure?", options: ["A function within a function", "A type of loop", "A variable"], correctAnswer: 0, explanation: "A closure is a function within a function." }],
    },
  },
  // Add more topics and learning paths here
};

export default learningPaths;