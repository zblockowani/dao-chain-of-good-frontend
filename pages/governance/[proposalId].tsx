import {
	Box,
	Button,
	Center,
	Flex,
	Heading,
	Icon,
	IconButton,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Progress,
	Skeleton,
	Spacer,
	Spinner,
	Text,
	useDisclosure,
} from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BsFillCalendarCheckFill } from 'react-icons/bs';
import { FaMoneyBill, FaWallet } from 'react-icons/fa';
import { FiThumbsDown, FiThumbsUp } from 'react-icons/fi';
import { GiStoneBlock } from 'react-icons/gi';
import ProposalState from '../../components/proposals/ProposalState';
import { getCampaignFactory, getGovernor } from '../../utils/contractsFactory';
type Proposal = {
	proposalId?: BigNumber;
	proposalTitle?: string;
	proposalDescription?: string;
	charityTile?: string;
	charityDescription?: string;
	startBlock?: BigNumber;
	endBlock?: BigNumber;
	beneficiary?: string;
	tokenAddress?: string;
	tokenTicker?: string;
	metadataUrl?: string;
};

type Voting = {
	from: BigNumber;
	to: BigNumber;
	against: BigNumber;
	for: BigNumber;
	total: BigNumber;
	againstPercentage: number;
	forPercentage: number;
};

const ProposalPage: NextPage = () => {
	const router = useRouter();
	const [proposal, setProposal] = useState<Proposal | null>({
		startBlock: BigNumber.from('0'),
		endBlock: BigNumber.from('0'),
	});
	const [loading, setLoading] = useState(true);
	const [proposalStatus, setProposalStatus] = useState(0);
	const { library: provider, chainId } = useWeb3React<Web3Provider>();
	const { onOpen, isOpen } = useDisclosure();
	const [votes, setVotes] = useState<Voting>({
		from: BigNumber.from('0'),
		to: BigNumber.from('0'),
		against: BigNumber.from('0'),
		for: BigNumber.from('0'),
		total: BigNumber.from('0'),
		againstPercentage: 0,
		forPercentage: 0,
	});
	const [ready, setReady] = useState(false);
	const [charityId, setCharityId] = useState('1');
	const [governorContract, setGovernorContract] = useState<any>();

	useEffect(() => {
		const getData = async () => {
			const id = router.query.proposalId;
			if (id && provider) {
				const proposalData = await fetch(
					`/api/governance/proposals/${id}`
				).then((response) => response.json());

				setProposal(proposalData);
				const governor = getGovernor(chainId, provider.getSigner());
				const state = await governor.state(proposalData.proposalId);

				await updateVotes(proposalData.proposalId);
				setProposalStatus(state);
				setGovernorContract(governor);
				setLoading(false);
			}
		};
		getData();
	}, [router.query.proposalId, provider, chainId]);

	useEffect(() => {
		if (provider && proposal.proposalId && governorContract) {
			let interval = setInterval(async () => {
				const state = await governorContract.state(proposal.proposalId);
				setProposalStatus(state);
			}, 5000);

			return () => clearInterval(interval);
		}
	}, [provider, proposal.proposalId, chainId, governorContract]);

	const updateVotes = async (proposalId) => {
		const governor = getGovernor(chainId, provider.getSigner());

		const result = await governor.proposalVotes(proposalId);
		const [votesAgainst, votesFor] = result;
		const totalVotes = votesAgainst.add(votesFor);
		const percentageAgainst = votesAgainst.eq(0)
			? BigNumber.from('0')
			: votesAgainst.mul(100).div(totalVotes);
		const percentageFor = votesFor.eq(0)
			? BigNumber.from('0')
			: votesFor.mul(100).div(totalVotes);
		const from = await governor.proposalSnapshot(proposalId);
		const to = await governor.proposalDeadline(proposalId);

		setVotes({
			from,
			to,
			against: votesAgainst,
			for: votesFor,
			total: totalVotes,
			againstPercentage: percentageAgainst.toNumber(),
			forPercentage: percentageFor.toNumber(),
		});
	};

	const handleVote = async (voteType: number) => {
		const governor = getGovernor(chainId, provider.getSigner());
		const tx = await governor.castVote(proposal.proposalId, voteType);
		await tx.wait(1);
		await updateVotes(proposal.proposalId);
	};

	const handleQueue = async () => {
		const descriptionHash = ethers.utils.keccak256(
			ethers.utils.toUtf8Bytes(proposal.proposalDescription)
		);

		const signer = provider.getSigner();
		const factory = getCampaignFactory(chainId, signer);

		const args = [
			proposal.startBlock,
			proposal.endBlock,
			proposal.tokenAddress,
			proposal.beneficiary,
			proposal.metadataUrl,
		];

		const encodedFunctionCall = factory.interface.encodeFunctionData(
			'createCampaign',
			args
		);

		const governor = getGovernor(chainId, signer);
		const tx = await governor.queue(
			[factory.address],
			[0],
			[encodedFunctionCall],
			descriptionHash
		);
		await tx.wait(1);
		const state = await governor.state(proposal.proposalId);
		setProposalStatus(state);
		console.log('Zakolejkowane');
	};

	const handleExecute = async () => {
		const descriptionHash = ethers.utils.keccak256(
			ethers.utils.toUtf8Bytes(proposal.proposalDescription)
		);

		const signer = provider.getSigner();

		const factory = getCampaignFactory(chainId, signer);

		const args = [
			proposal.startBlock,
			proposal.endBlock,
			proposal.tokenAddress,
			proposal.beneficiary,
			proposal.metadataUrl,
		];

		const encodedFunctionCall = factory.interface.encodeFunctionData(
			'createCampaign',
			args
		);
		const governor = getGovernor(chainId, signer);
		await governor.execute(
			[factory.address],
			[0],
			[encodedFunctionCall],
			descriptionHash
		);

		factory.once('CampaignCreated', async (campaignAddress) => {
			const campaign = {
				address: campaignAddress,
				title: proposal.charityTile,
				description: proposal.charityDescription,
			};
			const data = await fetch('/api/charity/campaigns', {
				method: 'POST',
				body: JSON.stringify(campaign),
				headers: {
					'Content-Type': 'application/json',
				},
			}).then((response) => response.json());
			setCharityId(data.id);
			setReady(true);
		});
		onOpen();
	};

	const formatVotes = (votes) => {
		const votesWithDecimal = ethers.utils.formatEther(votes);
		return votesWithDecimal.substring(0, votesWithDecimal.indexOf('.'));
	};

	return (
		<Box pt={'5'} height={'100%'}>
			<Flex mb={3}>
				<Box ml={'auto'} mr={5} width={'25%'}>
					<Heading size={'lg'} color={'white'}>
						Proposal
					</Heading>
				</Box>
				<Box mr={'auto'} ml={5} width={'25%'}>
					<Heading size={'lg'} color={'white'}>
						Campaign Details
					</Heading>
				</Box>
			</Flex>
			<Flex mt={'auto'}>
				<Box
					borderRadius={4}
					boxShadow="dark-lg"
					backgroundColor={'white'}
					ml={'auto'}
					mr={5}
					width={'25%'}
				>
					<Box>
						<Flex mb={2}>
							<Skeleton m={2} width={'90%'} height="20px" isLoaded={!loading}>
								<Heading as="h3" size={'md'}>
									{proposal.proposalTitle}
								</Heading>
							</Skeleton>
							<Spacer />
							<Skeleton mr={1} mt={1} height="20px" isLoaded={!loading}>
								<ProposalState state={proposalStatus} />
							</Skeleton>
						</Flex>

						<Skeleton m={2} height="20px" isLoaded={!loading}>
							<Text>{proposal.proposalDescription}</Text>
						</Skeleton>

						<Skeleton m={2} mt={4} height="20px" isLoaded={!loading}>
							<Flex>
								<Icon
									pt={1}
									boxSize={5}
									mr={1}
									color="#5c636e	"
									as={BsFillCalendarCheckFill}
								/>
								<Text mr={1}>{votes.from.toString()}</Text>
								<Text> {'- ' + votes.to.toString()}</Text>
								<Icon pt={1} boxSize={5} color="#5c636e" as={GiStoneBlock} />
							</Flex>
						</Skeleton>

						<Skeleton m={2} mt={2} height="20px" isLoaded={!loading}>
							<Text fontSize={14}>Votes: {formatVotes(votes.total)}</Text>
						</Skeleton>

						<Skeleton height="20px" m={2} mb={5} isLoaded={!loading}>
							<Text fontSize={14}>For: {formatVotes(votes.for)}</Text>
							<Progress
								borderRadius={2}
								colorScheme={'green'}
								value={votes.forPercentage}
							></Progress>
						</Skeleton>

						<Skeleton height="20px" m={2} mb={5} isLoaded={!loading}>
							<Text fontSize={14}>Against: {formatVotes(votes.against)}</Text>
							<Progress
								borderRadius={2}
								colorScheme={'red'}
								value={votes.againstPercentage}
							></Progress>
						</Skeleton>

						<Box m={2} mt={2} textAlign="center" hidden={loading}>
							<Box hidden={proposalStatus !== 1}>
								<IconButton
									m={2}
									aria-label="Vote for"
									fontSize={'25'}
									colorScheme="red"
									icon={<FiThumbsDown />}
									onClick={() => handleVote(0)}
								></IconButton>
								<IconButton
									aria-label="Vote for"
									fontSize={'25'}
									colorScheme="green"
									icon={<FiThumbsUp />}
									onClick={() => handleVote(1)}
								></IconButton>
							</Box>
							<Box hidden={proposalStatus !== 4}>
								<Button onClick={handleQueue} colorScheme="purple">
									Queue
								</Button>
							</Box>
							<Box hidden={proposalStatus !== 5}>
								<Button onClick={handleExecute} colorScheme="blue">
									Execute
								</Button>
							</Box>
						</Box>
					</Box>
				</Box>
				<Box
					borderRadius={4}
					boxShadow="dark-lg"
					backgroundColor={'white'}
					mr={'auto'}
					ml={5}
					width={'25%'}
					height={'100%'}
				>
					<Skeleton
						m={2}
						mb={3}
						width={'50%'}
						height="20px"
						isLoaded={!loading}
					>
						<Heading as="h3" size={'md'}>
							{proposal.charityTile}
						</Heading>
					</Skeleton>

					<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
						<Text>{proposal.charityDescription}</Text>
					</Skeleton>

					<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
						<Flex>
							<Icon
								pt={1}
								boxSize={5}
								mr={1}
								color="#5c636e	"
								as={BsFillCalendarCheckFill}
							/>
							<Text mr={1}>{proposal.startBlock.toString()}</Text>
							<Text> {'- ' + proposal.endBlock.toString()}</Text>
							<Icon pt={1} boxSize={5} color="#5c636e" as={GiStoneBlock} />
						</Flex>
					</Skeleton>

					<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
						<Flex width={'100%'}>
							<Icon pt={1} mr={1} boxSize={5} color={'#5c636e'} as={FaWallet} />
							<Text>{proposal.beneficiary}</Text>
						</Flex>
					</Skeleton>

					<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
						<Flex>
							<Icon
								pt={1}
								mr={1}
								boxSize={5}
								color={'#5c636e'}
								as={FaMoneyBill}
							/>
							<Text>{proposal.tokenTicker}</Text>
						</Flex>
					</Skeleton>
				</Box>
			</Flex>

			<Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={() => {}}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Proposal execution</ModalHeader>
					{/* <ModalCloseButton /> */}
					<ModalBody pb={6}>
						{ready ? (
							<Text>Campaing has been created.</Text>
						) : (
							<Box>
								<Text>Campaing is beeing created. Please wait.</Text>
								<Center mt={10} height={'75%'}>
									<Spinner
										thickness="4px"
										speed="0.65s"
										emptyColor="gray.200"
										color="blue.500"
										size="xl"
									/>
								</Center>
							</Box>
						)}
					</ModalBody>

					<ModalFooter>
						{ready ? (
							<Box>
								<Link href={`/charity/campaigns/${charityId}`}>
									<Button colorScheme="orange">Go to the charity</Button>
								</Link>
							</Box>
						) : (
							<></>
						)}
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default ProposalPage;
