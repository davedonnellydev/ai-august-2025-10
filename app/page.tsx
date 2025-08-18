'use client';

import { useState } from 'react';
import { Container, Title, Text, Stack } from '@mantine/core';
import { QuizOptions } from '../components/QuizOptions/QuizOptions';
import { OnlineQuiz } from '../components/OnlineQuiz/OnlineQuiz';
import { ExportQuiz } from '../components/ExportQuiz/ExportQuiz';
import { LoadingScreen } from '../components/LoadingScreen/LoadingScreen';

export interface Round {
  id: string;
  name: string;
  topic: string;
  questionsCount: number;
  timeLimit: number | null;
  hasTimeLimit: boolean;
}

export interface QuizConfig {
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
      const response = await fetch('/api/openai/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ QuizConfig: config }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.response || !data.response.rounds) {
        throw new Error('Invalid response format from API');
      }

      setQuizData(data.response);

      if (config.quizMode === 'online') {
        setAppState('online-quiz');
      } else {
        setAppState('export-quiz');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to generate quiz:', error);

      // Show user-friendly error message
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate quiz';
      // eslint-disable-next-line no-alert
      alert(`Error: ${errorMessage}. Please try again.`);

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
