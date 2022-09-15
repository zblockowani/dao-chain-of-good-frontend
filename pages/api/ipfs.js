import { saveToIPFS } from '../../utils/pinata';
const handler = async (req, res) => {
	if (req.method === 'POST') {
		const data = req.body;
		const pinataResponse = await saveToIPFS(data);
		res
			.status(201)
			.json({ message: 'Data stored', ipfsHash: pinataResponse.IpfsHash });
	} else {
		return res.status(400).json({ message: 'Error' });
	}
};

export default handler;
