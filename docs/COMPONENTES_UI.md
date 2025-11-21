# 🎨 Componentes de Interface e Design System

A interface do **Faixa Preta IA** foi desenhada para evocar a sensação de um **Dojo Digital Moderno**. O Design System mistura a sobriedade do minimalismo "Dark Mode" com a energia da cor vermelha (faixa, sangue, urgência).

## 1. Design System (Tema Tatame)

Definido em `index.css`:
*   **Cores Base**: Zinc-950 (Fundo Profundo), Zinc-900 (Painéis), Red-600 (Ação/Destaque).
*   **Textura**: `.bg-tatame` cria um padrão quadriculado sutil usando gradientes CSS, simulando o piso de um tatame.
*   **Tipografia**: `Inter` para UI geral e `JetBrains Mono` para elementos técnicos e código.

## 2. Componentes Principais

### `Hero.tsx` (A Narrativa Visual)
*   **Função**: Apresentar o conceito de "Alavanca" e criar ambientação.
*   **Destaque**: Possui um sistema de animação (`DrawingTransformation`) que cicla ícones de um estado de "Rascunho" (wireframe cinza) para "Faixa Preta" (colorido, neon, pulsante). Isso conta a história do app sem palavras.

### `InputArea.tsx` (O Tatame de Entrada)
*   **UX**: Área de Drag & Drop massiva.
*   **Features**:
    *   **Multimodal**: Aceita Imagens, PDFs e Markdown simultaneamente.
    *   **Dicas Contextuais**: Um carrossel de sugestões ("Sugestão do Sensei") que roda frases para inspirar o usuário.
    *   **Seletor de Tipo**: Permite direcionar a IA para criar `App`, `Game` ou `Ferramenta`.
    *   **Validação**: Impede envio vazio e feedback visual de loading.

### `LivePreview.tsx` (O Sandbox)
*   **Função**: Renderizar o código gerado de forma segura e mostrar os inputs originais.
*   **Arquitetura**:
    *   **Split View**: Esquerda (Inputs originais) | Direita (Resultado).
    *   **Renderizadores**:
        *   `iframe`: Para o HTML gerado (com sandbox attributes).
        *   `PdfRenderer`: Usa `pdf.js` e Canvas HTML5 para desenhar PDFs.
        *   `TextRenderer`: Exibe arquivos .md decodificados.
*   **Navegação**: Botão "Voltar ao Dojo" para resetar o estado.

### `CreationHistory.tsx` (O Arquivo)
*   **Layout**: Lista horizontal com scroll ("Carrossel").
*   **Visual**: Cards compactos com thumbnails dos inputs originais.
*   **Funcionalidade**:
    *   Clique para reabrir um projeto.
    *   Botão de download (`ArrowDownOnSquareIcon`) para exportar o JSON de backup.

## 3. App.tsx (Controlador)

O componente raiz gerencia o estado global da sessão:
*   `activeCreation`: Qual projeto está sendo visualizado.
*   `isGenerating`: Estado de loading (bloqueia inputs).
*   `history`: Array de criações carregadas.

Ele orquestra a chamada ao `gemini.ts` e a transição entre a tela de input e a tela de preview.
