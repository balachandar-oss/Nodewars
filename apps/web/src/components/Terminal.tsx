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
    <div className="terminal-window relative w-full h-full flex flex-col text-xs">

      <div className="terminal-titlebar shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="terminal-dot" style={{ backgroundColor: '#ff5f57', color: '#ff5f57' }}></div>
          <div className="terminal-dot" style={{ backgroundColor: '#ffbd2e', color: '#ffbd2e' }}></div>
          <div className="terminal-dot" style={{ backgroundColor: '#39ff9d', color: '#39ff9d' }}></div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold ml-2" style={{ color: 'var(--text-secondary)' }}>
          <TerminalIcon size={12} />
          <span>output</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] ml-auto">
          {isEvaluating ? (
             <span className="animate-pulse" style={{ color: 'var(--accent-gold)' }}>running...</span>
          ) : (
             <span style={{ color: 'var(--text-muted)' }}>ready</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar p-4 font-mono">
        {logs.length === 0 && (
          <div className="italic flex items-center gap-2 mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span className="animate-pulse">_</span> Waiting for you to run your code...
          </div>
        )}
        {logs.map((log, i) => {
          let color = 'rgba(255,255,255,0.8)';
          let prefix = '>';

          if (log.type === 'success') {
            color = 'var(--accent-mint)';
            prefix = '✓';
          }
          if (log.type === 'error') {
            color = 'var(--accent-rose)';
            prefix = '✗';
          }
          if (log.type === 'sim') {
            color = 'var(--accent-gold)';
            prefix = '○';
          }
          if (log.type === 'info') {
            color = 'var(--accent-sky)';
            prefix = 'i';
          }

          return (
            <div key={i} className="flex items-start gap-3 px-1 py-0.5 rounded transition-colors hover:bg-white/5" style={{ color }}>
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
