import { Badge, Box, Flex, ListItem, Spacer, Text } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import Link from 'next/link';
import React, { useMemo } from 'react';
import ProposalState from './ProposalState';

export type ItemProps = {
	id: string;
	proposalId: BigNumber;
	title: string;
	state: number;
};

const ProposalItem: React.FC<ItemProps> = (props) => {
	return (
		<ListItem>
			<Link href={`/governance/${props.id}`}>
				<Flex
					p={2}
					cursor="pointer"
					width={'100%'}
					borderBottom={'1px solid #d9d9d9 '}
					borderRadius={4}
					_hover={{
						backgroundColor: '#fffafa',
						borderRadius: 4,
					}}
				>
					<Box>
						<Text>{props.title}</Text>
					</Box>
					<Spacer />
					<Box>
						<ProposalState state={props.state} />
					</Box>
				</Flex>
			</Link>
		</ListItem>
	);
};

export default ProposalItem;
