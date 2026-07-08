import { useEffect, useRef } from 'react';

const FLOATING_OBJECTS = [
  { id: 'book',       bgPos: '0% 0%',    dx: -60, dy: -45, dz: 120, rx: 22,  ry: -30, rz: 15,  scale: 1.1,  label: 'Book' },
  { id: 'pencil',     bgPos: '50% 0%',   dx: 55,  dy: -60, dz: 90,  rx: -18, ry: 25,  rz: -20, scale: 0.85, label: 'Pencil' },
  { id: 'cap',        bgPos: '100% 0%',  dx: -30, dy: 70,  dz: 140, rx: 30,  ry: 15,  rz: 10,  scale: 1.0,  label: 'Graduation cap' },
  { id: 'gear',       bgPos: '0% 50%',   dx: 70,  dy: 50,  dz: 110, rx: -25, ry: -20, rz: 18,  scale: 0.9,  label: 'Gear' },
  { id: 'robotic',    bgPos: '50% 50%',  dx: -80, dy: 10,  dz: 100, rx: 15,  ry: 35,  rz: -12, scale: 1.05, label: 'Robotic arm' },
  { id: 'circuit',    bgPos: '100% 50%', dx: 50,  dy: -35, dz: 130, rx: 45,  ry: -40, rz: 30,  scale: 0.95, label: 'Circuit board' },
  { id: 'gear2',      bgPos: '0% 100%',  dx: -55, dy: -70, dz: 80,  rx: -35, ry: 20,  rz: -25, scale: 0.8,  label: 'Gear 2' },
  { id: 'bolt',       bgPos: '100% 100%',dx: 35,  dy: 75,  dz: 95,  rx: 20,  ry: -35, rz: 22,  scale: 1.0,  label: 'Bolt' },
];

export const StickyNoteScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const initScene = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const stickyNote1 = container.querySelector<HTMLElement>('[data-note="1"]');
      const stickyNote2 = container.querySelector<HTMLElement>('[data-note="2"]');
      const pieces = container.querySelectorAll<HTMLElement>('[data-piece]');

      const ctx = gsap.context(() => {
        gsap.set(stickyNote1, { autoAlpha: 1, scale: 1, rotateY: 0, rotateX: 0, y: 0, rotateZ: 0 });
        gsap.set(stickyNote2, { autoAlpha: 0, scale: 0.6, y: 30 });
        gsap.set(pieces, { autoAlpha: 0, scale: 0, x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, rotateZ: 0 });

        // Idle float animation on note 1
        const floatAnim = gsap.to(stickyNote1, {
          y: -12,
          rotateZ: 3,
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          paused: false,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '+=260%',
            scrub: 1.2,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              // Kill float anim once scroll starts
              if (self.progress > 0.02) floatAnim.pause();
              else floatAnim.resume();
            },
          },
        });

        // Phase 1 (0-15%): tension build
        tl.to(stickyNote1, { rotateZ: 8, rotateX: 5, scale: 1.06, duration: 0.15, ease: 'power1.inOut' }, 0);

        // Phase 2 (15-65%): explosion
        tl.to(stickyNote1, { autoAlpha: 0, scale: 0.2, rotateZ: 45, rotateY: 90, duration: 0.12, ease: 'power4.in' }, 0.15);

        const isMobile = window.innerWidth < 768;
        const mf = isMobile ? 0.4 : 1;

        pieces.forEach((piece, i) => {
          const obj = FLOATING_OBJECTS[i % FLOATING_OBJECTS.length];
          tl.to(piece, {
            autoAlpha: 1,
            scale: obj.scale,
            x: `${obj.dx * mf}%`,
            y: `${obj.dy * mf}%`,
            z: obj.dz * mf,
            rotateX: obj.rx,
            rotateY: obj.ry,
            rotateZ: obj.rz,
            duration: 0.48,
            ease: 'power3.out',
          }, 0.15 + i * 0.022);
        });

        // Phase 3 (65-85%): converge
        pieces.forEach((piece, i) => {
          tl.to(piece, {
            x: 0, y: 0, z: 0,
            rotateX: 0, rotateY: 0, rotateZ: 0,
            scale: 0,
            autoAlpha: 0,
            duration: 0.18,
            ease: 'power3.in',
          }, 0.66 + i * 0.01);
        });

        // Phase 4 (85-100%): note 2 assembles
        tl.to(stickyNote2, {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          rotateY: 720,
          duration: 0.22,
          ease: 'back.out(1.5)',
        }, 0.82);
      }, container);

      cleanup = () => ctx.revert();
    };

    void initScene().catch(console.error);
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <img
          src="/assets/3d/sticky_note_whole.jpg"
          alt="Study note"
          className="w-44 h-auto drop-shadow-2xl"
        />
        <div className="flex gap-3 flex-wrap justify-center max-w-sm">
          {FLOATING_OBJECTS.slice(0, 6).map((obj) => (
            <div
              key={obj.id}
              className="scene-piece-sprite opacity-75"
              aria-label={obj.label}
              style={{
                backgroundImage: 'url(/assets/3d/floating_elements_sheet.jpg)',
                backgroundSize: '300% 300%',
                backgroundPosition: obj.bgPos,
                backgroundRepeat: 'no-repeat',
              }}
            />
          ))}
        </div>
        <p className="text-center font-semibold text-slate-700 dark:text-slate-200">Ready to master your syllabus?</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="scene-scroll-container"
      aria-label="Interactive scroll experience"
    >
      <div className="scene-sticky-wrapper">
        <div className="scene-perspective">
          {/* Initial sticky note */}
          <div data-note="1" className="scene-note">
            <img
              src="/assets/3d/sticky_note_whole.jpg"
              alt="Study sticky note"
              className="scene-note-img"
            />
          </div>

          {/* Reassembled sticky note */}
          <div data-note="2" className="scene-note">
            <img
              src="/assets/3d/sticky_note_reassembled.jpg"
              alt="Assembled sticky note"
              className="scene-note-img"
            />
            <div className="scene-note-text">
              <p className="text-lg font-bold text-violet-700 dark:text-violet-200">Ready to master your syllabus?</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Aide turns any material into an exam-ready toolkit.</p>
            </div>
          </div>

          {/* Floating explosion pieces */}
          {FLOATING_OBJECTS.map((obj) => (
            <div
              key={obj.id}
              data-piece
              className="scene-piece"
            >
              <div
                className="scene-piece-sprite"
                aria-label={obj.label}
                style={{
                  backgroundImage: 'url(/assets/3d/floating_elements_sheet.jpg)',
                  backgroundSize: '300% 300%',
                  backgroundPosition: obj.bgPos,
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StickyNoteScene;
