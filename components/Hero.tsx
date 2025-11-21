/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { DocumentTextIcon, BoltIcon, TrophyIcon, MapIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { FireIcon, StarIcon } from '@heroicons/react/24/solid';

// Componente que simula o desenho virando realidade (Estilo Dojo)
const DrawingTransformation = ({ 
  initialIcon: InitialIcon, 
  finalIcon: FinalIcon, 
  label,
  delay, 
  x, 
  y,
  rotation = 0
}: { 
  initialIcon: React.ElementType, 
  finalIcon: React.ElementType, 
  label: string,
  delay: number,
  x: string,
  y: string,
  rotation?: number
}) => {
  const [stage, setStage] = useState(0); // 0: Oculto, 1: Rascunho, 2: Faixa Preta

  useEffect(() => {
    const cycle = () => {
      setStage(0);
      setTimeout(() => setStage(1), 500); // Começa a desenhar
      setTimeout(() => setStage(2), 3500); // Ganha vida
    };

    // Atraso inicial
    const startTimeout = setTimeout(() => {
      cycle();
      // Repete o ciclo
      const interval = setInterval(cycle, 9000);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  return (
    <div 
      className="absolute transition-all duration-1000 ease-in-out z-0 pointer-events-none"
      style={{ top: y, left: x, transform: `rotate(${rotation}deg)` }}
    >
      <div className={`relative w-24 h-32 md:w-32 md:h-44 rounded-lg backdrop-blur-md transition-all duration-1000 ${stage === 2 ? 'bg-zinc-900/80 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] scale-110 -translate-y-4' : 'bg-zinc-900/30 border-zinc-700 scale-100 border border-dashed'}`}>
        
        {/* Etiqueta que aparece no estágio 2 */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white border border-red-500 text-[9px] md:text-[11px] font-mono font-bold px-2 py-0.5 rounded-sm transition-all duration-500 ${stage === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {label}
        </div>

        {/* Container de Conteúdo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          
          {/* Estágio 1: Rascunho Tático */}
          <div className={`absolute transition-all duration-1000 ${stage === 1 ? 'opacity-100' : 'opacity-0'}`}>
             <InitialIcon className="w-8 h-8 md:w-12 md:h-12 text-zinc-500 stroke-1" />
             {/* Marcadores de canto técnico */}
             <div className="absolute -inset-2 border border-zinc-700/30 opacity-50"></div>
             <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-zinc-500"></div>
             <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-zinc-500"></div>
             <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-zinc-500"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-zinc-500"></div>
          </div>

          {/* Estágio 2: Faixa Preta/Vivo */}
          <div className={`absolute transition-all duration-700 flex flex-col items-center ${stage === 2 ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-75 blur-sm'}`}>
             <FinalIcon className="w-10 h-10 md:w-14 md:h-14 text-red-500" />
             {stage === 2 && (
               <div className="mt-3 flex items-center gap-2 px-2 py-1 bg-black/60 rounded-full border border-red-900/50">
                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                 <div className="w-10 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 w-full animate-[shimmer_1s_infinite]"></div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Hero: React.FC = () => {
  return (
    <>
      {/* Background Transformation Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top Left: Técnica -> Maestria */}
        <div className="hidden lg:block">
            <DrawingTransformation 
            initialIcon={ShieldCheckIcon} 
            finalIcon={TrophyIcon} 
            label="RANK S"
            delay={0} 
            x="4%" 
            y="8%"
            rotation={-3} 
            />
        </div>

        {/* Bottom Right: Estratégia -> Ação */}
        <div className="hidden md:block">
            <DrawingTransformation 
            initialIcon={MapIcon} 
            finalIcon={FireIcon} 
            label="COMBATE"
            delay={3000} 
            x="85%" 
            y="70%"
            rotation={2} 
            />
        </div>

        {/* Top Right: Rascunho -> Poder */}
        <div className="hidden lg:block">
            <DrawingTransformation 
            initialIcon={DocumentTextIcon} 
            finalIcon={BoltIcon} 
            label="ENERGIA"
            delay={6000} 
            x="85%" 
            y="12%"
            rotation={1} 
            />
        </div>

        {/* Bottom Left: Ideia -> Estrela */}
        <div className="hidden md:block">
            <DrawingTransformation 
            initialIcon={DocumentTextIcon} 
            finalIcon={StarIcon} 
            label="LENDA"
            delay={4500} 
            x="5%" 
            y="65%"
            rotation={-2} 
            />
        </div>
      </div>

      {/* Hero Text Content */}
      <div className="text-center relative z-10 max-w-6xl mx-auto px-4 pt-10 md:pt-16">
        <div className="inline-flex items-center justify-center px-3 py-1 mb-6 border border-red-900/50 rounded-full bg-red-900/10 backdrop-blur-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-red-200 text-xs font-mono uppercase tracking-widest">Dojo de Inteligência Artificial</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6 leading-[1.1]">
          Transforme sua ideia em <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">Alavanca</span>.
        </h1>
        
        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light">
          Use a inteligência artificial para transformar rabiscos, ideias ou fotos em alavancas digitais — apps e utilitários que turbinam sua rotina, criatividade ou negócio.
        </p>
      </div>
    </>
  );
};