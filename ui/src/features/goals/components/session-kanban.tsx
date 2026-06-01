import { Button } from "@mantine/core";
import { PlusIcon } from "@phosphor-icons/react/dist/icons/Plus";
import SessionCard from "./session-card";

export default function sessionKanban() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%'}}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <h2>Sessões</h2>
                <div>
                    <Button variant="outline" style={{ border: 'none'}} size="xs">
                        <PlusIcon size={16} />
                        <p style={{ marginLeft: '5px', fontWeight: 'normal'}}>
                            Adicionar
                        </p>
                    </Button>
                </div>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SessionCard />
                <SessionCard />
                <SessionCard />
            </div>
        </div>
    )
}