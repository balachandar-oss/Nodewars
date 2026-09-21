import React, { useState } from 'react';
import { MapPin, CheckCircle, AlertCircle, Loader, Target } from 'lucide-react';
import { ROOMS } from '../utils/gameConstants';
import { structureRegistry, type StructureType } from '../utils/structureData';

export interface BugAssignment {
  id: string;
  vulnerabilityType: string;
  targetSystem: string;
  difficulty: string;
  question: string;
  options: string[];
  status: 'DRAFT' | 'PLANTED';
  location?: string;
  structureType?: string;
}

interface BugArchitectPanelProps {
  bug: BugAssignment;
  onPlanted: (bug: BugAssignment) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'text-neon-green',
  MEDIUM: 'text-neon-amber',
  HARD: 'text-neon-red',
  CRITICAL: 'text-neon-red'
};

const ROOM_OPTIONS = Object.values(ROOMS).map(r => ({ id: r.id, name: r.name }));
const STRUCTURE_OPTIONS = Object.keys(structureRegistry) as StructureType[];

const BugArchitectPanel: React.FC<BugArchitectPanelProps> = ({ bug, onPlanted }) => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStructure, setSelectedStructure] = useState('');
  const [isPlanting, setIsPlanting] = useState(false);
  const [error, setError] = useState('');

  const handlePlantBug = async () => {
    if (!selectedLocation || !selectedStructure) {
      setError('Please select both a location and a structure type');
      return;
    }

    const token = localStorage.getItem('token');
    setIsPlanting(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:3001/api/bugs/${bug.id}/plant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          location: selectedLocation,
          structureType: selectedStructure
        })
      });

      if (res.ok) {
        onPlanted({ ...bug, status: 'PLANTED', location: selectedLocation, structureType: selectedStructure });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || (res.status === 400 ? 'Bug already planted' : 'Failed to plant bug'));
      }
    } catch (err) {
      console.error('Failed to plant bug', err);
      setError('Connection error while planting bug');
    } finally {
      setIsPlanting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* HEADER */}
      <div className="glass-panel p-4 border-t-2 border-t-neon-purple bg-[#0a0510]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-neon-purple flex items-center justify-center bg-neon-purple/10 text-neon-purple">
            <Target size={20} />
          </div>
          <div>
            <h2 className="text-lg font-title tracking-widest text-white uppercase">
              YOUR ASSIGNED BUG
            </h2>
            <div className="text-[10px] font-mono text-neon-purple/70 tracking-widest mt-1">
              ONE SHOT • CHOOSE WISELY
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* BUG DETAILS */}
        <div className="lg:col-span-2 glass-panel flex flex-col border-t-2 border-t-white/20 bg-[#0a0510]">
          <div className="p-4 border-b border-white/5 bg-black/40 shrink-0">
            <h3 className="text-sm font-title tracking-widest text-white/70">
              THREAT DETAILS
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {error && (
              <div className="p-4 border border-neon-red text-neon-red bg-neon-red/5 font-mono text-xs flex items-center gap-3 mb-4">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="p-4 border border-neon-purple bg-neon-purple/10 shadow-[inset_0_0_15px_rgba(176,38,255,0.15)]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-xs tracking-widest mb-1 text-white">
                    {bug.vulnerabilityType.replace(/_/g, ' ')}
                  </div>
                  <div className={`text-xs font-mono ${DIFFICULTY_COLORS[bug.difficulty] || 'text-white/50'}`}>
                    {bug.difficulty}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-white/60 leading-relaxed border-t border-white/5 pt-2 mt-2">
                <span className="text-white/40">TARGET SYSTEM: </span>
                {bug.targetSystem}
              </div>

              <div className="text-[10px] text-white/60 leading-relaxed border-t border-white/5 pt-2 mt-2">
                <span className="text-white/40">Q: </span>
                {bug.question}
              </div>

              {bug.options?.length > 0 && (
                <div className="text-[10px] text-white/50 leading-relaxed border-t border-white/5 pt-2 mt-2 space-y-1">
                  {bug.options.map((opt, idx) => (
                    <div key={idx}>{String.fromCharCode(65 + idx)}. {opt}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOCATION / STRUCTURE SELECTION & PLANTING */}
        <div className="glass-panel flex flex-col border-t-2 border-t-neon-amber bg-[#0a0510]">
          {bug.status === 'PLANTED' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-4">
              <div className="w-16 h-16 border-2 border-neon-green rounded-full flex items-center justify-center bg-neon-green/10">
                <CheckCircle size={28} className="text-neon-green" />
              </div>
              <div className="font-title text-lg text-neon-green tracking-widest">PLANTED</div>
              <div className="font-mono text-[10px] text-white/60 tracking-widest">
                LOCATION: <span className="text-white">{bug.location || 'UNKNOWN'}</span>
              </div>
              {bug.structureType && (
                <div className="font-mono text-[10px] text-white/60 tracking-widest">
                  STRUCTURE: <span className="text-white">{bug.structureType}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-white/5 bg-black/40 shrink-0">
                <h3 className="text-sm font-title tracking-widest text-white/70 flex items-center gap-2">
                  <MapPin size={14} />
                  PLANT LOCATION
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
                <div>
                  <div className="text-[9px] font-mono text-white/40 tracking-widest mb-2">ROOM</div>
                  <div className="grid grid-cols-2 gap-2">
                    {ROOM_OPTIONS.map(room => {
                      const isSelected = selectedLocation === room.id;
                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedLocation(room.id)}
                          className={`p-2 border text-center cursor-pointer transition-all font-mono text-[10px] tracking-widest font-bold ${
                            isSelected
                              ? 'border-neon-amber bg-neon-amber/10 text-neon-amber shadow-[inset_0_0_10px_rgba(255,170,0,0.2)]'
                              : 'border-white/10 text-white/50 hover:border-white/30 bg-black/40'
                          }`}
                        >
                          {room.name.toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] font-mono text-white/40 tracking-widest mb-2">STRUCTURE TYPE</div>
                  <div className="grid grid-cols-1 gap-2">
                    {STRUCTURE_OPTIONS.map(type => {
                      const isSelected = selectedStructure === type;
                      return (
                        <div
                          key={type}
                          onClick={() => setSelectedStructure(type)}
                          className={`p-2 border text-center cursor-pointer transition-all font-mono text-[10px] tracking-widest font-bold ${
                            isSelected
                              ? 'border-neon-purple bg-neon-purple/10 text-neon-purple shadow-[inset_0_0_10px_rgba(176,38,255,0.2)]'
                              : 'border-white/10 text-white/50 hover:border-white/30 bg-black/40'
                          }`}
                        >
                          {type.replace(/_/g, ' ')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-black/40 shrink-0">
                <button
                  onClick={handlePlantBug}
                  disabled={!selectedLocation || !selectedStructure || isPlanting}
                  className={`cyber-button w-full px-4 py-3 font-bold transition-all text-xs tracking-widest ${
                    !selectedLocation || !selectedStructure
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BugArchitectPanel;
