# LowCode Async Integrator

Status: Development started

## Plan: Integration Sources/Targets
- RabbitMQ 
- HTTP(S) API/WebHook
- Azure Event Hub or Kafka

# Getting Started

## Prepare "LowCode Data App"

1. Install and start [LowCode Data App](https://github.com/ma-ha/lowcode-data-app)
2. Log in
3. In "Scopes" create a new root scope: As Id enter `#` and as name `LowCode Async Integrator` 
4. Reload the page and change the "Scope" (header, right pull down) to `LowCode Async Integrator`
5. Copy the the Scope ID
6. In "Users" add an "API Account": Name `manager-pod` 
7. Copy the ID 
8. Click "API Secret" and copy the secret

## Prepare the "Manager Pod"

1. Open [./run/manager-pod.js](./run/manager-pod.js) in an editor
2. Replace the `change_me` in `LOWCODE_DB_ROOTSCOPE` by the "Scope ID"
3. Replace the `change_me` in `LOWCODE_DB_API_ID` by the "API Account ID"
4. Replace the `change_me` in `LOWCODE_DB_API_KEY` by the "API Secret"

Start the manager pod:

    cd app
    npm install
    cd ../run
    node manager-pod.js | ../app/node_modules/bunyan/bin/bunyan

## Prepare RabbitMQ

see https://hub.docker.com/_/rabbitmq

    docker run -d --hostname my-rabbit --name some-rabbit -e RABBITMQ_DEFAULT_USER=user -e RABBITMQ_DEFAULT_PASS=password -p 8080:15672 rabbitmq:3-management

Open [http://localhost:8080](http://localhost:8080)