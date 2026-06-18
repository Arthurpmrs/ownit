import { BarChart } from '@mantine/charts';
import { Group, Paper, Text, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { studySessionStrategyMap } from '../../mappers';
import type { StrategyMetric } from '../../models';

interface StrategyAdherenceChartProps {
  data: StrategyMetric[];
}

export function StrategyAdherenceChart({ data }: StrategyAdherenceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Paper p="lg" radius="md" withBorder>
        <Text c="dimmed" ta="center">
          Sem dados de estratégias disponíveis
        </Text>
      </Paper>
    );
  }

  const chartData = data
    .sort((a, b) => b.adherence - a.adherence)
    .map((item) => ({
      Estratégia:
        studySessionStrategyMap[
          item.strategy as keyof typeof studySessionStrategyMap
        ],
      Aderência: Math.round(item.adherence * 100),
      Contagem: item.sessionsCount,
    }));

  return (
    <Paper p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="lg">
        <div>
          <Group align="center" gap="xs">
            <Text fw={500} size="lg">
              Aderência ao Plano por Estratégia
            </Text>
            <Tooltip label="Aderência é calculada como 1 - |Duração planejada - Duração executada| / Duração planejada">
              <IconInfoCircle
                size={16}
                color="#868E96"
                stroke={2}
                cursor="pointer"
              />
            </Tooltip>
          </Group>
          <Text size="sm" c="dimmed">
            Percentual de aderência para cada estratégia de aprendizado
          </Text>
        </div>
      </Group>

      <BarChart
        h={260}
        data={chartData}
        dataKey="Estratégia"
        gridAxis="xy"
        series={[{ name: 'Aderência', color: '#FD7E14' }]}
        tickLine="none"
        withLegend={false}
        strokeDasharray="4 4"
        orientation="vertical"
        xAxisProps={{
          domain: [0, 100],
          ticks: [0, 25, 50, 75, 100],
        }}
        barProps={{ radius: 0 }}
      />
    </Paper>
  );
}
