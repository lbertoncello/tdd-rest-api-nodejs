# Múltiplos DBs SQL com Node.js + Sequelize

Este projeto é uma REST API fictícia desenvolvida em Express.js utilizando TDD.

## Bancos de dados

Todas as configurações relacionadas ao banco de dados estão no arquivo `knexfile.js` e podem ser alteradas caso necessário.

##  Como executar

Inicialmente é necessário executar as migrations e após isso executar o servidor.

### Migrations

#### Executar em ambiente de produção

    yarn migrate-prod

#### Executar em ambiente de desenvolvimento

    yarn migrate-test

### Servidor

#### Linux/Mac

##### Executar em ambiente de produção

    yarn start

##### Executar em ambiente de desenvolvimento

    yarn dev

#### Windows

##### Executar em ambiente de produção

    yarn startw

##### Executar em ambiente de desenvolvimento

    yarn devw

### Testes

#### Linux/Mac

    yarn test

#### Windows

    yarn testw
