import contractsConfig from '../constants/contracts.json';
import campaignConfig from '../constants/Campaign.json';
import { Contract, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { AbiCoder } from 'ethers/lib/utils';

type ContractCofing = {
	abi: any;
	address: string;
};

export function getGovernor(chainId, signer) {
	return getContract('ChainOfGoodGovernor', chainId, signer);
}

export function getCampaignFactory(chainId, signer) {
	return getContract('ChainOfGoodFactory', chainId, signer);
}

export function getCampaign(campaignAddress, chainId, signer) {
	return new ethers.Contract(campaignAddress, campaignConfig.abi, signer);
}

export function getADaiToken(chainId, signer) {
	return getContract('ADaiToken', chainId, signer);
}

export function getDaiToken(chainId, signer) {
	return getContract('DaiToken', chainId, signer);
}

function getContract(contractName, chainId, signer, contractAddress?) {
	console.log(chainId);
	const config: ContractCofing = contractsConfig[chainId][contractName];

	const address = contractAddress || config.address;
	return new ethers.Contract(address, config.abi, signer);
}
