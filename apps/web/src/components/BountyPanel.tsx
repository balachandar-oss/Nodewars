import React from 'react';
import { Target, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getMissionIdentity } from '../utils/missionIdentity';

interface BountyPanelProps {
  missionId: string;
  isCompleted?: boolean;
}

const getBountyData = (missionId: string) => {
  switch (missionId) {
    case 'mission-01':
      return {
        number: '01',
        title: 'DEAD CASTLE CORE',
        target: 'OUTER GATE',
        symptom: 'Castle element cannot be created.',
        objective: 'Trace the module/import/export connection.',
      };
    case 'mission-02':
      return {
        number: '02',
        title: 'MISSING CAPABILITY',
        target: 'ROYAL KEY',
        symptom: 'Dependency unavailable. Capability offline.',
        objective: 'Restore the missing package capability using NPM.',
      };
    case 'mission-03':
      return {
        number: '03',
        title: 'DEAD CASTLE CIRCUIT',
        target: 'INNER GATE',
        symptom: 'Lever activates but gate remains closed.',
        objective: 'Repair the event connection.',
      };
    case 'mission-04':
      return {
        number: '04',
        title: 'ISOLATED CASTLE',
        target: 'SIGNAL TOWER',
        symptom: 'Application cannot become publicly reachable.',
        objective: 'Repair deployment configuration.',
      };
    case 'capstone':
      return {
        number: '05',
        title: 'THE GATEHOUSE',
        target: 'GATEHOUSE',
        symptom: 'Every system works alone. Nothing has been combined yet.',
        objective: 'Wire the module, package, event, and deployment port together.',
      };
    default:
      return {
        number: '??',
        title: 'UNKNOWN BOUNTY',
        target: 'UNKNOWN',
        symptom: 'Unknown symptom.',
        objective: 'Unknown objective.',
      };
  }
};

const BountyPanel: React.FC<BountyPanelProps> = ({ missionId, isCompleted }) => {
  const data = getBountyData(missionId);
  const identity = getMissionIdentity(missionId);
  const Icon = identity.icon;
  
  return (
    <div className="w-full h-full flex flex-col p-4 bg-[var(--bg-secondary)] border-b lg:border-b-0 lg:border-r border-[var(--border-color)]">
      
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <Icon size={16} style={{ color: 'var(--accent-gold)' }} />
        <h2 className="font-display font-bold text-sm tracking-widest" style={{ color: 'var(--accent-gold)' }}>
          BOUNTY #{data.number} &mdash; {data.title}
        </h2>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        
        <div className="clay-panel p-3 shadow-none bg-black/20">
          <div className="text-[10px] font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>TARGET</div>
          <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            <Target size={14} style={{ color: 'var(--accent-purple)' }} />
            {data.target}
          </div>
        </div>

        <div className="clay-panel p-3 shadow-none bg-black/20">
          <div className="text-[10px] font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>SYMPTOM</div>
          <div className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--accent-red)' }}>
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{data.symptom}</span>
          </div>
        </div>

        <div className="clay-panel p-3 shadow-none bg-black/20">
          <div className="text-[10px] font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>OBJECTIVE</div>
          <div className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--accent-sky)' }}>
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            <span>{data.objective}</span>
          </div>
        </div>

      </div>
      
      <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-color)' }}>
        <span className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>STATUS</span>
        <span className={`chip text-[9px] ${isCompleted ? 'chip-mint' : 'chip-gold'}`}>
          {isCompleted ? 'RESTORED' : 'ACTIVE BOUNTY'}
        </span>
      </div>

    </div>
  );
};

export default BountyPanel;
