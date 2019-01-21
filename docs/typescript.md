# Typescript / Frontend

All generated TypeScript code will live in the `server` directory.

## Server Responses

The general format for server responses is a tuple,

```typescript

[expectedValue, responseData, statusCode, err]

```

If `expectedValue` is `undefined`, it means there was either a bad
request - a validation error, or permission error, for example - or a
server error.

## Create

## Get

## Update

## Delete

## Filter

