import { Injectable } from '@angular/core';
import { animate, stagger, createTimeline, utils } from 'animejs';

/**
 * AnimationService — servicio central de Anime.js v4 para PetyZoos.
 * Ofrece animaciones reutilizables para todos los componentes.
 */
@Injectable({ providedIn: 'root' })
export class AnimationService {

  // ─────────────────────────────────────────────────────────────
  // ENTRADA DE PÁGINA (fade + slide up)
  // ─────────────────────────────────────────────────────────────
  pageEnter(selector: string, delay: number = 0): void {
    animate(selector, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 600,
      delay,
      ease: 'outCubic'
    });
  }

  // ─────────────────────────────────────────────────────────────
  // STAGGER — múltiples elementos en cascada
  // ─────────────────────────────────────────────────────────────
  staggerIn(selector: string, staggerMs: number = 80): void {
    animate(selector, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      delay: stagger(staggerMs, { start: 60 }),
      ease: 'outQuart'
    });
  }

  // ─────────────────────────────────────────────────────────────
  // COUNTER — número animado (count-up)
  // ─────────────────────────────────────────────────────────────
  countUp(element: HTMLElement, targetValue: number, duration: number = 1200): void {
    const obj = { value: 0 };
    animate(obj, {
      value: targetValue,
      duration,
      ease: 'outExpo',
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toString();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SCALE-IN — aparece con escala (cards, badges)
  // ─────────────────────────────────────────────────────────────
  scaleIn(selector: string, delay: number = 0): void {
    animate(selector, {
      opacity: [0, 1],
      scale: [0.88, 1],
      duration: 450,
      delay,
      ease: 'outBack(1.4)'
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SHAKE — feedback de error
  // ─────────────────────────────────────────────────────────────
  shake(selector: string): void {
    animate(selector, {
      translateX: [
        { to: -10, duration: 60 },
        { to: 10,  duration: 60 },
        { to: -8,  duration: 60 },
        { to: 8,   duration: 60 },
        { to: -4,  duration: 60 },
        { to: 0,   duration: 60 }
      ],
      ease: 'inOutSine'
    });
  }

  // ─────────────────────────────────────────────────────────────
  // PULSE — llamar atención (notificaciones, badges)
  // ─────────────────────────────────────────────────────────────
  pulse(selector: string): void {
    animate(selector, {
      scale: [1, 1.12, 1],
      duration: 400,
      ease: 'inOutQuad'
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SLIDE-IN FROM LEFT — sidebar / paneles laterales
  // ─────────────────────────────────────────────────────────────
  slideInLeft(selector: string, staggerMs: number = 60): void {
    animate(selector, {
      opacity: [0, 1],
      translateX: [-30, 0],
      duration: 500,
      delay: stagger(staggerMs, { start: 0 }),
      ease: 'outCubic'
    });
  }

  // ─────────────────────────────────────────────────────────────
  // MODAL ENTER — modal/dialogo aparece
  // ─────────────────────────────────────────────────────────────
  modalEnter(selector: string): void {
    animate(selector, {
      opacity: [0, 1],
      scale: [0.9, 1],
      translateY: [-16, 0],
      duration: 380,
      ease: 'outCubic'
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ROW STAGGER — filas de tabla en cascada
  // ─────────────────────────────────────────────────────────────
  tableRowsIn(selector: string): void {
    animate(selector, {
      opacity: [0, 1],
      translateX: [-16, 0],
      duration: 400,
      delay: stagger(40, { start: 80 }),
      ease: 'outQuart'
    });
  }

  // ─────────────────────────────────────────────────────────────
  // WELCOME BANNER — animación del banner de bienvenida
  // ─────────────────────────────────────────────────────────────
  welcomeBanner(bannerSel: string, contentSel: string, imgSel: string): void {
    const tl = createTimeline({});
    tl.add(bannerSel,  { opacity: [0, 1], duration: 400, ease: 'outCubic' })
      .add(contentSel, { opacity: [0, 1], translateY: [30, 0], duration: 600, ease: 'outCubic' }, 200)
      .add(imgSel,     { opacity: [0, 1], scale: [0.85, 1], duration: 700, ease: 'outCubic' }, 400);
  }
}
