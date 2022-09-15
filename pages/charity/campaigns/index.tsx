import { Box, Center, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from 'ethers';
import { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ChairtyList from '../../../components/charity/CampaingList';
import { getCampaign, getGovernor } from '../../../utils/contractsFactory';

const CampaignsPage: NextPage = () => {
	const { library: provider, chainId } = useWeb3React<Web3Provider>();
	const [campaigns, setCampaigns] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const getData = async () => {
			const data = await fetch('/api/charity/campaigns').then((response) =>
				response.json()
			);

			if (!data || !provider) {
				return;
			}

			const campaignsData: any[] = [];

			console.log(data.results);

			// // Do zmiany na jeden request po wszystkie dane
			await Promise.all(
				data.results.map(async (campaign) => {
					const campaignContract = getCampaign(
						campaign.address,
						chainId,
						provider.getSigner()
					);
					const { startBlock, endBlock } = await campaignContract.getInfo();
					const isEnded = await campaignContract.isEnded();
					const state = await getCampaignState(startBlock, endBlock, isEnded);
					campaignsData.push({
						id: campaign.id,
						title: campaign.title,
						state,
					});
				})
			);

			setCampaigns(campaignsData);
			setLoading(false);
		};
		getData();
	}, [chainId, provider]);

	const getCampaignState = async (startBlock, endBlock, isEnded) => {
		const blockNumber = await provider.getBlockNumber();

		if (startBlock.gte(blockNumber)) {
			return 0;
		}
		if (endBlock.gte(blockNumber)) {
			return 1;
		}
		if (!isEnded) {
			return 2;
		}
		return 3;
	};

	const content =
		campaigns.length > 0 ? (
			<Box width={'100%'}>
				<Center width={'100%'}>
					<ChairtyList items={campaigns} />
				</Center>
			</Box>
		) : (
			<Center height={'100%'}>No campaing has been created yet.</Center>
		);
	return (
		<Box pt={5}>
			<Center mb={5}>
				<Heading size="3xl" color={'white'}>
					Charity Overview
				</Heading>
			</Center>
			<Box
				boxShadow="dark-lg"
				m={'auto'}
				textAlign={'center'}
				backgroundColor={'white'}
				borderRadius={4}
				width={'40%'}
			>
				<Box
					height={'25%'}
					p={1}
					h={10}
					borderTopRadius={4}
					backgroundColor={'#d9d9d9'}
					textAlign={'left'}
				>
					<Text fontSize={20}>Campaigns</Text>
				</Box>

				<Box height={'75%'}>
					{loading ? (
						<Center height={'100%'} margin={5} p={10}>
							<Spinner
								thickness="4px"
								speed="0.65s"
								emptyColor="gray.200"
								color="blue.500"
								size="xl"
							/>
						</Center>
					) : (
						content
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default CampaignsPage;
