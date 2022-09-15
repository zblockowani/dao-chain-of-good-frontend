import { Box } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import React, { useEffect, useMemo, useState } from 'react';

const CurrentBlock: React.FC = () => {
	const { library: provider } = useWeb3React<Web3Provider>();
	const [blockNumber, setBlockNumber] = useState<number>();

	useEffect(() => {
		const getBlockNumber = async () => {
			const currentBlockNumber = await provider.getBlockNumber();
			setBlockNumber(currentBlockNumber);
		};
		getBlockNumber();
	}, [provider]);

	return <Box>Current block number: {blockNumber}</Box>;
};

export default CurrentBlock;
