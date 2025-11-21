# 🥋 PRD - Documento de Requisitos do Produto
**Projeto:** Faixa Preta IA (Bring Any Idea to Life)  
**Versão:** 1.0 (Fase Alavanca)  
**Status:** Em Produção (MVP)

---

## 1. Introdução e Visão

### 1.1 O Problema
Empreendedores, criativos e gestores têm ideias brilhantes o tempo todo — rascunhadas em guardanapos, cadernos ou quadros brancos. No entanto, a barreira técnica para transformar esses esboços em software funcional é alta, lenta e cara. A "ideia" morre no papel por falta de execução imediata.

### 1.2 A Solução: "Alavanca Digital"
O **Faixa Preta IA** atua como um catalisador instantâneo. Ele usa IA multimodal de última geração para interpretar a **intenção** por trás de um artefato visual ou textual e gerar, em segundos, uma aplicação web funcional (App, Jogo ou Ferramenta).
Não é apenas "gerar código"; é criar uma **alavanca** que permite ao usuário testar, validar e utilizar sua ideia imediatamente.

### 1.3 Proposta de Valor Única (UVP)
*   **Velocidade Extrema:** Do papel para o navegador em < 15 segundos.
*   **Interpretação de Mestre (Sensei):** A IA não copia pixels; ela entende lógica de negócios, regras de jogos e fluxos de UX.
*   **Zero Config:** Não requer login, setup de ambiente ou conhecimento de git para começar.

---

## 2. Público Alvo

*   **Product Managers:** Para prototipar features rapidamente.
*   **Empreendedores:** Para criar MVPs de landing pages ou calculadoras.
*   **Desenvolvedores:** Para gerar boilerplate visual (Tailwind/HTML) a partir de wireframes.
*   **Educadores/Gamificadores:** Para transformar conceitos em jogos interativos.

---

## 3. Escopo Funcional (MoSCoW)

### Must Have (Essencial - Já Implementado)
- [x] **Upload Multimodal:** Suporte a Imagens (PNG/JPG), PDF e Markdown (.md).
- [x] **Engine "Sensei":** Prompt de sistema especializado em gerar Single File Components (HTML/JS/CSS).
- [x] **Seletor de Intenção:** Opções explícitas para criar Apps, Games ou Ferramentas.
- [x] **Live Preview Sandbox:** Visualização segura do código gerado lado a lado com o original.
- [x] **Histórico Local (Dojo Archive):** Persistência de criações no navegador.
- [x] **Exportação/Backup:** Download do código HTML e do JSON do projeto.

### Should Have (Desejável - Próximos Passos)
- [ ] **Edição Assistida:** Capacidade de pedir ajustes simples ("Mude o fundo para azul").
- [ ] **Compartilhamento:** Gerar uma URL pública para o protótipo criado.
- [ ] **Voice Input:** Ditar as regras do app enquanto envia a foto.

### Won't Have (Fora do Escopo Atual)
- [ ] **Backend Real:** O app não gera servidores, bancos de dados SQL ou APIs complexas. Tudo é front-end logic ou mockado.
- [ ] **Hospedagem Permanente:** O app não substitui um provedor de hosting.

---

## 4. Métricas de Sucesso

1.  **Taxa de Sucesso na Compilação:** % de códigos gerados que rodam sem erros de sintaxe no iframe.
2.  **Retenção de Histórico:** Frequência com que usuários voltam para acessar "Treinos" antigos.
3.  **Engajamento de Backup:** Número de downloads/exportações de projetos.

---

## 5. Design e Identidade

*   **Tema:** "Dojo Digital / Faixa Preta".
*   **Estética:** Dark Mode, Vermelho Sangue, Minimalismo Técnico.
*   **Tom de Voz:** Respeitoso, Disciplinado, Motivador ("Sensei").
