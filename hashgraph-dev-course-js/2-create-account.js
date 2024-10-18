const {
  Hbar,
  Client,
  PrivateKey,
  AccountBalanceQuery,
  AccountCreateTransaction,
  } = require("@hashgraph/sdk");
  
  require("dotenv").config();
  
  async function environmentSetup() {
    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;
  
    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
      throw new Error(
        "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
      );
    }
    
    //Create your Hedera Testnet client
    const client = Client.forTestnet();
  
    //Set your account as the client's operator
    client.setOperator(myAccountId, myPrivateKey);
  
    
    //Set the default maximum transaction fee (in Hbar)
    client.setDefaultMaxTransactionFee(new Hbar(100));
  
    //Set the maximum payment for queries (in Hbar)
    client.setDefaultMaxQueryPayment(new Hbar(50));

    // Create a new account with 1,000 tinybars -------------------------

    // Create new keys
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    // Create a new account with 1,000 tinybar starting balance
    const newAccount = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(Hbar.fromTinybars(1000))
      .execute(client);

    // Get the new account ID
    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;
    
    console.log("\nNew account ID: " + newAccountId);

    // Verify the account balance
    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(newAccountId)
      .execute(client);

    console.log(
      "The new account balance is: " +
        accountBalance.hbars.toTinybars() +
        " tinybar."
    );

    return newAccountId;

    // ---------------------------------------------------------------

  }
  var newAccountId = null;

  environmentSetup().then((res) => 
    { 
      newAccountId = res; 
      console.log("New account ID (caller): " + newAccountId);
    }
  );