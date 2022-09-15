import ChainOfGoodFactory from '../../constants/ChainOfGoodFactory.json';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { NextPage } from 'next';
import { useEffect } from 'react';
import * as IPFS from 'ipfs';

const CharityPage: NextPage = () => {
	const { library: provider } = useWeb3React<Web3Provider>();

	useEffect(() => {
		const getData = async () => {
			if (provider) {
				const factory = new ethers.Contract(
					'0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
					ChainOfGoodFactory.abi,
					provider.getSigner()
				);

				const camp = await factory.getCampaigns();
				console.log(camp);
			}
		};
		getData();
	}, [provider]);

	const handle = async () => {
		await fetch('/api/charity');
		// const node = await IPFS.create();
		// const chunks = [];

		// for await (const chunk of node.cat(
		// 	'QmZEzNuysnpsdrmJupwQq8HMZvnWmEJDGYqftpDZX9NvH1'
		// )) {
		// 	chunks.push(chunk);
		// }
		// const metadata = JSON.parse(new TextDecoder('utf-8').decode(chunks[0]));

		// console.log('Meta:', metadata);

		// const fetchIpfs = await makeIPFSFetch({ipfs});
		// const response = await fetchIpfs("ipfs://QmUAC9NuWpGmbscUKjr6BxGQcMb9rVPyAwQPBv8YcoUS7R");
		// const text = await response.text();
		// console.log(text);
	};
	return (
		<div>
			<button onClick={handle}>Click</button>
		</div>
	);
};

export default CharityPage;
