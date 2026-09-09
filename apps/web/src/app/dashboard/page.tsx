'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, money } from '@/lib/api';

type User = { name: string; role: string };
type Rental = { _id: string; name: string; phone: string; date: string; time: string; location: string; status: string; assignedGoalkeeper?: string; matchType?: string; durationMinutes?: number };
type AcademyUser = { _id: string; name: string; email: string; role: string };
type Session = { _id: string; date: string; time: string; durationMinutes: number; location: string; status: string; studentId?: { name: string }; coachId?: { name: string } };
type Payment = { _id: string; amount: number; paymentMethod: string; status: string; concept: string; userId?: { name: string }; createdAt: string };

const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
const statusLabels: Record<string, string> = { PENDING: 'Pendiente', CONTACTED: 'En revisión', CONFIRMED: 'Confirmada', COMPLETED: 'Realizada', CANCELLED: 'Cancelada', REJECTED: 'No disponible', SCHEDULED: 'Programada' };
const statusClass: Record<string, string> = { PENDING: 'statusPending', CONFIRMED: 'statusConfirmed', COMPLETED: 'statusCompleted', CANCELLED: 'statusCancelled', REJECTED: 'statusCancelled', CONTACTED: 'statusContacted', SCHEDULED: 'statusConfirmed' };

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [message, setMessage] = useState('');
  const [weeklySessions, setWeeklySessions] = useState<Session[]>([]);
  const [academyUsers, setAcademyUsers] = useState<AcademyUser[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessionForm, setSessionForm] = useState({ studentId: '', coachId: '', date: '', time: '', durationMinutes: 60, location: '' });
  const [cashForm, setCashForm] = useState({ userId: '', amount: '', concept: '' });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(storedUser);
    if (!storedUser) return;

    api('/subscriptions/me').then(setSubscriptions).catch(() => {});
    if (storedUser.role === 'ADMIN' || storedUser.role === 'COACH') api('/rentals').then(setRentals).catch(() => {});
    if (storedUser.role === 'ADMIN') {
      api('/dashboard/summary').then(setSummary).catch(() => {});
      api('/dashboard/weekly').then(setWeeklySessions).catch(() => {});
      api('/users').then(setAcademyUsers).catch(() => {});
      api('/payments').then(setPayments).catch(() => {});
    }
  }, []);

  const students = academyUsers.filter(academyUser => academyUser.role === 'STUDENT');
  const coaches = academyUsers.filter(academyUser => academyUser.role === 'COACH');

  async function createSession(event: React.FormEvent) {
    event.preventDefault();
    try {
      const created = await api('/sessions', { method: 'POST', body: JSON.stringify({ ...sessionForm, durationMinutes: Number(sessionForm.durationMinutes) }) });
      setWeeklySessions(current => [...current, created].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));
      setMessage('Sesión asignada correctamente.');
    } catch (error: any) { setMessage(error.message || 'No se pudo crear la sesión.'); }
  }

  async function registerCash(event: React.FormEvent) {
    event.preventDefault();
    try {
      const created = await api('/payments/cash', { method: 'POST', body: JSON.stringify({ ...cashForm, amount: Number(cashForm.amount) }) });
      setPayments(current => [created, ...current]);
      setCashForm({ userId: '', amount: '', concept: '' });
      setMessage('Pago en efectivo registrado.');
    } catch (error: any) { setMessage(error.message || 'No se pudo registrar el pago.'); }
  }

  const filteredRentals = useMemo(() => statusFilter === 'ALL' ? rentals : rentals.filter(rental => rental.status === statusFilter), [rentals, statusFilter]);

  async function updateRental(id: string, changes: Record<string, string>) {
    try {
      const updated = await api(`/rentals/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
      setRentals(current => current.map(rental => rental._id === id ? updated : rental));
      setMessage('Solicitud actualizada correctamente.');
    } catch (error: any) {
      setMessage(error.message || 'No se pudo actualizar la solicitud.');
    }
  }

  if (!user) return <section className="section"><div className="container"><h2>Tu cuenta</h2><p className="muted">Debes iniciar sesión para ver el dashboard.</p><Link className="btn" href="/login">Ingresar</Link></div></section>;

  if (user.role === 'ADMIN' || user.role === 'COACH') return <main className="dashboard"><div className="container">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 28 }}><div><div className="kicker">Administración</div><h2>Panel de la academia</h2><p className="muted">Hola, {user.name}. Gestiona la operación diaria desde aquí.</p></div><span className="badge">{user.role === 'ADMIN' ? 'Administrador' : 'Coach'}</span></div>
    {user.role === 'ADMIN' && <div className="stats" style={{ margin: '0 0 28px' }}><div className="stat"><span className="muted">Alumnos activos</span><b>{summary?.activeStudents ?? '—'}</b></div><div className="stat"><span className="muted">Suscripciones</span><b>{summary?.activeSubscriptions ?? '—'}</b></div><div className="stat"><span className="muted">Solicitudes pendientes</span><b>{summary?.pendingRentals ?? '—'}</b></div><div className="stat"><span className="muted">Ingresos</span><b>{summary ? money(summary.revenue) : '—'}</b></div></div>}
    {user.role === 'ADMIN' && <div className="plans" style={{ margin: '0 0 36px' }}><Link className="card" href="/planes"><strong>Planes</strong><span className="muted">Crea y modifica precios, sesiones y modalidades.</span></Link><Link className="card" href="/catalogo"><strong>Servicios</strong><span className="muted">Administra el catálogo.</span></Link><Link className="card" href="/alquiler-arquero"><strong>Solicitar arquero</strong><span className="muted">Ver el formulario público.</span></Link></div>}
    {user.role === 'ADMIN' && <><section className="card" style={{ marginBottom: 28 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, marginBottom: 18 }}><div><div className="kicker">Agenda semanal</div><h3>Entrenamientos y asignaciones</h3></div><span className="badge">{weeklySessions.length} sesiones</span></div><div style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Fecha</th><th>Estudiante</th><th>Profesor</th><th>Lugar</th><th>Estado</th></tr></thead><tbody>{weeklySessions.length ? weeklySessions.map(session => <tr key={session._id}><td>{session.date}<br /><span className="muted">{session.time} · {session.durationMinutes} min</span></td><td>{session.studentId?.name || 'Sin asignar'}</td><td>{session.coachId?.name || 'Sin asignar'}</td><td>{session.location || 'Por definir'}</td><td><span className={`statusPill ${statusClass[session.status] || ''}`}>{statusLabels[session.status] || session.status}</span></td></tr>) : <tr><td colSpan={5} className="muted">No hay entrenamientos registrados esta semana.</td></tr>}</tbody></table></div></section>
      <div className="grid2" style={{ alignItems: 'start', marginBottom: 28 }}><form className="card form" onSubmit={createSession}><div className="kicker">Nueva asignación</div><h3>Programar entrenamiento</h3><div className="field"><label>Estudiante</label><select required value={sessionForm.studentId} onChange={event => setSessionForm({ ...sessionForm, studentId: event.target.value })}><option value="">Selecciona un estudiante</option>{students.map(student => <option key={student._id} value={student._id}>{student.name}</option>)}</select></div><div className="field"><label>Profesor</label><select required value={sessionForm.coachId} onChange={event => setSessionForm({ ...sessionForm, coachId: event.target.value })}><option value="">Selecciona un profesor</option>{coaches.map(coach => <option key={coach._id} value={coach._id}>{coach.name}</option>)}</select></div><div className="grid2"><div className="field"><label>Fecha</label><input required type="date" value={sessionForm.date} onChange={event => setSessionForm({ ...sessionForm, date: event.target.value })} /></div><div className="field"><label>Hora</label><input required type="time" value={sessionForm.time} onChange={event => setSessionForm({ ...sessionForm, time: event.target.value })} /></div></div><div className="grid2"><div className="field"><label>Duración</label><input required type="number" min="30" value={sessionForm.durationMinutes} onChange={event => setSessionForm({ ...sessionForm, durationMinutes: Number(event.target.value) })} /></div><div className="field"><label>Lugar</label><input value={sessionForm.location} onChange={event => setSessionForm({ ...sessionForm, location: event.target.value })} /></div></div><button className="btn" type="submit">Asignar sesión</button></form><form className="card form" onSubmit={registerCash}><div className="kicker">Caja</div><h3>Registrar pago en efectivo</h3><div className="field"><label>Estudiante</label><select required value={cashForm.userId} onChange={event => setCashForm({ ...cashForm, userId: event.target.value })}><option value="">Selecciona un estudiante</option>{students.map(student => <option key={student._id} value={student._id}>{student.name}</option>)}</select></div><div className="field"><label>Valor (COP)</label><input required type="number" min="1" value={cashForm.amount} onChange={event => setCashForm({ ...cashForm, amount: event.target.value })} /></div><div className="field"><label>Concepto</label><input required value={cashForm.concept} onChange={event => setCashForm({ ...cashForm, concept: event.target.value })} placeholder="Ej. Plan mensual" /></div><button className="btn" type="submit">Registrar efectivo</button></form></div>
      <section className="card" style={{ marginBottom: 28 }}><div className="kicker">Ingresos</div><h3>Pagos recientes</h3><div style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Fecha</th><th>Estudiante</th><th>Concepto</th><th>Método</th><th>Valor</th></tr></thead><tbody>{payments.slice(0, 10).map(payment => <tr key={payment._id}><td>{new Date(payment.createdAt).toLocaleDateString('es-CO')}</td><td>{payment.userId?.name || 'Usuario'}</td><td>{payment.concept || 'Plan'}</td><td><span className={`statusPill ${payment.paymentMethod === 'CASH' ? 'statusCash' : 'statusOnline'}`}>{payment.paymentMethod === 'CASH' ? 'Efectivo' : 'Online'}</span></td><td>{money(payment.amount)}</td></tr>)}</tbody></table></div></section></>}
    <section className="card"><div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}><div><div className="kicker">Seguimiento</div><h3>Solicitudes de arqueros</h3></div><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filtrar solicitudes por estado"><option value="ALL">Todos los estados</option>{statuses.map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></div>{message && <p className="muted">{message}</p>}<div style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Cliente</th><th>Fecha</th><th>Lugar</th><th>Partido</th><th>Arquero asignado</th><th>Estado</th></tr></thead><tbody>{filteredRentals.length ? filteredRentals.map(rental => <tr key={rental._id}><td><strong>{rental.name}</strong><br /><span className="muted">{rental.phone}</span></td><td>{rental.date}<br /><span className="muted">{rental.time}</span></td><td>{rental.location}</td><td>{rental.matchType || 'Fútbol'}<br /><span className="muted">{rental.durationMinutes || 90} min</span></td><td><input defaultValue={rental.assignedGoalkeeper || ''} placeholder="Nombre del arquero" onBlur={event => { if (event.target.value !== (rental.assignedGoalkeeper || '')) updateRental(rental._id, { assignedGoalkeeper: event.target.value }); }} aria-label={`Arquero asignado a ${rental.name}`} /></td><td><select value={rental.status} onChange={event => updateRental(rental._id, { status: event.target.value })} aria-label={`Cambiar estado de solicitud de ${rental.name}`}>{statuses.map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}</select><div style={{ marginTop: 6 }}><span className={`statusPill ${statusClass[rental.status] || ''}`}>{statusLabels[rental.status] || rental.status}</span></div></td></tr>) : <tr><td colSpan={6} className="muted">No hay solicitudes con este filtro.</td></tr>}</tbody></table></div></section>
  </div></main>;

  return <main className="dashboard"><div className="container"><div className="kicker">Mi cuenta</div><h2>Hola, {user.name}</h2><p className="muted">Consulta tus planes y mantén tu entrenamiento activo.</p><section className="card"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16 }}><div><div className="kicker">Tu entrenamiento</div><h3>Mis planes</h3></div><Link className="btn" href="/#planes">Ver planes</Link></div>{subscriptions.length ? <div className="plans">{subscriptions.map(subscription => <article className="card" key={subscription._id}><div className="kicker">Suscripción</div><h3>{subscription.plan?.name || subscription.planName || 'Plan de entrenamiento'}</h3><p className="muted">Estado: {subscription.status}</p></article>)}</div> : <p className="muted">Aún no tienes un plan activo.</p>}</section></div></main>;
}
