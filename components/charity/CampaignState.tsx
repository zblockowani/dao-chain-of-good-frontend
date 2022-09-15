import { Badge } from '@chakra-ui/react';
import { useMemo } from 'react';

type CampaignStateProps = {
	state: number;
};

const CampaignState: React.FC<CampaignStateProps> = (props) => {
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
						In progress
					</Badge>
				);
			case 2:
				return (
					<Badge variant="outline" colorScheme="red">
						Waiting for completion
					</Badge>
				);
			case 3:
				return (
					<Badge variant="outline" colorScheme="green">
						Ended
					</Badge>
				);
		}
	}, [props.state]);
	return <>{badge}</>;
};

export default CampaignState;
