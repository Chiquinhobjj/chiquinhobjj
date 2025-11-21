
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ClockIcon, ArrowRightIcon, DocumentIcon, PhotoIcon, Square2StackIcon, DocumentTextIcon, ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';

export interface Creation {
  id: string;
  name: string;
  html: string;
  originalImage?: string; // Deprecated (kept for old history)
  originalImages?: string[]; // New: Supports multiple images
  timestamp: Date;
}

interface CreationHistoryProps {
  history: Creation[];
  onSelect: (creation: Creation) => void;
  onExport: (creation: Creation) => void;
}

export const CreationHistory: React.FC<CreationHistoryProps> = ({ history, onSelect, onExport }) => {
  if (history.length === 0) return null;

  const handleExport = (e: React.MouseEvent, item: Creation) => {
      e.stopPropagation(); // Evita abrir o item ao clicar em exportar
      onExport(item);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center space-x-3 mb-3 px-2">
        <ClockIcon className="w-4 h-4 text-zinc-500" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Arquivo do Dojo (Histórico)</h2>
        <div className="h-px flex-1 bg-zinc-800"></div>
      </div>
      
      {/* Horizontal Scroll Container for Compact Layout */}
      <div className="flex overflow-x-auto space-x-4 pb-2 px-2 scrollbar-hide">
        {history.map((item) => {
          // Determine image count and thumbnail
          const images = item.originalImages || (item.originalImage ? [item.originalImage] : []);
          const isMulti = images.length > 1;
          const thumb = images[0] || "";
          const isPdf = thumb.startsWith('data:application/pdf');
          const isText = thumb.startsWith('data:text/markdown') || thumb.startsWith('data:text/plain');

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="group flex-shrink-0 relative flex flex-col text-left w-44 h-28 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-lg transition-all duration-200 overflow-hidden cursor-pointer"
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="relative p-1.5 bg-zinc-800 rounded group-hover:bg-zinc-700 transition-colors border border-zinc-700/50">
                      {isPdf ? (
                          <DocumentIcon className="w-4 h-4 text-zinc-400" />
                      ) : isText ? (
                          <DocumentTextIcon className="w-4 h-4 text-zinc-400" />
                      ) : isMulti ? (
                          <Square2StackIcon className="w-4 h-4 text-zinc-400" />
                      ) : (
                          <PhotoIcon className="w-4 h-4 text-zinc-400" />
                      )}
                      
                      {isMulti && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold border border-zinc-900">
                            {images.length}
                        </span>
                      )}
                  </div>
                  
                  {/* Botão de Exportar Backup */}
                  <button 
                    onClick={(e) => handleExport(e, item)}
                    className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-zinc-700/50"
                    title="Salvar backup (.json)"
                  >
                    <ArrowDownOnSquareIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-auto">
                  <h3 className="text-sm font-medium text-zinc-300 group-hover:text-white truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-mono text-zinc-500">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex items-center space-x-1">
                        <span className="text-[10px] text-red-400 font-bold">ABRIR</span>
                        <ArrowRightIcon className="w-3 h-3 text-red-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
