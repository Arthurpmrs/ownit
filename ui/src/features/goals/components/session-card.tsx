import { CalendarIcon, ClockIcon } from "@phosphor-icons/react";

export default function sessionCard() {
  return (
    <div style={{ border: '1px solid #E8DFD6', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', width: '100%' }}>
      <h2 style={{ margin: '0'}}>Título da sessão de estudo</h2>
      <p style={{ margin: '0', color: '#868E96'}}>descrição da sessão de estudo</p>
      <div style={{ display: 'flex', gap: '20px'}}>
        <div style={{ display: 'flex', fontSize: '12px', color: '#868E96', alignItems: 'center', gap: '5px' }}>
            <CalendarIcon size={18} />
            <p>01/07/2026 - 31/08/2026</p>
        </div>
        <div style={{ display: 'flex', fontSize: '12px', color: '#868E96', alignItems: 'center', gap: '5px' }}>
            <ClockIcon size={18} />
            <p>X horas</p>
        </div>
      </div>
    </div>
  );
}