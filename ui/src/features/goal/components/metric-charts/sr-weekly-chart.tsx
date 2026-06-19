import { LineChart } from '@mantine/charts';
import {
  Card,
  Stack,
  Text,
  Group,
  Paper,
  SimpleGrid,
  Tooltip,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { SRWeeklyMetric } from '../../models';

function formatWeekRange(start: Date, end: Date): string {
  const format = (date: Date) =>
    date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });

  return `${format(start)} - ${format(end)}`;
}

interface SRWeeklyChartProps {
  data: SRWeeklyMetric[];
}

export function SRWeeklyChart({ data }: SRWeeklyChartProps) {
  if (!data || data.length === 0) {
    return (
      <Paper p="lg" radius="md" withBorder>
        <Text c="dimmed" ta="center">
          Sem dados de autorregulação disponíveis
        </Text>
      </Paper>
    );
  }

  // Transformar dados para o formato esperado pelo Mantine Charts
  const chartData = data.map((item) => ({
    semana: formatWeekRange(item.weekStart, item.weekEnd),
    'Eventos SRL': item.srCount,
    'Sessões Finalizadas': item.finishedCount,
    Frequência: Math.round(item.frequency * 100) / 100,
  }));

  const frequencyStats = {
    avg: (data.reduce((sum, d) => sum + d.frequency, 0) / data.length).toFixed(
      2,
    ),
    max: Math.max(...data.map((d) => d.frequency)).toFixed(2),
  };

  return (
    <Stack gap="lg">
      <Card p="lg" radius="md" withBorder shadow="xs">
        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Group align="center" gap="xs">
                <Text fw={600} size="lg">
                  Autorregulação Semanal
                </Text>
                <Tooltip label="Frequência = Eventos SRL / Sessões Finalizadas">
                  <IconInfoCircle
                    size={16}
                    color="#868E96"
                    stroke={2}
                    cursor="pointer"
                  />
                </Tooltip>
              </Group>
              <Text size="sm" c="dimmed">
                Relação entre eventos de autorregulação e sessões concluídas
              </Text>
            </div>
          </Group>

          {/* LineChart com 2 séries */}
          <LineChart
            h={280}
            data={chartData}
            dataKey="semana"
            series={[
              { name: 'Eventos SRL', color: '#FD7E14' },
              { name: 'Sessões Finalizadas', color: '#12B886' },
            ]}
            tickLine="none"
            gridAxis="y"
            withLegend
            strokeDasharray="4 4"
            curveType="natural"
            withDots
            yAxisProps={{
              domain: [
                0,
                Math.max(
                  ...chartData.map((d) =>
                    Math.max(d['Eventos SRL'], d['Sessões Finalizadas']),
                  ),
                ) * 1.1,
              ],
            }}
            xAxisProps={{ tick: { fill: '#ADB5BD', fontSize: 12 } }}
          />
        </Stack>
      </Card>

      {/* Métricas de frequência */}
      <SimpleGrid cols={2} spacing="md">
        <Paper p="md" radius="md" withBorder shadow="xs">
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={500}>
              Frequência de Autorregulação Média
            </Text>
            <Text size="xl" fw={700} c="orange.6">
              {frequencyStats.avg}x
            </Text>
          </Stack>
        </Paper>
        <Paper p="md" radius="md" withBorder shadow="xs">
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={500}>
              Frequência de Autorregulação Máxima
            </Text>
            <Text size="xl" fw={700} c="orange.6">
              {frequencyStats.max}x
            </Text>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
