import { List } from '@chakra-ui/react';
import CharityListItem, { CharityItemProps } from './CampaignListItem';

type CharityListProps = {
	items: CharityItemProps[];
};

const ChairtyList: React.FC<CharityListProps> = (props) => {
	return (
		<List width={'100%'}>
			{props.items.map((campaign) => (
				<CharityListItem
					key={campaign.id}
					id={campaign.id}
					title={campaign.title}
					state={campaign.state}
				/>
			))}
		</List>
	);
};

export default ChairtyList;
