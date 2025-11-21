# 🚀 Guia de Deploy em Produção

Este guia orienta como colocar o **Faixa Preta IA** no ar de forma segura e performática.

---

## ⚠️ Aviso de Segurança Crítico (API Key)

Como esta é uma aplicação **Client-Side** (roda no navegador do usuário), a variável de ambiente contendo a chave da API do Google (`API_KEY`) será embutida no código JavaScript final.

**Risco:** Um usuário mal intencionado pode inspecionar o código e copiar sua chave.

**Mitigação Obrigatória para Produção:**
1.  Vá ao **Google Cloud Console** > **APIs & Services** > **Credentials**.
2.  Edite sua API Key.
3.  Em **Application restrictions**, selecione **HTTP referrers (web sites)**.
4.  Adicione EXATAMENTE o domínio do seu site (ex: `https://meu-dojo-app.vercel.app/*`).
5.  (Opcional) Em **API restrictions**, limite o uso apenas para a "Gemini API".

Isso garante que, mesmo se roubarem a chave, ela não funcionará fora do seu site.

---

## Opção 1: Vercel (Recomendado)

A maneira mais fácil de hospedar aplicações React/Vite.

1.  **Pré-requisitos:**
    *   Conta no GitHub/GitLab.
    *   Conta na Vercel.

2.  **Passos:**
    *   Faça push do código para um repositório no GitHub.
    *   Acesse o dashboard da Vercel e clique em **"Add New Project"**.
    *   Importe o repositório.
    *   **Configuração de Build:** A Vercel detecta Vite automaticamente.
        *   Framework Preset: `Vite`
        *   Build Command: `npm run build`
        *   Output Directory: `dist`
    *   **Environment Variables:**
        *   Adicione uma variável chamada `API_KEY`.
        *   Cole sua chave do Google AI Studio.
    *   Clique em **Deploy**.

---

## Opção 2: Netlify

Muito similar à Vercel.

1.  Arraste a pasta do projeto ou conecte ao Git.
2.  Em **Site Settings** > **Build & Deploy** > **Environment**:
    *   Adicione `API_KEY` = `sua-chave`.
3.  O comando de build é `npm run build` e o diretório é `dist`.

---

## Opção 3: Docker (Self-Hosted)

Para rodar em infraestrutura própria (AWS, Digital Ocean, Railway).

1.  Crie um arquivo `Dockerfile` na raiz:

```dockerfile
# Stage 1: Build
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# Argumento de build para injetar a chave (Cuidado: a chave fica no histórico da imagem se não usar secrets)
ARG API_KEY
ENV API_KEY=$API_KEY
RUN npm run build

# Stage 2: Serve (Nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2.  Build e Run:
```bash
docker build --build-arg API_KEY=sua_chave_aqui -t faixa-preta-ia .
docker run -p 8080:80 faixa-preta-ia
```

---

## Verificação Pós-Deploy

1.  Acesse a URL de produção.
2.  Abra o console do navegador (F12).
3.  Envie uma imagem de teste.
4.  Verifique se não há erros de **CORS** ou **403 Forbidden** (indica problema na restrição da API Key).
5.  Teste a funcionalidade de exportar backup JSON.
