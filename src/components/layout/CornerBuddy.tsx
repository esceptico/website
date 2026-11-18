'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

// Bottom-right corner of the index and log pages.
// A text face that watches the pointer and follows Tim's local day:
// it sleeps while it is night in Los Angeles, until someone clicks it awake.
//
// The face is one of a fixed set of moods. A "resting" mood comes from the
// world (night, idle pointer, pointer close by). A "reaction" is a short
// mood on a timer that covers the resting mood and then expires.
//
// Now and then he puts headphones on. While he listens, a small level meter
// shows beside him; it is the site's only link to /tape, on purpose a hint.

type Mood =
  | 'idle' // watching the pointer
  | 'near' // pointer is close
  | 'dozing' // pointer has not moved for a while
  | 'asleep' // night in Los Angeles
  | 'happy' // clicked once or twice
  | 'annoyed' // clicked too much
  | 'fleeing' // clicked far too much: moving away
  | 'wary' // just fled, keeping an eye on you
  | 'startled'; // woken from a doze, or clicked awake at night

type Face = { eye: string; mouth: string; tracks?: boolean; tail?: string; note?: string };

const FACES: Record<Mood, Face> = {
  idle: { eye: '•', mouth: '_', tracks: true },
  near: { eye: '°', mouth: 'o', tracks: true },
  dozing: { eye: '–', mouth: '_', tail: ' z' },
  asleep: { eye: '–', mouth: '_', tail: ' zzz' },
  happy: { eye: '^', mouth: '▽', note: 'hi' },
  annoyed: { eye: '¬', mouth: '_', note: 'hey' },
  fleeing: { eye: '>', mouth: '_' },
  wary: { eye: '•', mouth: '_', tracks: true, tail: ';' },
  startled: { eye: '°', mouth: '□' },
};

const NEAR_PX = 90;
const DOZE_AFTER_MS = 25_000;
const CLICK_WINDOW_MS = 2500; // clicks closer together than this add up
const ANNOYED_AT = 3;
const FLEE_AT = 5;
const GO_HOME_AFTER_MS = 12_000;
const BACK_TO_SLEEP_MS = 60_000; // at night, after the last click
const LISTEN_FIRST_MS = 5000;
const LISTEN_FOR_MS = 20_000;
const LISTEN_EVERY_MS = 50_000;

function laHour(): number {
  const h = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'America/Los_Angeles',
  }).format(new Date());
  return Number(h) % 24;
}

export default function CornerBuddy() {
  const ref = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  // Resting inputs
  const [night, setNight] = useState(false);
  const [woken, setWoken] = useState(false); // clicked awake during the night
  const asleep = night && !woken;
  const [dozing, setDozing] = useState(false);
  const [near, setNear] = useState(false);
  // Reaction on a timer
  const [reaction, setReaction] = useState<Mood | null>(null);
  const reactionTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [offset, setOffset] = useState(0); // px moved left of home after fleeing

  const react = useCallback((mood: Mood, ms: number, then?: () => void) => {
    clearTimeout(reactionTimer.current);
    setReaction(mood);
    reactionTimer.current = setTimeout(() => {
      setReaction(null);
      then?.();
    }, ms);
  }, []);
  useEffect(() => () => clearTimeout(reactionTimer.current), []);

  const mood: Mood = reaction ?? (asleep ? 'asleep' : dozing ? 'dozing' : near ? 'near' : 'idle');
  const face = FACES[mood];

  // Headphones go on a few seconds after load, then come back now and then.
  const [listening, setListening] = useState(false);
  useEffect(() => {
    if (asleep) return;
    let off: ReturnType<typeof setTimeout>;
    const on = () => {
      setListening(true);
      off = setTimeout(() => setListening(false), LISTEN_FOR_MS);
    };
    const first = setTimeout(on, LISTEN_FIRST_MS);
    const again = setInterval(on, LISTEN_EVERY_MS);
    return () => {
      clearTimeout(first);
      clearTimeout(off);
      clearInterval(again);
      setListening(false);
    };
  }, [asleep]);

  // Night in Los Angeles
  useEffect(() => {
    const update = () => setNight(laHour() < 7);
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, []);

  // Pointer: where to look, how close, and when it last moved
  const pointer = useRef({ movedAt: 0 });
  useEffect(() => {
    if (asleep) return;
    pointer.current.movedAt = performance.now();

    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      pointer.current.movedAt = performance.now();
      setDozing((was) => {
        if (was) react('startled', 700);
        return false;
      });

      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      // Pupils move at most 2px toward the pointer.
      setLook({ x: (dx / d) * 2, y: (dy / d) * 2 });
      setNear(d < NEAR_PX);
    };

    const idle = setInterval(() => {
      if (performance.now() - pointer.current.movedAt > DOZE_AFTER_MS) setDozing(true);
    }, 1000);

    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      clearInterval(idle);
    };
  }, [asleep, react]);

  // Blink while the eyes are open and following
  useEffect(() => {
    if (!face.tracks) return;
    let next: ReturnType<typeof setTimeout>;
    let open: ReturnType<typeof setTimeout>;
    const schedule = () => {
      next = setTimeout(() => {
        setBlink(true);
        open = setTimeout(() => setBlink(false), 130);
        schedule();
      }, 2500 + Math.random() * 4000);
    };
    schedule();
    return () => {
      clearTimeout(next);
      clearTimeout(open);
      setBlink(false);
    };
  }, [face.tracks]);

  // Clicks add up: hi, hi, hey, hey, then he leaves.
  const clicks = useRef<number[]>([]);
  const homeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(homeTimer.current), []);

  // At night a click wakes him; he goes back to sleep a minute after the last click.
  const sleepTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(sleepTimer.current), []);

  const poke = () => {
    if (night) {
      clearTimeout(sleepTimer.current);
      sleepTimer.current = setTimeout(() => setWoken(false), BACK_TO_SLEEP_MS);
      if (!woken) {
        setWoken(true);
        react('startled', 700);
        return;
      }
    }
    const now = performance.now();
    clicks.current = [...clicks.current.filter((t) => now - t < CLICK_WINDOW_MS), now];
    const n = clicks.current.length;

    if (n >= FLEE_AT && !reduceMotion) {
      clicks.current = [];
      const room = Math.max(160, window.innerWidth - 260);
      // Pick a spot at least 200px from where he is now.
      let to = offset;
      while (Math.abs(to - offset) < Math.min(200, room / 2)) to = Math.random() * room;
      setOffset(to);
      react('fleeing', 700, () => react('wary', 2500));
      clearTimeout(homeTimer.current);
      homeTimer.current = setTimeout(() => setOffset(0), GO_HOME_AFTER_MS);
    } else if (n >= ANNOYED_AT) {
      react('annoyed', 1400);
    } else {
      react('happy', 1200);
    }
  };

  const eye = blink && face.tracks ? '–' : face.eye;
  const eyeStyle = face.tracks ? { transform: `translate(${look.x}px, ${look.y}px)` } : undefined;
  const eyeClass = 'inline-block transition-transform duration-100';

  return (
    <motion.div
      animate={{ x: -offset }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="fixed bottom-4 right-5 hidden md:flex items-baseline gap-3 select-none z-40 font-mono text-[var(--theme-text-muted)]"
    >
      {listening && (
        <Link href="/tape" aria-label="tape" title="tape" className="live-bars self-center">
          <i /><i /><i /><i /><i />
        </Link>
      )}
      <button
        ref={ref}
        type="button"
        onClick={poke}
        tabIndex={-1}
        aria-hidden="true"
        className="flex items-baseline gap-2 text-[13px] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer"
      >
      <span className="text-[10px] tracking-wider">{face.note}</span>
      <span className="whitespace-pre">
        {listening && 'd'}(<span className={eyeClass} style={eyeStyle}>{eye}</span>
        {face.mouth}
        <span className={eyeClass} style={eyeStyle}>{eye}</span>){listening && 'b'}
        {face.tail && <span className="text-[10px]">{face.tail}</span>}
      </span>
      </button>
    </motion.div>
  );
}
