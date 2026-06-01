import { Group, Title } from "@mantine/core";
import CreateSessionModal from "./create-session-modal";
import SessionCard from "./session-card";

interface SessionKanbanProps {
  goalId: string;
}

export default function SessionKanban({ goalId }: SessionKanbanProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%'}}>
            <Group gap="sm" align="center">
                <Title order={3}>Sessões</Title>
                <CreateSessionModal goalId={goalId} />
            </Group>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SessionCard />
                <SessionCard />
                <SessionCard />
            </div>
        </div>
    )
}