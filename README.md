# Hedera Development 


### Get A Testnet Account

* [Hedera oficial instructions](https://docs.hedera.com/hedera/getting-started/introduction])


### Environment Setup (Javascript) - Prerequisites

* [Hedera oficial instructions](https://docs.hedera.com/hedera/getting-started/introduction)
* [Download node.js installer for windows](https://nodejs.org/en/download/prebuilt-installer)


### Environment Setup (Javascript) 

1. Create project dir
    ```
    mkdir hello-hedera-js-sdk && cd hello-hedera-js-sdk
    ```
2.  Install Dependencies and SDKs
    ```
    // Install Hedera's JS SDK with NPM
    npm install --save @hashgraph/sdk

    // Install with NPM
    npm install dotenv

    // create an index.js file
    touch index.js
    ```

3.  Create your .env File (stores your environment variables)
    ```
    // create .env file
    touch index.js
    ```
4.  Get Account ID amd DER Encoded Private message from your testnet account and place them to .env file
    ```
    MY_ACCOUNT_ID=0.0.1234
    MY_PRIVATE_KEY=302e020100300506032b657004220420ed5a93073.....
    ```

5. Create .gitingnore to exclude downloaded packages and .env
    ```
    // create .env file
    touch .gitignore
    ```
    and put the below
    ```
    # Node.js
    node_modules/
    npm-debug.log
    yarn-error.log

    # Logs
    logs/
    *.log
    npm-debug.log*
    yarn-debug.log*
    yarn-error.log*

    # Dependency directories
    node_modules/
    jspm_packages/

    # Optional npm cache directory
    .npm

    # Optional eslint cache
    .eslintcache

    # Optional REPL history
    .node_repl_history

    # dotenv environment variables file
    .env

    # IDE specific files
    .vscode/
    .idea/

    # Build output
    dist/
    build/

    # Coverage directory used by tools like istanbul
    coverage/

    # TypeScript
    *.tsbuildinfo

    # Miscellaneous
    .DS_Store
    Thumbs.db

    # Hedera specific
    hedera-sdk-logs/
    hedera-sdk-cache/
    ```
