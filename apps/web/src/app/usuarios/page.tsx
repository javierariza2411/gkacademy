'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type AcademyUser = { _id: string; name: string; email: string; phone: string; role: string; active: boolean };
const emptyForm = { name: '', email: '', phone: '', role: 'COACH', password: '' };
const roleLabels: Record<string, string> = { ADMIN: 'Administrador', COACH: 'Profesor', STUDENT: 'Estudiante', CUSTOMER: 'Cliente' };

export default function UsuariosAdmin() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<AcademyUser[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(stored);
    if (stored?.role === 'ADMIN') loadUsers();
  }, []);

  async function loadUsers() {
    try { setUsers(await api('/users')); } catch (error: any) { setMessage(error.message || 'No se pudieron cargar los usuarios.'); }
  }

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api('/users', { method: 'POST', body: JSON.stringify(form) });
      setForm(emptyForm);
      setMessage(`${roleLabels[form.role]} creado correctamente.`);
      loadUsers();
    } catch (error: any) { setMessage(error.message || 'No se pudo crear el usuario.'); }
  }

  async function toggleUser(account: AcademyUser) {
    try { await api(`/users/${account._id}/status`, { method: 'PATCH', body: JSON.stringify({ active: !account.active }) }); loadUsers(); }
    catch (error: any) { setMessage(error.message || 'No se pudo actualizar el usuario.'); }
  }

  if (!user || user.role !== 'ADMIN') return <main className="dashboard"><div className="container"><h2>Acceso restringido</h2><p className="muted">Esta sección está disponible únicamente para administradores.</p></div></main>;

  return <main className="dashboard"><div className="container"><div className="kicker">Equipo y comunidad</div><h2>Usuarios de la academia</h2><p className="muted">Crea profesores y estudiantes desde un único lugar. No es necesario registrarlos manualmente en la base de datos.</p>{message && <p className="muted">{message}</p>}<div className="grid2" style={{ alignItems: 'start', marginTop: 28 }}><form className="card form" onSubmit={createUser}><div className="kicker">Alta controlada</div><h3>Crear usuario</h3><div className="field"><label>Tipo de usuario</label><select value={form.role} onChange={event => setForm({ ...form, role: event.target.value })}><option value="COACH">Profesor</option><option value="STUDENT">Estudiante</option></select></div><div className="field"><label>Nombre completo</label><input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></div><div className="field"><label>Correo</label><input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></div><div className="field"><label>Celular</label><input value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></div><div className="field"><label>Contraseña temporal</label><input required minLength={6} type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /></div><button className="btn" type="submit">Crear {form.role === 'COACH' ? 'profesor' : 'estudiante'}</button></form><section className="card"><div className="kicker">Directorio</div><h3>Personas registradas</h3><div style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Nombre</th><th>Correo</th><th>Perfil</th><th>Estado</th><th></th></tr></thead><tbody>{users.map(account => <tr key={account._id}><td><strong>{account.name}</strong><br /><span className="muted">{account.phone}</span></td><td>{account.email}</td><td><span className="badge">{roleLabels[account.role] || account.role}</span></td><td>{account.active ? 'Activo' : 'Inactivo'}</td><td><button className="btn secondary" type="button" onClick={() => toggleUser(account)}>{account.active ? 'Desactivar' : 'Activar'}</button></td></tr>)}</tbody></table></div></section></div></div></main>;
}
