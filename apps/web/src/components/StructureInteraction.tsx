import React, { useState, useEffect } from 'react';
import { X, Code2, BookOpen, Server, Lock, Database, Zap, Radio, Copy, Check } from 'lucide-react';
import {
  StructureInfo,
  EndpointInfo,
  ResourceItem,
  EventStreamItem,
  AuthInfo,
  getStructureColorClass
} from '../utils/structureData';

interface StructureInteractionProps {
  structures: StructureInfo[];
  playerPosition: { x: number; y: number };
  onInteract?: (structure: StructureInfo) => void;
}

interface CollisionState {
  structure: StructureInfo | null;
  distance: number;
}

const StructureInteraction: React.FC<StructureInteractionProps> = ({
  structures,
  playerPosition,
  onInteract,
}) => {
  const [collision, setCollision] = useState<CollisionState>({ structure: null, distance: Infinity });
  const [selectedStructure, setSelectedStructure] = useState<StructureInfo | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Detect collisions
  useEffect(() => {
    let closest: CollisionState = { structure: null, distance: Infinity };

    structures.forEach(struct => {
      const dx = playerPosition.x - struct.position.x;
      const dy = playerPosition.y - struct.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < struct.radius && distance < closest.distance) {
        closest = { structure: struct, distance };
      }
    });

    setCollision(closest);
  }, [playerPosition, structures]);

  // Handle keyboard interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E') {
        if (collision.structure && !selectedStructure) {
          e.preventDefault();
          setSelectedStructure(collision.structure);
          onInteract?.(collision.structure);
        }
      }
      if (e.key === 'Escape' && selectedStructure) {
        e.preventDefault();
        setSelectedStructure(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collision.structure, selectedStructure, onInteract]);

  const handleCopyCode = () => {
    if (selectedStructure?.content.codeSnippet) {
      navigator.clipboard.writeText(selectedStructure.content.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const colorClass = selectedStructure
    ? getStructureColorClass(selectedStructure.color)
    : null;

  return (
    <>
      {/* INTERACTION PROMPT */}
      {collision.structure && !selectedStructure && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in">
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-mono text-white/70 tracking-widest animate-pulse">
              [ STRUCTURE DETECTED ]
            </div>
            <div className={`px-6 py-3 border-2 ${
              colorClass
                ? `${colorClass.border} ${colorClass.bg}`
                : 'border-neon-blue bg-neon-blue/10'
            } rounded-sm`}>
              <div className={`font-mono text-xs tracking-widest flex items-center gap-2 ${
                colorClass ? colorClass.text : 'text-neon-blue'
              }`}>
                <span className="w-2 h-2 rounded-full animate-pulse bg-current"></span>
                {collision.structure.title}
              </div>
              <div className="font-mono text-[10px] text-white/50 text-center mt-2 tracking-widest">
                PRESS [E] TO INTERACT
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRUCTURE INFO MODAL */}
      {selectedStructure && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedStructure(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative max-w-2xl w-full max-h-[80vh] overflow-y-auto glass-panel border-2"
            style={{
              borderColor: colorClass
                ? `var(--color-${selectedStructure.color})`
                : 'var(--color-neon-blue)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`sticky top-0 p-6 border-b-2 ${colorClass?.bg || 'bg-neon-blue/10'} flex items-start justify-between`}>
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-12 h-12 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  colorClass
                    ? `${colorClass.border} ${colorClass.bg}`
                    : 'border-neon-blue bg-neon-blue/10'
                }`}>
                  <selectedStructure.icon size={24} className={colorClass?.text || 'text-neon-blue'} />
                </div>
                <div>
                  <h2 className={`text-2xl font-title tracking-widest uppercase ${
                    colorClass?.text || 'text-neon-blue'
                  }`}>
                    {selectedStructure.content.title}
                  </h2>
                  <p className="text-xs font-mono text-white/50 mt-1 tracking-widest">
                    {selectedStructure.content.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStructure(null)}
                className="text-white/40 hover:text-white transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {selectedStructure.content.details.map((detail, idx) => (
                  <div key={idx} className="p-3 border border-white/10 bg-black/40 rounded-sm">
                    <div className="text-[10px] font-mono text-white/40 tracking-widest mb-1">
                      {detail.label}
                    </div>
                    <div className="text-sm font-mono text-white font-bold">
                      {String(detail.value)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Code Snippet */}
              {selectedStructure.content.codeSnippet && (
                <StructureCodeBlock
                  code={selectedStructure.content.codeSnippet}
                  onCopy={handleCopyCode}
                  copied={copiedCode}
                />
              )}

              {/* Endpoints */}
              {selectedStructure.content.endpoints && selectedStructure.content.endpoints.length > 0 && (
                <StructureEndpoints endpoints={selectedStructure.content.endpoints} />
              )}

              {/* Auth Info */}
              {selectedStructure.content.authInfo && (
                <StructureAuthInfo authInfo={selectedStructure.content.authInfo} />
              )}

              {/* Resources */}
              {selectedStructure.content.resources && selectedStructure.content.resources.length > 0 && (
                <StructureResources resources={selectedStructure.content.resources} />
              )}

              {/* Event Stream */}
              {selectedStructure.content.eventStream && selectedStructure.content.eventStream.length > 0 && (
                <StructureEventStream events={selectedStructure.content.eventStream} />
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-4 border-t border-white/10 bg-black/60 flex justify-between items-center text-xs font-mono text-white/50 tracking-widest">
              <span>MISSION {String(selectedStructure.missionNumber).padStart(2, '0')}</span>
              <span>ESC TO CLOSE</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface StructureCodeBlockProps {
  code: string;
  onCopy: () => void;
  copied: boolean;
}

const StructureCodeBlock: React.FC<StructureCodeBlockProps> = ({ code, onCopy, copied }) => (
  <div className="border border-neon-blue/30 bg-black/60 rounded-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-neon-blue/20 flex items-center justify-between bg-neon-blue/5">
      <div className="flex items-center gap-2 text-neon-blue">
        <Code2 size={14} />
        <span className="text-xs font-mono tracking-widest">CODE SNIPPET</span>
      </div>
      <button
        onClick={onCopy}
        className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded transition-colors ${
          copied
            ? 'bg-neon-green/20 text-neon-green'
            : 'text-white/40 hover:text-white/70'
        }`}
      >
        {copied ? (
          <>
            <Check size={12} /> COPIED
          </>
        ) : (
          <>
            <Copy size={12} /> COPY
          </>
        )}
      </button>
    </div>
    <pre className="p-4 text-[11px] font-mono text-white/80 overflow-x-auto leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);

interface StructureEndpointsProps {
  endpoints: EndpointInfo[];
}

const StructureEndpoints: React.FC<StructureEndpointsProps> = ({ endpoints }) => (
  <div className="border border-neon-green/30 bg-neon-green/5 rounded-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-neon-green/20 flex items-center gap-2 bg-neon-green/10">
      <Server size={14} className="text-neon-green" />
      <span className="text-xs font-mono text-neon-green tracking-widest">API ENDPOINTS</span>
    </div>
    <div className="p-4 space-y-3">
      {endpoints.map((ep, idx) => (
        <div key={idx} className="text-xs font-mono space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
              ep.method === 'GET'
                ? 'bg-neon-blue/20 text-neon-blue'
                : 'bg-neon-amber/20 text-neon-amber'
            }`}>
              {ep.method}
            </span>
            <span className="text-white font-mono break-all">{ep.path}</span>
          </div>
          <div className="text-white/50 ml-16">{ep.description}</div>
          {ep.status && (
            <div className="text-neon-amber ml-16">{ep.status}</div>
          )}
        </div>
      ))}
    </div>
  </div>
);

interface StructureAuthInfoProps {
  authInfo: AuthInfo;
}

const StructureAuthInfo: React.FC<StructureAuthInfoProps> = ({ authInfo }) => {
  const statusColor = authInfo.status === 'AUTHENTICATED'
    ? 'text-neon-green'
    : authInfo.status === 'UNAUTHORIZED'
    ? 'text-neon-red'
    : 'text-neon-amber';

  return (
    <div className={`border rounded-sm overflow-hidden ${
      authInfo.status === 'AUTHENTICATED'
        ? 'border-neon-green/30 bg-neon-green/5'
        : 'border-neon-red/30 bg-neon-red/5'
    }`}>
      <div className={`px-4 py-3 border-b flex items-center gap-2 ${
        authInfo.status === 'AUTHENTICATED'
          ? 'border-neon-green/20 bg-neon-green/10'
          : 'border-neon-red/20 bg-neon-red/10'
      }`}>
        <Lock size={14} className={statusColor} />
        <span className={`text-xs font-mono tracking-widest ${statusColor}`}>
          AUTH STATUS: {authInfo.status}
        </span>
      </div>
      <div className="p-4 space-y-2">
        {authInfo.role && (
          <div className="text-xs font-mono">
            <span className="text-white/50">Role: </span>
            <span className="text-white">{authInfo.role}</span>
          </div>
        )}
        {authInfo.permissions && authInfo.permissions.length > 0 && (
          <div className="text-xs font-mono">
            <div className="text-white/50 mb-1">Permissions:</div>
            <div className="flex flex-wrap gap-1">
              {authInfo.permissions.map((perm, idx) => (
                <span key={idx} className="px-2 py-1 bg-neon-green/20 text-neon-green rounded text-[10px]">
                  {perm}
                </span>
              ))}
            </div>
          </div>
        )}
        {authInfo.middleware && authInfo.middleware.length > 0 && (
          <div className="text-xs font-mono">
            <div className="text-white/50 mb-2">Middleware Chain:</div>
            <div className="space-y-1">
              {authInfo.middleware.map((mw, idx) => (
                <div key={idx} className="text-white/70 pl-4 border-l-2 border-neon-blue/30">
                  {mw}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface StructureResourcesProps {
  resources: ResourceItem[];
}

const StructureResources: React.FC<StructureResourcesProps> = ({ resources }) => (
  <div className="border border-neon-blue/30 bg-neon-blue/5 rounded-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-neon-blue/20 flex items-center gap-2 bg-neon-blue/10">
      <Database size={14} className="text-neon-blue" />
      <span className="text-xs font-mono text-neon-blue tracking-widest">STORED RESOURCES ({resources.length})</span>
    </div>
    <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
      {resources.map((res, idx) => (
        <div key={idx} className="text-xs font-mono p-2 bg-black/40 border border-white/5 rounded">
          <div className="flex justify-between items-center">
            <span className="text-neon-blue">{res.id}</span>
            <span className={`text-[10px] ${res.status === 'ACTIVE' ? 'text-neon-green' : 'text-neon-amber'}`}>
              {res.status}
            </span>
          </div>
          <div className="text-white/50 mt-1">
            Type: <span className="text-white">{res.type}</span> | Created: {res.created}
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface StructureEventStreamProps {
  events: EventStreamItem[];
}

const StructureEventStream: React.FC<StructureEventStreamProps> = ({ events }) => (
  <div className="border border-neon-purple/30 bg-neon-purple/5 rounded-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-neon-purple/20 flex items-center gap-2 bg-neon-purple/10">
      <Radio size={14} className="text-neon-purple" />
      <span className="text-xs font-mono text-neon-purple tracking-widest">EVENT STREAM</span>
    </div>
    <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
      {events.map((evt, idx) => (
        <div key={idx} className="text-xs font-mono p-2 bg-black/40 border border-white/5 rounded">
          <div className="flex justify-between items-start mb-1">
            <span className="text-neon-purple font-bold">{evt.event}</span>
            <span className="text-white/40 text-[10px]">
              {new Date(evt.timestamp).toLocaleTimeString()}
            </span>
          </div>
          {evt.payload && (
            <div className="text-white/60">
              <code>{JSON.stringify(evt.payload).substring(0, 60)}...</code>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default StructureInteraction;
