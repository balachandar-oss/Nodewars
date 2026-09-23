import React, { useState } from 'react';
import { MapPin, CheckCircle, AlertCircle, Loader, Target } from 'lucide-react';
import { ROOMS } from '../utils/gameConstants';
import { structureRegistry, type StructureType } from '../utils/structureData';
import { API_URL } from '../utils/api';

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
  EASY: 'var(--accent-mint)',
  MEDIUM: 'var(--accent-gold)',
  HARD: 'var(--accent-rose)',
  CRITICAL: 'var(--accent-rose)'
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
      const res = await fetch(`${API_URL}/api/bugs/${bug.id}/plant`, {
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
      <div className="glass-panel p-4">
        <div className="flex items-center gap-3">
          <div className="clay-inset w-10 h-10 rounded-xl flex items-center justify-center">
            <Target size={20} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Your assigned bug
            </h2>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              One shot &middot; choose wisely
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* BUG DETAILS */}
        <div className="lg:col-span-2 glass-panel flex flex-col">
          <div className="p-4 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Bug details
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {error && (
              <div className="p-4 rounded-2xl clay-inset text-sm flex items-center gap-3 mb-4" style={{ color: 'var(--accent-rose)' }}>
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="p-4 rounded-2xl clay-inset">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    {bug.vulnerabilityType.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs font-semibold" style={{ color: DIFFICULTY_COLORS[bug.difficulty] || 'var(--text-muted)' }}>
                    {bug.difficulty}
                  </div>
                </div>
              </div>

              <div className="text-xs leading-relaxed pt-2 mt-2" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target system: </span>
                {bug.targetSystem}
              </div>

              <div className="text-xs leading-relaxed pt-2 mt-2" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Question: </span>
                {bug.question}
              </div>

              {bug.options?.length > 0 && (
                <div className="text-xs leading-relaxed pt-2 mt-2 space-y-1" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)' }}>
                  {bug.options.map((opt, idx) => (
                    <div key={idx}>{String.fromCharCode(65 + idx)}. {opt}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOCATION / STRUCTURE SELECTION & PLANTING */}
        <div className="glass-panel flex flex-col">
          {bug.status === 'PLANTED' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center clay-inset">
                <CheckCircle size={28} style={{ color: 'var(--accent-mint)' }} />
              </div>
              <div className="text-lg font-display font-bold" style={{ color: 'var(--accent-mint)' }}>Planted</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Location: <span style={{ color: 'var(--text-primary)' }}>{bug.location || 'Unknown'}</span>
              </div>
              {bug.structureType && (
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Structure: <span style={{ color: 'var(--text-primary)' }}>{bug.structureType}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin size={14} />
                  Plant location
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
                <div>
                  <div className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Room</div>
                  <div className="grid grid-cols-2 gap-2">
                    {ROOM_OPTIONS.map(room => {
                      const isSelected = selectedLocation === room.id;
                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedLocation(room.id)}
                          className={`p-2 rounded-xl text-center cursor-pointer transition-all text-xs font-semibold ${
                            isSelected ? 'clay-panel' : 'clay-inset hover:opacity-90'
                          }`}
                          style={{ color: isSelected ? 'var(--accent-purple)' : 'var(--text-secondary)' }}
                        >
                          {room.name}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Structure type</div>
                  <div className="grid grid-cols-1 gap-2">
                    {STRUCTURE_OPTIONS.map(type => {
                      const isSelected = selectedStructure === type;
                      return (
                        <div
                          key={type}
                          onClick={() => setSelectedStructure(type)}
                          className={`p-2 rounded-xl text-center cursor-pointer transition-all text-xs font-semibold ${
                            isSelected ? 'clay-panel' : 'clay-inset hover:opacity-90'
                          }`}
                          style={{ color: isSelected ? 'var(--accent-purple)' : 'var(--text-secondary)' }}
                        >
                          {type.replace(/_/g, ' ')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={handlePlantBug}
                  disabled={!selectedLocation || !selectedStructure || isPlanting}
                  className="clay-button w-full px-4 py-3 font-bold text-sm disabled:opacity-40"
                >
                  {isPlanting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader size={12} className="animate-spin" />
                      Planting...
                    </span>
                  ) : (
                    'Plant bug'
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
