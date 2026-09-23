import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { teachingRegistry } from '@node-wars/shared';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

// The 150-minute seminar schedule template
const SEMINAR_SCHEDULE = [
  { time: '0–5', task: 'Introduction / Node Lab briefing' },
  { time: '5–15', task: 'Mission 01 — First Server' },
  { time: '15–30', task: 'Mission 02 — Smart Door' },
  { time: '30–45', task: 'Mission 03 — Security Gate' },
  { time: '45–60', task: 'Mission 04 — Resource Vault' },
  { time: '60–72', task: 'Mission 05 — Async Operations' },
  { time: '72–87', task: 'Mission 06 — Live Security Monitor' },
  { time: '87–100', task: 'Mission 07 — Break It' },
  { time: '100–115', task: 'Official Quiz' },
  { time: '115–120', task: 'Results / transition' }
];

const CHECKLIST = [
  'Backend running',
  'Frontend running',
  'Database available',
  'Demo account verified',
  'Student accounts ready',
  'Missions 01–07 available',
  'Quiz available',
  'Display/projector tested'
];

const InstructorMode = () => {
  const { user } = useOutletContext<{ user?: { role?: string } }>();
  const [selectedMissionIndex, setSelectedMissionIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Extract ordered missions
  const missions = Object.values(teachingRegistry)
    .sort((a, b) => a.missionId.localeCompare(b.missionId));

  const currentMission = missions[selectedMissionIndex];
  const guide = currentMission?.instructorGuide;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // Authorization Check
  if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="clay-panel p-8 text-center" style={{ color: '#c14d72' }}>
          Instructor access required.
        </div>
      </div>
    );
  }

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    if (timerSeconds === 0 && guide) {
      setTimerSeconds(guide.durationMinutes * 60);
    }
    setTimerActive(true);
  };

  const handlePauseTimer = () => setTimerActive(false);

  const handleResetTimer = () => {
    setTimerActive(false);
    if (guide) setTimerSeconds(guide.durationMinutes * 60);
    else setTimerSeconds(0);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] -mt-6 p-6 max-w-[1920px] mx-auto z-10 relative animate-slide-in overflow-hidden">
      <header className="glass-panel shrink-0 p-4 flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Instructor mode</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Live seminar guidance</p>
        </div>

        {/* Timer UI */}
        <div className="flex items-center gap-4 clay-inset px-4 py-2 rounded-2xl">
          <div className="text-2xl font-display font-bold w-24 text-center" style={{ color: 'var(--text-primary)' }}>
            {formatTime(timerSeconds)}
          </div>
          <div className="flex gap-2">
            {!timerActive ? (
              <button data-testid="timer-start" onClick={handleStartTimer} className="clay-button px-3 py-1.5 text-xs flex items-center gap-1">
                <Play size={12} /> Start
              </button>
            ) : (
              <button data-testid="timer-pause" onClick={handlePauseTimer} className="clay-button-secondary px-3 py-1.5 text-xs flex items-center gap-1" style={{ color: '#a87f1e' }}>
                <Pause size={12} /> Pause
              </button>
            )}
            <button data-testid="timer-reset" onClick={handleResetTimer} className="clay-button-secondary px-3 py-1.5 text-xs flex items-center gap-1" style={{ color: '#c14d72' }}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>
      </header>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* LEFT COLUMN: Seminar Plan & Checklist */}
        <div className="w-1/3 flex flex-col gap-6">
          <div className="glass-panel p-6 flex-1 overflow-y-auto custom-scrollbar">
            <h2 className="text-sm font-display font-bold pb-2 mb-4" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>Seminar plan</h2>
            <div className="space-y-2 text-sm">
              {SEMINAR_SCHEDULE.map((item, i) => (
                <div key={i} className="flex gap-4 p-2 rounded-lg" style={{ color: 'var(--text-primary)' }}>
                  <div className="w-16" style={{ color: 'var(--text-muted)' }}>{item.time}</div>
                  <div>{item.task}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-sm font-display font-bold pb-2 mb-4" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>Pre-flight checklist</h2>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
              {CHECKLIST.map((item, i) => (
                <li key={i} className="flex gap-3 items-center">
                  <input type="checkbox" className="w-4 h-4 accent-[var(--accent-purple)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 text-xs" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--accent-rose)' }}>
              Note: Node Wars is a separate application. Do not include its dependencies here.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mission Guide */}
        <div className="w-2/3 glass-panel flex flex-col min-h-0">

          <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setSelectedMissionIndex(Math.max(0, selectedMissionIndex - 1))}
              disabled={selectedMissionIndex === 0}
              className="clay-button-secondary px-4 py-2 text-sm flex items-center gap-1 disabled:opacity-30"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <div className="text-lg font-display font-bold text-center" style={{ color: 'var(--text-primary)' }}>
              {currentMission?.title || 'Select mission'}
            </div>
            <button
              onClick={() => setSelectedMissionIndex(Math.max(0, Math.min(missions.length - 1, selectedMissionIndex + 1)))}
              disabled={selectedMissionIndex === missions.length - 1}
              className="clay-button-secondary px-4 py-2 text-sm flex items-center gap-1 disabled:opacity-30"
            >
              Next mission <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {!guide ? (
              <div className="text-center mt-10" style={{ color: 'var(--text-secondary)' }}>No instructor guide available for this mission.</div>
            ) : (
              <>
                <section>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-sky)' }}>Time</h3>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{guide.timeLabel}</div>
                </section>

                <section>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-sky)' }}>Purpose</h3>
                  <div className="text-sm leading-relaxed clay-inset p-3" style={{ color: 'var(--text-primary)' }}>
                    {guide.purpose}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-sky)' }}>Teach</h3>
                  <ul className="list-none space-y-1">
                    {guide.teach.map((point, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--accent-sky)' }}>•</span> {point}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-mint)' }}>Demonstrate</h3>
                  <div className="text-sm p-3 rounded-xl" style={{ color: '#2a9c68', backgroundColor: 'rgba(111, 216, 168, 0.12)' }}>
                    {guide.demonstrate}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-purple)' }}>Ask</h3>
                  <div className="text-sm italic" style={{ color: 'var(--text-primary)' }}>"{guide.ask}"</div>
                </section>

                <section>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-rose)' }}>Watch for</h3>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{guide.watchFor}</div>
                </section>

                <section>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-sky)' }}>Let students code</h3>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{guide.letStudentsCode}</div>
                </section>

                <section>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-sky)' }}>Debrief</h3>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{guide.debrief}</div>
                </section>

                <section>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-gold)' }}>Transition</h3>
                  <div className="text-sm italic p-3 rounded-xl" style={{ color: '#a87f1e', backgroundColor: 'rgba(232, 184, 75, 0.12)' }}>
                    "{guide.transition}"
                  </div>
                </section>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstructorMode;
