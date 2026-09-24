import React, { useState } from 'react';
import { ShieldAlert, Server, Zap, Radio, KeyRound } from 'lucide-react';
import { getMissionIdentity } from '../utils/missionIdentity';

interface BountyInteractProps {
  missionId: string;
  onOpenCode: () => void;
}

const BountyInteract: React.FC<BountyInteractProps> = ({ missionId, onOpenCode }) => {
  const [interacted, setInteracted] = useState(false);
  const [bountyDetected, setBountyDetected] = useState(false);

  const handleInteract = () => {
    setInteracted(true);
    setTimeout(() => setBountyDetected(true), 1500);
  };

  const renderMission1 = () => (
    <div className="flex flex-col items-center">
      <div className="w-64 border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-2xl flex flex-col items-center mb-8">
        <Server size={32} className="mb-4 text-white/50" />
        <div className="text-sm font-bold tracking-widest text-white/50 mb-6">OUTER GATE</div>
        {!interacted ? (
          <button onClick={handleInteract} className="clay-button py-2 px-6 text-xs w-full">
            [ ACTIVATE ]
          </button>
        ) : (
          <div className="text-center w-full">
            <div className="text-[10px] text-[var(--accent-red)] font-mono animate-pulse mb-1">MODULE LOAD FAILED</div>
            <div className="text-[10px] text-white/50 font-mono">CASTLE ELEMENT OFFLINE</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMission2 = () => (
    <div className="flex flex-col items-center">
      <div className="w-64 border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-2xl flex flex-col items-center mb-8">
        <KeyRound size={32} className="mb-4 text-white/50" />
        <div className="text-sm font-bold tracking-widest text-white/50 mb-6">ROYAL KEY</div>
        {!interacted ? (
          <div className="text-center w-full cursor-pointer hover:bg-white/5 p-2 rounded transition-colors" onClick={handleInteract}>
            <div className="text-xs text-[var(--accent-gold)] font-mono">STATUS: DISABLED</div>
            <div className="text-[9px] text-white/40 mt-2">(Click to inspect)</div>
          </div>
        ) : (
          <div className="text-center w-full">
            <div className="text-[10px] text-[var(--accent-red)] font-mono animate-pulse mb-1">DEPENDENCY UNAVAILABLE</div>
            <div className="text-[10px] text-white/50 font-mono">CAPABILITY OFFLINE</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMission3 = () => (
    <div className="flex flex-col items-center">
      <div className="w-64 border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-2xl flex flex-col items-center mb-8">
        <Zap size={32} className="mb-4 text-white/50" />
        <div className="text-sm font-bold tracking-widest text-white/50 mb-6">DEAD CIRCUIT</div>
        {!interacted ? (
          <button onClick={handleInteract} className="clay-button-secondary py-2 px-6 text-xs w-full">
            [ PULL LEVER ]
          </button>
        ) : (
          <div className="text-left w-full space-y-2">
            <div className="text-[10px] text-[var(--accent-mint)] font-mono">EVENT EMITTED ✓</div>
            <div className="text-[10px] text-[var(--accent-red)] font-mono animate-pulse">LISTENER NOT FOUND ✗</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMission4 = () => (
    <div className="flex flex-col items-center">
      <div className="w-64 border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-2xl flex flex-col items-center mb-8">
        <Radio size={32} className="mb-4 text-white/50" />
        <div className="text-sm font-bold tracking-widest text-white/50 mb-6">SIGNAL TOWER</div>
        {!interacted ? (
          <div className="w-full space-y-2 text-left mb-6">
             <div className="text-[10px] font-mono flex justify-between"><span className="text-white/50">LOCAL SERVER</span><span className="text-[var(--accent-mint)]">ONLINE ✓</span></div>
             <div className="text-[10px] font-mono flex justify-between"><span className="text-white/50">START COMMAND</span><span className="text-[var(--accent-mint)]">VALID ✓</span></div>
             <div className="text-[10px] font-mono flex justify-between"><span className="text-white/50">PORT</span><span className="text-[var(--accent-red)]">INVALID ✗</span></div>
             <div className="text-[10px] font-mono flex justify-between"><span className="text-white/50">PUBLIC ACCESS</span><span className="text-[var(--accent-red)]">OFFLINE ✗</span></div>
             <button onClick={handleInteract} className="clay-button py-2 text-xs w-full mt-4">[ CHECK DEPLOYMENT ]</button>
          </div>
        ) : (
          <div className="text-center w-full">
            <div className="text-[10px] text-[var(--accent-mint)] font-mono mb-1">LOCAL CASTLE ONLINE</div>
            <div className="text-[10px] text-[var(--accent-red)] font-mono animate-pulse">PUBLIC ACCESS FAILED</div>
          </div>
        )}
      </div>
    </div>
  );

  const knownMissionIds = ['mission-01', 'mission-02', 'mission-03', 'mission-04'];
  const isKnownMission = knownMissionIds.includes(missionId);

  const renderUnknownMission = () => (
    <div className="flex flex-col items-center">
      <div className="w-64 border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 rounded-2xl flex flex-col items-center mb-8">
        <ShieldAlert size={32} className="mb-4 text-white/50" />
        <div className="text-sm font-bold tracking-widest text-white/50 mb-6 text-center">CASTLE SYSTEM</div>
        {!interacted ? (
          <button onClick={handleInteract} className="clay-button py-2 px-6 text-xs w-full">
            [ INSPECT ]
          </button>
        ) : (
          <div className="text-center w-full">
            <div className="text-[10px] text-[var(--accent-red)] font-mono animate-pulse mb-1">FAULT DETECTED</div>
            <div className="text-[10px] text-white/50 font-mono">SYSTEM OFFLINE</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-xl mx-auto p-8 animate-fade-in">
      {missionId === 'mission-01' && renderMission1()}
      {missionId === 'mission-02' && renderMission2()}
      {missionId === 'mission-03' && renderMission3()}
      {missionId === 'mission-04' && renderMission4()}
      {!isKnownMission && renderUnknownMission()}

      {bountyDetected && (
        <div className="w-full bg-black/40 border border-[var(--accent-gold)] rounded-xl p-6 shadow-2xl animate-slide-in relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--accent-gold)] opacity-5 animate-pulse"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <ShieldAlert size={24} className="text-[var(--accent-gold)] animate-bounce" />
            <h2 className="text-lg font-display font-bold text-[var(--accent-gold)] tracking-widest">BOUNTY DETECTED</h2>
          </div>

          <div className="space-y-4 relative z-10">
             {missionId === 'mission-01' && (
               <>
                 <div><span className="text-[10px] text-white/50 tracking-wider">TARGET:</span> <span className="text-xs ml-2 text-[var(--accent-purple)] font-bold">OUTER GATE</span></div>
                 <div><span className="text-[10px] text-white/50 tracking-wider">SYMPTOM:</span> <span className="text-xs ml-2 text-[var(--accent-red)]">Castle element cannot be created.</span></div>
                 <div><span className="text-[10px] text-white/50 tracking-wider">OBJECTIVE:</span> <span className="text-xs ml-2 text-[var(--accent-sky)]">Trace the module/import/export connection.</span></div>
               </>
             )}
             {missionId === 'mission-02' && (
               <>
                 <div><span className="text-[10px] text-white/50 tracking-wider">TARGET:</span> <span className="text-xs ml-2 text-[var(--accent-purple)] font-bold">ROYAL KEY</span></div>
                 <div><span className="text-[10px] text-white/50 tracking-wider">SYMPTOM:</span> <span className="text-xs ml-2 text-[var(--accent-red)]">Dependency unavailable.</span></div>
                 <div><span className="text-[10px] text-white/50 tracking-wider">OBJECTIVE:</span> <span className="text-xs ml-2 text-[var(--accent-sky)]">Restore the missing package capability.</span></div>
               </>
             )}
             {missionId === 'mission-03' && (
               <>
                 <div><span className="text-[10px] text-white/50 tracking-wider">TARGET:</span> <span className="text-xs ml-2 text-[var(--accent-purple)] font-bold">INNER GATE</span></div>
                 <div><span className="text-[10px] text-white/50 tracking-wider">SYMPTOM:</span> <span className="text-xs ml-2 text-[var(--accent-red)]">Lever activates but gate remains closed.</span></div>
                 <div><span className="text-[10px] text-white/50 tracking-wider">OBJECTIVE:</span> <span className="text-xs ml-2 text-[var(--accent-sky)]">Repair the event connection.</span></div>
               </>
             )}
             {missionId === 'mission-04' && (
               <>
                 <div><span className="text-[10px] text-white/50 tracking-wider">TARGET:</span> <span className="text-xs ml-2 text-[var(--accent-purple)] font-bold">SIGNAL TOWER</span></div>
                 <div><span className="text-[10px] text-white/50 tracking-wider">SYMPTOM:</span> <span className="text-xs ml-2 text-[var(--accent-red)]">Application cannot become publicly reachable.</span></div>
                 <div><span className="text-[10px] text-white/50 tracking-wider">OBJECTIVE:</span> <span className="text-xs ml-2 text-[var(--accent-sky)]">Repair deployment configuration.</span></div>
               </>
             )}
             {!isKnownMission && (
               <>
                 <div><span className="text-[10px] text-white/50 tracking-wider">TARGET:</span> <span className="text-xs ml-2 text-[var(--accent-purple)] font-bold">CASTLE SYSTEM</span></div>
                 <div><span className="text-[10px] text-white/50 tracking-wider">SYMPTOM:</span> <span className="text-xs ml-2 text-[var(--accent-red)]">System not responding as expected.</span></div>
                 <div><span className="text-[10px] text-white/50 tracking-wider">OBJECTIVE:</span> <span className="text-xs ml-2 text-[var(--accent-sky)]">Open the code editor to investigate.</span></div>
               </>
             )}
          </div>

          <button onClick={onOpenCode} className="mt-8 clay-button w-full py-3 text-xs tracking-widest flex items-center justify-center gap-2">
            [ OPEN CODE ]
          </button>
        </div>
      )}
    </div>
  );
};

export default BountyInteract;
