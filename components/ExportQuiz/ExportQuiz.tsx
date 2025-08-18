'use client';

import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Card,
  Divider,
  Badge,
} from '@mantine/core';
import { IconArrowLeft, IconPrinter, IconDownload } from '@tabler/icons-react';
import styles from './ExportQuiz.module.css';

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

interface ExportQuizProps {
  quizData: QuizData;
  quizConfig: QuizConfig;
  onBackToConfig: () => void;
}

export function ExportQuiz({
  quizData,
  quizConfig,
  onBackToConfig,
}: ExportQuizProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement PDF download functionality
    // eslint-disable-next-line no-console
    console.log('Download functionality will be implemented here');
  };

  const handleBackToConfig = () => {
    onBackToConfig();
  };

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="xl" radius="md" className={styles.container}>
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="center">
            <div>
              <Title order={2}>Quiz Export</Title>
              <Text c="dimmed">
                {quizConfig.quizTopic || 'General Knowledge'} Quiz
              </Text>
            </div>
            <Group>
              <Button
                variant="light"
                leftSection={<IconPrinter size={16} />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button
                variant="light"
                leftSection={<IconDownload size={16} />}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
              <Button
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
                onClick={handleBackToConfig}
              >
                Back to Config
              </Button>
            </Group>
          </Group>

          {/* Quiz Information */}
          <Card withBorder p="lg" className={styles.infoCard}>
            <Stack gap="md">
              <Title order={3}>Quiz Information</Title>
              <Group>
                <Badge color="blue">
                  Topic: {quizConfig.quizTopic || 'General Knowledge'}
                </Badge>
                <Badge color="green">{quizData.rounds.length} Rounds</Badge>
                <Badge color="orange">
                  {quizConfig.totalQuestions} Questions
                </Badge>
                <Badge color="red">{quizConfig.estimatedTime} Minutes</Badge>
              </Group>
            </Stack>
          </Card>

          {/* Quiz Content */}
          <div className={styles.quizContent}>
            {quizData.rounds.map((round, roundIndex) => (
              <Card
                key={roundIndex}
                withBorder
                p="lg"
                className={styles.roundCard}
              >
                <Stack gap="lg">
                  <div className={styles.roundHeader}>
                    <Title order={3}>
                      Round {roundIndex + 1}: {round.title}
                    </Title>
                    <Badge color="blue">
                      {round.questions.length} questions
                    </Badge>
                  </div>

                  <Divider />

                  {round.questions.map((question, questionIndex) => (
                    <div
                      key={questionIndex}
                      className={styles.questionContainer}
                    >
                      <div className={styles.questionSection}>
                        <Text fw={500} size="lg" mb="sm">
                          Question {questionIndex + 1}:
                        </Text>
                        <Text size="lg" mb="lg">
                          {question.question}
                        </Text>
                      </div>

                      <div className={styles.answerSection}>
                        <Text fw={500} size="lg" mb="sm" c="green">
                          Answer:
                        </Text>
                        <Text size="lg" c="dimmed">
                          {question.answer}
                        </Text>
                      </div>

                      {questionIndex < round.questions.length - 1 && (
                        <Divider my="lg" />
                      )}
                    </div>
                  ))}
                </Stack>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <Card withBorder p="lg" className={styles.footerCard}>
            <Stack gap="md">
              <Title order={3}>Quiz Summary</Title>
              <Group>
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
              </Group>
              <Text size="sm" c="dimmed">
                Generated by Quiz Master AI
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Paper>
    </Container>
  );
}
