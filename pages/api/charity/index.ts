const handler = async (req, res) => {
	console.log('fetching ');
	const response = await fetch(
		// 'https://cloudflare-ipfs.com/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/wiki/'
		'https://cloudflare-ipfs.com/ipfs/QmWHRTV4NEVcmeJVwqdLHwnJSABu6LNM1GX1wPcRopxjbj'
	).then((response) => response.json());

	console.log(response);
	return res.status(200);
};

export default handler;
