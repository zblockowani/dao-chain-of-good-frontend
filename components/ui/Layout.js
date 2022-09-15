import { Box, Container } from '@chakra-ui/react';
import MainHeader from './MainHeader';

const Layout = (props) => {
	return (
		<Box height={'100%'}>
			<MainHeader />
			<Box as="main" p="20" backgroundColor={'blue.400'} height={'100%'}>
				{props.children}
			</Box>
		</Box>
	);
};

export default Layout;
