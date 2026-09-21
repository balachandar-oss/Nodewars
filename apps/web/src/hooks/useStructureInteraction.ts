import { useState, useCallback } from 'react';
import { StructureInfo, StructureType, getStructureInfo } from '../utils/structureData';

export interface UseStructureInteractionOptions {
  onStructureInteract?: (structure: StructureInfo) => void;
}

/**
 * Hook for managing structure interaction state in game environments
 *
 * Example usage:
 * ```
 * const { structures, addStructure, playerPosition, setPlayerPosition, selectedStructure } =
 *   useStructureInteraction();
 *
 * // In your game loop:
 * const handlePlayerMove = (x: number, y: number) => {
 *   setPlayerPosition({ x, y });
 * };
 *
 * // Add structures for each completed mission:
 * useEffect(() => {
 *   if (progress.status === 'COMPLETE') {
 *     addStructure('TERMINAL', { x: 100, y: 100 });
 *   }
 * }, [progress]);
 * ```
 */
export function useStructureInteraction(options?: UseStructureInteractionOptions) {
  const [structures, setStructures] = useState<StructureInfo[]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [selectedStructure, setSelectedStructure] = useState<StructureInfo | null>(null);

  const addStructure = useCallback((
    type: StructureType,
    position: { x: number; y: number },
    customContent?: Partial<StructureInfo['content']>
  ) => {
    const newStructure = getStructureInfo(type, position);
    if (customContent) {
      newStructure.content = { ...newStructure.content, ...customContent };
    }

    // Prevent duplicates of the same structure type
    setStructures(prev => {
      const filtered = prev.filter(s => s.type !== type);
      return [...filtered, newStructure];
    });
  }, []);

  const removeStructure = useCallback((type: StructureType) => {
    setStructures(prev => prev.filter(s => s.type !== type));
  }, []);

  const clearStructures = useCallback(() => {
    setStructures([]);
  }, []);

  const handleStructureInteract = useCallback((structure: StructureInfo) => {
    setSelectedStructure(structure);
    options?.onStructureInteract?.(structure);
  }, [options]);

  const clearSelection = useCallback(() => {
    setSelectedStructure(null);
  }, []);

  return {
    structures,
    addStructure,
    removeStructure,
    clearStructures,
    playerPosition,
    setPlayerPosition,
    selectedStructure,
    handleStructureInteract,
    clearSelection,
  };
}
