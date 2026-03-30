# 📄 Product Requirements Document (PRD) - Tô Aqui!

**Projeto:** Tô Aqui! (AutoPresence Institucional)  
**Versão:** 1.3.0 (Refinada para Negócio com Base em Dados Reais)  
**Status:** 🟢 Definido (MVP)

---

## 🎯 1. Visão Geral e Objetivo
O registro de presença manual em sala de aula consome tempo e é suscetível a fraudes. O **Tô Aqui!** automatiza este processo utilizando QR Codes dinâmicos. O objetivo é permitir que o professor projete um código que se regenera periodicamente, garantindo que apenas alunos fisicamente presentes e autenticados com o e-mail previamente cadastrado na pauta oficial registrem presença. Os dados são posteriormente consolidados e injetados no sistema acadêmico via extensão de navegador.

## 📖 2. Glossário Ubíquo
* **Sessão de Presença:** Período em que a chamada de uma disciplina está aberta.
* **Pauta Oficial (Lista):** Relação de alunos matriculados importada do portal da UTFPR, contendo Nome, RA e E-mail.
* **QR Dinâmico:** Código QR que muda automaticamente a cada 15 segundos para evitar cópias.
* **Check-in:** Ação do aluno escanear o código e ter sua presença validada.
* **Extensão Bridge:** Componente de navegador que lê os dados do aplicativo e preenche automaticamente o portal acadêmico, aguardando confirmação manual do professor.

## 👤 3. Atores e Permissões
* **Administrador (Admin):** Gerencia a estrutura basilar do sistema (Campi, Cursos, Disciplinas, Professores).
* **Professor:** Importa a pauta oficial de alunos, abre/fecha sessões, projeta o QR, adiciona exceções manuais, acompanha a chamada em tempo real e sincroniza os dados.
* **Aluno:** Realiza login exclusivo com o e-mail (Google) que consta na pauta do professor e escaneia o QR Code.
* **Sistema (Automático):** Cruza e-mails com RAs, valida a autenticidade dos códigos, checa unicidade e encerra sessões automaticamente ao atingir 100% de quórum.

## 📝 4. Escopo Funcional, Histórias de Usuário e Critérios de Aceitação (MoSCoW)

> **Instrução para a IA/Desenvolvedor:** Cada bloco abaixo representa uma necessidade de negócio. Uma história só é considerada "Done" quando todos os seus critérios de aceitação forem atendidos no sistema.

### 🔴 US01 - Autenticação por E-mail Validado na Pauta (Must Have)
**Ator:** Todos | **História:** Como usuário, quero fazer login via Google Auth para que o sistema confirme minha identidade cruzando meu e-mail com a pauta oficial da disciplina.

**✅ Critérios de Aceitação:**
* [ ] O fluxo de login deve ser exclusivamente via conta do Google.
* [ ] O sistema deve permitir qualquer domínio (incluindo `@gmail.com`), **desde que** o e-mail conste em uma pauta importada por um professor.
* [ ] Se um e-mail desconhecido tentar logar, o acesso deve ser bloqueado com a mensagem: "E-mail não matriculado em nenhuma disciplina ativa".
* [ ] Após a validação, o sistema deve emitir uma sessão segura válida para um turno completo de aulas.

### 🔴 US02 - Cadastro Acadêmico Base (Must Have)
**Ator:** Admin | **História:** Como administrador, quero cadastrar Campi, Cursos, Disciplinas e vincular Professores para que o sistema reflita a estrutura acadêmica.

**✅ Critérios de Aceitação:**
* [ ] Devem existir telas de gestão (CRUD) restritas apenas a Administradores para gerenciar a base acadêmica.
* [ ] Deve ser possível vincular o perfil de um Professor a uma ou mais Disciplinas.
* [ ] O sistema não deve permitir a exclusão de uma Disciplina que já possua histórico de sessões de presença registradas.

### 🔴 US02b - Importação de Pauta Oficial (Must Have)
**Ator:** Professor | **História:** Como professor, quero importar a lista de alunos (contendo Nome, RA e E-mail) extraída do portal da UTFPR, para que o sistema saiba previamente quem está autorizado a registrar presença na minha disciplina.

**✅ Critérios de Aceitação:**
* [ ] O sistema deve permitir a colagem de texto ou upload de um arquivo com os dados da pauta.
* [ ] O sistema deve extrair e vincular automaticamente os RAs aos respectivos E-mails informados na lista.
* [ ] Alunos importados devem ser pré-cadastrados na disciplina, aguardando apenas o seu primeiro login via Google para ativar a conta.

### 🔴 US03 - Abertura de Sessão de Presença (Must Have)
**Ator:** Professor | **História:** Como professor, quero selecionar uma disciplina e iniciar uma Sessão de Presença para que os alunos possam começar o check-in.

**✅ Critérios de Aceitação:**
* [ ] O professor só deve visualizar as disciplinas às quais está oficialmente vinculado.
* [ ] Ao iniciar, o sistema deve registrar o horário exato de abertura da sessão.
* [ ] O sistema deve impedir que o mesmo professor abra duas sessões ativas simultaneamente.

### 🔴 US04 - Motor de QR Code Dinâmico (Must Have)
**Ator:** Professor | **História:** Como professor, quero projetar um QR Code que se regenera a cada 15 segundos para que se evite a fraude por compartilhamento de fotos.

**✅ Critérios de Aceitação:**
* [ ] O QR Code projetado na tela deve conter um código de segurança criptografado vinculado à sessão atual.
* [ ] A validade exata do código gerado no QR deve ser de estritos 15 segundos.
* [ ] O painel do professor deve atualizar o QR Code visualmente de forma automática antes que o anterior expire, sem a necessidade de recarregar a página.

### 🔴 US05 - Check-in do Aluno (Must Have)
**Ator:** Aluno | **História:** Como aluno, quero escanear o QR com a câmera do Web App e receber feedback imediato para que eu saiba se minha presença foi registrada.

**✅ Critérios de Aceitação:**
* [ ] O aplicativo web deve ser capaz de abrir a câmera traseira do smartphone do aluno.
* [ ] O sistema deve rejeitar instantaneamente a leitura de códigos que já passaram do limite de 15 segundos de validade ou que possuam assinaturas inválidas.
* [ ] O sistema deve rejeitar tentativas de check-in duplicados para o mesmo aluno na mesma sessão.
* [ ] A tela do aluno deve exibir um alerta visual inconfundível de Sucesso (Verde) ou Falha (Vermelho), explicando o motivo do erro.

### 🔴 US06 - Encerramento Manual de Sessão (Must Have)
**Ator:** Professor | **História:** Como professor, quero encerrar a sessão manualmente para que a lista de presença seja consolidada e fechada.

**✅ Critérios de Aceitação:**
* [ ] O painel da sessão ativa deve ter um botão de destaque para "Encerrar Chamada".
* [ ] A ação deve registrar o horário exato do encerramento.
* [ ] Qualquer tentativa de check-in de aluno processada após este evento deve ser categoricamente negada.

### 🟡 US07 - Integração via Extensão Bridge (Should Have)
**Ator:** Professor | **História:** Como professor, quero usar a Extensão Bridge para pré-preencher a chamada no portal acadêmico e revisá-la para que eu automatize o lançamento final.

**✅ Critérios de Aceitação:**
* [ ] A extensão do navegador deve ser capaz de importar a lista final de alunos presentes gerada pelo sistema "Tô Aqui!".
* [ ] A extensão deve identificar e preencher automaticamente as caixas de seleção correspondentes aos RAs na página oficial do portal acadêmico da instituição.
* [ ] Por segurança, a extensão **não deve** salvar ou submeter o formulário final automaticamente; a revisão e o clique final são de responsabilidade do professor.

### 🟡 US08 - Inclusão Manual de Presença (Should Have)
**Ator:** Professor | **História:** Como professor, quero registrar manualmente a presença de um aluno pelo sistema para que eu resolva imprevistos (ex: aluno sem bateria no celular).

**✅ Critérios de Aceitação:**
* [ ] Durante uma sessão ativa, o professor deve ter um campo de busca para encontrar um aluno matriculado pelo nome ou RA.
* [ ] Ao confirmar a presença manual, o sistema deve registrar esse check-in no histórico com um indicativo claro de que foi uma "inserção manual", diferenciando-o da leitura via QR.

### 🔵 US09 - Painel de Acompanhamento em Tempo Real (Could Have)
**Ator:** Professor | **História:** Como professor, quero visualizar em tempo real os nomes dos alunos que já fizeram check-in para que eu acompanhe o progresso visualmente.

**✅ Critérios de Aceitação:**
* [ ] Assim que um aluno receber a mensagem de sucesso no seu celular, o nome dele deve surgir instantaneamente na lista projetada na tela do professor.
* [ ] A atualização dessa lista deve ocorrer de forma fluida, sem exigir a atualização da página.

### 🔵 US10 - Encerramento Automático por Quórum (Could Have)
**Ator:** Sistema | **História:** Como sistema, quero encerrar a sessão automaticamente quando 100% dos alunos matriculados fizerem check-in para que o professor não precise intervir.

**✅ Critérios de Aceitação:**
* [ ] A cada novo check-in, o sistema deve cruzar o número de presenças confirmadas com o total de alunos na pauta oficial da referida disciplina.
* [ ] Se o quórum atingir 100%, o sistema deve acionar a rotina de encerramento da sessão automaticamente e exibir um aviso de conclusão no painel do professor.

## 🛡️ 5. Regras de Negócio (Constraints)
* **RN01 (Acesso Restrito via Pauta):** O sistema aceita logins de qualquer domínio do Google (incluindo `@gmail.com`), **desde que** o e-mail autenticado esteja previamente cadastrado na pauta oficial importada pelo professor. E-mails não listados não podem gerar sessão válida.
* **RN02 (Rigidez do QR):** A janela de validade do código QR é uma regra de segurança imutável. Passados os 15 segundos, o código perde o valor e qualquer tentativa de uso deve gerar uma mensagem de erro clara ao aluno.
* **RN03 (Garantia de Unicidade):** É impossível que um aluno acumule mais de um registro de presença validado dentro da mesma Sessão.
* **RN04 (Identificação Única e Imutável):** O RA do aluno nasce no sistema através da importação da pauta pelo professor. O aluno não tem permissão para editar, criar ou alterar o seu próprio RA, garantindo a integridade dos dados institucionais.

## 🚫 6. Fora de Escopo (Non-goals)
* Lançamento de notas ou gestão de conteúdo das disciplinas.
* Abono de faltas justificadas com apresentação de atestado médico.
* Desenvolvimento e publicação de aplicativos nativos (APK/IPA) nas lojas Apple e Google.
* Rastreamento da posição física do aluno via GPS ou triangulação de antenas.

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)
* **Desempenho da Validação:** O sistema deve processar a leitura do QR Code e devolver a resposta ao celular do aluno em no máximo 1.5 segundos.
* **Otimização de Tráfego:** A comunicação de dados em tempo real (como a rotação do QR e a lista de alunos) deve utilizar protocolos bidirecionais eficientes, evitando a sobrecarga do servidor com requisições HTTP repetitivas.
* **Acessibilidade Web:** O aplicativo deve ser perfeitamente responsivo, permitindo a sua instalação na tela inicial do celular como um PWA (Progressive Web App) e garantindo acesso nativo à câmera pelo navegador.