'use client';

import {
  Container,
  Paper,
  Title,
  Text,
  Loader,
  Stack,
  Center,
} from '@mantine/core';
import { IconBrain, IconLoader } from '@tabler/icons-react';
import styles from './LoadingScreen.module.css';

export function LoadingScreen() {
  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" p="xl" radius="md" className={styles.container}>
        <Center>
          <Stack gap="xl" align="center">
            <div className={styles.iconContainer}>
              <IconBrain size={64} className={styles.brainIcon} />
              <IconLoader size={32} className={styles.loaderIcon} />
            </div>

            <Stack gap="md" align="center">
              <Title order={2} ta="center">
                Generating Your Quiz
              </Title>
              <Text size="lg" c="dimmed" ta="center">
                Our AI is crafting the perfect questions for you...
              </Text>
            </Stack>

            <Loader size="lg" color="blue" />

            <Text size="sm" c="dimmed" ta="center">
              This may take a few moments
            </Text>
          </Stack>
        </Center>
      </Paper>
    </Container>
  );
}
