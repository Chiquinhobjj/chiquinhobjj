
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useRef } from 'react';
import { ArrowDownTrayIcon, DocumentIcon, DocumentTextIcon, ArrowLeftIcon, EyeIcon, CodeBracketIcon, WrenchScrewdriverIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Creation } from './CreationHistory';

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  onReset: () => void;
  onRefine: (instruction: string) => void;
}

// Add type definition for the global pdfjsLib
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const LoadingStep = ({ text, active, completed }: { text: string, active: boolean, completed: boolean }) => (
    <div className={`flex items-center space-x-3 transition-all duration-500 ${active || completed ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
        <div className={`w-4 h-4 flex items-center justify-center ${completed ? 'text-green-500' : active ? 'text-red-500' : 'text-zinc-700'}`}>
            {completed ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : active ? (
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            ) : (
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
            )}
        </div>
        <span className={`font-mono text-xs tracking-wide uppercase ${active ? 'text-zinc-200' : completed ? 'text-zinc-400 line-through' : 'text-zinc-600'}`}>{text}</span>
    </div>
);

const TextRenderer = ({ dataUrl }: { dataUrl: string }) => {
    const [content, setContent] = useState<string>("");

    useEffect(() => {
        try {
            // data:text/markdown;base64,....
            const base64 = dataUrl.split(',')[1];
            
            // UTF-8 safe decoding
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const text = new TextDecoder().decode(bytes);
            
            setContent(text);
        } catch (e) {
            setContent("Erro ao ler texto.");
        }
    }, [dataUrl]);

    return (
        <div className="w-full h-full overflow-auto bg-zinc-900 p-4 text-xs font-mono text-zinc-400 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-zinc-700">
            {content}
        </div>
    );
}

const PdfRenderer = ({ dataUrl }: { dataUrl: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderPdf = async () => {
      if (!window.pdfjsLib) {
        setError("Biblioteca PDF não inicializada");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const loadingTask = window.pdfjsLib.getDocument(dataUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 2.0 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error("Erro ao renderizar PDF:", err);
        setError("Não foi possível renderizar a prévia do PDF.");
        setLoading(false);
      }
    };

    renderPdf();
  }, [dataUrl]);

  if (error) {
    return (
        <div className="flex items-center justify-center h-full text-zinc-500 text-sm p-4 text-center border border-zinc-800 rounded-lg border-dashed">
            {error}
        </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-zinc-900 overflow-hidden ${loading ? 'animate-pulse' : ''}`}>
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-lg" />
    </div>
  );
}

export const LivePreview: React.FC<LivePreviewProps> = ({ creation, isLoading, isFocused, onReset, onRefine }) => {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [loadingStep, setLoadingStep] = useState(0);
  const [showRefine, setShowRefine] = useState(false);
  const [refineText, setRefineText] = useState("");

  useEffect(() => {
    if (creation) setView('preview');
  }, [creation]);

  useEffect(() => {
    if (isLoading) {
        setLoadingStep(0);
        const times = [1000, 3000, 6000]; 
        const timers = times.map((t, i) => setTimeout(() => setLoadingStep(i + 1), t));
        return () => timers.forEach(clearTimeout);
    } else {
        setLoadingStep(0);
        setShowRefine(false); // Close refine window on finish
    }
  }, [isLoading]);

  // Derive list of images to display (handle legacy format)
  const displayImages = creation?.originalImages 
    ? creation.originalImages 
    : creation?.originalImage 
        ? [creation.originalImage] 
        : [];

  const handleRefineSubmit = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (refineText.trim()) {
          onRefine(refineText);
          setRefineText("");
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          handleRefineSubmit();
      }
  };

  if (!isFocused) return null;

  return (
    <div className={`fixed inset-0 z-40 flex flex-col bg-zinc-950/95 backdrop-blur-xl transition-opacity duration-500 ${isLoading || creation ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-zinc-800 bg-zinc-950/50 shadow-md z-50 relative">
        <div className="flex items-center gap-4">
            <button 
                onClick={onReset}
                disabled={isLoading}
                className="group flex items-center space-x-2 px-4 py-2 bg-zinc-900 hover:bg-red-950/30 text-zinc-300 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 rounded-lg transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Voltar para a tela de upload"
            >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Voltar ao Dojo</span>
            </button>
            
            <div className="h-6 w-px bg-zinc-800 hidden sm:block"></div>

            <h2 className="font-mono text-sm font-bold text-zinc-200 uppercase tracking-wider truncate max-w-[150px] sm:max-w-xs">
                {isLoading ? 'Treinando IA...' : creation?.name || 'Novo Treino'}
            </h2>
        </div>

        {!isLoading && creation && (
            <div className="flex items-center gap-3">
                {/* Botão Refinar */}
                <div className="relative">
                    <button 
                        onClick={() => setShowRefine(!showRefine)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all 
                            ${showRefine ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'}
                        `}
                    >
                        <WrenchScrewdriverIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Ajustar</span>
                    </button>

                    {/* Refine Popover */}
                    {showRefine && (
                        <div className="absolute top-full right-0 mt-2 w-72 md:w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Polimento Técnico</div>
                                <button onClick={() => setShowRefine(false)} className="text-zinc-500 hover:text-white">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleRefineSubmit}>
                                <textarea 
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white placeholder-zinc-600 focus:border-red-500 outline-none resize-none h-24 mb-3 transition-colors"
                                    placeholder="Ex: 'Mude o fundo para azul', 'Corrija o título'..."
                                    value={refineText}
                                    onChange={(e) => setRefineText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                />
                                <div className="flex gap-2 mb-3">
                                    <button type="button" onClick={() => setRefineText("Mude para Modo Claro")} className="text-[10px] px-2 py-1 bg-zinc-800 rounded border border-zinc-700 hover:text-white hover:border-zinc-500 transition-colors">☀️ Claro</button>
                                    <button type="button" onClick={() => setRefineText("Mude para Modo Escuro")} className="text-[10px] px-2 py-1 bg-zinc-800 rounded border border-zinc-700 hover:text-white hover:border-zinc-500 transition-colors">🌑 Escuro</button>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!refineText.trim()}
                                    className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                                >
                                    <PaperAirplaneIcon className="w-3 h-3" />
                                    Aplicar Ajuste
                                </button>
                                <div className="text-[9px] text-zinc-600 text-center mt-2">
                                    Pressione <span className="font-mono bg-zinc-800 px-1 rounded">Ctrl + Enter</span> para enviar
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div className="flex items-center p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                    <button 
                        onClick={() => setView('preview')}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="Ver resultado visual"
                    >
                        <EyeIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Visual</span>
                    </button>
                    <button 
                        onClick={() => setView('code')}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="Ver código fonte"
                    >
                        <CodeBracketIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Código</span>
                    </button>
                </div>
                
                <a 
                 href={`data:text/html;charset=utf-8,${encodeURIComponent(creation.html)}`} 
                 download="treino-digital.html"
                 className="flex items-center space-x-2 px-4 py-2 bg-zinc-100 hover:bg-white text-black rounded-lg transition-colors text-xs font-bold uppercase tracking-wider border border-zinc-200 shadow-sm hover:shadow-md"
               >
                 <ArrowDownTrayIcon className="w-4 h-4" />
                 <span className="hidden sm:inline">Baixar</span>
               </a>
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Source (Image/PDF/Markdown) */}
        <div className="hidden lg:flex w-1/3 border-r border-zinc-800 bg-zinc-900/30 flex-col p-6">
             <div className="text-xs font-mono text-zinc-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                <DocumentIcon className="w-4 h-4" />
                Entrada (Técnica Original)
             </div>
             
             {/* Container de Imagens com Scroll */}
             <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                {isLoading && displayImages.length === 0 ? (
                     <div className="w-full aspect-[3/4] bg-zinc-800 animate-pulse rounded-lg"></div>
                ) : displayImages.length > 0 ? (
                    displayImages.map((img, idx) => (
                        <div key={idx} className="relative rounded-lg border border-zinc-800 border-dashed bg-zinc-900/50 overflow-hidden group min-h-[200px]">
                            {img.startsWith('data:application/pdf') ? (
                                <div className="h-96"><PdfRenderer dataUrl={img} /></div>
                            ) : img.startsWith('data:text/markdown') || img.startsWith('data:text/plain') ? (
                                <div className="h-64"><TextRenderer dataUrl={img} /></div>
                            ) : (
                                <img src={img} className="w-full h-auto object-contain" alt={`Original ${idx + 1}`} />
                            )}
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                                {img.startsWith('data:text/') ? <DocumentTextIcon className="w-3 h-3" /> : null}
                                #{idx + 1}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-zinc-600 text-sm text-center mt-10">Nenhuma entrada selecionada</div>
                )}
             </div>
        </div>

        {/* Right Panel: Output */}
        <div className="flex-1 relative bg-zinc-950">
            {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-64 space-y-6">
                        <LoadingStep text="Analisando Combinação de Golpes..." active={loadingStep === 0} completed={loadingStep > 0} />
                        <LoadingStep text="Detectando Fluxo Lógico e Regras..." active={loadingStep === 1} completed={loadingStep > 1} />
                        <LoadingStep text="Gerando Aplicação Mestre..." active={loadingStep === 2} completed={loadingStep > 2} />
                        <LoadingStep text="Polindo o Dojo..." active={loadingStep === 3} completed={loadingStep > 3} />
                    </div>
                </div>
            ) : (
                view === 'preview' ? (
                    <iframe 
                        srcDoc={creation?.html} 
                        className="w-full h-full bg-white" 
                        title="Preview"
                        sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                    />
                ) : (
                    <div className="w-full h-full overflow-auto p-6">
                        <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap">
                            {creation?.html}
                        </pre>
                    </div>
                )
            )}
        </div>

      </div>
    </div>
  );
};
