import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		let data = await fetch(
			'https://chain-of-good-default-rtdb.firebaseio.com/charities.json'
		).then((response) => response.json());

		if (!data) {
			data = {};
		}

		const charityData = [];
		console.log(data);
		for (let key of Object.keys(data)) {
			const charity = { id: key, ...data[key] };
			charityData.push(charity);
		}

		return res.status(200).json({ results: charityData });
	}

	if (req.method === 'POST') {
		console.log(req.body);
		const body = JSON.stringify(req.body);
		const data = await fetch(
			'https://chain-of-good-default-rtdb.firebaseio.com/charities.json',
			{
				method: 'POST',
				body: body,
			}
		).then((response) => response.json());
		return res.status(201).json({ message: 'Charity created', id: data.name });
	}

	return res.status(400).json({ message: 'Error' });
};

export default handler;
