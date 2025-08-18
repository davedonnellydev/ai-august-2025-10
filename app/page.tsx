'use client';

import { useState } from 'react';
import { Container, Title, Text, Stack } from '@mantine/core';
import { QuizOptions } from '../components/QuizOptions/QuizOptions';
import { OnlineQuiz } from '../components/OnlineQuiz/OnlineQuiz';
import { ExportQuiz } from '../components/ExportQuiz/ExportQuiz';
import { LoadingScreen } from '../components/LoadingScreen/LoadingScreen';

interface Round {
  id: string;
  name: string;
  topic: string;
  questionsCount: number;
  timeLimit: number | null;
  hasTimeLimit: boolean;
}

interface QuizConfig {
  rounds: Round[];
  quizTopic: string;
  quizMode: 'online' | 'export';
  totalQuestions: number;
  estimatedTime: number;
}

interface QuizData {
  rounds: Array<{
    questions: Array<{
      question: string;
      answer: string;
    }>;
    title: string;
  }>;
}

type AppState = 'config' | 'loading' | 'online-quiz' | 'export-quiz';

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('config');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  const handleQuizGeneration = async (config: QuizConfig) => {
    setQuizConfig(config);
    setAppState('loading');

    try {
      // TODO: Call the OpenAI API endpoint here
      // const response = await fetch('/api/openai/responses', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ input: config })
      // });
      // const data = await response.json();
      // setQuizData(data.response);

      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock data for testing
      const mockData: QuizData = {
        rounds: config.rounds.map((round) => ({
          title: round.name,
          questions: Array.from({ length: round.questionsCount }, (_, i) => ({
            question: `Sample question ${i + 1} for ${round.topic}`,
            answer: `Sample answer ${i + 1} for ${round.topic}`,
          })),
        })),
      };

      setQuizData(mockData);

      if (config.quizMode === 'online') {
        setAppState('online-quiz');
      } else {
        setAppState('export-quiz');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to generate quiz:', error);
      setAppState('config');
    }
  };

  const handleBackToConfig = () => {
    setAppState('config');
    setQuizConfig(null);
    setQuizData(null);
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <Title order={1} size="3rem" mb="md">
            Quiz Master
          </Title>
          <Text size="lg" c="dimmed">
            Create and take quizzes on any topic
          </Text>
        </div>

        {/* Main Content */}
        {appState === 'config' && (
          <QuizOptions onGenerateQuiz={handleQuizGeneration} />
        )}

        {appState === 'loading' && <LoadingScreen />}

        {appState === 'online-quiz' && quizData && quizConfig && (
          <OnlineQuiz
            quizData={quizData}
            quizConfig={quizConfig}
            onBackToConfig={handleBackToConfig}
          />
        )}

        {appState === 'export-quiz' && quizData && quizConfig && (
          <ExportQuiz
            quizData={quizData}
            quizConfig={quizConfig}
            onBackToConfig={handleBackToConfig}
          />
        )}
      </Stack>
    </Container>
  );
}
