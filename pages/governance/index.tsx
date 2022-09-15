import {
	Box,
	Center,
	Flex,
	Heading,
	Icon,
	Spacer,
	Spinner,
	Text,
} from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AiFillPlusSquare } from 'react-icons/ai';
import ProposalList from '../../components/proposals/ProposalList';
// import ProposalList from '../../components/proposals/ProposalList';
import { getGovernor } from '../../utils/contractsFactory';
const GovernancePage: NextPage = () => {
	const { library: provider, chainId } = useWeb3React();
	const [proposals, setProposals] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getData = async () => {
			const data = await fetch('/api/governance/proposals').then((response) =>
				response.json()
			);

			if (!data || !provider) {
				return;
			}

			const proposalsData: any[] = [];
			const governor = getGovernor(chainId, provider.getSigner());

			//Do zmiany na jeden request po wszystkie dane
			await Promise.all(
				data.map(async (proposal) => {
					const state = await governor.state(proposal.proposalId);
					proposalsData.push({
						id: proposal.id,
						proposalId: proposal.proposalId,
						title: proposal.proposalTitle,
						state,
					});
				})
			);

			setProposals(proposalsData);
			setIsLoading(false);
		};
		getData();
	}, [chainId, provider]);

	const content =
		proposals.length > 0 ? (
			<Box width={'100%'}>
				<Center width={'100%'}>
					<ProposalList items={proposals} />
				</Center>
			</Box>
		) : (
			<Center height={'100%'}>No proposal has been created yet.</Center>
		);

	return (
		<Box pt={5}>
			<Center mb={5}>
				<Heading size="3xl" color={'white'}>
					Governance Overview
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
				<Flex
					height={'25%'}
					p={1}
					h={10}
					borderTopRadius={4}
					backgroundColor={'#d9d9d9'}
				>
					<Box>
						<Text fontSize={20}>Proposals</Text>
					</Box>
					<Spacer />

					<Box>
						<Link href={'/governance/new'} passHref>
							<Box>
								<Icon
									boxSize={8}
									cursor={'pointer'}
									as={AiFillPlusSquare}
									color={'#f26935'}
									_hover={{
										color: '#ca431d',
									}}
								/>
							</Box>
						</Link>
					</Box>
				</Flex>
				<Box height={'75%'}>
					{isLoading ? (
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

export default GovernancePage;
