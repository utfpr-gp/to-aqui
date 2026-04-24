# 📐 Software Design Document (SDD) - Tô Aqui!

**Projeto:** Tô Aqui! (AutoPresence UTFPR)  
**Versão:** 1.0.0  
**Status:** 🟢 Pronto para Implementação  
**Stack Principal:** NestJS, Angular, Prisma ORM, PostgreSQL.

---

## 🏗️ 1. Arquitetura do Sistema (Estrutura Monorepo)

O projeto utiliza uma arquitetura de Monorepo. O Agente de IA deve respeitar a seguinte estrutura de pastas:

- **`apps/api`**: Servidor Backend (NestJS).
- **`apps/web`**: Aplicação Client (Angular 17+).
- **`apps/extension`**: Vanilla TypeScript para manipulação de DOM.

## 🤖 2. Orquestração e Ecossistema de Contexto (MCP)

> **Instrução para a IA:** Este projeto utiliza o Model Context Protocol (MCP) para garantir a paridade entre especificação e execução. Sempre utilize as ferramentas abaixo antes de propor alterações estruturais.

- **GitHub Projects MCP:** Utilize para sincronizar o status das User Stories (PRD) com o desenvolvimento técnico. As definições de "Done" devem seguir os Critérios de Aceitação das Issues.
- **Neon.tech MCP:** Interface obrigatória para introspecção e migração do banco de dados PostgreSQL. O esquema gerado pelo Prisma deve ser validado contra o estado real do banco via este MCP.
- **Stitch MCP (Google):** Utilizado para a geração e prototipação de interfaces Angular. Consulte este contexto para garantir que os componentes sigam os padrões visuais e funcionais definidos no Stitch.

## 📦 3. Stack Tecnológica e Bibliotecas

> Definição estrita das tecnologias permitidas. Nenhuma dependência externa deve ser instalada sem refletir aqui.

### Core & Infraestrutura

- **Ambiente:** Node.js v24.x LTS.
- **Banco de Dados:** PostgreSQL 16 (Local via Docker; Produção via Neon)
- **Backend:** NestJS v10.x.
- **Frontend:** Angular v17+ (Obrigatório o uso da nova Control Flow `@if`, `@for` e configuração estrita com `Standalone Components`. O uso de `NgModule` está proibido).
- **ORM:** Prisma v5.x (Interface oficial com o banco de dados).

### 🧪 Estratégia de Testes (Unificada com Jest)

O projeto adota o **Jest** como ferramenta única de testes para garantir consistência entre as camadas.

#### 🖥️ Backend (NestJS)

- **Unitários:** Foco em Services e Business Logic.
- **E2E (End-to-End):** Uso obrigatório de `supertest` para validar rotas e integração com Prisma/PostgreSQL.
- **Runner:** Jest nativo do NestJS.

#### 🌐 Frontend (Angular)

- **Unitários/Lógica:** Foco em Signals, Services de API e transformações de dados.
- **Component Testing:** Uso de `TestBed` com `jest-preset-angular` para validar templates e interações de UI.
- **Atenção:** Proibido o uso de Karma/Jasmine ou Vitest. Toda a suíte deve rodar sobre o motor do Jest.

### UI & Estilização (Frontend)

- **Design System:** DaisyUI (Obrigatório o uso das classes semânticas de componentes do DaisyUI combinadas com o Tailwind em vez de estilizar elementos HTML nativos do zero).
- **CSS Framework:** Tailwind CSS v4.0. (Configuração CSS-First via @import "tailwindcss". É proibido o uso de 'tailwind.config.js para definições de tema; utilize o bloco @theme no styles.css).
- **Ícones:** Lucide Angular (via `@spartan-ng/ui-icon-brain`).

### Bibliotecas e Utilitários Permitidos

- **WebSockets:** Socket.io v4.x (integrado via `@nestjs/platform-socket.io` v10.x).
- **State Management:** NgRx SignalStore v18+ (Para estados globais complexos).
- **Auth:** Passport.js + JWT (`@nestjs/jwt` e `@nestjs/passport`) para sessões seguras.
- **Validação:** `class-validator` e `class-transformer` (Obrigatório para os Pipes globais de validação de DTOs).
- **Documentação:** `@nestjs/swagger` (OpenAPI 3.0 para os contratos de API).
- **Utilitários:** `date-fns` v3.x (Para a lógica rigorosa de expiração do QR Code em 15s).

### 📚 Referências Técnicas e Instalação

> **Regra de Ouro:** O Agente DEVE consultar estas docs antes de executar comandos de scaffolding.

- **Tailwind com Angular:** [https://angular.dev/guide/tailwind]https://angular.dev/guide/tailwind)
- **Angular Overview:** https://angular.dev/overview
- **NestJS Overview:** https://docs.nestjs.com/
- **Prisma Postgres:** https://www.prisma.io/docs/postgres
- **DaisyUI Instalação:** https://daisyui.com/docs/install/

## 🗄️ 4. Arquitetura de Dados

### 📖 4.1. Glossário Técnico (Mapeamento)

| Termo PRD (PT-BR) | Entidade Técnica (EN) | Atributos Principais                  |
| :---------------- | :-------------------- | :------------------------------------ |
| Usuário           | `User`                | `id, email, name, role`               |
| Disciplina        | `Course`              | `id, name, code, professorId`         |
| Chamada / Sessão  | `Session`             | `id, courseId, startTime, isActive`   |
| Presença          | `Attendance`          | `id, sessionId, studentId, timestamp` |

### 🗄️ 4.2. Modelagem de Dados (Dicionário de Entidades)

> **Instrução para a IA:** Utilize este diagrama Mermaid como fonte da verdade para gerar o arquivo `schema.prisma` e as migrações do banco de dados.

```mermaid
erDiagram
    COURSE ||--o{ ENROLLMENT : "possui pauta de"
    USER ||--o{ ENROLLMENT : "matriculado em"
    USER ||--o{ ATTENDANCE : "realiza"
    COURSE ||--o{ SESSION : "possui"
    SESSION ||--o{ ATTENDANCE : "contém"

    USER {
        string id PK
        string email UK "E-mail validado via Pauta"
        string name
        string ra UK "Registro Acadêmico (Importado)"
        string role "PROFESSOR | STUDENT | ADMIN"
        datetime createdAt
    }

    COURSE {
        string id PK
        string name
        string code "Ex: TSI32B"
        string professorId FK
    }

    ENROLLMENT {
        string id PK
        string courseId FK
        string studentEmail "Usado para pré-cadastro antes do aluno logar"
        string studentId FK "Nulo até o aluno logar pela 1ª vez"
    }

    SESSION {
        string id PK
        string courseId FK
        datetime startTime
        datetime endTime
        boolean isActive
    }

    ATTENDANCE {
        string id PK
        string sessionId FK
        string studentId FK
        datetime timestamp
        boolean isManual "True se inserido pelo Prof (US08)"
    }
```

### 🗄️ 4.3. Regras de Migração e Operações Seguras (Zero-Downtime)

> **Instrução Crítica para a IA:** O ecossistema possui dualidade (Docker local / Neon produção). No entanto, como as migrações geradas localmente (`.sql`) serão executadas no Neon posteriormente, as regras de segurança aplicam-se já no ambiente de desenvolvimento.

- **Paridade de Ambiente:** Todas as criações de migração (`prisma migrate dev`) e testes DEVEM ocorrer contra o Docker local.
- **Proibição Destrutiva (Prevenção de Deploy):** É terminantemente proibido gerar migrações do Prisma que contenham operações destrutivas (`DROP TABLE`, `DROP COLUMN`, ou `ALTER COLUMN TYPE`). Se a IA gerar um arquivo `.sql` destrutivo localmente, ele destruirá dados no Neon durante o deploy.
- **Evolução de Esquema:** Qualquer alteração estrutural que exija renomear ou deletar campos deve utilizar o padrão _Expand and Contract_ (criar a nova coluna, permitir nulos temporariamente e manter a antiga intacta no Schema).

## 📑 5. Contratos Globais (DTOs & Interfaces)

> Tipagem TypeScript para validação de entrada (Request) e saída (Response).

- **AuthDTO:** `{ idToken: string }` -> Retorna Token JWT + Perfil do Usuário.
- **CreateSessionDTO:** `{ courseId: string, durationMinutes: number }` (Exclusivo Professor).
- **CheckInDTO:** `{ qrToken: string }` -> O `qrToken` é um JWT assinado com validade de 15 segundos.

## 🏗️ 6. Scaffolding Macro

### 📂 6.1. Estrutura de Diretórios — Backend (apps/api)

> **Instrução para a IA:** Organize a pasta `apps/api/src` utilizando estritamente a arquitetura padrão gerada pelo NestJS CLI (Flat Structure). Cada domínio de negócio deve ser uma pasta direta na raiz do `src/`.

| Pasta | Responsabilidade |
| :--- | :--- |
| `src/config/` | Validação obrigatória de variáveis de ambiente no bootstrap via `class-validator`. O servidor **não pode iniciar** com variáveis ausentes (Seção 9.1) |
| `src/prisma/` | `PrismaService` declarado como `@Global()`. Nenhum módulo de domínio deve importar `PrismaModule` diretamente |
| `src/auth/` | Validação do token Google, checagem de e-mail institucional e emissão de JWT de sessão |
| `src/users/` | Perfil do usuário, atribuição de `role` e vinculação do RA acadêmico |
| `src/courses/` | CRUD de disciplinas. Recurso pai de `enrollments` |
| `src/enrollments/` | Matrícula de alunos por e-mail. Roteado como sub-recurso: `/courses/:id/enrollments` (Seção 8.1) |
| `src/sessions/` | Criação de chamadas, geração de QR efêmero e controle de estado da sessão |
| `src/attendance/` | Validação do `qrToken` e registro de presença. Deve tratar idempotência via `P2002` do Prisma (Seção 8.4) |
| `src/events/` | `EventsGateway` (WebSocket) para emissão dos eventos `qr:updated` e `presence:updated` em tempo real |
| `src/common/` | Código transversal sem lógica de negócio: `GlobalExceptionFilter`, `JwtAuthGuard`, `RolesGuard`, `RolesDecorator` e `ValidationPipe` |

### 🧠 6.2. Core Services (Singleton)

| Service          | Responsabilidade Macro                                              |
| :--------------- | :------------------------------------------------------------------ |
| `PrismaService`  | Gerenciar conexão e pooling com o banco PostgreSQL (Neon.tech).     |
| `AuthService`    | Validar e-mail institucional e emitir Tokens de Acesso.             |
| `QrTokenService` | Assinar e verificar tokens JWT efêmeros para o QR Code (Segurança). |

### 📂 6.3. Estrutura de Diretórios Frontend (Angular)

> **Instrução para a IA:** A estrutura abaixo define os **domínios e suas responsabilidades**. É proibido criar pastas por tipo técnico (`components/`, `services/`) na raiz do `app/`. Todos os componentes são **Standalone** — o uso de `NgModule` é proibido.

| Pasta | Responsabilidade |
| :--- | :--- |
| `core/` | Singletons instanciados uma vez no bootstrap: `AuthGuard`, `TokenInterceptor` (injeta JWT), `ErrorInterceptor` (captura 4xx/5xx) e `AuthStore` (NgRx SignalStore global com perfil do usuário) |
| `shared/` | Componentes "burros" reutilizáveis sem lógica de negócio, pipes e diretivas. |
| `features/check-in/` | Fluxo do aluno: leitura do QR e confirmação de presença |
| `features/dashboard/` | Painel do professor: exibição do QR dinâmico via WebSocket e lista de presenças em tempo real |
| `features/roster/` | Gestão de pauta: listagem de disciplinas, alunos matriculados e adição manual de presença |


## 🛡️ 7. Segurança (API Protection)

> Políticas de acesso e integridade dos dados no nível do servidor.

- **ValidationPipe:** Configurado com `whitelist: true` para ignorar campos não mapeados nos DTOs.
- **JWT Expiry:** Tokens de usuário (8h); Tokens de QR Code (15 segundos).
- **CORS:** Restrito ao domínio do Frontend e à origem da Extensão Chrome.
- **Rate Limit:** Proteção contra ataques de força bruta na rota de check-in.
- **Tratamento de Erros (Exception Filter):** A IA deve implementar um `GlobalExceptionFilter`. É estritamente proibido retornar erros em formatos arbitrários. Toda falha deve retornar ao (Frontend) neste exato formato JSON:
  ```json
  {
    "statusCode": 400,
    "timestamp": "2026-03-20T23:19:20.000Z",
    "path": "/api/rota",
    "message": "Descrição detalhada do erro ou array de validações"
  }
  ```

## 📡 8. Padrões e Design de API (REST Guidelines)

> **Instrução para a IA:** Ao projetar novos contratos de API (Rotas e Payloads) nas especificações de Issues, você DEVE seguir rigorosamente os padrões abaixo.

### 8.1. Nomenclatura e Arquitetura REST

- **Pluralização:** Todos os recursos devem ser nomeados no plural (ex: `/users`, `/sessions`, `/courses`).
- **Sub-recursos:** Para ações aninhadas, utilize hierarquia clara (ex: `/courses/:id/enrollments` e não `/enrollments/course/:id`).
- **Ações (Verbos):** Se uma rota não for um CRUD básico, mas sim uma ação (ex: check-in, aprovação), o verbo deve vir no final da URL após o recurso pai (ex: `POST /attendance/check-in`, `POST /sessions/:id/generate-qr`).

### 8.2. Padronização de Payloads e Respostas

- **Payloads de Criação (POST/PUT):** Os DTOs devem utilizar _camelCase_ estrito. É proibido aninhar dados desnecessariamente se uma estrutura _flat_ for suficiente.
- **Respostas de Sucesso (200/201):**
  - Operações de criação (`POST`) devem retornar código `201 Created` contendo o objeto criado na íntegra.
  - Consultas (`GET`) de listagem devem sempre prever e retornar um array (mesmo que vazio `[]`).
- **Metadados:** Listagens que não possuírem paginação explícita devem retornar o array diretamente. Se houver paginação, devem retornar no formato: `{ "data": [], "meta": { "total", "page" } }`.

### 8.3. Segurança na Camada de Rota

- Toda rota que muta dados (POST, PUT, DELETE, PATCH) relacionada a configuração de sessão ou pauta (ex: `/sessions`) exige obrigatoriamente autenticação JWT e validação de permissão (`Role = Professor`).
- Apenas rotas públicas ou de autenticação (ex: `/auth/google`) e a rota de validação de QR Code pelo aluno podem operar sem permissão de `Professor`.

### 8.4. Concorrência e Idempotência (Operações Críticas)

- Todas as rotas de mutação de estado (especialmente o registro de presença em `/attendance/check-in`) DEVEM ser tratadas de forma idempotente.
- **Camada de Dados:** O banco deve possuir _Unique Constraints_ compostas (ex: `@@unique([sessionId, studentId])` no Prisma) para impedir inserções duplas.
- **Tratamento de Exceção:** O backend (NestJS) DEVE capturar exceções de violação de Unique Key (código `P2002` do Prisma) e tratá-las graciosamente. Em caso de presença duplicada, o sistema deve retornar um HTTP 200 silencioso ou um HTTP 409 (Conflict) com mensagem clara ("Presença já confirmada"), nunca um erro 500 (Internal Server Error).

## ⚙️ 9. Contrato de Configuração (Environment)

> **Instrução Crítica para a IA:** Nenhum dado sensível, URL externa ou chave secreta deve estar _hardcoded_ no código-fonte. O gerenciamento de ambiente é rigorosamente dividido entre Backend e Frontend.

### 9.1. Backend (NestJS)

Utilize obrigatoriamente o `@nestjs/config` (`ConfigModule`).

- **Validação Rigorosa:** É OBRIGATÓRIO implementar a validação de esquema no carregamento do módulo (utilizando `class-validator` e `class-transformer` em uma classe `EnvironmentVariables`). O servidor NÃO PODE iniciar se uma variável obrigatória estiver faltando.
- **Tipagem:** Utilize o `ConfigService` sempre tipado para garantir o autocompletar e a segurança do compilador.

**Contrato Base de Variáveis (.env):**

- `DATABASE_URL` = String de conexão do PostgreSQL. No ambiente local, o Agente DEVE assumir a URL do contêiner Docker (ex: `postgresql://usuario:senha@localhost:5432/nome_do_banco`). Em produção, a plataforma injetará a string do Neon.tech. O código deve ser agnóstico a essa mudança.
- `JWT_SECRET` = Chave para assinar o token de sessão de usuário.
- `JWT_EXPIRES_IN` = Tempo de expiração da sessão (ex: `8h`, `7d`).
- `QR_SECRET` = Chave isolada e exclusiva para assinar o token efêmero do QR Code.
- `GOOGLE_CLIENT_ID` = ID do Client OAuth (Usado para validar o token no backend).

### 9.2. Frontend (Angular)

Utilize a estrutura nativa de `environments` do Angular (`environment.ts` e `environment.development.ts`).

- Nenhum Service Angular pode ter a URL da API _hardcoded_ (ex: `http://localhost:3000/api`).
- **Contrato Base de Variáveis (Angular):**
  - `apiUrl` = A base URL do Backend NestJS.
  - `googleClientId` = O ID público do OAuth para renderizar o botão de login do Google.

## 🧩 10. Padrões Globais de Frontend (Angular)

### 10.1. Gerenciamento de Estado

- **Local State:** Utilizar exclusivamente **Signals** (`signal`, `computed`, `effect`) para estados confinados ao componente. Proibido o uso de `BehaviorSubject` para estados locais de UI.
- **Global State:** Para dados compartilhados (ex: Perfil do Usuário Logado, Sessão Ativa), utilizar o **NgRx SignalStore** (arquitetura leve e moderna).

### 10.2. Tratamento de Erros e UI Transitória

> **Instrução para a IA:** O Agente de UI nunca deve ignorar falhas da API.

- **Loading States:** Toda chamada HTTP deve acionar um `Skeleton` ou `Spinner` do Spartan desabilitando o botão de ação para evitar concorrência.
- **Global HTTP Interceptor:** O Frontend possui um Interceptor global. A IA não precisa anexar o Token JWT manualmente em cada requisição; o interceptor faz isso.
- **Error Handling:** Erros 4xx e 5xx da API (formatados no padrão NestJS da Seção 7) devem ser capturados e exibidos utilizando o componente global de **Toast** ou **Alert** do Spartan. Se o erro for `401 Unauthorized`, a Store deve limpar os dados e forçar o redirecionamento para o login.

## 🧪 11. Padrões de Qualidade e Testes (TDD)

> **Instrução para a IA:** Os testes automatizados são a garantia de funcionamento da linha de montagem. Testes vazios ou puramente sintáticos serão rejeitados.

- **Proibição de Testes "Ocos":** É proibido aprovar testes que apenas verifiquem se um _Mock_ foi chamado (ex: `expect(mock).toHaveBeenCalled()`) sem validar a mudança de estado real do sistema.
- **Backend (NestJS):** Os testes de Controllers e Services devem validar o fluxo de dados, exceções lançadas (ex: `HttpException`) e o payload exato de retorno mapeado no DTO. Sempre que possível, utilize banco de dados em memória ou mocks estritos que simulem as restrições do Prisma.
- **Frontend (Angular):** Testes de componente não devem focar apenas em métodos de classe TypeScript. Devem testar as interações do DOM (ex: simular clique no botão de gerar QR Code e verificar se o componente do Spartan acionou o estado de _Loading_ no HTML).
