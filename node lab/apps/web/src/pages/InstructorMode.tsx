import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { teachingRegistry } from '@node-wars/shared';

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
  'Admin accounts verified (admin04 / admin12)',
  'Student accounts ready (49 participants)',
  'Missions 01–07 available',
  'Quiz available',
  'Display/projector tested'
];

const InstructorMode = () => {
  const { user } = useOutletContext<{ user?: { role?: string } }>();
  const navigate = useNavigate();
  const [selectedMissionIndex, setSelectedMissionIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isStartingPlacement, setIsStartingPlacement] = useState(false);

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
      <div className="h-screen flex items-center justify-center bg-[#0a0510]">
        <div className="text-red-500 font-mono tracking-widest bg-black p-8 border border-red-500/50">
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

  const handleStartPlacement = async () => {
    try {
      setIsStartingPlacement(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/admin/game/start-placement', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to start placement');
      } else {
        alert('Bug Placement started! 120s timer is active.');
      }
    } catch (err) {
      alert('Connection error starting placement.');
    } finally {
      setIsStartingPlacement(false);
    }
  };

  const handleRestartGame = async () => {
    if (!window.confirm('Are you sure you want to restore the kingdom and reset hunt progress?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/admin/game/restart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to restart game');
      } else {
        alert('Kingdom restored (Game Restarted).');
      }
    } catch (err) {
      alert('Connection error restarting game.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] -mt-6 p-6 max-w-[1920px] mx-auto z-10 relative animate-slide-in font-mono text-white overflow-hidden">
      <header className="glass-panel shrink-0 p-4 border-t-2 border-t-neon-blue flex justify-between items-center bg-[#0a0510] mb-6">
        <div>
          <h1 className="text-2xl font-title tracking-widest uppercase">NODE LAB // INSTRUCTOR MODE</h1>
          <p className="text-neon-blue text-[10px] mt-1 tracking-widest uppercase">Live Seminar Guidance System</p>
        </div>
        
        {/* Timer & Navigation UI */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/results')}
            className="px-4 py-2 bg-neon-purple/20 text-neon-purple border border-neon-purple/50 hover:bg-neon-purple/30 text-xs tracking-widest uppercase font-bold"
          >
            [ STUDENT RESULTS REVIEW ]
          </button>
          <div className="flex items-center gap-4 bg-black/50 p-2 border border-white/10 rounded-sm">
            <div className="text-2xl font-bold tracking-widest w-24 text-center">
              {formatTime(timerSeconds)}
            </div>
            <div className="flex gap-2 text-[10px]">
              {!timerActive ? (
                <button data-testid="timer-start" onClick={handleStartTimer} className="px-3 py-1 bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20">START</button>
              ) : (
                <button data-testid="timer-pause" onClick={handlePauseTimer} className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20">PAUSE</button>
              )}
              <button data-testid="timer-reset" onClick={handleResetTimer} className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20">RESET</button>
            </div>
          </div>
          <button
            onClick={handleStartPlacement}
            disabled={isStartingPlacement}
            className="px-4 py-2 bg-neon-amber/20 text-neon-amber border border-neon-amber/50 hover:bg-neon-amber/30 text-xs tracking-widest uppercase font-bold disabled:opacity-50"
          >
            {isStartingPlacement ? 'STARTING...' : '[ START PLACEMENT ]'}
          </button>
          <button
            onClick={handleRestartGame}
            className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30 text-xs tracking-widest uppercase font-bold"
          >
            [ RESTORE KINGDOM (RESTART) ]
          </button>
        </div>
      </header>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* LEFT COLUMN: Seminar Plan & Checklist */}
        <div className="w-1/3 flex flex-col gap-6">
          <div className="glass-panel bg-black/60 p-6 flex-1 overflow-y-auto custom-scrollbar border border-white/5">
            <h2 className="text-lg font-title text-neon-blue tracking-widest uppercase border-b border-white/10 pb-2 mb-4">SEMINAR PLAN</h2>
            <div className="space-y-2 text-xs">
              {SEMINAR_SCHEDULE.map((item, i) => (
                <div key={i} className="flex gap-4 p-2 hover:bg-white/5">
                  <div className="w-16 text-white/50">{item.time}</div>
                  <div className="text-white/90">{item.task}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel bg-black/60 p-6 border border-white/5">
            <h2 className="text-lg font-title text-neon-blue tracking-widest uppercase border-b border-white/10 pb-2 mb-4">PRE-FLIGHT CHECKLIST</h2>
            <ul className="space-y-2 text-[11px] text-white/80">
              {CHECKLIST.map((item, i) => (
                <li key={i} className="flex gap-3 items-center">
                  <input type="checkbox" className="accent-neon-blue w-3 h-3" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-white/10 text-[9px] text-red-400 uppercase tracking-widest">
              Note: Node Wars is a separate application. Do not include its dependencies here.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mission Guide */}
        <div className="w-2/3 glass-panel bg-black/60 flex flex-col border border-white/5 min-h-0">
          
          <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
            <button 
              onClick={() => setSelectedMissionIndex(Math.max(0, selectedMissionIndex - 1))}
              disabled={selectedMissionIndex === 0}
              className="text-[10px] tracking-widest px-4 py-2 border border-white/20 disabled:opacity-30 hover:bg-white/10"
            >
              [ PREVIOUS ]
            </button>
            <div className="text-lg font-bold tracking-widest text-center uppercase">
              {currentMission?.title || 'SELECT MISSION'}
            </div>
            <button 
              onClick={() => setSelectedMissionIndex(Math.max(0, Math.min(missions.length - 1, selectedMissionIndex + 1)))}
              disabled={selectedMissionIndex === missions.length - 1}
              className="text-[10px] tracking-widest px-4 py-2 border border-white/20 disabled:opacity-30 hover:bg-white/10"
            >
              [ NEXT MISSION ]
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            {!guide ? (
              <div className="text-white/50 text-center mt-10">No instructor guide available for this mission.</div>
            ) : (
              <>
                <section>
                  <h3 className="text-xs text-neon-blue tracking-widest uppercase mb-2">TIME</h3>
                  <div className="text-sm">{guide.timeLabel}</div>
                </section>

                <section>
                  <h3 className="text-xs text-neon-blue tracking-widest uppercase mb-2">PURPOSE</h3>
                  <div className="text-sm text-white/90 leading-relaxed bg-white/5 p-3 border-l-2 border-neon-blue">
                    {guide.purpose}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs text-neon-blue tracking-widest uppercase mb-2">TEACH</h3>
                  <ul className="list-none space-y-1">
                    {guide.teach.map((point, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/80">
                        <span className="text-neon-blue">■</span> {point}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-xs text-neon-green tracking-widest uppercase mb-2">DEMONSTRATE</h3>
                  <div className="text-sm text-neon-green/90 bg-neon-green/5 p-3 border border-neon-green/20">
                    {guide.demonstrate}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs text-purple-400 tracking-widest uppercase mb-2">ASK</h3>
                  <div className="text-sm italic text-white/90">"{guide.ask}"</div>
                </section>

                <section>
                  <h3 className="text-xs text-red-400 tracking-widest uppercase mb-2">WATCH FOR</h3>
                  <div className="text-sm text-white/80">{guide.watchFor}</div>
                </section>

                <section>
                  <h3 className="text-xs text-neon-blue tracking-widest uppercase mb-2">LET STUDENTS CODE</h3>
                  <div className="text-sm text-white/80">{guide.letStudentsCode}</div>
                </section>

                <section>
                  <h3 className="text-xs text-neon-blue tracking-widest uppercase mb-2">DEBRIEF</h3>
                  <div className="text-sm text-white/80">{guide.debrief}</div>
                </section>

                <section>
                  <h3 className="text-xs text-yellow-400 tracking-widest uppercase mb-2">TRANSITION</h3>
                  <div className="text-sm italic text-yellow-400/90 bg-yellow-400/5 p-3 border-l-2 border-yellow-400">
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
