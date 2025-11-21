
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Usando gemini-3-pro-preview para tarefas complexas de codificação.
const GEMINI_MODEL = 'gemini-3-pro-preview';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `Você é um Sensei de Código e Engenheiro de Produto "Faixa Preta" especializado em dar vida a artefatos.
Seu objetivo é pegar um ou mais arquivos enviados pelo usuário — que podem ser designs de UI, esboços táticos num guardanapo, fotos de quadros brancos, objetos reais ou especificações em Markdown (.md) — e gerar instantaneamente uma aplicação web HTML/JS/CSS totalmente funcional e interativa.

DIRETRIZES PRINCIPAIS:
1. **Analisar e Abstrair**: 
    - **Markdown/Texto**: Se receber arquivos de texto (.md), leia as regras, histórias de usuário ou estruturas de dados e implemente-as rigorosamente no código. Use o texto como a "regra do dojo".
    - **Múltiplas Entradas**: Combine as imagens e textos.
      - Exemplo: Imagem do layout + Markdown com as regras do jogo = Jogo completo.
      - Tente inferir a ordem lógica.
    - **Esboços/Wireframes**: Detecte botões, inputs e layout. Transforme-os em uma UI moderna e limpa.
    - **Fotos do Mundo Real**: Se o usuário enviar fotos de objetos, **Gamifique** ou crie um **Utilitário de Treino**.
      - *Mesa Bagunçada* -> Crie um jogo "Limpeza do Dojo".
      - *Objeto Aleatório* -> Transforme em um alvo de treino ou tracker.

2. **SEM IMAGENS EXTERNAS**:
    - **CRÍTICO**: NÃO use <img src="..."> com URLs externas. Elas falharão.
    - **AO INVÉS DISSO**: Use **CSS shapes**, **SVGs inline**, **Emojis**, ou **CSS gradients** para representar visualmente os elementos.
    - Se vir um "café", desenhe com CSS ou use um emoji ☕.

3. **Interatividade**: O resultado NÃO PODE ser estático. Precisa de botões, sliders, drag-and-drop ou visualizações dinâmicas.
4. **Autocontido**: O output deve ser um único arquivo HTML com CSS (<style>) e JavaScript (<script>) embutidos. Use Tailwind via CDN.
5. **Idioma**: Todo o texto da aplicação gerada deve estar em **PORTUGUÊS**.
6. **Robustez**: Se a entrada for ambígua, gere sua "melhor interpretação criativa" estilo Faixa Preta. Nunca retorne erro. Construa *algo* funcional.

FORMATO DA RESPOSTA:
Retorne APENAS o código HTML bruto. Não envolva em blocos de código markdown (\`\`\`html ... \`\`\`). Comece imediatamente com <!DOCTYPE html>.`;

export interface InputFile {
    base64: string;
    mimeType: string;
}

export type CreationType = 'app' | 'game' | 'utility';

export async function bringToLife(prompt: string, files: InputFile[] = [], type: CreationType = 'app'): Promise<string> {
  const parts: any[] = [];
  
  let typeInstruction = "";
  switch (type) {
      case 'game':
          typeInstruction = "FOCO: Crie um JOGO interativo e divertido. Adicione pontuação, níveis ou mecânicas de vitória/derrota.";
          break;
      case 'utility':
          typeInstruction = "FOCO: Crie uma FERRAMENTA ÚTIL ou Dashboard. Priorize funcionalidade, input de dados e visualização clara.";
          break;
      case 'app':
      default:
          typeInstruction = "FOCO: Crie uma INTERFACE WEB moderna e responsiva (Site ou App). Priorize layout, tipografia e UX.";
          break;
  }

  // Diretiva para múltiplas imagens e arquivos
  const filePrompt = files.length > 0
    ? `Analise estes ${files.length} arquivos como um Sensei. O usuário escolheu o estilo: ${type.toUpperCase()}. ${typeInstruction}.
       
       INSTRUÇÃO ADICIONAL DO USUÁRIO: "${prompt || 'Nenhuma instrução extra, use sua intuição de mestre.'}"
       
       Una a lógica visual e textual em um web app coeso e interativo. IMPORTANTE: NÃO use imagens externas. Recrie visuais com CSS/Emojis. Texto em Português.` 
    : prompt || "Crie um app de demonstração que mostre suas habilidades de Faixa Preta em código.";

  parts.push({ text: filePrompt });

  // Processar arquivos
  files.forEach(file => {
    if (file.mimeType === 'text/markdown' || file.mimeType === 'text/plain') {
        // Decodificar base64 de volta para texto para enviar como prompt textual (melhor compreensão para o modelo)
        try {
            // UTF-8 safe decoding
            const binaryString = atob(file.base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const textContent = new TextDecoder().decode(bytes);

            parts.push({
                text: `\n--- ARQUIVO DE ESPECIFICAÇÃO/REGRAS (${file.mimeType}) ---\n${textContent}\n--- FIM DO ARQUIVO ---\n`
            });
        } catch (e) {
            console.error("Erro ao decodificar Markdown", e);
            // Fallback para inlineData se falhar
            parts.push({
                inlineData: {
                    data: file.base64,
                    mimeType: "text/plain",
                },
            });
        }
    } else {
        // Imagens e PDFs vão como inlineData
        parts.push({
            inlineData: {
              data: file.base64,
              mimeType: file.mimeType,
            },
        });
    }
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    let text = response.text || "<!-- Falha ao gerar conteúdo -->";
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
    return text;
  } catch (error) {
    console.error("Erro na Geração Gemini:", error);
    throw error;
  }
}

export async function refineCode(currentHtml: string, instruction: string): Promise<string> {
    const parts: any[] = [];
    
    const refinementPrompt = `
    VOCÊ ESTÁ NO MODO DE "POLIMENTO TÉCNICO" (REFINAMENTO).
    
    Abaixo está o código HTML atual de uma aplicação gerada.
    O usuário (aluno do Dojo) solicitou um ajuste específico.
    
    INSTRUÇÃO DE AJUSTE: "${instruction}"
    
    DIRETRIZES DE REFINAMENTO:
    1. Mantenha toda a funcionalidade existente que não foi solicitado mudar.
    2. Se for pedido "Modo Claro/Escuro", ajuste as classes Tailwind (bg-zinc-900 -> bg-white, text-white -> text-zinc-900, etc).
    3. Se for pedido para corrigir um erro, analise o código e conserte a lógica ou visual.
    4. Retorne o CÓDIGO HTML COMPLETO e corrigido. Não retorne apenas o diff.
    
    --- CÓDIGO ATUAL ---
    ${currentHtml}
    --- FIM DO CÓDIGO ATUAL ---
    `;

    parts.push({ text: refinementPrompt });

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: { parts: parts },
            config: {
                systemInstruction: SYSTEM_INSTRUCTION, // Mantém a persona Sensei
                temperature: 0.3, // Menor temperatura para ajustes precisos
            },
        });

        let text = response.text || currentHtml;
        text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
        return text;

    } catch (error) {
        console.error("Erro no Refinamento Gemini:", error);
        throw error;
    }
}
