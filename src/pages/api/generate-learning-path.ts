import type { NextApiRequest, NextApiResponse } from 'next';
import learningPaths from "@/data/learningPaths";

interface LearningNode {
  id: string;
  label: string;
  description: string;
  completed?: boolean;
  completedAt?: Date | null;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface LearningPath {
  nodes: LearningNode[];
  edges: { id: string; source: string; target: string }[];
  quizzes: { [key: string]: QuizQuestion[] };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { topic } = req.query;

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Invalid topic' });
  }

  const learningPath = learningPaths[topic.toLowerCase()];

  if (!learningPath) {
    return res.status(404).json({ error: 'Learning path not found' });
  }

  res.status(200).json(learningPath);
}