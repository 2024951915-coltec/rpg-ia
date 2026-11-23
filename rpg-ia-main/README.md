# Boulderspire RPG

Boulderspire é um RPG multiplayer de fantasia no qual os jogadores criam personagens, entram em uma sala e avançam por cenas e desafios conduzidos por uma IA.

## Requisitos

- Node.js `>=22.15.0`
- npm
- Uma chave de API do Google Gemini configurada conforme o `.env.example`

## Instalação e execução

Na pasta raiz do projeto:

```bash
npm install
cp .env.example .env
```

Preencha as variáveis necessárias no arquivo `.env`. Em seguida:

```bash
npm run build
npm start
```

A aplicação é iniciada em `http://localhost:3000`.

> No Windows PowerShell, use `Copy-Item .env.example .env` no lugar de `cp`.

## Como demonstrar o jogo

1. Inicie o servidor e abra `http://localhost:3000` no navegador.
2. Na tela inicial, informe um nome de jogador e selecione **Continuar**.
3. Para hospedar, selecione **Criar campanha**, preencha o nome e a descrição e crie a sala.
4. Na tela de criação de personagem, informe o nome do personagem, distribua os atributos primários e escolha exatamente três perícias.
5. Após entrar na sala de espera, copie o código da sala.
6. Abra uma janela anônima ou outro navegador, entre na página inicial com outro nome e use o código para entrar na mesma sala.
7. Crie o segundo personagem. Na sala de espera, confira se os dois jogadores aparecem.
8. O anfitrião seleciona **Iniciar aventura**. A partida começa e os jogadores recebem as cenas e opções de ação.
9. No turno de cada jogador, selecione uma perícia ou um atributo para realizar a ação. A próxima cena será exibida no diário da campanha.

## Telas da aplicação

- **Identificação e início:** coleta o nome público do jogador e apresenta as opções de criar ou entrar em campanha.
- **Nova campanha:** formulário para definir o nome e a descrição inicial do cenário.
- **Ficha do personagem:** cadastro do nome do jogador e do personagem, distribuição dos cinco atributos primários e seleção de três perícias aprimoradas.
- **Sala de espera:** exibe os jogadores conectados e o código que pode ser compartilhado com o grupo.
- **Partida:** apresenta o diário de cenas, as opções de testes e as fichas resumidas dos participantes.

## Observações importantes

- O nome informado na tela inicial é uma identificação local do jogador, armazenada na sessão do navegador (`sessionStorage`). **Não é uma conta autenticada** e não substitui login com senha ou gerenciamento de usuários no servidor.
- A interface depende das rotas e dos eventos Socket.IO existentes no projeto. O cadastro/autenticação real, a persistência de sessões de usuário e a lógica de turnos no servidor devem ser tratados pela implementação de servidor correspondente.
- O servidor usa a porta `3000` (definida em `src/models/app.ts`).
- O Bootstrap e o jQuery são carregados por CDN; é necessária conexão com a internet para carregar essas bibliotecas no navegador.

## Verificação manual

O ZIP recebido não contém uma pasta `tests/` nem casos de teste automatizados. Para verificar a interface e o fluxo multiplayer, siga o roteiro em [`docs/DEMO.md`](docs/DEMO.md) usando duas sessões de navegador.
