import {
	Box,
	Button,
	Center,
	Flex,
	Heading,
	Icon,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Skeleton,
	Spacer,
	Text,
} from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BsFillCalendarCheckFill, BsFillPiggyBankFill } from 'react-icons/bs';
import { FaMoneyBill, FaWallet } from 'react-icons/fa';
import { GiStoneBlock } from 'react-icons/gi';
import CampaignState from '../../../components/charity/CampaignState';
import CurrentBlock from '../../../components/utils/CurrentBlock';
import {
	getADaiToken,
	getCampaign,
	getDaiToken,
} from '../../../utils/contractsFactory';

type Campaign = {
	title: string;
	description: string;
	startBlock: BigNumber;
	endBlock: BigNumber;
	beneficiary: string;
	donationPool: BigNumber;
	currentReward: BigNumber;
	collectedReward: BigNumber;
	additionalPassedFounds: BigNumber;
	myDonation: BigNumber;
	totalPassedFounds: BigNumber;
	tokenTicker: string;
	state: number;
};

const CampaignDetailsPage: NextPage = () => {
	const { library: provider, chainId, account } = useWeb3React<Web3Provider>();
	const [campaign, setCampaign] = useState<Campaign>({
		title: '',
		description: '',
		startBlock: BigNumber.from('0'),
		endBlock: BigNumber.from('0'),
		beneficiary: '',
		donationPool: BigNumber.from('0'),
		currentReward: BigNumber.from('0'),
		collectedReward: BigNumber.from('0'),
		additionalPassedFounds: BigNumber.from('0'),
		myDonation: BigNumber.from('0'),
		totalPassedFounds: BigNumber.from('0'),
		tokenTicker: '',
		state: 0,
	});
	const [loading, setLoading] = useState(true);
	const [campaignContract, setCampaignContract] = useState<any>();
	const [daiToken, setDaiToken] = useState<any>();
	const [aDaiToken, setADaiToken] = useState<any>();
	const [joined, setJoined] = useState(false);

	const [amount, setAmount] = useState('0');

	const router = useRouter();
	const [address, setAddress] = useState();
	const [tokensInWallet, setTokensInWallet] = useState(BigNumber.from('0'));

	useEffect(() => {
		const getData = async () => {
			const campaignId = router.query.campaignId;

			if (campaignId && provider) {
				const data = await fetch(`/api/charity/campaigns/${campaignId}`).then(
					(response) => response.json()
				);

				const signer = provider.getSigner();

				const campaignContract = getCampaign(data.address, chainId, signer);
				const aDaiTokenContract = getADaiToken(chainId, signer);
				const daiToken = getDaiToken(chainId, signer);

				const info: any = await campaignContract.getInfo();

				const tokenTicker = await daiToken.symbol();
				let currentReward: BigNumber = (
					await aDaiTokenContract.balanceOf(campaignContract.address)
				).sub(info.donationPool);
				currentReward = currentReward.gt(0)
					? currentReward
					: BigNumber.from('0');
				const myDonation = await campaignContract.getDonorDonation(account);

				const totalPassedFounds = info.collectedReward.add(
					info.additionalPassedFounds
				);

				const isEnded = await campaignContract.isEnded();
				const state = await getCampaignState(
					info.startBlock,
					info.endBlock,
					isEnded
				);

				const allowance = await daiToken.allowance(
					account,
					campaignContract.address
				);
				if (allowance > 0) {
					setJoined(true);
				}

				const campaingData: Campaign = {
					title: data.title,
					description: data.description,
					startBlock: info.startBlock,
					endBlock: info.endBlock,
					beneficiary: info.beneficiaryWallet,
					donationPool: info.donationPool,
					currentReward,
					collectedReward: info.collectedReward,
					additionalPassedFounds: info.additionalPassedFounds,
					myDonation,
					totalPassedFounds,
					tokenTicker,
					state,
				};

				const tokens = await daiToken.balanceOf(account);

				setCampaign(campaingData);
				setCampaignContract(campaignContract);
				setDaiToken(daiToken);
				setADaiToken(aDaiTokenContract);
				setTokensInWallet(tokens);
				setLoading(false);
			}
		};
		getData();
	}, [router.query.campaignId, chainId, provider, account]);

	const updateData = useCallback(async () => {
		const info: any = await campaignContract.getInfo();

		let currentReward: BigNumber = (
			await aDaiToken.balanceOf(campaignContract.address)
		).sub(info.donationPool);
		currentReward = currentReward.gt(0) ? currentReward : BigNumber.from('0');
		const myDonation = await campaignContract.getDonorDonation(account);

		const totalPassedFounds = info.collectedReward.add(
			info.additionalPassedFounds
		);

		const isEnded = await campaignContract.isEnded();
		const state = await getCampaignState(
			info.startBlock,
			info.endBlock,
			isEnded
		);
		const tokens = await daiToken.balanceOf(account);

		setCampaign((prevState) => ({
			...prevState,
			donationPool: info.donationPool,
			currentReward,
			collectedReward: info.collectedReward,
			additionalPassedFounds: info.additionalPassedFounds,
			myDonation,
			totalPassedFounds,
			state,
		}));
		setTokensInWallet(tokens);
	}, [aDaiToken, account, campaignContract, daiToken]);

	useEffect(() => {
		if (provider) {
			const interval = setInterval(async () => {
				await updateData();
			}, 5000);

			return () => clearInterval(interval);
		}
	}, [provider, updateData]);

	useEffect(() => {
		const updateJoined = async () => {
			if (daiToken && campaignContract) {
				setJoined(false);

				const allowance = await daiToken.allowance(
					account,
					campaignContract.address
				);
				if (allowance > 0) {
					setJoined(true);
				}
				console.log(account);
				console.log('Joined ', joined);
			}
		};
		updateJoined();
	}, [account, daiToken, campaignContract]);
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

	const handleJoinCampaign = async () => {
		await daiToken.approve(
			campaignContract.address,
			ethers.constants.MaxUint256
		);
		setJoined(true);
	};

	const handleDonate = async () => {
		let tx = await campaignContract.donate(amount);
		await tx.wait(1);
		await updateData();
	};

	const handleWithdraw = async () => {
		let tx = await campaignContract.withdraw(amount);
		await tx.wait(1);
		await updateData();
	};

	const handleWithdrawAll = async () => {
		const balance = await campaignContract.getDonorDonation(account);
		let tx = await campaignContract.withdraw(balance);
		await tx.wait(1);
		await updateData();
	};

	const handleEndCampaign = async () => {
		let tx = await campaignContract.endCampaign();
		await tx.wait(1);
		await updateData();
	};

	const handleAddMore = async () => {
		let tx = await campaignContract.foundCharityWalletAndGetBackRest(amount);
		await tx.wait(1);
		await updateData();
	};

	const handleAddAll = async () => {
		const balance = await campaignContract.getDonorDonation(account);
		let tx = await campaignContract.foundCharityWalletAndGetBackRest(balance);
		await tx.wait(1);
		await updateData();
	};

	const formatTokens = (tokens) => {
		const formated = ethers.utils.formatEther(tokens);
		return (
			formated.substring(0, formated.indexOf('.') + 3) +
			' ' +
			campaign.tokenTicker
		);
	};
	return (
		<Box pt={'5'} height={'100%'}>
			<Flex mb={3}>
				<Box ml={'auto'} mr={5} width={'25%'}>
					<Heading size={'lg'} color={'white'}>
						Campaign
					</Heading>
				</Box>
				<Box mr={'auto'} ml={5} width={'25%'}>
					<Heading size={'lg'} color={'white'}>
						Stats
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
					height={'100%'}
					width={'25%'}
				>
					<Flex mb={2}>
						<Skeleton m={2} width={'90%'} height="20px" isLoaded={!loading}>
							<Heading as="h3" size={'md'}>
								{campaign.title}
							</Heading>
						</Skeleton>
						<Spacer />
						<Skeleton mr={1} mt={1} height="20px" isLoaded={!loading}>
							<CampaignState state={campaign.state} />
						</Skeleton>
					</Flex>
					<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
						<Text>{campaign.description}</Text>
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
							<Text mr={1}>{campaign.startBlock.toString()}</Text>
							<Text> {'- ' + campaign.endBlock.toString()}</Text>
							<Icon pt={1} boxSize={5} color="#5c636e" as={GiStoneBlock} />
						</Flex>
					</Skeleton>

					<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
						<Flex width={'100%'}>
							<Icon pt={1} mr={1} boxSize={5} color={'#5c636e'} as={FaWallet} />
							<Text>{campaign.beneficiary}</Text>
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
							<Text>{campaign.tokenTicker}</Text>
						</Flex>
					</Skeleton>
					<Box m={2} mt={2} textAlign="center" hidden={loading}>
						<Box hidden={campaign.state !== 1} m={'auto'}>
							<Center hidden={joined}>
								<Button onClick={handleJoinCampaign} colorScheme="orange">
									Join
								</Button>
							</Center>

							<Flex hidden={!joined}>
								<NumberInput m={2} borderColor="grey" id="startBlock" min={0}>
									<NumberInputField
										onChange={(event) =>
											setAmount(
												ethers.utils.parseEther(event.target.value).toString()
											)
										}
										placeholder="Amount"
									/>
								</NumberInput>
								<Spacer />
								<Button onClick={handleDonate} m={2} colorScheme="green">
									Donate
								</Button>
								<Button onClick={handleWithdraw} m={2} colorScheme="red">
									Withdraw
								</Button>
								<Button onClick={handleWithdrawAll} m={2} colorScheme="red">
									Withdraw all
								</Button>
							</Flex>
						</Box>

						<Flex hidden={campaign.state !== 2}>
							<NumberInput m={2} borderColor="grey" id="startBlock" min={0}>
								<NumberInputField
									onChange={(event) =>
										setAmount(
											ethers.utils.parseEther(event.target.value).toString()
										)
									}
									placeholder="Amount"
								/>
							</NumberInput>
							<Spacer />
							<Button onClick={handleWithdraw} m={2} colorScheme="red">
								Withdraw
							</Button>
							<Button onClick={handleWithdrawAll} m={2} colorScheme="red">
								Withdraw all
							</Button>
							<Button onClick={handleEndCampaign} m={2} colorScheme="blue">
								End
							</Button>
						</Flex>

						<Box hidden={campaign.state !== 3} m={'auto'}>
							<Flex hidden={campaign.myDonation.eq(0)}>
								<NumberInput m={2} borderColor="grey" id="startBlock" min={0}>
									<NumberInputField
										value={1}
										onChange={(event) =>
											setAmount(
												ethers.utils.parseEther(event.target.value).toString()
											)
										}
										placeholder="Amount"
									/>
								</NumberInput>
								<Spacer />
								<Button onClick={handleAddMore} m={2} colorScheme="green">
									Add more
								</Button>
								<Button onClick={handleAddAll} m={2} colorScheme="green">
									Add all
								</Button>
								<Button onClick={handleWithdrawAll} m={2} colorScheme="red">
									Withdraw all
								</Button>
							</Flex>
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
					<Box>
						<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
							<Flex width={'100%'}>
								<Icon
									pt={1}
									mr={1}
									boxSize={5}
									color={'#5c636e'}
									as={BsFillPiggyBankFill}
								/>
								<Text>
									Tokens in your wallet: {formatTokens(tokensInWallet)}
								</Text>
							</Flex>
						</Skeleton>

						<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
							<Flex width={'100%'}>
								<Icon
									pt={1}
									mr={1}
									boxSize={5}
									color={'#5c636e'}
									as={BsFillPiggyBankFill}
								/>
								<Text>Your donation: {formatTokens(campaign.myDonation)}</Text>
							</Flex>
						</Skeleton>

						<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
							<Flex width={'100%'}>
								<Icon
									pt={1}
									mr={1}
									boxSize={5}
									color={'#5c636e'}
									as={BsFillPiggyBankFill}
								/>
								<Text>
									All donations: {formatTokens(campaign.donationPool)}
								</Text>
							</Flex>
						</Skeleton>

						<Skeleton
							hidden={campaign.state === 3}
							m={2}
							mb={3}
							height="20px"
							isLoaded={!loading}
						>
							<Flex width={'100%'}>
								<Icon
									pt={1}
									mr={1}
									boxSize={5}
									color={'#5c636e'}
									as={BsFillPiggyBankFill}
								/>
								<Text>
									Estimated reward: {formatTokens(campaign.currentReward)} ($)
								</Text>
							</Flex>
						</Skeleton>
					</Box>
					<Box hidden={campaign.state !== 3}>
						<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
							<Flex width={'100%'}>
								<Icon
									pt={1}
									mr={1}
									boxSize={5}
									color={'#5c636e'}
									as={BsFillPiggyBankFill}
								/>
								<Text>
									Collected founds: {formatTokens(campaign.collectedReward)}
								</Text>
							</Flex>
						</Skeleton>

						<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
							<Flex width={'100%'}>
								<Icon
									pt={1}
									mr={1}
									boxSize={5}
									color={'#5c636e'}
									as={BsFillPiggyBankFill}
								/>
								<Text>
									Additional founds:{' '}
									{formatTokens(campaign.additionalPassedFounds)}
								</Text>
							</Flex>
						</Skeleton>

						<Skeleton m={2} mb={3} height="20px" isLoaded={!loading}>
							<Flex width={'100%'}>
								<Icon
									pt={1}
									mr={1}
									boxSize={5}
									color={'#5c636e'}
									as={BsFillPiggyBankFill}
								/>
								<Text>
									Transfered founds: {formatTokens(campaign.totalPassedFounds)}
								</Text>
							</Flex>
						</Skeleton>
					</Box>
				</Box>
			</Flex>
		</Box>
	);
};

export default CampaignDetailsPage;
