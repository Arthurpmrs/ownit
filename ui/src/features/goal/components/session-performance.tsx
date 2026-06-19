import { Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { StrategyAdherenceChart } from './metric-charts/strategy-adherence-chart';
import { useStrategyMetrics } from '../hooks';
import { SRWeeklyChart } from './metric-charts/sr-weekly-chart';

interface MetricCardProps {
  label: string;
  value: string;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Paper p="md" radius="md" withBorder shadow="xs">
      <Stack gap={4}>
        <Text size="sm" c="dimmed" fw={500}>
          {label}
        </Text>
        <Text size="xl" fw={700}>
          {value}
        </Text>
      </Stack>
    </Paper>
  );
}

interface SessionPerformanceProps {
  goalId: string;
}

export default function SessionPerformance({
  goalId,
}: SessionPerformanceProps) {
  const { data } = useStrategyMetrics(goalId);

  return (
    <Stack gap="lg">
      <Title order={3}>Desempenho</Title>

      <SimpleGrid cols={3}>
        <MetricCard
          label="Horas Dedicadas"
          value={data.performanceSummary.totalDurationInHours}
        />
        <MetricCard
          label="Tempo Médio por Sessão"
          value={data.performanceSummary.avgSessionDuratioInHours}
        />
        <MetricCard
          label="Nota média"
          value={data.performanceSummary.avgRating.toFixed(2)}
        />
      </SimpleGrid>

      <SRWeeklyChart data={data.srWeekly} />
      <StrategyAdherenceChart data={data.strategyAdherence} />
    </Stack>
  );
}
