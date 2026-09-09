'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = { name: string; role: string };

export default function Nav() {
	const [user, setUser] = useState<User | null>(null);
	const router = useRouter();

	useEffect(() => {
		const loadUser = () => {
			const storedUser = localStorage.getItem('user');
			setUser(storedUser ? JSON.parse(storedUser) : null);
		};

		loadUser();
		window.addEventListener('auth-change', loadUser);
		return () => window.removeEventListener('auth-change', loadUser);
	}, []);

	function logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		window.dispatchEvent(new Event('auth-change'));
		router.push('/');
	}

	const isAdmin = user?.role === 'ADMIN';
	return <header className={`nav ${isAdmin ? 'navAdmin' : ''}`}><div className="container navin"><Link className="brand" href={isAdmin ? '/dashboard' : '/'}>GK<span>{isAdmin ? 'CONTROL' : 'ACADEMY'}</span></Link>{isAdmin ? <><span className="adminLabel">PANEL ADMIN</span><nav className="links"><Link href="/dashboard">Resumen</Link><Link href="/planes">Planes</Link><Link href="/catalogo">Servicios</Link><Link href="/usuarios">Personas</Link></nav></> : <nav className="links"><Link href="/#planes">Planes</Link><Link href="/catalogo">Servicios</Link><Link href="/alquiler-arquero">Alquila un arquero</Link><Link href="/dashboard">Mi cuenta</Link></nav>}{user ? <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Link href="/dashboard" className="navUser">{isAdmin ? 'Administrador' : `Hola, ${user.name}`}</Link><button className="btn secondary" type="button" onClick={logout}>Cerrar sesión</button></div> : <Link className="btn secondary" href="/login">Ingresar</Link>}</div></header>;
}
