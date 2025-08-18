'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Badge,
  Card,
} from '@mantine/core';
import { IconArrowLeft, IconClock, IconCheck } from '@tabler/icons-react';
import styles from './OnlineQuiz.module.css';

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

interface OnlineQuizProps {
  quizData: QuizData;
  quizConfig: QuizConfig;
  onBackToConfig: () => void;
}

export function OnlineQuiz({
  quizData,
  quizConfig,
  onBackToConfig,
}: OnlineQuizProps) {
  const [currentRound, setCurrentRound] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [_userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentRoundData = quizData.rounds[currentRound];
  const currentQuestionData = currentRoundData?.questions[currentQuestion];

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleAnswerSubmit = (answer: string) => {
    const questionKey = `${currentRound}-${currentQuestion}`;
    setUserAnswers((prev) => ({
      ...prev,
      [questionKey]: answer,
    }));

    // Move to next question or round
    if (currentQuestion < currentRoundData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentRound < quizData.rounds.length - 1) {
      setCurrentRound(currentRound + 1);
      setCurrentQuestion(0);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleBackToConfig = () => {
    onBackToConfig();
  };

  if (!quizStarted) {
    return (
      <Container size="lg" py="xl">
        <Paper shadow="sm" p="xl" radius="md" className={styles.container}>
          <Stack gap="xl">
            <Group justify="space-between" align="center">
              <Title order={2}>Quiz Preview</Title>
              <Button
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
                onClick={handleBackToConfig}
              >
                Back to Config
              </Button>
            </Group>

            <Card withBorder p="lg">
              <Stack gap="md">
                <Title order={3}>Quiz Information</Title>
                <Text>
                  <strong>Topic:</strong>{' '}
                  {quizConfig.quizTopic || 'General Knowledge'}
                </Text>
                <Text>
                  <strong>Total Rounds:</strong> {quizData.rounds.length}
                </Text>
                <Text>
                  <strong>Total Questions:</strong> {quizConfig.totalQuestions}
                </Text>
                <Text>
                  <strong>Estimated Time:</strong> {quizConfig.estimatedTime}{' '}
                  minutes
                </Text>
              </Stack>
            </Card>

            <Card withBorder p="lg">
              <Stack gap="md">
                <Title order={3}>Round Overview</Title>
                {quizData.rounds.map((round, index) => (
                  <div key={index} className={styles.roundPreview}>
                    <Text fw={500}>
                      Round {index + 1}: {round.title}
                    </Text>
                    <Badge color="blue">
                      {round.questions.length} questions
                    </Badge>
                  </div>
                ))}
              </Stack>
            </Card>

            <Button
              size="lg"
              onClick={handleStartQuiz}
              leftSection={<IconCheck size={20} />}
              className={styles.startButton}
            >
              Start Quiz
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (quizCompleted) {
    return (
      <Container size="lg" py="xl">
        <Paper shadow="sm" p="xl" radius="md" className={styles.container}>
          <Stack gap="xl" align="center">
            <Title order={2}>Quiz Completed!</Title>
            <Text size="lg">Congratulations on completing the quiz!</Text>
            <Button
              size="lg"
              onClick={handleBackToConfig}
              leftSection={<IconArrowLeft size={16} />}
            >
              Create New Quiz
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="xl" radius="md" className={styles.container}>
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="center">
            <div>
              <Title order={2}>
                Round {currentRound + 1}: {currentRoundData.title}
              </Title>
              <Text c="dimmed">
                Question {currentQuestion + 1} of{' '}
                {currentRoundData.questions.length}
              </Text>
            </div>
            <Group>
              {quizConfig.rounds[currentRound].hasTimeLimit && (
                <Badge
                  size="lg"
                  color="orange"
                  leftSection={<IconClock size={14} />}
                >
                  Time Limit: {quizConfig.rounds[currentRound].timeLimit} min
                </Badge>
              )}
              <Button
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
                onClick={handleBackToConfig}
              >
                Exit Quiz
              </Button>
            </Group>
          </Group>

          {/* Question */}
          <Card withBorder p="lg" className={styles.questionCard}>
            <Title order={3} mb="md">
              Question {currentQuestion + 1}
            </Title>
            <Text size="lg" mb="xl">
              {currentQuestionData?.question}
            </Text>

            {/* TODO: Add answer input/options here */}
            <Text c="dimmed" ta="center" py="xl">
              Answer input component will be implemented here
            </Text>
          </Card>

          {/* Progress */}
          <Card withBorder p="md">
            <Group justify="space-between">
              <Text>
                Progress: {currentRound + 1}/{quizData.rounds.length} rounds
              </Text>
              <Text>
                Question: {currentQuestion + 1}/
                {currentRoundData.questions.length}
              </Text>
            </Group>
          </Card>
        </Stack>
      </Paper>
    </Container>
  );
}
