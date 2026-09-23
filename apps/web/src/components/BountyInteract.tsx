import React, { useState } from 'react';
import { Target, Search, Code, ShieldAlert, Zap, Server as ServerIcon, Package, Radio } from 'lucide-react';

interface BountyInteractProps {
  missionId: string;
  onOpenCode: () => void;
}

const BountyInteract: React.FC<BountyInteractProps> = ({ missionId, onOpenCode }) => {
  const [interactionState, setInteractionState] = useState<'IDLE' | 'TESTING' | 'FAILED'>('IDLE');

  const handleInteract = () => {
    setInteractionState('TESTING');
    setTimeout(() => {
      setInteractionState('FAILED');
    }, 1200);
  };

  const getMissionConfig = () => {
    switch (missionId) {
      case 'mission-01':
        return {
          title: 'DEAD CASTLE CORE',
          element: 'OUTER GATE',
          icon: ServerIcon,
          actionText: 'ACTIVATE GATE',
          symptom: 'Module load failed. Outer gate unresponsive.',
          objective: 'Export and require the missing module to restore the gate.'
        };
      case 'mission-02':
        return {
          title: 'MISSING CAPABILITY',
          element: 'ROYAL KEY',
          icon: Package,
          actionText: 'USE ROYAL KEY',
          symptom: 'Dependency unavailable. Capability offline.',
          objective: 'Install the missing package to restore the Royal Key.'
        };
      case 'mission-03':
        return {
          title: 'DEAD CASTLE CIRCUIT',
          element: 'INNER GATE LEVER',
          icon: Zap,
          actionText: 'PULL LEVER',
          symptom: 'Event emitted, but listener not found. Gate remains closed.',
          objective: 'Find the broken event connection and restore the gate response.'
        };
      case 'mission-04':
        return {
          title: 'OFFLINE TOWER',
          element: 'SIGNAL TOWER',
          icon: Radio,
          actionText: 'CHECK DEPLOYMENT',
          symptom: 'Local server online. Public access failed (Port mismatch).',
          objective: 'Configure process.env.PORT to bring the public castle online.'
        };
      default:
        return {
          title: 'UNKNOWN ANOMALY',
          element: 'SYSTEM',
          icon: Target,
          actionText: 'INTERACT',
          symptom: 'System unresponsive.',
          objective: 'Investigate and patch the anomaly.'
        };
    }
  };

  const config = getMissionConfig();
  const Icon = config.icon;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="w-full max-w-2xl clay-panel flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-[#1a1825] p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <Target className="text-[var(--accent-rose)]" size={20} />
            <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">
              BOUNTY DETECTED: {config.title}
            </h2>
          </div>
          <span className="chip chip-rose animate-pulse">ACTION REQUIRED</span>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          
          {/* Visual Element Representation */}
          <div className="relative flex flex-col items-center mb-8">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
              interactionState === 'IDLE' ? 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)]' :
              interactionState === 'TESTING' ? 'border-[var(--accent-gold)] bg-[rgba(232,184,75,0.1)] text-[var(--accent-gold)] scale-110' :
              'border-[var(--accent-rose)] bg-[rgba(224,124,155,0.1)] text-[var(--accent-rose)] scale-100'
            }`}>
              <Icon size={48} className={interactionState === 'TESTING' ? 'animate-pulse' : ''} />
            </div>
            
            <div className="mt-4 font-semibold text-sm tracking-widest text-[var(--text-secondary)] uppercase">
              {config.element}
            </div>
          </div>

          {/* Interaction Button */}
          {interactionState === 'IDLE' && (
            <button 
              onClick={handleInteract}
              className="clay-button px-8 py-3 flex items-center gap-2 font-bold transition-all hover:scale-105"
            >
              <Zap size={16} /> [{config.actionText}]
            </button>
          )}

          {/* Testing State */}
          {interactionState === 'TESTING' && (
            <div className="flex flex-col items-center gap-3 animate-fade-in">
              <div className="w-6 h-6 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm font-semibold text-[var(--accent-gold)] uppercase tracking-wider">
                Testing capability...
              </div>
            </div>
          )}

          {/* Failed / Symptom State */}
          {interactionState === 'FAILED' && (
            <div className="w-full max-w-lg flex flex-col gap-4 animate-slide-up">
              
              <div className="p-4 rounded-xl border border-[var(--accent-rose)] bg-[rgba(224,124,155,0.05)] flex items-start gap-4">
                <ShieldAlert className="text-[var(--accent-rose)] shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="text-xs font-bold text-[var(--accent-rose)] mb-1 uppercase tracking-wider">Symptom</div>
                  <div className="text-sm text-[var(--text-primary)]">{config.symptom}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--accent-gold)] bg-[rgba(232,184,75,0.05)] flex items-start gap-4">
                <Search className="text-[var(--accent-gold)] shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="text-xs font-bold text-[var(--accent-gold)] mb-1 uppercase tracking-wider">Objective</div>
                  <div className="text-sm text-[var(--text-primary)]">{config.objective}</div>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <button 
                  onClick={onOpenCode}
                  className="clay-button px-8 py-3 flex items-center gap-2 font-bold hover:scale-105 transition-transform"
                >
                  <Code size={16} /> [OPEN CODE]
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BountyInteract;
