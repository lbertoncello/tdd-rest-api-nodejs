# Múltiplos DBs SQL com Node.js + Sequelize

Este projeto é uma REST API fictícia desenvolvida em Express.js utilizando TDD.

## Bancos de dados

Todas as configurações relacionadas ao banco de dados estão no arquivo `knexfile.js` e podem ser alteradas caso necessário.

##  Como executar

Inicialmente é necessário executar as migrations e após isso executar o servidor.

### Linux/Mac

    yarn migrate-prod
    yarn start

### Windows

    yarn migrate-prod
    yarn startw

## Testes

Os testes automatizados de integração foram criados utilizando o jest. O projeto está configurado para só aceitar commits quando as métricas resultantes dos forem acima de um determinado limiar. Os comandos abaixo mostram como rodar os testes de acordo com o sistema operacional.

### Linux/Mac

    yarn test

### Windows

    yarn testw
