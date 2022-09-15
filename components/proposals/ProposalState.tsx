import { Badge } from '@chakra-ui/react';
import { useMemo } from 'react';

type ProposalStateProps = {
	state: number;
};

const ProposalState: React.FC<ProposalStateProps> = (props) => {
	const badge = useMemo(() => {
		switch (props.state) {
			case 0:
				return (
					<Badge variant="outline" colorScheme="gray">
						Created
					</Badge>
				);
			case 1:
				return (
					<Badge variant="outline" colorScheme="cyan">
						Voting
					</Badge>
				);
			case 3:
				return (
					<Badge variant="outline" colorScheme="red">
						Canceled
					</Badge>
				);
			case 4:
				return (
					<Badge variant="outline" colorScheme="green">
						Passed
					</Badge>
				);
			case 5:
				return (
					<Badge variant="outline" colorScheme="purple">
						Queued
					</Badge>
				);
			case 7:
				return (
					<Badge variant="outline" colorScheme="blue">
						Executed
					</Badge>
				);
		}
	}, [props.state]);
	return <>{badge}</>;
};

export default ProposalState;
