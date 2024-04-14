# LowCode Async Integrator

Status: Development started

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
