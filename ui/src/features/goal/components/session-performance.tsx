import { BarChart } from '@mantine/charts';
import { Card, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { StrategyAdherenceChart } from './metric-charts/strategy-adherence-chart';
import { useStrategyMetrics } from '../hooks';
import { SRWeeklyChart } from './metric-charts/sr-weekly-chart';

const weeklyStudyData = [
  { day: 'Domingo', minutos: 200 },
  { day: 'Segunda', minutos: 240 },
  { day: 'Terça', minutos: 100 },
  { day: 'Quarta', minutos: 180 },
  { day: 'Quinta', minutos: 170 },
  { day: 'Sexta', minutos: 150 },
  { day: 'Sábado', minutos: 0 },
];

interface MetricCardProps {
  label: string;
  value: string;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Paper p="md" radius="md" withBorder shadow="xs">
      <Stack gap={4}>
        <Text size="xs" c="dimmed" fw={500}>
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
        <MetricCard label="Horas Dedicadas" value="12h 43min" />
        <MetricCard label="Tempo Médio por Sessão" value="3.2h" />
        <MetricCard label="Estratégia Favorita" value="Vídeos" />
      </SimpleGrid>

      <StrategyAdherenceChart data={data.strategyAdherence} />
      <SRWeeklyChart data={data.srWeekly} />

      <Card p="lg" radius="md" withBorder shadow="xs">
        <Stack gap="md">
          <Text fw={700}>Tempo de Estudo Semanal</Text>
          <BarChart
            h={260}
            data={weeklyStudyData}
            dataKey="day"
            series={[{ name: 'minutos', color: '#FD7E14' }]}
            tickLine="none"
            gridAxis="y"
            withLegend={false}
            strokeDasharray="4 4"
            yAxisProps={{
              domain: [0, 250],
              ticks: [0, 50, 100, 150, 200, 250],
            }}
            barProps={{ radius: 0 }}
            xAxisProps={{ tick: { fill: '#ADB5BD', fontSize: 12 } }}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
