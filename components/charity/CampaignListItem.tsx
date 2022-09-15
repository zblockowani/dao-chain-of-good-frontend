import { Box, Flex, ListItem, Spacer, Text } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import Link from 'next/link';
import CampaignState from './CampaignState';

export type CharityItemProps = {
	id: string;
	title: string;
	state: number;
};

const CharityListItem: React.FC<CharityItemProps> = (props) => {
	return (
		<ListItem>
			<Link href={`/charity/campaigns/${props.id}`}>
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
						<CampaignState state={props.state} />
					</Box>
				</Flex>
			</Link>
		</ListItem>
	);
};

export default CharityListItem;
