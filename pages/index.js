import { Box, Center, Img } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function Home() {
	const [displayText, setDisplayText] = useState(true);
	useEffect(() => {
		const interval = setInterval(() => {
			setDisplayText((prevState) => (prevState ? false : true));
		}, 1000);
		return () => clearInterval(interval);
	}, []);
	return (
		<Box>
			{displayText ? (
				<Center>
					<Img src="/logo.png"></Img>
				</Center>
			) : (
				<Center>
					<Img src="/chainOfGood.png"></Img>
				</Center>
			)}
		</Box>
	);
}
