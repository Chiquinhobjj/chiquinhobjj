# Faixa Preta IA - Dojo Digital

## 🥋 Visão Geral: O Conceito de "Alavanca"

O **Faixa Preta IA** não é apenas uma ferramenta de criação de códigos; é um **Dojo Digital** focado em transformar ideias abstratas em **Alavancas Digitais**.

### O que é uma Alavanca?
No contexto deste projeto, uma alavanca é qualquer artefato digital (App, Jogo ou Utilitário) que multiplica o potencial do usuário.
- Um desenho num guardanapo vira um **Dashboard de Gestão**.
- Uma foto de uma mesa bagunçada vira um **Jogo de Organização**.
- Um arquivo de texto com regras vira um **Software Funcional**.

A IA atua como o "Sensei", interpretando a intenção por trás do rascunho e entregando uma solução robusta e polida.

---

## 🚀 Funcionalidades Principais

1.  **Criação "One-Shot" (Tiro Único)**: Foco total na ideia inicial. O usuário envia os artefatos, define a intenção, e a IA gera o resultado final de uma vez.
2.  **Entradas Multimodais**:
    *   **Imagens**: Fotos de quadros brancos, rascunhos em papel, wireframes.
    *   **PDFs**: Documentações, slides ou especificações.
    *   **Markdown (.md)**: Regras de negócio ou histórias de usuário escritas.
3.  **Preview em Tempo Real**: Um ambiente seguro (sandbox) para testar o código gerado instantaneamente.
4.  **Histórico Local (Arquivo do Dojo)**: Persistência automática dos projetos no navegador.
5.  **Backup/Restore**: Capacidade de exportar e importar projetos via arquivos JSON.

---

## 🛠 Stack Tecnológico

*   **Frontend Framework**: React 19 + Vite
*   **Linguagem**: TypeScript
*   **Estilização**: Tailwind CSS (Design System "Dojo/Tatame")
*   **IA Engine**: Google GenAI SDK (`@google/genai`)
*   **Modelo**: Gemini 2.0 Flash / Gemini 3 Pro Preview
*   **Renderização PDF**: PDF.js
*   **Ícones**: Heroicons

---

## 📂 Estrutura de Diretórios

```
/
├── components/       # Componentes React (UI)
├── services/         # Lógica de integração com Gemini API
├── docs/             # Documentação do Projeto (Você está aqui)
├── App.tsx           # Controlador Principal
├── index.css         # Estilos Globais e Tema Tatame
└── index.html        # Entry point
```

---

## 🏃‍♂️ Como Rodar

Este projeto utiliza a estrutura padrão do Vite.

1.  **Instalar dependências**: `npm install`
2.  **Configurar Chave de API**: Definir `process.env.API_KEY` com sua chave Google GenAI.
3.  **Rodar servidor**: `npm run dev`
