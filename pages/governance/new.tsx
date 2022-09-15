import {
	Box,
	Button,
	Center,
	FormControl,
	FormLabel,
	Heading,
	Input,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Select,
	Textarea,
} from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useFormik } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { getCampaignFactory, getGovernor } from '../../utils/contractsFactory';

type ProposalFormValues = {
	proposalTitle: string;
	proposalDescription: string;
	charityTitle: string;
	charityDescription: string;
	startBlock: number;
	endBlock: number;
	beneficiary: string;
	token: any;
};

const NewCharityPage: NextPage = () => {
	const router = useRouter();
	const { library: provider, chainId } = useWeb3React();

	const formik = useFormik<ProposalFormValues>({
		enableReinitialize: true,
		initialValues: {
			proposalTitle: '',
			proposalDescription: '',
			charityTitle: '',
			charityDescription: '',
			startBlock: 0,
			endBlock: 0,
			beneficiary: '',
			token: {
				address: process.env.NEXT_PUBLIC_DAI_TOKEN_ADDRESS,
				ticker: 'MDAI',
			},
		},
		onSubmit: async (values) => {
			const ipfsData = {
				title: values.charityTitle,
				description: values.charityDescription,
			};

			const response = fetch('/api/ipfs', {
				method: 'POST',
				body: JSON.stringify(ipfsData),
				headers: {
					'Content-Type': 'application/json',
				},
			})
				.then((ipfsResponse) => ipfsResponse.json())
				.then((data) => {
					return `ipfs://${data.ipfsHash}`;
				});

			const signer = provider.getSigner();

			const factory = getCampaignFactory(chainId, signer);

			const metadataUrl = await response;
			const args = [
				values.startBlock,
				values.endBlock,
				values.token.address,
				values.beneficiary,
				metadataUrl,
			];

			const encodedFunctionCall = factory.interface.encodeFunctionData(
				'createCampaign',
				args
			);

			console.log(encodedFunctionCall);

			const governor = getGovernor(chainId, signer);
			const proposalTx = await governor.propose(
				[factory.address],
				[0],
				[encodedFunctionCall],
				values.proposalDescription
			);

			console.log('Done');
			const proposalResponse = await proposalTx.wait(1);
			const proposalId = proposalResponse.events[0].args.proposalId.toString();

			const body = {
				proposalId,
				proposalTitle: values.proposalTitle,
				proposalDescription: values.proposalDescription,
				charityTile: values.charityTitle,
				charityDescription: values.charityDescription,
				startBlock: values.startBlock,
				endBlock: values.endBlock,
				beneficiary: values.beneficiary,
				tokenAddress: values.token.address,
				tokenTicker: values.token.ticker,
				metadataUrl: metadataUrl,
			};

			fetch('/api/governance/new', {
				method: 'POST',
				body: JSON.stringify(body),
				headers: {
					'Content-Type': 'application/json',
				},
			})
				.then((createResponse) => createResponse.json())
				.then(() => router.push('/governance'));
		},
	});

	const handleChange = async (event) => {
		const [address, ticker] = event.target.value.split('/');
		formik.setFieldValue('token', { address, ticker });
	};

	return (
		<Box mt={5}>
			<Center mb={5}>
				<Heading size="2xl" color={'white'}>
					Create proposal
				</Heading>
			</Center>
			<Box
				boxShadow="dark-lg"
				m={'auto'}
				textAlign={'center'}
				backgroundColor={'white'}
				borderWidth={2}
				borderRadius="lg"
				width={'25%'}
			>
				<form onSubmit={formik.handleSubmit}>
					<Center p={2}>
						<FormControl borderColor="grey" width={'100%'}>
							<FormLabel color={'#393e46'} htmlFor="proposalTitle">
								Proposal title
							</FormLabel>
							<Input
								id="proposalTitle"
								value={formik.values.proposalTitle}
								onChange={formik.handleChange}
							></Input>
						</FormControl>
					</Center>
					<Center p={2}>
						<FormControl borderColor="grey" width={'100%'}>
							<FormLabel htmlFor="proposalDescription">
								Proposal description
							</FormLabel>
							<Textarea
								id="proposalDescription"
								value={formik.values.proposalDescription}
								onChange={formik.handleChange}
							></Textarea>
						</FormControl>
					</Center>
					<Center p={2}>
						<FormControl borderColor="grey" width={'100%'}>
							<FormLabel htmlFor="charityTitle">Charity title</FormLabel>
							<Input
								id="charityTitle"
								value={formik.values.charityTitle}
								onChange={formik.handleChange}
							></Input>
						</FormControl>
					</Center>
					<Center p={2}>
						<FormControl borderColor="grey" width={'100%'}>
							<FormLabel htmlFor="charityDescription">
								Charity description
							</FormLabel>
							<Textarea
								id="charityDescription"
								value={formik.values.charityDescription}
								onChange={formik.handleChange}
							></Textarea>
						</FormControl>
					</Center>

					<Center p={2}>
						<FormControl width={'100%'}>
							<FormLabel htmlFor="starBlock">Start block</FormLabel>
							<NumberInput borderColor="grey" id="startBlock" min={0}>
								<NumberInputField
									value={formik.values.startBlock}
									onChange={formik.handleChange}
								/>
								<NumberInputStepper>
									<NumberIncrementStepper />
									<NumberDecrementStepper />
								</NumberInputStepper>
							</NumberInput>
						</FormControl>
					</Center>

					<Center p={2}>
						<FormControl width={'100%'}>
							<FormLabel htmlFor="endBlock">End block</FormLabel>
							<NumberInput borderColor="grey" id="endBlock" min={0}>
								<NumberInputField
									value={formik.values.endBlock}
									onChange={formik.handleChange}
								/>
								<NumberInputStepper>
									<NumberIncrementStepper />
									<NumberDecrementStepper />
								</NumberInputStepper>
							</NumberInput>
						</FormControl>
					</Center>

					<Center p={2}>
						<FormControl borderColor="grey" width={'100%'}>
							<FormLabel htmlFor="beneficiary">Beneficiary</FormLabel>
							<Input
								id="beneficiary"
								value={formik.values.beneficiary}
								onChange={formik.handleChange}
							/>
						</FormControl>
					</Center>

					<Center p={2}>
						<FormControl width={'100%'}>
							<FormLabel htmlFor="token">Token</FormLabel>
							<Select
								id="token"
								borderColor="grey"
								value={`${formik.values.token.address}/${formik.values.token.ticker}`}
								onChange={handleChange}
							>
								<option
									value={`${process.env.NEXT_PUBLIC_DAI_TOKEN_ADDRESS}/MDAI`}
								>
									MDAI
								</option>
							</Select>
						</FormControl>
					</Center>
					<Box m={2} textAlign="right">
						<Button size={'md'} type="submit" colorScheme="orange">
							Create
						</Button>
					</Box>
				</form>
			</Box>
		</Box>
		// </div> */}
	);
};

export default NewCharityPage;
