# 📐 Software Design Document (SDD) - Tô Aqui!

**Projeto:** Tô Aqui! (AutoPresence UTFPR)  
**Versão:** 1.0.0  
**Status:** 🟢 Pronto para Implementação  
**Stack Principal:** NestJS, Angular, Prisma ORM, PostgreSQL.

---

## 🏗️ 1. Arquitetura do Sistema (Estrutura Monorepo)

O projeto utiliza uma arquitetura de Monorepo. O Agente de IA deve respeitar a seguinte estrutura de pastas:

* **`apps/api`**: Servidor Backend (NestJS). 
* **`apps/web`**: Aplicação Client (Angular 17+). 
* **`apps/extension`**: Vanilla TypeScript para manipulação de DOM.


## 🤖 2. Orquestração e Ecossistema de Contexto (MCP)
> **Instrução para a IA:** Este projeto utiliza o Model Context Protocol (MCP) para garantir a paridade entre especificação e execução. Sempre utilize as ferramentas abaixo antes de propor alterações estruturais.

* **GitHub Projects MCP:** Utilize para sincronizar o status das User Stories (PRD) com o desenvolvimento técnico. As definições de "Done" devem seguir os Critérios de Aceitação das Issues.
* **Neon.tech MCP:** Interface obrigatória para introspecção e migração do banco de dados PostgreSQL. O esquema gerado pelo Prisma deve ser validado contra o estado real do banco via este MCP.
* **Stitch MCP (Google):** Utilizado para a geração e prototipação de interfaces Angular. Consulte este contexto para garantir que os componentes sigam os padrões visuais e funcionais definidos no Stitch.

## 📦 3. Stack Tecnológica e Bibliotecas
> Definição estrita das tecnologias permitidas. Nenhuma dependência externa deve ser instalada sem refletir aqui.

### Core & Infraestrutura
* **Ambiente:** Node.js v20.x LTS.
* **Banco de Dados:** PostgreSQL 16 (Hospedado no Neon.tech).
* **Backend:** NestJS v10.x.
* **Frontend:** Angular v17+ (Obrigatório o uso da nova Control Flow `@if`, `@for` e configuração estrita com `Standalone Components`. O uso de `NgModule` está proibido).
* **ORM:** Prisma v5.x (Interface oficial com o banco de dados).
* **Testes:** `jest` e `supertest` (Obrigatório seguir o padrão oficial do NestJS para testes unitários e E2E. Proibido o uso de Vitest, Mocha ou qualquer outro test runner).

### Bibliotecas e Utilitários Permitidos
* **WebSockets:** Socket.io v4.x (integrado via `@nestjs/platform-socket.io` v10.x).
* **Auth:** Passport.js + JWT (`@nestjs/jwt` e `@nestjs/passport`) para sessões seguras.
* **Validação:** `class-validator` e `class-transformer` (Obrigatório para os Pipes globais de validação de DTOs).
* **Documentação:** `@nestjs/swagger` (OpenAPI 3.0 para os contratos de API).
* **Utilitários:** `date-fns` (Para a lógica rigorosa de expiração do QR Code em 15s).


## 🗄️ 4. Arquitetura de Dados

### 📖 4.1. Glossário Técnico (Mapeamento)
| Termo PRD (PT-BR) | Entidade Técnica (EN) | Atributos Principais |
| :--- | :--- | :--- |
| Usuário | `User` | `id, email, name, role` |
| Disciplina | `Course` | `id, name, code, professorId` |
| Chamada / Sessão | `Session` | `id, courseId, startTime, isActive` |
| Presença | `Attendance` | `id, sessionId, studentId, timestamp` |


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

## 📑 5. Contratos Globais (DTOs & Interfaces)
> Tipagem TypeScript para validação de entrada (Request) e saída (Response).

* **AuthDTO:** `{ idToken: string }` -> Retorna Token JWT + Perfil do Usuário.
* **CreateSessionDTO:** `{ courseId: string, durationMinutes: number }` (Exclusivo Professor).
* **CheckInDTO:** `{ qrToken: string }` -> O `qrToken` é um JWT assinado com validade de 15 segundos.


## 🏗️ 6. Scaffolding Macro (Arquitetura Backend)

### 📂 6.1. Estrutura de Diretórios (Padrão Oficial NestJS CLI)
> **Instrução para a IA:** Organize a pasta `apps/api/src` utilizando estritamente a arquitetura padrão gerada pelo NestJS CLI (Flat Structure). Cada domínio de negócio deve ser uma pasta direta na raiz do `src/`.

* **`src/auth/`**: Gestão de identidade Google, validação de domínio e fluxo de RA.
* **`src/sessions/`**: CRUD de chamadas e gerenciamento de estado da sessão.
* **`src/attendance/`**: Validação do QR e registro de presenças.
* **`src/events/`**: `EventsGateway` (WebSocket) para emissão do QR dinâmico e painel em tempo real.
* **`src/common/`**: Código compartilhado globalmente (Decorators customizados, Guards de JWT, Filters de Exceção).
* **`src/prisma/`**: Módulo global contendo o `PrismaService` para injeção de dependência do banco de dados.

### 🧠 6.2. Core Services (Singleton)
| Service | Responsabilidade Macro |
| :--- | :--- |
| `PrismaService` | Gerenciar conexão e pooling com o banco PostgreSQL (Neon.tech). |
| `AuthService` | Validar e-mail institucional e emitir Tokens de Acesso. |
| `QrTokenService` | Assinar e verificar tokens JWT efêmeros para o QR Code (Segurança). |


## 🛡️ 7. Segurança (API Protection)
> Políticas de acesso e integridade dos dados no nível do servidor.

* **ValidationPipe:** Configurado com `whitelist: true` para ignorar campos não mapeados nos DTOs.
* **JWT Expiry:** Tokens de usuário (8h); Tokens de QR Code (15 segundos).
* **CORS:** Restrito ao domínio do Frontend e à origem da Extensão Chrome.
* **Rate Limit:** Proteção contra ataques de força bruta na rota de check-in.
* **Tratamento de Erros (Exception Filter):** A IA deve implementar um `GlobalExceptionFilter`. É estritamente proibido retornar erros em formatos arbitrários. Toda falha deve retornar ao (Frontend) neste exato formato JSON:
  ```json
  {
    "statusCode": 400,
    "timestamp": "2026-03-20T23:19:20.000Z",
    "path": "/api/rota",
    "message": "Descrição detalhada do erro ou array de validações"
  }


## 📡 8. Contratos de API (Especificação OpenAPI)

> **Instrução para a IA:** Implemente os Controllers e DTOs seguindo rigorosamente estas definições.

### 🔐 Módulo de Autenticação (Google OAuth2)
* **POST** `/auth/google`
    * **Payload:** `{ "idToken": "string" }`
    * **Regra:** Buscar o e-mail na tabela `Enrollment`. Se não existir em nenhuma pauta, retornar `403 Forbidden`. Se existir, atrelar o `studentId` à matrícula e retornar os tokens.
    * **Retorno:** `{ "accessToken": "string", "user": { "id", "ra", "role", "name" } }`

### 📚 Módulo de Disciplinas e Pautas (Professores)
* **POST** `/courses/:id/roster`
    * **Payload:** `[{ "name": "string", "ra": "string", "email": "string" }]`
    * **Lógica:** O professor envia o JSON extraído da pauta. O sistema insere os registros na tabela `Enrollment` atrelados a esta disciplina (US02b).

### 📅 Módulo de Sessões (Exclusivo Professor)
* **POST** `/sessions`
    * **Payload:** `{ "courseId": "string", "durationMinutes": 110 }`
* **GET** `/sessions/:id/qr-payload`
    * **Lógica:** Gerar um JWT efêmero (15s) assinado contendo o `sessionId`.

### 🖋️ Módulo de Presença
* **POST** `/attendance/check-in` (Via App do Aluno)
    * **Payload:** `{ "qrToken": "string" }`
    * **Validação:** Verificar assinatura do token (15s) e impedir duplicidade na mesma sessão.
* **POST** `/attendance/manual` (Exclusivo Professor - US08)
    * **Payload:** `{ "sessionId": "string", "studentId": "string" }`
    * **Lógica:** Registra a presença forçando a coluna `isManual = true`.
    
## ⚙️ 9. Contrato de Configuração (Environment)
> **Instrução Crítica para a IA:** Nenhum dado sensível ou configurável deve estar *hardcoded*. Utilize o `@nestjs/config` (`ConfigModule`) para carregar e validar as variáveis em tempo de inicialização.

As seguintes variáveis são o contrato obrigatório para o arquivo `.env`:
* `DATABASE_URL` = String de conexão do PostgreSQL (Neon.tech).
* `JWT_SECRET` = Chave para assinar o token de sessão de usuário.
* `JWT_EXPIRES_IN` = Tempo de expiração da sessão (ex: `8h`).
* `QR_SECRET` = Chave isolada e exclusiva para assinar o token efêmero do QR Code.
* `GOOGLE_CLIENT_ID` = ID do Client OAuth para validação segura do token de login.

