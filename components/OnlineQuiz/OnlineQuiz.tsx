'use client';

import { useState, useEffect } from 'react';
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
  TextInput,
  Progress,
  Divider,
  Modal,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconClock,
  IconCheck,
  IconX,
  IconArrowRight,
  IconArrowLeft as IconArrowLeftSmall,
} from '@tabler/icons-react';
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

interface UserAnswer {
  roundIndex: number;
  questionIndex: number;
  answer: string;
}

interface QuizResult {
  roundIndex: number;
  questionIndex: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  question: string;
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
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  const currentRoundData = quizData.rounds[currentRound];
  const currentQuestionData = currentRoundData?.questions[currentQuestion];
  const currentRoundConfig = quizConfig.rounds[currentRound];

  // Get current user answer
  const getCurrentUserAnswer = (): string => {
    const answer = userAnswers.find(
      (a) =>
        a.roundIndex === currentRound && a.questionIndex === currentQuestion
    );
    return answer?.answer || '';
  };

  // Save current user answer
  const saveCurrentAnswer = (answer: string) => {
    setUserAnswers((prev) => {
      const existingIndex = prev.findIndex(
        (a) =>
          a.roundIndex === currentRound && a.questionIndex === currentQuestion
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], answer };
        return updated;
      }
      return [
        ...prev,
        { roundIndex: currentRound, questionIndex: currentQuestion, answer },
      ];
    });
  };

  // Timer functionality
  useEffect(() => {
    if (!timerActive || timeRemaining === null || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setTimerActive(false);
          // Auto-submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Start timer when quiz starts
  useEffect(() => {
    if (
      quizStarted &&
      currentRoundConfig.hasTimeLimit &&
      currentRoundConfig.timeLimit
    ) {
      setTimeRemaining(currentRoundConfig.timeLimit * 60); // Convert minutes to seconds
      setTimerActive(true);
    }
  }, [quizStarted, currentRound, currentRoundConfig]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = (answer: string) => {
    saveCurrentAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < currentRoundData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentRound < quizData.rounds.length - 1) {
      setCurrentRound(currentRound + 1);
      setCurrentQuestion(0);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentRound > 0) {
      setCurrentRound(currentRound - 1);
      setCurrentQuestion(
        quizData.rounds[currentRound - 1].questions.length - 1
      );
    }
  };

  const handleSubmitQuiz = () => {
    setTimerActive(false);
    setQuizCompleted(true);
  };

  const handleExitQuiz = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    setShowExitModal(false);
    onBackToConfig();
  };

  const cancelExit = () => {
    setShowExitModal(false);
  };

  // Calculate quiz results
  const calculateResults = (): QuizResult[] => {
    const results: QuizResult[] = [];

    quizData.rounds.forEach((round, roundIndex) => {
      round.questions.forEach((question, questionIndex) => {
        const userAnswer = userAnswers.find(
          (a) =>
            a.roundIndex === roundIndex && a.questionIndex === questionIndex
        );

        results.push({
          roundIndex,
          questionIndex,
          userAnswer: userAnswer?.answer || '',
          correctAnswer: question.answer,
          isCorrect:
            userAnswer?.answer?.toLowerCase().trim() ===
            question.answer.toLowerCase().trim(),
          question: question.question,
        });
      });
    });

    return results;
  };

  const results = calculateResults();
  const totalQuestions = results.length;
  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  // Check if we can proceed to next question
  const canProceed =
    currentQuestion < currentRoundData.questions.length - 1 ||
    currentRound < quizData.rounds.length - 1;
  const isLastQuestion =
    currentQuestion === currentRoundData.questions.length - 1 &&
    currentRound === quizData.rounds.length - 1;
  const canGoBack = currentQuestion > 0 || currentRound > 0;

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
                onClick={onBackToConfig}
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
      <QuizResults
        results={results}
        quizData={quizData}
        quizConfig={quizConfig}
        onBackToConfig={onBackToConfig}
        scorePercentage={scorePercentage}
        correctAnswers={correctAnswers}
        totalQuestions={totalQuestions}
      />
    );
  }

  return (
    <>
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
                {timerActive && timeRemaining !== null && (
                  <Badge
                    size="lg"
                    color={timeRemaining < 60 ? 'red' : 'orange'}
                    leftSection={<IconClock size={14} />}
                  >
                    {Math.floor(timeRemaining / 60)}:
                    {(timeRemaining % 60).toString().padStart(2, '0')}
                  </Badge>
                )}
                <Button
                  variant="light"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={handleExitQuiz}
                >
                  Exit Quiz
                </Button>
              </Group>
            </Group>

            {/* Progress Bar */}
            <div>
              <Progress
                value={
                  ((currentRound * quizData.rounds[0].questions.length +
                    currentQuestion +
                    1) /
                    totalQuestions) *
                  100
                }
                color="blue"
                size="lg"
              />
              <Text size="sm" c="dimmed" ta="center" mt="xs">
                {currentRound * quizData.rounds[0].questions.length +
                  currentQuestion +
                  1}{' '}
                / {totalQuestions}
              </Text>
            </div>

            {/* Question */}
            <Card withBorder p="lg" className={styles.questionCard}>
              <Title order={3} mb="md">
                Question {currentQuestion + 1}
              </Title>
              <Text size="lg" mb="xl">
                {currentQuestionData?.question}
              </Text>

              <TextInput
                label="Your Answer"
                value={getCurrentUserAnswer()}
                onChange={(e) => handleAnswerChange(e.currentTarget.value)}
                placeholder="Type your answer here..."
                size="lg"
                autoFocus
              />
            </Card>

            {/* Navigation */}
            <Group justify="space-between">
              <Button
                variant="light"
                leftSection={<IconArrowLeftSmall size={16} />}
                onClick={handlePreviousQuestion}
                disabled={!canGoBack}
              >
                Previous
              </Button>

              <Group>
                {canProceed && !isLastQuestion && (
                  <Button
                    variant="light"
                    rightSection={<IconArrowRight size={16} />}
                    onClick={handleNextQuestion}
                  >
                    Next
                  </Button>
                )}

                {isLastQuestion && (
                  <Button
                    variant="filled"
                    color="green"
                    rightSection={<IconCheck size={16} />}
                    onClick={handleSubmitQuiz}
                  >
                    Submit Quiz
                  </Button>
                )}
              </Group>
            </Group>

            {/* Progress Summary */}
            <Card withBorder p="md">
              <Group justify="space-between">
                <Text>
                  Progress: {currentRound + 1}/{quizData.rounds.length} rounds
                </Text>
                <Text>
                  Question: {currentQuestion + 1}/
                  {currentRoundData.questions.length}
                </Text>
                <Text>
                  Answered: {userAnswers.length}/{totalQuestions}
                </Text>
              </Group>
            </Card>
          </Stack>
        </Paper>
      </Container>

      {/* Exit Confirmation Modal */}
      <Modal
        opened={showExitModal}
        onClose={cancelExit}
        title="Exit Quiz?"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to exit the quiz? Your progress will be lost.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={cancelExit}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmExit}>
              Exit Quiz
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

// Quiz Results Component
interface QuizResultsProps {
  results: QuizResult[];
  quizData: QuizData;
  quizConfig: QuizConfig;
  onBackToConfig: () => void;
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
}

function QuizResults({
  results,
  quizData,
  quizConfig,
  onBackToConfig,
  scorePercentage,
  correctAnswers,
  totalQuestions,
}: QuizResultsProps) {
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set());

  const toggleRound = (roundIndex: number) => {
    setExpandedRounds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roundIndex)) {
        newSet.delete(roundIndex);
      } else {
        newSet.add(roundIndex);
      }
      return newSet;
    });
  };

  // Group results by round
  const resultsByRound = results.reduce(
    (acc, result) => {
      if (!acc[result.roundIndex]) {
        acc[result.roundIndex] = [];
      }
      acc[result.roundIndex].push(result);
      return acc;
    },
    {} as Record<number, QuizResult[]>
  );

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) {
      return 'green';
    }
    if (percentage >= 60) {
      return 'yellow';
    }
    return 'red';
  };

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="xl" radius="md" className={styles.container}>
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="center">
            <div>
              <Title order={2}>Quiz Results</Title>
              <Text c="dimmed">
                {quizConfig.quizTopic || 'General Knowledge'} Quiz
              </Text>
            </div>
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={onBackToConfig}
            >
              Create New Quiz
            </Button>
          </Group>

          {/* Overall Score */}
          <Card withBorder p="lg" className={styles.scoreCard}>
            <Stack gap="md" align="center">
              <Title order={3}>Overall Score</Title>
              <Badge
                size="xl"
                color={getScoreColor(scorePercentage)}
                variant="filled"
              >
                {scorePercentage}%
              </Badge>
              <Text size="lg">
                {correctAnswers} out of {totalQuestions} questions correct
              </Text>
              <Progress
                value={scorePercentage}
                color={getScoreColor(scorePercentage)}
                size="xl"
                w="100%"
              />
            </Stack>
          </Card>

          {/* Results by Round */}
          <Card withBorder p="lg">
            <Title order={3} mb="lg">
              Detailed Results
            </Title>
            <Stack gap="md">
              {Object.entries(resultsByRound).map(
                ([roundIndex, roundResults]) => {
                  const roundNumber = parseInt(roundIndex, 10);
                  const roundCorrect = roundResults.filter(
                    (r) => r.isCorrect
                  ).length;
                  const roundPercentage = Math.round(
                    (roundCorrect / roundResults.length) * 100
                  );
                  const isExpanded = expandedRounds.has(roundNumber);

                  return (
                    <div key={roundIndex} className={styles.roundResult}>
                      <Group justify="space-between" align="center">
                        <div>
                          <Text fw={500} size="lg">
                            Round {roundNumber + 1}:{' '}
                            {quizData.rounds[roundNumber].title}
                          </Text>
                          <Text c="dimmed">
                            {roundCorrect} out of {roundResults.length} correct
                            ({roundPercentage}%)
                          </Text>
                        </div>
                        <Group>
                          <Badge color={getScoreColor(roundPercentage)}>
                            {roundPercentage}%
                          </Badge>
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => toggleRound(roundNumber)}
                          >
                            {isExpanded ? 'Hide' : 'Show'} Details
                          </Button>
                        </Group>
                      </Group>

                      {isExpanded && (
                        <div className={styles.roundDetails}>
                          <Divider my="md" />
                          <Stack gap="md">
                            {roundResults.map((result, index) => (
                              <div
                                key={index}
                                className={styles.questionResult}
                              >
                                <Group align="flex-start" gap="md">
                                  <Badge
                                    color={result.isCorrect ? 'green' : 'red'}
                                    variant="light"
                                    size="sm"
                                  >
                                    {result.isCorrect ? (
                                      <IconCheck size={12} />
                                    ) : (
                                      <IconX size={12} />
                                    )}
                                  </Badge>
                                  <div style={{ flex: 1 }}>
                                    <Text fw={500} mb="xs">
                                      Question {index + 1}:
                                    </Text>
                                    <Text mb="xs">{result.question}</Text>
                                    <Text size="sm" c="dimmed" mb="xs">
                                      <strong>Your answer:</strong>{' '}
                                      {result.userAnswer ||
                                        'No answer provided'}
                                    </Text>
                                    <Text size="sm" c="green">
                                      <strong>Correct answer:</strong>{' '}
                                      {result.correctAnswer}
                                    </Text>
                                  </div>
                                </Group>
                              </div>
                            ))}
                          </Stack>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </Stack>
          </Card>
        </Stack>
      </Paper>
    </Container>
  );
}
