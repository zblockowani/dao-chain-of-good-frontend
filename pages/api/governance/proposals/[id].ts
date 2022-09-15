import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		const id = req.query.id;

		const data = await fetch(
			`https://chain-of-good-default-rtdb.firebaseio.com/proposals/${id}.json`
		).then((response) => response.json());

		res.status(200).json({ ...data });
	} else return res.status(404).json({message: "Error"});
};

export default handler;
