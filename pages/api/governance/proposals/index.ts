import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		
		let data = await fetch(
			'https://chain-of-good-default-rtdb.firebaseio.com/proposals.json'
		).then((response) => response.json());

		if (!data) {
			data = {}
		}

		const proposalsData = [];

		for (let key of Object.keys(data)) {
			const proposal = { id: key, ...data[key] };
			proposalsData.push(proposal);
		}

		return res.status(200).json(proposalsData);
	}

	return res.status(400).json({ message: 'Error' });
};

export default handler;
