import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		const id = req.query.campaignId;

		const data = await fetch(
			`https://chain-of-good-default-rtdb.firebaseio.com/charities/${id}.json`
		).then((response) => response.json());

		return res.status(200).json({ ...data });
	}
	return res.status(400).json({ message: 'Error' });
};

export default handler;
