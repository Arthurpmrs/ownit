import {
  ActionIcon,
  Card,
  Center,
  Group,
  RingProgress,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconBrain,
  IconCoffee,
  IconHourglassEmpty,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

interface PomodoroConfig {
  sessionDuration: string;
  focusDuration: string;
  breakDuration: string;
}

interface TimeBlock {
  mode: 'focus' | 'break';
  durationInSeconds: number;
}

function toSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const [hourStr, minutesStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  return hour * 3600 + minutes * 60;
}

function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (num: number) => String(num).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function Pomodoro({
  sessionDuration,
  focusDuration,
  breakDuration,
}: PomodoroConfig) {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(toSeconds(focusDuration));
  const [isActive, setIsActive] = useState(false);
  const [history, setHistory] = useState<TimeBlock[]>([]);
  const [currentBlockSeconds, setCurrentBlockSeconds] = useState(0);
  const isChangingModeManually = useRef(false);

  const totalSessionSeconds = toSeconds(sessionDuration);

  useEffect(() => {
    let interval: number | null = null;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setCurrentBlockSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      archiveCurrentBlock(mode);
      setMode((prev) => (prev === 'focus' ? 'break' : 'focus'));
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isActive, timeLeft, mode]);

  useEffect(() => {
    if (currentBlockSeconds === 0 && history.length === 0) {
      setTimeLeft(toSeconds(mode === 'focus' ? focusDuration : breakDuration));
      return;
    }

    if (isChangingModeManually.current) {
      isChangingModeManually.current = false;
    }

    setTimeLeft(toSeconds(mode === 'focus' ? focusDuration : breakDuration));
  }, [mode]);

  const archiveCurrentBlock = (forcedMode?: 'focus' | 'break') => {
    if (currentBlockSeconds > 0) {
      const modeToArchive = forcedMode || mode;
      setHistory((prev) => [
        ...prev,
        { mode: modeToArchive, durationInSeconds: currentBlockSeconds },
      ]);
      setCurrentBlockSeconds(0);
    }
  };

  const handleModeChange = (newMode: string) => {
    if (newMode !== mode) {
      setIsActive(false);
      isChangingModeManually.current = true;
      archiveCurrentBlock(mode);
      setMode(newMode as 'focus' | 'break');
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(toSeconds(mode === 'focus' ? focusDuration : breakDuration));
  };

  const generateChartSections = () => {
    if (totalSessionSeconds <= 0) return [];

    const allBlocks = [...history];
    if (currentBlockSeconds > 0 || isActive) {
      allBlocks.push({ mode: mode, durationInSeconds: currentBlockSeconds });
    }

    return allBlocks.map((block) => {
      const percentage = (block.durationInSeconds / totalSessionSeconds) * 100;
      return {
        value: percentage,
        color: block.mode === 'focus' ? 'orange.5' : 'orange.1',
        tooltip: `${block.mode === 'focus' ? 'Foco' : 'Pausa'}: ${formatSeconds(block.durationInSeconds)}`,
      };
    });
  };

  const chartSections = generateChartSections();

  return (
    <Card withBorder padding="lg" w={'302px'} radius="md">
      <Card.Section inheritPadding py="md">
        <Stack gap={'xs'}>
          <Group justify="space-between">
            <Group gap={'xs'}>
              <IconHourglassEmpty size={16} color="orange" />
              <Title order={5}>Pomodoro</Title>
            </Group>
            <ActionIcon variant="subtle" color="gray">
              <IconPencil size={16} stroke={1.7} />
            </ActionIcon>
          </Group>

          <SegmentedControl
            value={mode}
            onChange={handleModeChange}
            radius="xl"
            size="md"
            color="orange"
            data={[
              {
                value: 'focus',
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconBrain
                      size={16}
                      stroke={mode === 'focus' ? 2 : 1.5}
                      color={mode === 'focus' ? '#e8590c' : '#868e96'}
                    />
                    <Text
                      span
                      fw={mode === 'focus' ? 600 : 500}
                      c={mode === 'focus' ? 'orange.8' : 'dimmed'}
                    >
                      Foco
                    </Text>
                  </Center>
                ),
              },
              {
                value: 'break',
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconCoffee
                      size={16}
                      stroke={mode === 'break' ? 2 : 1.5}
                      color={mode === 'break' ? '#e8590c' : '#868e96'}
                    />
                    <Text
                      span
                      fw={mode === 'break' ? 600 : 500}
                      c={mode === 'break' ? 'orange.8' : 'dimmed'}
                    >
                      Pausa
                    </Text>
                  </Center>
                ),
              },
            ]}
            styles={{
              root: { backgroundColor: '#FAF5EF' },
              indicator: {
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                backgroundColor: '#ffffff',
              },
            }}
          />

          <Center my="sm">
            <RingProgress
              roundCaps
              size={220}
              thickness={16}
              sections={chartSections}
              label={
                <Center>
                  <Stack align="center" gap={0}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: '42px',
                        lineHeight: 1,
                      }}
                    >
                      {formatSeconds(timeLeft)}
                    </Text>
                    <Text c="dimmed" size="xs" mt="xs">
                      {mode === 'focus' ? 'até a pausa' : 'até o foco'}
                    </Text>
                  </Stack>
                </Center>
              }
            />
          </Center>

          <Group justify="center" gap="sm">
            <ActionIcon
              size="xl"
              radius="md"
              color="orange"
              variant={isActive ? 'light' : 'filled'}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? (
                <IconPlayerPause size={24} />
              ) : (
                <IconPlayerPlay size={24} />
              )}
            </ActionIcon>

            <ActionIcon
              size="xl"
              radius="md"
              color="gray"
              variant="subtle"
              onClick={handleReset}
            >
              <IconRefresh size={20} />
            </ActionIcon>
          </Group>
        </Stack>
      </Card.Section>
    </Card>
  );
}
