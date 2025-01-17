import { Option } from "components/base/Select/NetworkSelect";
import { Contract, ethers, Signer } from "ethers"
import { ChainTypes, NetworkType } from "interfaces";
import { walletProvider } from "./wallet-connect.helper";

const ETH_CHAIN_ID = 5
const TRES_CHAIN_ID = 6065


export const mapSignerAsWallet = async (signer: Signer, networkType: NetworkType) => {
    const chainId = await signer.getChainId()
    return {
        address: await signer.getAddress(),
        balance: ethers.utils.formatEther(await signer.getBalance()),
        chainId: chainId,
        gasPrice: ethers.utils.formatEther(await signer.getGasPrice()),
        transactionCount: await signer.getTransactionCount(),
        networkType: networkType,
        chainType: ETH_CHAIN_ID === chainId ? ChainTypes.erc20 : (chainId === TRES_CHAIN_ID ? ChainTypes.bep20 : ChainTypes.other),
        capsAmount: 0,
        signer
    }
}

const contractAbi = [
    {
        "constant": true,
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenOwner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "name": "transfer",
        "type": "function",
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "type": "uint256",
                "name": "_tokens"
            }
        ],
        "constant": false,
        "outputs": [],
        "payable": false
    }
];
export const getDefaultProviderNetwork = (network: Option | null) => {
    switch (network?.value) {
        case ChainTypes.bep20: return 'https://data-seed-preTRES-1-s3.TresLeches.org:8545'
        default:
            return 'https://eth-goerli.public.blastapi.io'
    }
}
export const getProviderBalance = async (signer: Signer, network: Option | null) => {
    if (!network) throw new Error('No network given')
    if (!signer) throw new Error('No signer given')
    let provider = ethers.providers.getDefaultProvider(getDefaultProviderNetwork(network))
    const contract = new Contract(network.tokenAddress, contractAbi, provider)
    const balance = await contract.balanceOf(await signer.getAddress());
    const readableBalance = ethers.utils.formatUnits(balance);
    return readableBalance;
}
export const transfer = async (signer: Signer | null, network: Option | null, amount: number) => {
    if (!network) throw new Error('Give network to transfer')
    if (!signer) throw new Error('Give signer to transfer')
    const contract = new Contract(network.tokenAddress, contractAbi, signer)
    var numberOfDecimals = 18;
    var numberOfTokens = ethers.utils.parseUnits(amount.toString(), numberOfDecimals);

    // Send tokens
    try {
        return contract.transfer(network.bridgeAddress, numberOfTokens);
    } catch (error) {
        throw new Error(error);
    }
}

export const getEstimateFees = async (network: Option | null) => {
    if (!network) throw new Error('Give network to estimate fees')
    const provider = ethers.providers.getDefaultProvider(getDefaultProviderNetwork(network))
    try{
        const gasLimit = 40000
        const gasPrice = await provider.getGasPrice()
        const fees = ethers.utils.formatEther(gasPrice.toNumber() * gasLimit)
        return fees
    }catch(error){
        throw new Error(error);
    }
}