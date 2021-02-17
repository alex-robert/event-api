## Run locally 
    npm install
    npm run dev
    
Before running this, make sure you have a mongo server running.
You might want to update the default config file if it's not running on `localhost:27017`

## User Authentication

You need to get a token to be able to use the API.
I havn't implemented user auth, to get a valid token just call the route `/login?role=user` or `/login?role=admin`. 
This will generate a valid token with the associated role and a random user id. 
Then, call the API with a Bearer token authorization header.

## Routes :

- `POST /event` : Create a new event
- `POST /event/:id` : Admin route to create a new event for a user
- `PUT /event/:id`: update the Event with the given :id
- `DELETE /event/:id`: delete the Event with the given :id
- `GET /event/:id`: Retrieve the Event with the given :id

*note*: A user can only edit his own events, but the roles havn't been handled for the deletion route (so anyone can delete any event). 

## Examples : 

### Event body (POST and PUT)

```json
{
    "status": "MAYBE",
    "start_date": 1613598465,
    "end_date": 1613684865,
    "reminder": 10,
    "description": "new event",
}
```

*note*: Start and End dates are timestamps. 

### Get an event

```
curl --location --request GET 'localhost:3001/event/602d83256175e5a71e53957c' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImlkIjo0NCwiaWF0IjoxNjEzNTkyMjc5LCJleHAiOjE2MTM2MDMwNzl9.MgqzxCoezZGbxwhpWewQgcryCfIAgKNs1fZ1TmM9qTY'
```

### Post an event

```
curl --location --request PUT 'localhost:3001/event' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImlkIjo0NCwiaWF0IjoxNjEzNTkyMjc5LCJleHAiOjE2MTM2MDMwNzl9.MgqzxCoezZGbxwhpWewQgcryCfIAgKNs1fZ1TmM9qTY' \
--header 'Content-Type: application/json' \
--data-raw '{
    "status": "MAYBE",
    "start_date" : 1613598465,
    "end_date": 1613684865,
    "reminder" : 10,
    "description": "new event",

}'
```