# MyGym API

Backend Rails API do MVP MyGym.

## Requisitos

- Ruby 3.4.4
- MongoDB local para testes ou MongoDB Atlas para desenvolvimento/producao
- Firebase Project ID para validar tokens

## Variaveis de ambiente

Copie `.env.example` para `.env` e configure:

```env
MONGODB_URI=
FIREBASE_PROJECT_ID=
CORS_ORIGINS=*
```

## Desenvolvimento

```bash
bundle install
bin/rails server
```

## Testes

Com RVM neste ambiente, use Ruby 3.4.4 explicitamente:

```bash
rvm 3.4.4 do bin/rails test
```

## API

Endpoints, payloads e padrao de erros estao documentados em `docs/api.md`.

Uma colecao Postman esta disponivel em `docs/mygym-api.postman_collection.json`.

## Deploy Render

O arquivo `render.yaml` define:

- runtime Ruby
- `bundle install` como build command
- `bundle exec puma -C config/puma.rb` como start command
- `/api/health` como health check
- variaveis `MONGODB_URI`, `FIREBASE_PROJECT_ID` e `CORS_ORIGINS`
