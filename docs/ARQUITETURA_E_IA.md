# 🧠 Arquitetura de IA e Backend

Este documento detalha o funcionamento do "cérebro" do aplicativo, localizado principalmente em `services/gemini.ts`.

## 1. O Modelo e a Persona

Utilizamos o modelo **Gemini 3 Pro Preview** (ou fallback para Flash) para garantir alta capacidade de raciocínio lógico e geração de código complexo.

### O "Sensei de Código"
O System Prompt instrui a IA a assumir a persona de um **Sensei Faixa Preta**. Isso não é apenas estético; define o comportamento do modelo:
*   **Rigoroso**: Segue regras de Markdown estritamente.
*   **Intuitivo**: Preenche lacunas em desenhos mal feitos (assumindo a "melhor interpretação criativa").
*   **Disciplina Visual**: Proibido usar imagens externas (que quebrariam o app). Deve desenhar tudo com CSS ou usar Emojis.

## 2. Fluxo de Processamento de Dados (`bringToLife`)

A função `bringToLife` é o coração da geração. O fluxo é o seguinte:

1.  **Ingestão de Arquivos**:
    *   O usuário faz upload de múltiplos arquivos.
    *   **Imagens/PDFs**: São convertidos para Base64 e enviados como `inlineData` (multimodalidade nativa).
    *   **Markdown/Texto**: São decodificados via `TextDecoder` (para suportar UTF-8/Acentos) e injetados no prompt como **Texto Puro**. Isso aumenta drasticamente a aderência da IA às regras escritas, pois o texto é processado semanticamente, não visualmente.

2.  **Montagem do Prompt**:
    *   Combina a "Intenção do Usuário" (o texto digitado na caixa).
    *   Combina o "Tipo de Treino" (App, Game, Utilidade) para ajustar o foco da geração (ex: Games precisam de pontuação; Utils precisam de input de dados).
    *   Anexa os arquivos processados.

3.  **Geração (Output)**:
    *   O modelo retorna um **Single File Component** (HTML + CSS + JS embutidos).
    *   Não usamos Markdown blocks no output final para facilitar a renderização direta no iframe.

## 3. Persistência e Histórico

A aplicação segue uma arquitetura **Local-First**:

*   **Storage**: Todo o histórico (`CreationHistory`) é salvo no `localStorage` do navegador.
*   **Estrutura de Dados**:
    ```typescript
    interface Creation {
      id: string;
      name: string;     // Nome gerado ou inferido
      html: string;     // O código fonte gerado
      originalImages: string[]; // Base64 das entradas (para re-visualização)
      timestamp: Date;
    }
    ```
*   **Backup**: O sistema de Exportar/Importar gera um arquivo `.json` contendo o objeto `Creation`, permitindo que o usuário salve seus "treinos" fisicamente em sua máquina.

## 4. Tratamento de Erros e Fallbacks

*   **InvalidCharacterError (btoa)**: Implementamos `TextEncoder` antes de converter strings para Base64 para suportar caracteres latinos/português em arquivos de texto.
*   **PDF Rendering**: O frontend usa `pdf.js` apenas para *visualização* do usuário. Para a IA, o PDF é enviado como blob binário para a API multimodal do Gemini processar.
