# 🗺️ Blueprint Técnico - Faixa Preta IA

Este documento descreve a arquitetura atual e o roteiro de evolução técnica para escalar o **Faixa Preta IA** de um protótipo local para uma plataforma robusta.

---

## 1. Arquitetura Atual: "Local-First Sensei"

Atualmente, o app opera em um modelo **Client-Side Heavy**.

```mermaid
graph LR
    User[Usuário] -->|Drag & Drop| App[React Client]
    App -->|Processamento de Arquivos| Utils[Base64/TextEncoder]
    App -->|Request (Files + Prompt)| GeminiAPI[Google Gemini 3 Pro]
    GeminiAPI -->|Response (HTML String)| App
    App -->|Render| Iframe[Sandbox]
    App -->|Persist| LocalStorage[Browser Storage]
```

### Pontos Fortes
*   **Custo Zero de Backend:** Não há servidores intermediários.
*   **Privacidade:** Os dados (imagens/prompts) vão direto do browser para o Google, sem serem salvos em banco de dados nosso.
*   **Latência Baixa:** Resposta direta.

### Limitações
*   **API Key Exposta:** A chave precisa estar no cliente (veja Guia de Deploy para mitigação).
*   **Sem Persistência Cross-Device:** Se limpar o cache, perde os projetos.
*   **Contexto Limitado:** Não consegue lembrar de projetos passados para iteração.

---

## 2. Roadmap de Evolução

### Fase 2: O Dojo Conectado (Curto Prazo)
Objetivo: Permitir compartilhamento e maior segurança.

*   **Proxy Server (Edge Functions):**
    *   Implementar Vercel/Netlify Edge Functions para esconder a API Key do Gemini.
    *   O Front-end chama `/api/generate`, o Edge chama o Google e devolve o resultado.
*   **Supabase/Firebase (Lite):**
    *   Salvar apenas os metadados e o HTML gerado para permitir compartilhamento via Link (ex: `faixapreta.ia/share/xyz123`).

### Fase 3: A Academia Mestre (Longo Prazo)
Objetivo: Contas de usuário e "Vibe Coding" real.

*   **Auth System:** Login com Google/GitHub.
*   **Cloud Storage:** Salvar as imagens originais em Bucket (S3/R2) para não depender de Base64 no LocalStorage (que tem limite de 5-10MB).
*   **Editor de Código Híbrido:** Integração com Monaco Editor para permitir que desenvolvedores editem o código gerado manualmente dentro da plataforma.

---

## 3. Especificações Técnicas da IA (System Prompt V2)

Para melhorar a qualidade das "Alavancas", o prompt do Sensei deve evoluir para suportar bibliotecas externas de forma segura.

**Melhoria Planejada:**
*   Permitir importação de bibliotecas específicas via CDN (Chart.js para dashboards, Three.js para 3D).
*   Implementar "Reasoning Tokens" (Pensamento em Cadeia) antes de gerar o código, para planejar a arquitetura do app antes de escrever a primeira linha de HTML.

---

## 4. Estrutura de Dados (Schema Futuro)

Quando migrarmos para banco de dados, o schema sugerido é:

```json
{
  "project_id": "uuid",
  "user_id": "uuid",
  "title": "string",
  "intention_type": "APP | GAME | UTILITY",
  "artifacts": [
    { "type": "image", "url": "s3://..." },
    { "type": "markdown", "content": "..." }
  ],
  "generated_code": "text/html",
  "versions": [
    { "version": 1, "code": "...", "timestamp": "..." }
  ],
  "created_at": "datetime"
}
```
