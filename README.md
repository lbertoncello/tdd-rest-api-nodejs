# Múltiplos DBs SQL com Node.js + Sequelize

Este projeto é uma REST API fictícia desenvolvida em Express.js utilizando TDD.

## Bancos de dados

Todas as configurações relacionadas ao banco de dados estão no arquivo `knexfile.js` e podem ser alteradas caso necessário.

##  Como executar

Inicialmente é necessário executar as migrations e após isso executar o servidor.

### Linux/Mac

    yarn migrate-prod
    yarn start

## Testes

### Linux/Mac

    yarn test

### Windows

    yarn testw
