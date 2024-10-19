import { TopicCreateTransaction} from "@hashgraph/sdk";

async function topicCreateFcn(walletData, accountId) {

	const hashconnect = walletData[0];
	const saveData = walletData[1];
	const provider = hashconnect.getProvider("testnet", saveData.topic, accountId);
	const signer = hashconnect.getSigner(provider);

	//Create the transaction
	const topicCreateTx = await new TopicCreateTransaction().freezeWithSigner(signer);

	const topicCreateSubmit = await topicCreateTx.executeWithSigner(signer);
	const topicCreateRx = await provider.getTransactionReceipt(topicCreateSubmit.transactionId);

	const topicId = topicCreateRx.topicId;
	console.log(`- Topic created. New topic id is ${topicId}`);

	return [topicId];
}

export default topicCreateFcn;
