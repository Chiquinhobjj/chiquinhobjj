
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useEffect } from 'react';
import { ArrowUpTrayIcon, CpuChipIcon, LightBulbIcon, Square2StackIcon, XMarkIcon, BoltIcon, DevicePhoneMobileIcon, PuzzlePieceIcon, WrenchScrewdriverIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CreationType } from '../services/gemini';

interface InputAreaProps {
  onGenerate: (prompt: string, files: File[], type: CreationType) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const ContextualTips = () => {
    const tips = [
        "Transforme múltiplas fotos de um caderno em um site completo",
        "Envie diagrama e logo juntos para compor a marca",
        "Transforme um diagrama de ataque de Jiu-Jitsu em app",
        "Converta um wireframe de app de meditação em código",
        "Use um arquivo .md com as regras do jogo e deixe a IA programar",
        "Digitalize seu quadro branco de estratégias de combate"
    ];
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // fade out
            setTimeout(() => {
                setIndex(prev => (prev + 1) % tips.length);
                setFade(true); // fade in
            }, 500); // Wait for fade out
        }, 4000); 
        return () => clearInterval(interval);
    }, [tips.length]);

    return (
        <div className="flex flex-col items-center space-y-2 min-h-[3rem]">
            <div className="flex items-center space-x-2 text-red-400 text-xs font-mono uppercase tracking-widest opacity-80">
                <LightBulbIcon className="w-4 h-4" />
                <span>Sugestão do Sensei</span>
            </div>
            <span 
                className={`
                    inline-block text-center transition-all duration-500 transform 
                    ${fade ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-4 blur-sm'} 
                    text-zinc-300 text-sm font-medium leading-tight max-w-md
                `}
            >
                {tips[index]}
            </span>
        </div>
    );
};

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [creationType, setCreationType] = useState<CreationType>('app');

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const files = Array.from(fileList);
    const validFiles = files.filter(f => 
        f.type.startsWith('image/') || 
        f.type === 'application/pdf' || 
        f.name.endsWith('.md') || 
        f.type === 'text/markdown' ||
        f.type === 'text/plain'
    );

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    } else {
      alert("Por favor, envie imagens, PDFs ou arquivos Markdown (.md).");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    
    handleFiles(e.dataTransfer.files);
  }, [disabled, isGenerating]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) {
        setIsDragging(true);
    }
  }, [disabled, isGenerating]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
      if (selectedFiles.length === 0) return;
      onGenerate(userPrompt, selectedFiles, creationType);
      // Clear files after submit to reset state
      setSelectedFiles([]);
      setUserPrompt("");
  };

  const typeOptions: {id: CreationType, label: string, icon: any}[] = [
      { id: 'app', label: 'App / Site', icon: DevicePhoneMobileIcon },
      { id: 'game', label: 'Game', icon: PuzzlePieceIcon },
      { id: 'utility', label: 'Ferramenta', icon: WrenchScrewdriverIcon },
  ];

  // Sugestões baseadas no tipo selecionado (Katas)
  const suggestions = {
      app: [
          "Landing Page Minimalista", 
          "Dashboard Administrativo", 
          "Portfólio de Fotografia",
          "E-commerce de um produto só"
      ],
      game: [
          "Quiz Educativo", 
          "Jogo da Memória", 
          "Clicker / Idle Game",
          "Aventura de Texto (RPG)"
      ],
      utility: [
          "Calculadora de ROI", 
          "Lista de Tarefas (Kanban)", 
          "Pomodoro Timer",
          "Gerador de Senhas"
      ]
  };

  return (
    <div className="w-full max-w-4xl mx-auto perspective-1000 flex flex-col gap-4">
      
      {/* Upload Zone */}
      <div 
        className={`relative group transition-all duration-300 ${isDragging ? 'scale-[1.01]' : ''}`}
      >
        <label
          className={`
            relative flex flex-col items-center justify-center
            min-h-[16rem] md:min-h-[20rem]
            bg-zinc-900/50 
            backdrop-blur-sm
            rounded-xl border border-dashed
            cursor-pointer overflow-hidden
            transition-all duration-300
            ${isDragging 
              ? 'border-red-500 bg-zinc-900/80 shadow-[inset_0_0_30px_rgba(220,38,38,0.2)]' 
              : selectedFiles.length > 0 ? 'border-zinc-600 bg-zinc-900/70' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/60'
            }
            ${isGenerating ? 'pointer-events-none' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
            {/* Grid Tático de Fundo */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                 style={{backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
            </div>
            
            {/* Preview Area if files selected */}
            {selectedFiles.length > 0 ? (
                <div className="w-full h-full p-6 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto max-h-[20rem]">
                    {selectedFiles.map((file, idx) => (
                        <div key={idx} onClick={(e) => { e.preventDefault(); }} className="relative group/file aspect-square bg-zinc-800 rounded-lg border border-zinc-700 flex flex-col items-center justify-center overflow-hidden">
                            {file.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover opacity-70 group-hover/file:opacity-100 transition-opacity" />
                            ) : (
                                <div className="text-zinc-400 flex flex-col items-center p-2 text-center">
                                    <Square2StackIcon className="w-8 h-8 mb-2" />
                                    <span className="text-[10px] break-all">{file.name}</span>
                                </div>
                            )}
                            <button 
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeFile(idx); }}
                                className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    <div className="flex flex-col items-center justify-center aspect-square border border-dashed border-zinc-700 rounded-lg text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors">
                        <ArrowUpTrayIcon className="w-6 h-6 mb-1" />
                        <span className="text-[10px] uppercase font-bold">Adicionar</span>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 flex flex-col items-center text-center space-y-6 md:space-y-8 p-6 md:p-8 w-full">
                    <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-transform duration-500 ${isDragging ? 'scale-110' : 'group-hover:-translate-y-1'}`}>
                        <div className={`absolute inset-0 rounded-full bg-zinc-800 border border-zinc-700 shadow-2xl flex items-center justify-center ${isGenerating ? 'animate-pulse' : ''}`}>
                            {isGenerating ? (
                                <CpuChipIcon className="w-8 h-8 md:w-10 md:h-10 text-red-500 animate-spin-slow" />
                            ) : isDragging ? (
                                <Square2StackIcon className="w-8 h-8 md:w-10 md:h-10 text-red-500 animate-bounce" />
                            ) : (
                                <ArrowUpTrayIcon className="w-8 h-8 md:w-10 md:h-10 text-zinc-300" />
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 md:space-y-4 w-full max-w-3xl">
                         {isDragging ? (
                            <h3 className="text-xl sm:text-2xl md:text-4xl text-red-500 font-bold">Solte para combinar golpes!</h3>
                        ) : (
                             <ContextualTips />
                        )}
                        <p className="text-zinc-500 text-xs sm:text-base font-light tracking-wide">
                            Clique ou arraste imagens e markdown
                        </p>
                    </div>
                </div>
            )}

            <input
                type="file"
                multiple
                accept="image/*,application/pdf,.md,text/markdown,text/plain"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating || disabled}
            />
        </label>
      </div>

      {/* Control Panel (Visible always, active when files present) */}
      <div className={`
          transition-all duration-500 ease-out
          flex flex-col md:flex-row gap-4
          ${selectedFiles.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale cursor-not-allowed'}
      `}>
          
          {/* Left: Prompt Text Area */}
          <div className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 focus-within:border-red-500/50 transition-colors flex flex-col">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block pl-1 flex justify-between">
                  <span>Instrução do Sensei (Opcional)</span>
              </label>
              
              <textarea 
                  className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-600 resize-none outline-none h-16 scrollbar-thin scrollbar-thumb-zinc-700"
                  placeholder="Descreva detalhes específicos: cores, regras do jogo, ou comportamento desejado..."
                  maxLength={500}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  disabled={selectedFiles.length === 0 || isGenerating}
              />

              {/* Suggestion Chips (Katas) */}
              <div className="mt-2 flex flex-wrap gap-2">
                  {suggestions[creationType].map((sugg, i) => (
                      <button
                          key={i}
                          onClick={() => setUserPrompt(sugg)}
                          disabled={selectedFiles.length === 0 || isGenerating}
                          className="text-[10px] px-2 py-1 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-white hover:border-red-500/50 hover:bg-red-900/10 transition-all flex items-center gap-1"
                      >
                          <SparklesIcon className="w-3 h-3" />
                          {sugg}
                      </button>
                  ))}
              </div>

              <div className="text-right text-[10px] text-zinc-600 pt-1">{userPrompt.length}/500</div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-3 w-full md:w-64">
              
              {/* Type Selector */}
              <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                  {typeOptions.map((opt) => (
                      <button
                          key={opt.id}
                          onClick={() => setCreationType(opt.id)}
                          disabled={selectedFiles.length === 0 || isGenerating}
                          className={`
                              flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all duration-200
                              ${creationType === opt.id 
                                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' 
                                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                              }
                          `}
                          title={`Criar ${opt.label}`}
                      >
                          <opt.icon className={`w-5 h-5 mb-1 ${creationType === opt.id ? 'text-red-500' : ''}`} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">{opt.label}</span>
                      </button>
                  ))}
              </div>

              {/* Generate Button */}
              <button
                  onClick={handleSubmit}
                  disabled={selectedFiles.length === 0 || isGenerating}
                  className={`
                      flex-1 flex items-center justify-center gap-2
                      text-sm font-bold uppercase tracking-widest
                      rounded-lg transition-all duration-300
                      h-12
                      ${selectedFiles.length > 0 
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]' 
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      }
                  `}
              >
                  {isGenerating ? (
                      <>
                        <CpuChipIcon className="w-5 h-5 animate-spin" />
                        <span>Treinando...</span>
                      </>
                  ) : (
                      <>
                        <BoltIcon className="w-5 h-5" />
                        <span>Iniciar Treino</span>
                      </>
                  )}
              </button>
          </div>
      </div>

    </div>
  );
};
