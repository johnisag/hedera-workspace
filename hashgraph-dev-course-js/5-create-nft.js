console.clear();
require("dotenv").config();
const {
	PrivateKey,
	Client,
	TokenCreateTransaction,
    AccountCreateTransaction,
	TokenType,
	TokenSupplyType,
	TransferTransaction,
	Hbar,
	TokenAssociateTransaction,
    AccountBalanceQuery,
    TokenMintTransaction
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

    console.log(`- Supply key: ${supplyKey}`)

    //Create the NFT
    const nftCreate = await new TokenCreateTransaction()
        .setTokenName("Hedera Token Test")
        .setTokenSymbol("HTT")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(myAccountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(250)
        .setSupplyKey(supplyKey)
        .freezeWith(client);

    // sign with treasury account private key
    // TokenCreateTransaction requires PrivateKey.fromString() to be passed in
	let nftCreateSign = await nftCreate.sign(PrivateKey.fromString(myPrivateKey));
	
    // submit the transaction to a Hedera network
    let nftCreateSubmit = await nftCreateSign.execute(client);
	
    // get the transaaction receipt
    let nftCreateRx = await nftCreateSubmit.getReceipt(client);
	
    // get the token ID
    let tokenId = nftCreateRx.tokenId;

    // login the token id to the console
	console.log(`- Created NFT with Token ID: ${tokenId} \n`);

    ///////////////////////////////////////////////////////////////////////////////////////

    // Max transaction fee as a constant
    const maxTransactionFee = new Hbar(20);

    //IPFS content identifiers for which we will create a NFT
    const CID = [
        Buffer.from(
            "ipfs://bafyreiao6ajgsfji6qsgbqwdtjdu5gmul7tv2v3pd6kjgcw5o65b2ogst4/metadata.json"
        ),
        Buffer.from(
            "ipfs://bafyreic463uarchq4mlufp7pvfkfut7zeqsqmn3b2x3jjxwcjqx6b5pk7q/metadata.json"
        ),
        Buffer.from(
            "ipfs://bafyreihhja55q6h2rijscl3gra7a3ntiroyglz45z5wlyxdzs6kjh2dinu/metadata.json"
        ),
        Buffer.from(
            "ipfs://bafyreidb23oehkttjbff3gdi4vz7mjijcxjyxadwg32pngod4huozcwphu/metadata.json"
        ),
        Buffer.from(
            "ipfs://bafyreie7ftl6erd5etz5gscfwfiwjmht3b52cevdrf7hjwxx5ddns7zneu/metadata.json"
        )
    ];
	
    // MINT NEW BATCH OF NFTs
    const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata(CID) //Batch minting - UP TO 10 NFTs in single tx
        .setMaxTransactionFee(maxTransactionFee)
        .freezeWith(client);

    //Sign the transaction with the supply key
    const mintTxSign = await mintTx.sign(supplyKey);

    //Submit the transaction to a Hedera network
    const mintTxSubmit = await mintTxSign.execute(client);

    //Get the transaction receipt
    const mintRx = await mintTxSubmit.getReceipt(client);

    //Log the serial number
    console.log("Created NFT " + tokenId + " with serial number: " + mintRx.serials);

    //ASSOCIATE nft TO ACCOUNT

    //Create the associate transaction and sign with Alice's key 
    const associateAccountTx = await new TokenAssociateTransaction()
        .setAccountId(newAccountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(newAccountPrivateKey);

    //Submit the transaction to a Hedera network
    const associateAccountTxSubmit = await associateAccountTx.execute(client);

    //Get the transaction receipt
    const associateAccountRx = await associateAccountTxSubmit.getReceipt(client);

    //Confirm the transaction was successful
    console.log(`NFT association with Alice's account: ${associateAccountRx.status}\n`);

    ///////////////////////////////////////////////////////////////////////////////////////

    // //BALANCE CHECK BEFORE TRANSFER
	var balanceCheckTx = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
	console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
	var balanceCheckTx = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
	console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);

    // Transfer the NFT from treasury to Alice
    // Sign with the treasury key to authorize the transfer
    const tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, 1, myAccountId, newAccountId)
        .freezeWith(client)
        .sign(PrivateKey.fromString(myPrivateKey));

    const tokenTransferSubmit = await tokenTransferTx.execute(client);
    const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

    console.log(`\nNFT transfer from Treasury to New Account: ${tokenTransferRx.status} \n`);


    // //BALANCE CHECK BEFORE TRANSFER
	var balanceCheckTx = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
	console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
	var balanceCheckTx = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
	console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);

    

}
  
environmentSetup();