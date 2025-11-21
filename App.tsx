
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { LivePreview } from './components/LivePreview';
import { CreationHistory, Creation } from './components/CreationHistory';
import { bringToLife, refineCode, InputFile, CreationType } from './services/gemini';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Creation[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Load history from local storage or fetch examples on mount
  useEffect(() => {
    const initHistory = async () => {
      const saved = localStorage.getItem('gemini_app_history');
      let loadedHistory: Creation[] = [];

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          loadedHistory = parsed.map((item: any) => ({
              ...item,
              timestamp: new Date(item.timestamp)
          }));
        } catch (e) {
          console.error("Failed to load history", e);
        }
      }

      if (loadedHistory.length > 0) {
        setHistory(loadedHistory);
      } else {
        // If no history (new user or cleared), load examples
        try {
           const exampleUrls = [
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/vibecode-blog.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/cassette.json',
               'https://storage.googleapis.com/sideprojects-asronline/bringanythingtolife/chess.json'
           ];

           const examples = await Promise.all(exampleUrls.map(async (url) => {
               const res = await fetch(url);
               if (!res.ok) return null;
               const data = await res.json();
               return {
                   ...data,
                   timestamp: new Date(data.timestamp || Date.now()),
                   id: data.id || crypto.randomUUID()
               };
           }));
           
           const validExamples = examples.filter((e): e is Creation => e !== null);
           setHistory(validExamples);
        } catch (e) {
            console.error("Failed to load examples", e);
        }
      }
    };

    initHistory();
  }, []);

  // Save history when it changes
  useEffect(() => {
    if (history.length > 0) {
        try {
            localStorage.setItem('gemini_app_history', JSON.stringify(history));
        } catch (e) {
            console.warn("Local storage full or error saving history", e);
        }
    }
  }, [history]);

  // Helper to process file based on type
  const processFile = (file: File): Promise<InputFile> => {
    return new Promise((resolve, reject) => {
      // Check if it is a markdown or text file
      const isMarkdown = file.name.endsWith('.md') || file.type === 'text/markdown' || file.type === 'text/plain';

      if (isMarkdown) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                // UTF-8 safe encoding using TextEncoder
                // This prevents "InvalidCharacterError" with Portuguese characters in btoa
                try {
                    const encoder = new TextEncoder();
                    const data = encoder.encode(reader.result);
                    let binary = '';
                    const len = data.byteLength;
                    // Chunking might be needed for very large files, but adequate for typical text files
                    for (let i = 0; i < len; i++) {
                        binary += String.fromCharCode(data[i]);
                    }
                    const base64 = btoa(binary);
                    
                    resolve({
                        base64: base64,
                        mimeType: 'text/markdown'
                    });
                } catch (err) {
                    reject(err);
                }
            } else {
                reject(new Error('Failed to read text file'));
            }
        };
        reader.onerror = (error) => reject(error);
      } else {
        // Image or PDF
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                // Remove the data URL prefix
                const base64 = reader.result.split(',')[1];
                resolve({
                    base64: base64,
                    mimeType: file.type.toLowerCase()
                });
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = (error) => reject(error);
      }
    });
  };

  const handleGenerate = async (promptText: string, files: File[] = [], type: CreationType = 'app') => {
    setIsGenerating(true);
    setActiveCreation(null);

    try {
      // Process all files
      const processedFiles: InputFile[] = await Promise.all(files.map(processFile));

      const html = await bringToLife(promptText, processedFiles, type);
      
      if (html) {
        // Reconstruct full Data URLs for display/storage
        const originalImages = processedFiles.map(f => `data:${f.mimeType};base64,${f.base64}`);

        const newCreation: Creation = {
          id: crypto.randomUUID(),
          name: files.length > 1 ? `Combo (${files.length})` : (files[0]?.name || 'Novo Treino'),
          html: html,
          originalImages: originalImages,
          // Legacy support
          originalImage: originalImages[0],
          timestamp: new Date(),
        };
        setActiveCreation(newCreation);
        setHistory(prev => [newCreation, ...prev]);
      }

    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Algo deu errado ao trazer seu treino à vida. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (instruction: string) => {
      if (!activeCreation) return;
      
      setIsGenerating(true); // Show loading state inside LivePreview
      try {
          const newHtml = await refineCode(activeCreation.html, instruction);
          
          // Update the active creation with new HTML
          const updatedCreation = {
              ...activeCreation,
              html: newHtml,
              timestamp: new Date() // Update timestamp to bump priority if we wanted
          };
          
          setActiveCreation(updatedCreation);
          
          // Update history to save the refined version
          setHistory(prev => prev.map(c => c.id === updatedCreation.id ? updatedCreation : c));
          
      } catch (error) {
          console.error("Refinement failed", error);
          alert("Não foi possível aplicar o ajuste. Tente novamente.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleReset = () => {
    setActiveCreation(null);
    setIsGenerating(false);
  };

  const handleSelectCreation = (creation: Creation) => {
    setActiveCreation(creation);
  };

  const handleExportCreation = (creation: Creation) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(creation));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup-dojo-${creation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = event.target?.result as string;
            const parsed = JSON.parse(json);
            
            // Basic validation
            if (parsed.html && parsed.name) {
                const importedCreation: Creation = {
                    ...parsed,
                    timestamp: new Date(parsed.timestamp || Date.now()),
                    id: parsed.id || crypto.randomUUID()
                };
                
                // Add to history if not already there
                setHistory(prev => {
                    const exists = prev.some(c => c.id === importedCreation.id);
                    return exists ? prev : [importedCreation, ...prev];
                });

                setActiveCreation(importedCreation);
            } else {
                alert("Arquivo de backup inválido. Certifique-se de que é um JSON gerado por este aplicativo.");
            }
        } catch (err) {
            console.error("Import error", err);
            alert("Falha ao ler o arquivo de backup.");
        }
        if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const isFocused = !!activeCreation || isGenerating;

  return (
    <div className="h-[100dvh] bg-tatame text-zinc-50 selection:bg-red-500/30 overflow-y-auto overflow-x-hidden relative flex flex-col">
      
      {/* Centered Content Container */}
      <div 
        className={`
          min-h-full flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 
          transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)
          ${isFocused 
            ? 'opacity-0 scale-95 blur-sm pointer-events-none h-[100dvh] overflow-hidden' 
            : 'opacity-100 scale-100 blur-0'
          }
        `}
      >
        {/* Main Vertical Centering Wrapper */}
        <div className="flex-1 flex flex-col justify-center items-center w-full py-12 md:py-20">
          
          <div className="w-full mb-8 md:mb-16">
              <Hero />
          </div>

          <div className="w-full flex justify-center mb-8">
              <InputArea onGenerate={handleGenerate} isGenerating={isGenerating} disabled={isFocused} />
          </div>

        </div>
        
        <div className="flex-shrink-0 pb-6 w-full mt-auto flex flex-col items-center gap-6">
            <div className="w-full px-2 md:px-0">
                <CreationHistory history={history} onSelect={handleSelectCreation} onExport={handleExportCreation} />
            </div>
            
            <a 
              href="#" 
              className="text-zinc-600 hover:text-zinc-400 text-xs font-mono transition-colors pb-2"
            >
              Faixa Preta de IA
            </a>
        </div>
      </div>

      <LivePreview
        creation={activeCreation}
        isLoading={isGenerating}
        isFocused={isFocused}
        onReset={handleReset}
        onRefine={handleRefine}
      />

      <div className="fixed bottom-4 right-4 z-50">
        <button 
            onClick={handleImportClick}
            className="group flex items-center space-x-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 transition-all shadow-lg"
            title="Importar um projeto salvo anteriormente (.json)"
        >
            <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline group-hover:text-white transition-colors">Importar Backup</span>
            <ArrowUpTrayIcon className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        </button>
        <input 
            type="file" 
            ref={importInputRef} 
            onChange={handleImportFile} 
            accept=".json" 
            className="hidden" 
        />
      </div>
    </div>
  );
};

export default App;
