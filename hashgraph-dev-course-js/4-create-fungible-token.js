console.clear();
require("dotenv").config();
const {
	AccountId,
	PrivateKey,
	Client,
	TokenCreateTransaction,
    AccountCreateTransaction,
	TokenType,
	TokenSupplyType,
	TransferTransaction,
	Hbar,
	TokenAssociateTransaction,
    AccountBalanceQuery
} = require("@hashgraph/sdk");

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
    const newAccountTransactionResponse  = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

    // Get the new account ID
    const getReceipt = await newAccountTransactionResponse.getReceipt(client);
    const newAccountId = getReceipt.accountId;
    
    console.log("\nNew account ID: " + newAccountId);

    const supplyKey = PrivateKey.generate();

	//CREATE FUNGIBLE TOKEN (STABLECOIN)
	let tokenCreateTx = await new TokenCreateTransaction()
		.setTokenName("USD Bar")
		.setTokenSymbol("USDB")
		.setTokenType(TokenType.FungibleCommon)
		.setDecimals(2)
		.setInitialSupply(10000)
		.setTreasuryAccountId(myAccountId)
		.setSupplyType(TokenSupplyType.Infinite)
		.setSupplyKey(supplyKey)
		.freezeWith(client);

    // sign with treasury account private key
    // TokenCreateTransaction requires PrivateKey.fromString() to be passed in
	let tokenCreateSign = await tokenCreateTx.sign(PrivateKey.fromString(myPrivateKey));
	
    // submit the transaction to a Hedera network
    let tokenCreateSubmit = await tokenCreateSign.execute(client);
	
    // get the transaaction receipt
    let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
	
    // get the token ID
    let tokenId = tokenCreateRx.tokenId;

    // login the token id to the console
	console.log(`- Created token with ID: ${tokenId} \n`);

    ///////////////////////////////////////////////////////////////////////////////////////

    //ASSOCIATE TOKEN TO ACCOUNT
    // In hedera, tokens are not automatically associated with accounts
    const transaction = await new TokenAssociateTransaction()
        .setAccountId(newAccountId)
        .setTokenIds([tokenId])
        .freezeWith(client);

    // sign with the token treasury private key
    const signTx = await transaction.sign(newAccountPrivateKey);

    // submit the transaction to a Hedera network
    const txResponse = await signTx.execute(client); 

    // get the transaction receipt
    const assosiationReceipt = await txResponse.getReceipt(client);   
    
    const transactionStatus = assosiationReceipt.status;

    console.log(`- Associated token to account: ${transactionStatus} \n`);

    ///////////////////////////////////////////////////////////////////////////////////////

    //BALANCE CHECK BEFORE TRANSFER
	var balanceCheckTx = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
	console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
	var balanceCheckTx = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
	console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);

    // Transfer tokens to the new account
    const transferTransaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, myAccountId, -10)
        .addTokenTransfer(tokenId, newAccountId, 10)
        .freezeWith(client);
    
    const signTransferTx = await transferTransaction.sign(PrivateKey.fromString(myPrivateKey));

    const transferTxResponse = await signTransferTx.execute(client);

    const transferReceipt = await transferTxResponse.getReceipt(client);

    console.log(`- Transfer tokens to the new account: ${transferReceipt.status} \n`);

    ///////////////////////////////////////////////////////////////////////////
    
	//BALANCE CHECK AFTER TRANSFER
	var balanceCheckTx = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
	console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
	var balanceCheckTx = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
	console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);

}
  
environmentSetup();
