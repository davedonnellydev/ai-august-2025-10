'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  NumberInput,
  TextInput,
  Switch,
  Button,
  Group,
  Stack,
  Badge,
  Card,
  Grid,
} from '@mantine/core';
import {
  IconClock,
  IconFileExport,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import styles from './QuizOptions.module.css';

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

export function QuizOptions() {
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    rounds: [
      {
        id: '1',
        name: 'Round 1',
        topic: '',
        questionsCount: 10,
        timeLimit: 15,
        hasTimeLimit: true,
      },
    ],
    quizMode: 'online',
    quizTopic: '',
    totalQuestions: 10,
    estimatedTime: 15,
  });

  const addRound = () => {
    const newRound: Round = {
      id: Date.now().toString(),
      name: `Round ${quizConfig.rounds.length + 1}`,
      topic: '',
      questionsCount: 10,
      timeLimit: 15,
      hasTimeLimit: true,
    };

    setQuizConfig((prev) => ({
      ...prev,
      rounds: [...prev.rounds, newRound],
    }));
  };

  const removeRound = (roundId: string) => {
    if (quizConfig.rounds.length <= 1) {
      return;
    }

    setQuizConfig((prev) => ({
      ...prev,
      rounds: prev.rounds.filter((round) => round.id !== roundId),
    }));
  };

  const updateRound = (roundId: string, updates: Partial<Round>) => {
    setQuizConfig((prev) => ({
      ...prev,
      rounds: prev.rounds.map((round) =>
        round.id === roundId ? { ...round, ...updates } : round
      ),
    }));
  };

  const updateQuizMode = (mode: 'online' | 'export') => {
    setQuizConfig((prev) => ({ ...prev, quizMode: mode }));
  };

  const updateQuizTopic = (topic: string) => {
    setQuizConfig((prev) => ({ ...prev, quizTopic: topic }))
  }

  // Calculate totals
  const totalQuestions = quizConfig.rounds.reduce(
    (sum, round) => sum + round.questionsCount,
    0
  );
  const totalTime = quizConfig.rounds.reduce(
    (sum, round) =>
      sum + (round.hasTimeLimit && round.timeLimit ? round.timeLimit : 0),
    0
  );

  const handleGenerateQuiz = () => {

    if (quizConfig.quizMode === 'online') {
      // Handle online quiz generation
      // eslint-disable-next-line no-console
      console.log('Generating online quiz:', quizConfig);
    } else {
      // Handle export quiz generation
      // eslint-disable-next-line no-console
      console.log('Generating export quiz:', quizConfig);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="xl" radius="md" className={styles.container}>
        <Stack gap="xl">
          {/* Header */}
          <div className={styles.header}>
            <Title order={1} className={styles.title}>
              Quiz Maker
            </Title>
            <Text c="dimmed" size="lg">
              Configure your quiz settings and generate questions
            </Text>
          </div>

          {/* Quiz Mode Selection */}
          <Card withBorder p="lg" className={styles.modeCard}>
            <Title order={3} mb="md">
              Quiz Topic
            </Title>
            <Stack gap="md">
                <TextInput 
                    label="Quiz Topic"
                    value={quizConfig.quizTopic}
                    onChange={(e) =>
                        updateQuizTopic(e.currentTarget.value)
                    }
                    placeholder="e.g., General Knowledge"
                    size="md"
                />
            </Stack>
          </Card>

          {/* Rounds Configuration */}
          <Card withBorder p="lg">
            <Group justify="space-between" mb="md">
              <Title order={3}>Quiz Rounds</Title>
              <Button
                variant="light"
                color="blue"
                leftSection={<IconPlus size={16} />}
                onClick={addRound}
                size="sm"
              >
                Add Round
              </Button>
            </Group>

            <Stack gap="md">
              {quizConfig.rounds.map((round) => (
                <Paper
                  key={round.id}
                  withBorder
                  p="md"
                  className={styles.roundCard}
                >
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 3 }}>
                      <TextInput
                        label="Round Name"
                        value={round.name}
                        onChange={(e) =>
                          updateRound(round.id, { name: e.currentTarget.value })
                        }
                        placeholder="e.g., General Knowledge"
                        size="sm"
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label="Topic"
                        value={round.topic}
                        onChange={(e) =>
                          updateRound(round.id, {
                            topic: e.currentTarget.value,
                          })
                        }
                        placeholder="e.g., Science, History, Literature"
                        size="sm"
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 2 }}>
                      <NumberInput
                        label="Questions"
                        value={round.questionsCount}
                        onChange={(value) =>
                          updateRound(round.id, {
                            questionsCount:
                              typeof value === 'number' ? value : 1,
                          })
                        }
                        min={1}
                        max={20}
                        size="sm"
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 2 }}>
                      <Stack gap="xs">
                        <Switch
                          label="Time Limit"
                          checked={round.hasTimeLimit}
                          onChange={(e) =>
                            updateRound(round.id, {
                              hasTimeLimit: e.currentTarget.checked,
                            })
                          }
                          size="sm"
                        />
                        {round.hasTimeLimit && (
                          <NumberInput
                            value={round.timeLimit || undefined}
                            onChange={(value) =>
                              updateRound(round.id, {
                                timeLimit:
                                  typeof value === 'number' ? value : null,
                              })
                            }
                            min={1}
                            max={60}
                            size="sm"
                            rightSection={<IconClock size={16} />}
                            placeholder="Minutes"
                          />
                        )}
                      </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 1 }}>
                      {quizConfig.rounds.length > 1 && (
                        <Button
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => removeRound(round.id)}
                          className={styles.removeButton}
                        >
                            <IconTrash size={14} />
                        </Button>
                      )}
                    </Grid.Col>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Card>

          {/* Quiz Mode Selection */}
          <Card withBorder p="lg" className={styles.modeCard}>
            <Title order={3} mb="md">
              Quiz Mode
            </Title>
            <Group gap="md">
              <Button
                variant={quizConfig.quizMode === 'online' ? 'filled' : 'light'}
                color="blue"
                leftSection={<IconPlayerPlay size={16} />}
                onClick={() => updateQuizMode('online')}
                className={styles.modeButton}
              >
                Take Quiz Online
              </Button>
              <Button
                variant={quizConfig.quizMode === 'export' ? 'filled' : 'light'}
                color="green"
                leftSection={<IconFileExport size={16} />}
                onClick={() => updateQuizMode('export')}
                className={styles.modeButton}
              >
                Export Quiz
              </Button>
            </Group>
            <Text size="sm" c="dimmed" mt="xs">
              {quizConfig.quizMode === 'online'
                ? 'Take the quiz directly in this app with automatic scoring'
                : 'Get a printable version with questions and answers for offline use'}
            </Text>
          </Card>

          {/* Summary */}
          <Card withBorder p="lg" className={styles.summaryCard}>
            <Title order={3} mb="md">
              Quiz Summary
            </Title>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <div className={styles.summaryItem}>
                  <Text size="lg" fw={500}>
                    Total Rounds
                  </Text>
                  <Badge size="xl" variant="light" color="blue">
                    {quizConfig.rounds.length}
                  </Badge>
                </div>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <div className={styles.summaryItem}>
                  <Text size="lg" fw={500}>
                    Total Questions
                  </Text>
                  <Badge size="xl" variant="light" color="green">
                    {totalQuestions}
                  </Badge>
                </div>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <div className={styles.summaryItem}>
                  <Text size="lg" fw={500}>
                    Estimated Time
                  </Text>
                  <Badge size="xl" variant="light" color="orange">
                    {totalTime} min
                  </Badge>
                </div>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Action Buttons */}
          <Group justify="center" gap="md">
            <Button
              size="lg"
              variant="filled"
              color="blue"
              onClick={handleGenerateQuiz}
              className={styles.generateButton}
              leftSection={
                quizConfig.quizMode === 'online' ? (
                  <IconPlayerPlay size={20} />
                ) : (
                  <IconFileExport size={20} />
                )
              }
            >
              {quizConfig.quizMode === 'online'
                ? 'Start Quiz'
                : 'Generate Quiz'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
