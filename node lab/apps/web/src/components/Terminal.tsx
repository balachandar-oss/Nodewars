import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  logs: Array<{ type: 'info' | 'success' | 'error' | 'sim', message: string }>;
  isEvaluating?: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ logs, isEvaluating }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden font-mono text-xs shadow-inner p-4">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-amber/20 to-transparent"></div>
      
      <div className="flex items-center justify-between text-neon-amber/50 mb-3 border-b border-neon-amber/20 pb-2 uppercase tracking-widest text-[10px] px-1">
        <div className="flex items-center gap-2">
          <TerminalIcon size={12} />
          <span>SYSTEM TERMINAL // OUTPUT</span>
        </div>
        <div className="flex items-center gap-2">
          {isEvaluating ? (
             <span className="text-neon-amber animate-pulse">RUNNING...</span>
          ) : (
             <span className="text-cyber-light/50">READY</span>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2 pb-4">
        {logs.length === 0 && (
          <div className="text-cyber-light/30 italic flex items-center gap-2 mt-2">
            <span className="animate-pulse">_</span> Awaiting execution command...
          </div>
        )}
        {logs.map((log, i) => {
          let color = 'text-cyber-light/80';
          let prefix = '>';
          
          if (log.type === 'success') {
            color = 'text-neon-green glow-text-green';
            prefix = '✓';
          }
          if (log.type === 'error') {
            color = 'text-neon-red glow-text-red font-bold';
            prefix = '✗';
          }
          if (log.type === 'sim') {
            color = 'text-neon-amber';
            prefix = '○';
          }
          if (log.type === 'info') {
            color = 'text-neon-blue';
            prefix = 'ℹ';
          }

          return (
            <div key={i} className={`flex items-start gap-3 hover:bg-white/5 px-1 py-0.5 rounded transition-colors ${color}`}>
              <span className="opacity-50 shrink-0 mt-0.5 text-[10px]">{prefix}</span>
              <span className="break-all">{log.message}</span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default Terminal;
