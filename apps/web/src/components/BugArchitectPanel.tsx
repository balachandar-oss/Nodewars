import React, { useEffect, useState } from 'react';
import { Bug as BugIcon, MapPin, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface AvailableBug {
  id: string;
  structureType: string;
  difficulty: string;
  question: string;
  options: string[];
  fragment: string;
  plantedAt?: string;
}

interface BugArchitectPanelProps {
  gameId: string;
  maxBugs?: number;
}

const LOCATIONS = ['ROOM', 'TOWER', 'CORRIDOR'];
const DIFFICULTY_COLORS = {
  EASY: 'text-neon-green',
  MEDIUM: 'text-neon-amber',
  HARD: 'text-neon-red',
  CRITICAL: 'text-neon-red'
};

const BugArchitectPanel: React.FC<BugArchitectPanelProps> = ({ gameId, maxBugs = 20 }) => {
  const [bugs, setBugs] = useState<AvailableBug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedBug, setSelectedBug] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isPlanting, setIsPlanting] = useState(false);
  const [plantedCount, setPlantedCount] = useState(0);
  const [plantSuccess, setPlantSuccess] = useState<AvailableBug | null>(null);

  useEffect(() => {
    fetchAvailableBugs();
  }, [gameId]);

  const fetchAvailableBugs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/games/${gameId}/available-bugs`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setBugs(data.bugs || []);
        setPlantedCount(data.plantedCount || 0);
      } else {
        setError('Failed to load available bugs');
      }
    } catch (err) {
      console.error('Failed to fetch bugs', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlantBug = async () => {
    if (!selectedBug || !selectedLocation) {
      setError('Please select both a bug and a location');
      return;
    }

    const token = localStorage.getItem('token');
    setIsPlanting(true);
    setError('');
    setPlantSuccess(null);

    try {
      const res = await fetch(`http://localhost:3001/api/bugs/${selectedBug}/plant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          location: selectedLocation,
          gameId
        })
      });

      if (res.ok) {
        const data = await res.json();
        const plantedBug = bugs.find(b => b.id === selectedBug);
        if (plantedBug) {
          setPlantSuccess(plantedBug);
        }
        setPlantedCount(prev => prev + 1);
        setSelectedBug(null);
        setSelectedLocation('');

        // Refresh available bugs after a short delay
        setTimeout(() => {
          fetchAvailableBugs();
          setPlantSuccess(null);
        }, 2000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to plant bug');
      }
    } catch (err) {
      console.error('Failed to plant bug', err);
      setError('Connection error while planting bug');
    } finally {
      setIsPlanting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-neon-purple animate-pulse">
        INITIALIZING BUG ARCHITECT PANEL...
      </div>
    );
  }

  const remainingSlots = maxBugs - plantedCount;
  const availableBugCount = bugs.length;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* HEADER */}
      <div className="glass-panel p-4 border-t-2 border-t-neon-purple bg-[#0a0510]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-neon-purple flex items-center justify-center bg-neon-purple/10 text-neon-purple">
              <BugIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-title tracking-widest text-white uppercase">
                BUG PLANTING STATION
              </h2>
              <div className="text-[10px] font-mono text-neon-purple/70 tracking-widest mt-1">
                SELECT • PLACE • CONFIRM
              </div>
            </div>
          </div>

          <div className="text-right bg-black/60 p-3 border border-white/5">
            <div className="text-[10px] text-white/50 font-mono tracking-widest mb-1">PLANTED</div>
            <div className="text-2xl font-bold font-mono text-neon-purple leading-none">
              {plantedCount} <span className="text-white/30 text-lg">/ {maxBugs}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* BUG SELECTION */}
        <div className="lg:col-span-2 glass-panel flex flex-col border-t-2 border-t-white/20 bg-[#0a0510]">
          <div className="p-4 border-b border-white/5 bg-black/40 shrink-0">
            <h3 className="text-sm font-title tracking-widest text-white/70">
              AVAILABLE BUGS ({availableBugCount})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {error && (
              <div className="p-4 border border-neon-red text-neon-red bg-neon-red/5 font-mono text-xs flex items-center gap-3 mb-4">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {plantSuccess && (
              <div className="p-4 border border-neon-green text-neon-green bg-neon-green/5 font-mono text-xs flex items-center gap-3 mb-4">
                <CheckCircle size={16} className="shrink-0" />
                BUG PLANTED SUCCESSFULLY!
              </div>
            )}

            {availableBugCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center font-mono text-white/40 text-[10px] tracking-widest">
                <BugIcon size={32} className="mb-4 opacity-20" />
                NO BUGS AVAILABLE
              </div>
            ) : (
              bugs.map(bug => {
                const isSelected = selectedBug === bug.id;
                return (
                  <div
                    key={bug.id}
                    onClick={() => setSelectedBug(bug.id)}
                    className={`p-4 border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-neon-purple bg-neon-purple/10 shadow-[inset_0_0_15px_rgba(176,38,255,0.15)]'
                        : 'border-white/10 hover:border-white/30 bg-black/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className={`font-bold text-xs tracking-widest mb-1 ${isSelected ? 'text-white' : 'text-white/70'}`}>
                          {bug.structureType}
                        </div>
                        <div className={`text-xs font-mono ${DIFFICULTY_COLORS[bug.difficulty as keyof typeof DIFFICULTY_COLORS] || 'text-white/50'}`}>
                          {bug.difficulty}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle size={16} className="text-neon-purple" />
                      )}
                    </div>

                    <div className="text-[10px] text-white/60 leading-relaxed border-t border-white/5 pt-2 mt-2">
                      <span className="text-white/40">Q: </span>
                      {bug.question.substring(0, 60)}
                      {bug.question.length > 60 ? '...' : ''}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LOCATION SELECTION & PLANTING */}
        <div className="glass-panel flex flex-col border-t-2 border-t-neon-amber bg-[#0a0510]">
          <div className="p-4 border-b border-white/5 bg-black/40 shrink-0">
            <h3 className="text-sm font-title tracking-widest text-white/70 flex items-center gap-2">
              <MapPin size={14} />
              LOCATION
            </h3>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-3">
            {LOCATIONS.map(loc => {
              const isSelected = selectedLocation === loc;
              return (
                <div
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-4 border text-center cursor-pointer transition-all font-mono text-sm tracking-widest font-bold ${
                    isSelected
                      ? 'border-neon-amber bg-neon-amber/10 text-neon-amber shadow-[inset_0_0_10px_rgba(255,170,0,0.2)]'
                      : 'border-white/10 text-white/50 hover:border-white/30 bg-black/40'
                  }`}
                >
                  {loc}
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/40 shrink-0 flex flex-col gap-3">
            <button
              onClick={handlePlantBug}
              disabled={!selectedBug || !selectedLocation || isPlanting || remainingSlots === 0}
              className={`cyber-button w-full px-4 py-3 font-bold transition-all text-xs tracking-widest ${
                !selectedBug || !selectedLocation || remainingSlots === 0
                  ? 'opacity-50 border-white/10 text-white/30 cursor-not-allowed bg-black'
                  : 'border-neon-green bg-neon-green/10 text-neon-green hover:bg-neon-green/20 shadow-[0_0_15px_rgba(34,255,100,0.2)]'
              }`}
            >
              {isPlanting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={12} className="animate-spin" />
                  PLANTING...
                </span>
              ) : (
                'PLANT BUG'
              )}
            </button>

            {remainingSlots === 0 && (
              <div className="text-[10px] font-mono text-neon-amber text-center tracking-widest">
                MAXIMUM CAPACITY REACHED
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugArchitectPanel;
