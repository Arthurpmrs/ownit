import { LineChart } from '@mantine/charts';
import { Card, Stack, Text, Group, Paper, Tooltip } from '@mantine/core';
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

  const chartData = data.map((item) => ({
    semana: formatWeekRange(item.weekStart, item.weekEnd),
    'Eventos SRL': item.srCount,
    'Sessões Finalizadas': item.finishedCount,
    Frequência: Math.round(item.frequency * 100) / 100,
    'Média do Grau de Percepção de Domínio': item.avgDomainPerception,
    'Nota média das sessões': item.avgRating,
  }));

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
                <Tooltip
                  w={600}
                  multiline
                  label="Consideram-se Eventos de Autorregulação o ajuste de sessões existentes, criação de novas sessões e cancelamento de sessões, durante a execução do plano."
                >
                  <IconInfoCircle
                    size={16}
                    color="#868E96"
                    stroke={2}
                    cursor="pointer"
                  />
                </Tooltip>
              </Group>
              <Text size="sm" c="dimmed">
                Relação entre eventos de autorregulação, sessões concluídas,
                percepção de domínio e avaliação das sessões.
              </Text>
            </div>
          </Group>

          <LineChart
            h={280}
            data={chartData}
            dataKey="semana"
            series={[
              { name: 'Eventos SRL', color: '#e22732' },
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
            lineChartProps={{ syncId: 'srl' }}
          />
          <LineChart
            h={280}
            data={chartData}
            dataKey="semana"
            series={[
              {
                name: 'Média do Grau de Percepção de Domínio',
                color: '#FD7E14',
              },
              { name: 'Nota média das sessões', color: '#9354e0' },
            ]}
            tickLine="none"
            gridAxis="y"
            withLegend
            strokeDasharray="4 4"
            curveType="natural"
            withDots
            yAxisProps={{
              domain: [0, 5],
            }}
            xAxisProps={{ tick: { fill: '#ADB5BD', fontSize: 12 } }}
            lineChartProps={{ syncId: 'srl' }}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
