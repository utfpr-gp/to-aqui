# 📍 Tô Aqui!

**Status do Sistema:**
[![CI - Develop (Laboratório)](https://github.com/utfpr-gp/to-aqui/actions/workflows/ci.yml/badge.svg)](https://github.com/utfpr-gp/to-aqui/actions/workflows/cy.yml)
[![CI - Main (Produção)](https://github.com/utfpr-gp/to-aqui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/utfpr-gp/to-aqui/actions/workflows/cy.yml)


🔗 **Link em Produção:** [Aguardando Deploy na Nuvem]

👨‍💻 **Autores:** [Nome do Aluno A, Nome do Aluno B, Nome do Aluno C]

## 🎯 1. Visão Geral
Sistema Full-Cycle de registro de presenças acadêmicas utilizando QR Code dinâmico. O sistema permite que o professor projete um QR Code rotativo diretamente do sistema acadêmico da UTFPR via extensão de navegador. Os alunos escaneiam, fazem login com o e-mail institucional do Google, e a presença é validada e preenchida automaticamente na pauta.

## 📚 2. Documentação Oficial (Docs as Code)
Toda a especificação do sistema está versionada na pasta `/docs`:
* 📄 **[PRD (Product Requirements Document)](./docs/prd.md):** Visão do produto, Personas, User Stories e Divisão de Épicos.
* 📐 **[SDD (Software Design Document)](./docs/sdd.md):** Diagrama de banco de dados (Mermaid), contratos de API, DTOs e Fluxo de Autenticação.
* ✅ **[Checklist de Avaliação](./docs/checklist.md):** Controle de entrega dos IDs e RAs da disciplina de Tópicos Especiais.

## 🛠 3. Stack Tecnológica
* **Arquitetura:** Monorepo (Back, Front e Extensão no mesmo repositório).
* **Backend (API):** NestJS, TypeScript, JWT, Google OAuth.
* **Banco de Dados:** PostgreSQL (Nuvem) gerenciado via Prisma ORM.
* **Frontend (Mobile App):** Angular.
* **Integração:** Extensão de Navegador (Chrome) com manipulação de DOM.

## 🚀 4. Quick Start (Como Executar)

**1. Clone o repositório:**

    git clone https://github.com/seu-usuario/to-aqui.git
    cd to-aqui

**2. Instale as dependências:**
Como é um Monorepo, você precisa instalar os pacotes em cada camada:

    # Terminal 1 - Iniciar a API NestJS
    cd apps/api
    npm install
    npm run start:dev

    # Terminal 2 - Iniciar o Frontend Angular
    cd apps/web
    npm install
    npm run start

    # Terminal 3 - Compilar a Extensão
    cd apps/extension
    npm install
    npm run build

**3. Variáveis de Ambiente:**
Não esqueça de copiar o arquivo `.env.example` para `.env` dentro da pasta `apps/api` e configurar a `DATABASE_URL` do seu PostgreSQL.

