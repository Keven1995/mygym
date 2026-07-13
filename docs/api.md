# MyGym API

## Ambiente

Variaveis obrigatorias:

- `MONGODB_URI`: string de conexao do MongoDB Atlas.
- `FIREBASE_PROJECT_ID`: ID do projeto Firebase usado para validar tokens.
- `CORS_ORIGINS`: origens permitidas, separadas por virgula. Use `*` em desenvolvimento.

## Autenticacao

Endpoints protegidos exigem header:

```http
Authorization: Bearer FIREBASE_ID_TOKEN
```

## Health Check

```http
GET /api/health
```

Resposta:

```json
{ "status": "ok" }
```

## Usuario

```http
POST /api/users/sync
GET  /api/me
PUT  /api/me
```

## Exercicios

```http
GET    /api/exercises
POST   /api/exercises
GET    /api/exercises/:id
PUT    /api/exercises/:id
DELETE /api/exercises/:id
```

## Treinos

```http
GET    /api/workouts
POST   /api/workouts
GET    /api/workouts/today
GET    /api/workouts/:id
PUT    /api/workouts/:id
DELETE /api/workouts/:id
```

`weekday` aceita: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`.

## Padrao de Erro

Autenticacao:

```json
{ "error": "unauthorized", "message": "Invalid token" }
```

Nao encontrado:

```json
{ "error": "not_found", "message": "Resource not found" }
```

Validacao:

```json
{
  "error": "validation_error",
  "message": "Validation failed",
  "details": { "name": ["can't be blank"] }
}
```
