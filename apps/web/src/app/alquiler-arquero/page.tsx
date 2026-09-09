'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Rental = { _id: string; date: string; time: string; location: string; status: string; assignedGoalkeeper?: string; matchType: string };
type FormState = { name: string; phone: string; date: string; time: string; durationMinutes: number; location: string; matchType: string; notes: string };

const initialForm: FormState = { name: '', phone: '', date: '', time: '', durationMinutes: 90, location: '', matchType: 'Fútbol 11', notes: '' };
const statusLabels: Record<string, string> = { PENDING: 'Recibida', CONTACTED: 'En revisión', CONFIRMED: 'Arquero asignado', REJECTED: 'No disponible', COMPLETED: 'Realizada', CANCELLED: 'Cancelada' };

export default function Rental() {
  const [form, setForm] = useState(initialForm);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return;
    setForm(current => ({ ...current, name: user.name || '', phone: user.phone || '' }));
    api('/rentals/me').then(setRentals).catch(() => {});
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const created = await api('/rentals', { method: 'POST', body: JSON.stringify(form) });
      setRentals(current => [created, ...current]);
      setMessage('Solicitud recibida. Podrás consultar aquí cuando la academia asigne un arquero.');
      setForm(current => ({ ...initialForm, name: current.name, phone: current.phone }));
    } catch (error: any) { setMessage(error.message || 'No se pudo enviar la solicitud.'); }
  }

  return <main className="section"><div className="container rental"><div><div className="kicker">Servicio por partido</div><h2>Solicita un arquero</h2><p className="muted">No cobramos antes de confirmar disponibilidad. La academia revisará tu solicitud y aquí podrás ver si ya tienes un arquero asignado.</p>{rentals.length > 0 && <section className="card" style={{ marginTop: 28 }}><div className="kicker">Seguimiento</div><h3>Mis solicitudes</h3>{rentals.map(rental => <article key={rental._id} style={{ borderTop: '1px solid var(--line)', padding: '16px 0' }}><strong>{rental.date} · {rental.time}</strong><p className="muted" style={{ margin: '4px 0' }}>{rental.location} · {rental.matchType}</p><span className="badge">{statusLabels[rental.status] || rental.status}</span>{rental.assignedGoalkeeper && <p style={{ margin: '8px 0 0' }}><strong>Arquero asignado:</strong> {rental.assignedGoalkeeper}</p>}</article>)}</section>}</div><form className="card form" onSubmit={submit}><div className="grid2"><div className="field"><label>Nombre</label><input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></div><div className="field"><label>Celular</label><input required value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></div><div className="field"><label>Fecha</label><input type="date" required value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} /></div><div className="field"><label>Hora</label><input type="time" required value={form.time} onChange={event => setForm({ ...form, time: event.target.value })} /></div></div><div className="field"><label>Ubicación / cancha</label><input required value={form.location} onChange={event => setForm({ ...form, location: event.target.value })} /></div><div className="grid2"><div className="field"><label>Tipo de partido</label><select value={form.matchType} onChange={event => setForm({ ...form, matchType: event.target.value })}><option>Fútbol 11</option><option>Fútbol 7</option><option>Fútbol 5</option></select></div><div className="field"><label>Duración</label><select value={form.durationMinutes} onChange={event => setForm({ ...form, durationMinutes: Number(event.target.value) })}><option value={60}>60 min</option><option value={90}>90 min</option><option value={120}>120 min</option></select></div></div><div className="field"><label>Notas</label><textarea rows={3} value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></div>{message && <p className="muted">{message}</p>}<button className="btn" type="submit">Enviar solicitud</button></form></div></main>;
}
