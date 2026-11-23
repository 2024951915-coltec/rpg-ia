# Roteiro de demonstração — Boulderspire RPG

## Preparação

- Instalar as dependências (`npm install`).
- Configurar as variáveis do Gemini no `.env`.
- Iniciar o servidor (`npm start`).
- Abrir o endereço local em dois navegadores ou em uma janela normal e outra anônima.

## Demonstração passo a passo

1. Na primeira janela, informar o nome de jogador e continuar.
2. Criar uma campanha com título e descrição do universo.
3. Na ficha, preencher os nomes, distribuir os atributos de modo que a soma seja zero e marcar exatamente três perícias.
4. Copiar o código exibido na sala de espera.
5. Na segunda janela, informar outro nome, entrar com o código e criar outro personagem.
6. Mostrar a lista de participantes atualizada na sala de espera.
7. Iniciar a aventura e explicar que a IA prepara a cena inicial.
8. Durante a partida, escolher uma das ações disponíveis e acompanhar o resultado e a próxima cena no diário.
9. Mostrar a ficha resumida dos participantes na lateral (ou no painel recolhível em telas pequenas).

## Pontos para destacar

- A interface é responsiva e organiza as informações em etapas.
- O código da sala pode ser copiado e compartilhado.
- A ficha calcula os valores das perícias conforme os atributos e as três perícias escolhidas.
- A partida recebe atualizações em tempo real por Socket.IO.
- O tempo de resposta da IA pode variar; durante a demonstração, aguarde a geração da cena.

## Limite da identificação inicial

A tela inicial pede um nome público e o mantém no `sessionStorage` do navegador para preencher a ficha. Ela não autentica contas nem valida credenciais no servidor.
