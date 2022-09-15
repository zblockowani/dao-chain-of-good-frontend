import { List, ListItem, UnorderedList } from '@chakra-ui/react';
import ProposalItem, { ItemProps } from './ProposalItem';

type ListProps = {
	items: ItemProps[];
};

const ProposalList: React.FC<ListProps> = (props) => {
	return (
		<List width={'100%'}>
			{props.items.map((proposal) => (
				<ProposalItem
					key={proposal.id}
					id={proposal.id}
					proposalId={proposal.proposalId}
					title={proposal.title}
					state={proposal.state}
				/>
			))}
		</List>
	);
};

export default ProposalList;
