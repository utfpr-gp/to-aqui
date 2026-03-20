# 📄 Product Requirements Document (PRD) - Tô Aqui!

**Projeto:** Tô Aqui! (AutoPresence UTFPR)  
**Versão:** 1.0.0  
**Status:** 🟢 Definido (MVP)

---

## 🎯 1. Visão Geral e Objetivo
O registro de presença manual em sala de aula consome tempo precioso e é suscetível a fraudes. O **Tô Aqui!** visa automatizar este processo na UTFPR utilizando QR Codes dinâmicos. O objetivo é permitir que o professor projete um código que se regenera periodicamente, garantindo que apenas alunos fisicamente presentes e autenticados com e-mail institucional possam registrar sua presença, que será posteriormente injetada no sistema acadêmico via extensão de navegador.

## 📖 2. Glossário Ubíquo
* **Sessão de Presença:** Período de tempo em que a chamada de uma disciplina específica está aberta.
* **QR Dinâmico:** Código QR que muda a cada 15 segundos para evitar o compartilhamento de fotos por alunos ausentes.
* **Check-in:** O ato do aluno escanear o código e ter sua presença validada e registrada pelo servidor.
* **Extensão Bridge:** Componente de navegador que lê os dados do banco e preenche automaticamente o portal acadêmico da UTFPR.

## 👤 3. Atores e Permissões
* **Professor (Admin):** Pode abrir/fechar sessões, projetar o QR Code e visualizar a lista de check-ins em tempo real.
* **Aluno (User):** Pode realizar login institucional e escanear o QR Code para registrar presença.
* **Sistema (Automático):** Valida a expiração do token, a unicidade do aluno e a autenticidade do domínio do e-mail.

## 📝 4. Escopo Funcional (User Stories)
| ID | Ator | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **US01** | Todos | Login obrigatório via Google Auth utilizando o domínio `@utfpr.edu.br` ou `@alunos.utfpr.edu.br`. | 🔥 Crítica |
| **US02** | Professor | Criação de uma sessão de chamada vinculada a uma disciplina e data específica. | 🔥 Alta |
| **US03** | Professor | Exibição de um QR Code rotativo (Payload assinado com JWT) com expiração de 15 segundos. | 🔥 Alta |
| **US04** | Aluno | Leitura do QR Code via câmera do celular (Web App) para confirmação de presença. | 🔥 Alta |
| **US05** | Professor | Sincronização automática dos check-ins com o portal da UTFPR via extensão de navegador. | ⚡ Média |
| **US06** | Aluno | Recebimento de feedback imediato confirmando o sucesso ou erro do registro. | 🔥 Alta |

## 🛡️ 5. Regras de Negócio (Constraints)
* **RN01:** Apenas e-mails institucionais da UTFPR são autorizados a acessar o sistema.
* **RN02:** O token do QR Code deve expirar em 15 segundos; após este tempo, o check-in deve ser rejeitado.
* **RN03:** Um aluno não pode registrar mais de um check-in para a mesma sessão de aula.
* **RN04:** Todas as comunicações entre o QR Code projetado e o servidor devem ser assinadas digitalmente.

## 🚫 6. Fora de Escopo (Non-goals)
* Registro manual de notas ou abono de faltas.
* Desenvolvimento de aplicativos nativos (Android/iOS) — o foco é Web App (PWA).
* Geolocalização via GPS (o QR dinâmico substitui essa necessidade no MVP).

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)
* **Desempenho:** A validação do check-in não deve ultrapassar 1.5 segundos de tempo de resposta.
* **Segurança:** Implementação de JWT para sessões de usuário e proteção de rotas (Guards).
* **Escalabilidade:** Suporte a picos de acessos simultâneos (40-60 alunos por turma).

## 🛠️ 8. Tech Stack Principal (Diretrizes)
* **Backend:** NestJS + Prisma ORM + PostgreSQL (Hospedagem no Neon.tech).
* **Frontend:** Angular (Standalone Components) + Tailwind CSS.
* **Extensão:** Vanilla TypeScript (Chrome API).
* **CI/CD:** GitHub Actions (Pipelines de Teste) + Deploy na Nuvem (Render/Vercel).