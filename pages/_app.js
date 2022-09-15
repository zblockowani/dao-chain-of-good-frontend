import { background, Box, ChakraProvider, Container } from '@chakra-ui/react';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import Layout from '../components/ui/Layout';
import '../styles/globals.css';

const getLibrary = (provider) => {
	return new Web3Provider(provider);
};

function MyApp({ Component, pageProps }) {
	return (
		<Web3ReactProvider getLibrary={getLibrary}>
			<ChakraProvider>
				<Layout>
					<style global jsx>{`
						html,
						body,
						body > div:first-child,
						div#__next,
						div#__next > div {
							height: 100%;
						}
					`}</style>
					<Component {...pageProps} />
				</Layout>
			</ChakraProvider>
		</Web3ReactProvider>
	);
}

export default MyApp;
