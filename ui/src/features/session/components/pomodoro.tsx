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
  Tooltip,
} from '@mantine/core';
import {
  IconBrain,
  IconCoffee,
  IconHourglassEmpty,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import useUpdatePomodoroStatus from '../hook';
import type { Pomodoro, PomodoroStatus } from '../models';

interface PomodoroProps {
  sessionId: string;
  sessionDuration: string;
  pomodoro: Pomodoro;
}

function toSeconds(timeStr: string): number {
  if (!timeStr) {
    return 0;
  }
  const [hourStr, minutesStr, secStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  const sec = parseInt(secStr, 10) || 0;
  return hour * 3600 + minutes * 60 + sec;
}

function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600) * 60;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (num: number) => String(num).padStart(2, '0');

  if (hours > 0) {
    return `${pad(minutes + hours)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function Pomodoro({
  sessionId,
  sessionDuration,
  pomodoro,
}: PomodoroProps) {
  const startMode =
    pomodoro.status === 'not_started' || pomodoro.status.includes('focus')
      ? 'focus'
      : 'break';
  const [mode, setMode] = useState<'focus' | 'break'>(startMode);

  const [timeLeft, setTimeLeft] = useState(
    toSeconds(pomodoro.currentRemainingDuration),
  );
  const totalSessionSeconds = toSeconds(sessionDuration);
  const startActive = pomodoro.status.includes('mode');
  const [isActive, setIsActive] = useState(startActive);
  const [currentBlockSeconds, setCurrentBlockSeconds] = useState(0);

  const updatePomodoroStatusMutation = useUpdatePomodoroStatus(sessionId);

  // Controla o intervalo do contador regressivo
  useEffect(() => {
    let interval: number | null = null;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          // Se o tempo vai zerar neste exato tique:
          if (prevTime <= 1) {
            setIsActive(false);
            setCurrentBlockSeconds(0);

            const nextStatus: PomodoroStatus =
              pomodoro.status === 'focus_mode' ? 'focus_pause' : 'break_pause';

            updatePomodoroStatusMutation.mutate({
              sessionId,
              new_status: nextStatus,
            });
            return 0;
          }

          // Caso contrário, apenas decrementa
          setCurrentBlockSeconds((prevBlock) => prevBlock + 1);
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [
    isActive,
    timeLeft,
    pomodoro.status,
    sessionId,
    updatePomodoroStatusMutation,
  ]);

  function handleModeChange(newMode: string) {
    if (newMode !== mode) {
      const new_status: PomodoroStatus =
        newMode === 'focus' ? 'focus_pause' : 'break_pause';
      updatePomodoroStatusMutation.mutate({ sessionId, new_status });

      setIsActive(false);
      setMode(newMode as 'focus' | 'break');
      setCurrentBlockSeconds(0);
      setTimeLeft(
        toSeconds(
          newMode === 'focus' ? pomodoro.focusDuration : pomodoro.breakDuration,
        ),
      );
    }
  }

  function handleReset() {
    setIsActive(false);
    setTimeLeft(
      toSeconds(
        mode === 'focus' ? pomodoro.focusDuration : pomodoro.breakDuration,
      ),
    );
  }

  function getPlayPauseStatus(currentStatus: string) {
    switch (currentStatus) {
      case 'not_started':
        return 'focus_mode';
      case 'focus_mode':
        return 'focus_pause';
      case 'focus_pause':
        return 'focus_mode';
      case 'break_mode':
        return 'break_pause';
      case 'break_pause':
        return 'break_mode';
      default:
        return currentStatus;
    }
  }

  function handlePlayPause() {
    setIsActive(!isActive);
    const new_status = getPlayPauseStatus(pomodoro.status);
    updatePomodoroStatusMutation.mutate({ sessionId, new_status });
  }

  function generateChartSections() {
    if (totalSessionSeconds <= 0) {
      return [];
    }

    const allBlocks = [...(pomodoro.history || [])];

    const isStatusActive = pomodoro.status.includes('mode');

    if (currentBlockSeconds > 0 && isStatusActive) {
      allBlocks.push({
        mode,
        duration: currentBlockSeconds,
      });
    }

    return allBlocks.map((block) => {
      const percentage = (block.duration / totalSessionSeconds) * 100;

      return {
        value: percentage,
        color: block.mode === 'focus' ? 'orange.5' : 'orange.2',
        tooltip: `${block.mode === 'focus' ? 'Foco' : 'Pausa'}: ${formatSeconds(block.duration)}`,
      };
    });
  }

  const chartSections = generateChartSections();

  return (
    <Card withBorder padding="lg" radius="md">
      <Card.Section inheritPadding py="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap="xs">
              <IconHourglassEmpty size={16} color="orange" />
              <Title order={5}>Pomodoro</Title>
            </Group>
          </Group>
          {isActive && (
            <Tooltip
              target="#PomoTabs"
              label="Pause o pomodoro para trocar de modo"
            />
          )}
          <SegmentedControl
            id="PomoTabs"
            value={mode}
            onChange={handleModeChange}
            disabled={isActive}
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
              size={270}
              thickness={16}
              sections={chartSections}
              label={
                <Center>
                  <Stack align="center" gap={0}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: '44px',
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
              onClick={handlePlayPause}
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
