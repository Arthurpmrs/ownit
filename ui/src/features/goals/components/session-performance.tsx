import { BarChart, LineChart } from '@mantine/charts';
import { Card, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';

const weeklyStudyData = [
  { day: 'Domingo', minutos: 200 },
  { day: 'Segunda', minutos: 240 },
  { day: 'Terça', minutos: 100 },
  { day: 'Quarta', minutos: 180 },
  { day: 'Quinta', minutos: 170 },
  { day: 'Sexta', minutos: 150 },
  { day: 'Sábado', minutos: 0 },
];

const weeklySessionsData = [
  { week: 'Apr 26 - May 2', sessoes: 0 },
  { week: 'May 3 - May 9', sessoes: 4 },
  { week: 'May 10 - May 16', sessoes: 3 },
  { week: 'May 17 - May 23', sessoes: 2 },
  { week: 'May 24 - May 30', sessoes: 8 },
  { week: 'May 31 - Jun 6', sessoes: 0 },
  { week: 'Jun 7 - Jun 9', sessoes: 0 },
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

export default function SessionPerformance() {
  return (
    <Stack gap="lg">
      <Title order={3}>Desempenho</Title>

      <SimpleGrid cols={3}>
        <MetricCard label="Horas Dedicadas" value="12h 43min" />
        <MetricCard label="Tempo Médio por Sessão" value="3.2h" />
        <MetricCard label="Estratégia Favorita" value="Vídeos" />
      </SimpleGrid>

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
            yAxisProps={{ domain: [0, 250], ticks: [0, 50, 100, 150, 200, 250] }}
            barProps={{ radius: 0 }}
            xAxisProps={{ tick: { fill: '#ADB5BD', fontSize: 12 } }}
          />
        </Stack>
      </Card>

      <Card p="lg" radius="md" withBorder shadow="xs">
        <Stack gap="md">
          <Text fw={700}>Sessões Concluídas por Semana</Text>
          <LineChart
            h={260}
            data={weeklySessionsData}
            dataKey="week"
            series={[{ name: 'sessoes', color: '#12B886' }]}
            tickLine="none"
            gridAxis="y"
            withLegend={false}
            strokeDasharray="4 4"
            curveType="natural"
            withDots
            yAxisProps={{ domain: [0, 10], ticks: [0, 2, 4, 6, 8, 10] }}
            xAxisProps={{ tick: { fill: '#ADB5BD', fontSize: 11 } }}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
