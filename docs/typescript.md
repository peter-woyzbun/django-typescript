# Typescript / Frontend

All generated TypeScript code will live in the `server` directory.

## Server Client

Before using the generated models, the `ServerClient` must be setup by
passing it the base URL of your backend. Optionally, you can also add a
function for modifying the `serverClient`'s request headers - adding a
user token, for example, for authentication.

```typescript
import {serverClient} from './server'


serverClient.setup('http://your-server.url');


```


## Server Responses

The general format for server responses is a tuple,

```typescript

const [expectedValue, responseData, statusCode, err] = await ...

```

If `expectedValue` is `undefined`, it means there was either a bad
request - a validation error, or permission error, for example - or a
request exception.

```typescript

const [expectedValue, responseData, statusCode, err] = await ...

if (expectedValue){
    // Success
} else {
    if (statusCode){
        // Permission error, validation error...
    } else {
        // Request exception
    }
}

```

## Create

## Get

## Update

## Delete

## Filter

