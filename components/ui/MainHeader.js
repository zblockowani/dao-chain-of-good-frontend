import {
	Avatar,
	Box,
	Button,
	Center,
	Flex,
	HStack,
	Img,
	Menu,
	MenuButton,
	MenuDivider,
	MenuList,
	Stack,
	Stat,
	StatLabel,
	StatNumber,
	Text,
} from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { BigNumber, ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import logo from '../../image/logo.png';

const injected = new InjectedConnector();

const MainHeader = () => {
	const {
		active,
		activate,
		deactivate,
		library: provider,
		account,
	} = useWeb3React();
	const [balance, setBalance] = useState(BigNumber.from('0'));
	const [currentBlockNumber, setCurrentBlockNumber] = useState(
		BigNumber.from('0')
	);
	const router = useRouter();
	const connect = useCallback(async () => {
		try {
			await activate(injected);
		} catch (error) {
			console.log(error);
		}
	}, [activate]);

	useEffect(() => {
		const con = async () => {
			if (!active) {
				await activate(injected);
			}
		};
		con();
	}, []);

	useEffect(() => {
		console.log('Effect acctive ', active);
	}, [active]);

	useEffect(() => {
		const getBalance = async () => {
			if (provider) {
				const balance = await provider.getBalance(account);
				const blockNumber = await provider.getBlockNumber();
				setCurrentBlockNumber(blockNumber);
				setBalance(balance);
			}
		};
		getBalance();
	}, [provider, account]);

	useEffect(() => {
		if (provider) {
			const interval = setInterval(async () => {
				const blockNumber = await provider.getBlockNumber();
				setCurrentBlockNumber(blockNumber);
			}, 5000);
			return () => clearInterval(interval);
		}
	}, [provider]);

	const disconnect = async () => {
		try {
			deactivate(injected);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<Box
			as="header"
			position="fixed"
			backgroundColor="rgba(49, 130, 206, 0.8)"
			backdropFilter="saturate(180%) blur(5px)"
			w="100%"
			pl={1}
			pr={4}
		>
			<Flex
				as="header"
				h={20}
				alignItems={'center'}
				justifyContent={'space-between'}
			>
				<HStack spacing={8} alignItems={'center'}>
					<Link href={'/'}>
						<Box cursor={'pointer'} width={16}>
							<Image src={logo} alt="Logo"></Image>
						</Box>
					</Link>
					<HStack as={'nav'} spacing={8} display={{ base: 'none', md: 'flex' }}>
						<Link href={'/governance'}>
							<Text
								_hover={{
									textDecoration: 'underline',
								}}
								cursor={'pointer'}
								color={'white'}
								textDecoration={
									router.pathname == '/governance' ? 'underline' : 'none'
								}
							>
								Governance
							</Text>
						</Link>
						<Link href={'/charity/campaigns'}>
							<Text
								_hover={{
									textDecoration: 'underline',
								}}
								textDecoration={
									router.pathname == '/charity/campaigns' ? 'underline' : 'none'
								}
								cursor={'pointer'}
								color={'white'}
							>
								Charity
							</Text>
						</Link>
					</HStack>
				</HStack>

				<Flex alignItems={'center'}>
					<Stack direction={'row'} spacing={7}>
						<Menu>
							{!active ? (
								<Button onClick={connect} m={1} colorScheme="orange">
									Connect
								</Button>
							) : (
								<>
									<Stat pt={3} color={'white'} mr={0}>
										<StatLabel textAlign={'right'}>Current block</StatLabel>
										<StatNumber textAlign={'right'}>
											{currentBlockNumber.toString()}
										</StatNumber>
									</Stat>
									<MenuButton
										as={Button}
										rounded={'full'}
										variant={'link'}
										cursor={'pointer'}
										minW={0}
									>
										<Avatar
											height={16}
											width={16}
											src={
												'https://avatars.dicebear.com/api/avataaars/dsfwqcaaaaaaaadasdasdsaas.svg'
											}
										/>
									</MenuButton>
									<MenuList alignItems={'center'}>
										<br />
										<Center>
											<Avatar
												size={'2xl'}
												src={
													'https://avatars.dicebear.com/api/avataaars/dsfwqcaaaaaaaadasdasdsaas.svg'
												}
											/>
										</Center>
										<br />
										<Center>
											<Text>{`${account.slice(0, 6)}...${account.slice(
												account.length - 6
											)}`}</Text>
										</Center>
										<Center>
											<Text>
												{ethers.utils.formatEther(balance).slice(0, 9)} ETH
											</Text>
										</Center>
										<br />
										<MenuDivider />
										<Center>
											<Button onClick={disconnect} m={1} colorScheme={'orange'}>
												Disconnect
											</Button>
										</Center>
										{/* <MenuItem>Account Settings</MenuItem> */}
										{/* <MenuItem>Logout</MenuItem> */}
									</MenuList>
								</>
							)}
						</Menu>
					</Stack>
				</Flex>
			</Flex>
		</Box>
	);
};

export default MainHeader;
