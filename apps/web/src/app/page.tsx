'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, money } from '@/lib/api';

const fallback = [
  { _id: 'grupal', name: 'Plan Grupal', price: 120000, description: 'Entrenamiento técnico en grupo.', features: ['2 sesiones por semana', 'Trabajo técnico grupal', 'Seguimiento mensual'] },
  { _id: 'semi', name: 'Plan Semipersonalizado', price: 190000, description: 'Atención cercana en grupos reducidos.', features: ['Grupos reducidos', 'Correcciones individuales', 'Plan de progreso'] },
  { _id: 'personal', name: 'Plan Personalizado', price: 320000, description: 'Entrenamiento 1 a 1.', features: ['Entrenamiento individual', 'Plan específico', 'Seguimiento prioritario'] },
];

const steps = [
  { number: '01', title: 'Solicita', text: 'Cuéntanos cuándo y dónde juegas.' },
  { number: '02', title: 'Validamos', text: 'Revisamos disponibilidad y detalles.' },
  { number: '03', title: 'Confirma', text: 'Recibe la asignación y el valor.' },
  { number: '04', title: 'Juega', text: 'Disfruta el partido con respaldo.' },
];

export default function Home() {
  const [plans, setPlans] = useState<any[]>(fallback);
  useEffect(() => { api('/plans').then(setPlans).catch(() => {}); }, []);

  return <>
    <main>
      <section className="hero">
        <div className="heroGlow" />
        <div className="container heroGrid">
          <div className="heroCopy">
            <div className="eyebrow"><span /> Academia especializada de arqueros</div>
            <h1>Defiende más.<br /><em>Llega más lejos.</em></h1>
            <p>Entrenamiento especializado para arqueros que quieren dominar la técnica, ganar confianza y competir a otro nivel.</p>
            <div className="heroActions"><a className="btn" href="#planes">Ver planes <span>↗</span></a><Link className="btn secondary" href="/alquiler-arquero">Alquilar un arquero</Link></div>
            <div className="heroProof"><span className="proofMark">GK</span><span>Entrenamiento con propósito<br /><small>Metodología · Seguimiento · Comunidad</small></span></div>
          </div>
          <div className="heroVisual" aria-label="Espacio preparado para fotografía de un arquero entrenando"><div className="imagePlaceholder"><span className="placeholderLine" /><span>GK / TRAINING<br /><small>Espacio para fotografía deportiva</small></span></div><div className="visualLabel"><strong>01</strong><span>La posición<br />más exigente</span></div></div>
        </div>
        <div className="heroBottom"><div className="container heroStats"><span><strong>01</strong> Técnica aplicada</span><span><strong>02</strong> Preparación específica</span><span><strong>03</strong> Progreso medible</span></div></div>
      </section>

      <section className="section plansSection" id="planes"><div className="container"><div className="sectionHeading"><div><div className="eyebrow dark"><span /> Elige tu nivel de acompañamiento</div><h2>Planes para<br /><em>cada arquero.</em></h2></div><p className="sectionIntro">Una ruta clara para entrenar con intención. Valores y modalidades configurables desde el panel administrativo.</p></div><div className="plans premiumPlans">{plans.map((plan, index) => <article className={`card planCard ${index === 1 ? 'featured' : ''}`} key={plan._id}>{index === 1 && <div className="recommended">Más elegido</div>}<div className="planTop"><span className="planIndex">0{index + 1}</span><span className="planType">{index === 1 ? 'RECOMENDADO' : 'ENTRENAMIENTO'}</span></div><h3>{plan.name}</h3><p className="muted">{plan.description}</p><div className="price">{money(plan.price)}<small>/mes</small></div><ul className="features">{(plan.features || []).map((feature: string) => <li key={feature}>{feature}</li>)}</ul><Link className="btn planButton" href={`/checkout/${plan._id}`}>Elegir plan <span>↗</span></Link></article>)}</div></div></section>

      <section className="rentalSection"><div className="container rentalGrid"><div className="rentalVisual" aria-label="Espacio preparado para fotografía del servicio de alquiler"><div className="rentalPlaceholder"><span>GK / MATCHDAY</span><small>Espacio para fotografía</small></div></div><div className="rentalCopy"><div className="eyebrow"><span /> Servicio por partido</div><h2>Tu partido.<br /><em>Tu arquero.</em></h2><p>¿Tienen partido y les falta arquero? Envía los detalles, nosotros revisamos disponibilidad y te acompañamos hasta el pitazo inicial.</p><Link className="btn" href="/alquiler-arquero">Solicitar un arquero <span>↗</span></Link></div></div><div className="container steps"><div className="stepIntro"><span>EL PROCESO</span><strong>Simple y directo.</strong></div>{steps.map(step => <div className="step" key={step.number}><span className="stepNumber">{step.number}</span><strong>{step.title}</strong><p>{step.text}</p></div>)}</div></section>
    </main>
  </>;
}
