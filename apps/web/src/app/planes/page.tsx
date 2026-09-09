'use client';

import { useEffect, useState } from 'react';
import { api, money } from '@/lib/api';

type Plan = { _id: string; name: string; type: string; price: number; durationDays: number; sessionsPerMonth: number; features: string[]; description: string; active: boolean };
type FormState = Omit<Plan, '_id' | 'features'> & { featuresText: string };

const emptyForm: FormState = { name: '', type: 'PERSONALIZADO', price: 0, durationDays: 30, sessionsPerMonth: 8, featuresText: '', description: '', active: true };

export default function PlanesAdmin() {
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(storedUser);
    if (storedUser?.role === 'ADMIN') loadPlans();
  }, []);

  async function loadPlans() {
    try { setPlans(await api('/plans/all')); } catch (error: any) { setMessage(error.message || 'No se pudieron cargar los planes.'); }
  }

  function editPlan(plan: Plan) {
    setEditingId(plan._id);
    setForm({ ...plan, featuresText: (plan.features || []).join('\n') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() { setEditingId(null); setForm(emptyForm); }

  async function savePlan(event: React.FormEvent) {
    event.preventDefault();
    const payload = { ...form, price: Number(form.price), durationDays: Number(form.durationDays), sessionsPerMonth: Number(form.sessionsPerMonth), features: form.featuresText.split('\n').map(feature => feature.trim()).filter(Boolean) };
    try {
      if (editingId) await api(`/plans/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      else await api('/plans', { method: 'POST', body: JSON.stringify(payload) });
      setMessage(editingId ? 'Plan actualizado correctamente.' : 'Plan creado correctamente.');
      resetForm();
      loadPlans();
    } catch (error: any) { setMessage(error.message || 'No se pudo guardar el plan.'); }
  }

  if (!user) return <main className="dashboard"><div className="container"><h2>Gestión de planes</h2><p className="muted">Debes iniciar sesión como administrador.</p></div></main>;
  if (user.role !== 'ADMIN') return <main className="dashboard"><div className="container"><h2>Acceso restringido</h2><p className="muted">Solo un administrador puede gestionar los planes.</p></div></main>;

  return <main className="dashboard"><div className="container"><div className="kicker">Administración comercial</div><h2>Planes de entrenamiento</h2><p className="muted">Configura precios, modalidades, duración y contenido que verá el público en la página principal.</p>{message && <p className="muted">{message}</p>}<form className="card form" onSubmit={savePlan} style={{ margin: '28px 0' }}><div className="kicker">{editingId ? 'Editar plan' : 'Nuevo plan'}</div><div className="grid2"><div className="field"><label>Nombre</label><input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></div><div className="field"><label>Modalidad</label><select value={form.type} onChange={event => setForm({ ...form, type: event.target.value })}><option value="PERSONALIZADO">Personalizado</option><option value="SEMIPERSONALIZADO">Semipersonalizado</option><option value="GRUPAL">Grupal</option></select></div><div className="field"><label>Precio mensual (COP)</label><input required min="0" type="number" value={form.price} onChange={event => setForm({ ...form, price: Number(event.target.value) })} /></div><div className="field"><label>Sesiones al mes</label><input required min="1" type="number" value={form.sessionsPerMonth} onChange={event => setForm({ ...form, sessionsPerMonth: Number(event.target.value) })} /></div><div className="field"><label>Duración del plan (días)</label><input required min="1" type="number" value={form.durationDays} onChange={event => setForm({ ...form, durationDays: Number(event.target.value) })} /></div><div className="field"><label>Estado</label><select value={String(form.active)} onChange={event => setForm({ ...form, active: event.target.value === 'true' })}><option value="true">Activo y visible</option><option value="false">Inactivo y oculto</option></select></div></div><div className="field"><label>Descripción</label><textarea required rows={3} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></div><div className="field"><label>Características, una por línea</label><textarea rows={5} value={form.featuresText} onChange={event => setForm({ ...form, featuresText: event.target.value })} /></div><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><button className="btn" type="submit">{editingId ? 'Guardar cambios' : 'Crear plan'}</button>{editingId && <button className="btn secondary" type="button" onClick={resetForm}>Cancelar edición</button>}</div></form><div className="plans">{plans.map(plan => <article className="card" key={plan._id} style={{ opacity: plan.active ? 1 : .55 }}><div className="kicker">{plan.active ? 'Activo' : 'Inactivo'}</div><h3>{plan.name}</h3><p className="muted">{plan.description}</p><div className="price">{money(plan.price)} <small>/mes</small></div><p className="muted">{plan.sessionsPerMonth} sesiones · {plan.durationDays} días</p><ul className="features">{(plan.features || []).map(feature => <li key={feature}>{feature}</li>)}</ul><button className="btn secondary" type="button" onClick={() => editPlan(plan)} style={{ marginTop: 18 }}>Editar plan</button></article>)}</div></div></main>;
}
