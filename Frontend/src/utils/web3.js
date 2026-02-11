import { ethers } from "ethers";
import contractData from "../contracts/MLLifecycle.json";

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex
const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

/**
 * Get the Web3 provider from MetaMask
 */
export const getProvider = () => {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
    }
    return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Get the signer (connected wallet)
 */
export const getSigner = async () => {
    const provider = getProvider();
    return await provider.getSigner();
};

/**
 * Get the contract instance
 */
export const getContract = async () => {
    const signer = await getSigner();
    return new ethers.Contract(contractData.address, contractData.abi, signer);
};

/**
 * Connect to MetaMask wallet
 */
export const connectWallet = async () => {
    try {
        if (!window.ethereum) {
            throw new Error("MetaMask is not installed. Please install MetaMask to use blockchain features.");
        }

        const provider = getProvider();
        const accounts = await provider.send("eth_requestAccounts", []);

        // Check if we're on Sepolia
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== SEPOLIA_CHAIN_ID_DECIMAL) {
            await switchToSepolia();
        }

        return accounts[0];
    } catch (error) {
        console.error("Wallet connection error:", error);
        throw error;
    }
};

/**
 * Switch to Sepolia network
 */
export const switchToSepolia = async () => {
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: SEPOLIA_CHAIN_ID,
                            chainName: "Sepolia Test Network",
                            rpcUrls: ["https://rpc.sepolia.org"],
                            nativeCurrency: {
                                name: "Sepolia ETH",
                                symbol: "ETH",
                                decimals: 18,
                            },
                            blockExplorerUrls: ["https://sepolia.etherscan.io"],
                        },
                    ],
                });
            } catch (addError) {
                throw new Error("Failed to add Sepolia network");
            }
        } else {
            throw switchError;
        }
    }
};

/**
 * Get current connected account
 */
export const getCurrentAccount = async () => {
    try {
        const provider = getProvider();
        const accounts = await provider.send("eth_accounts", []);
        return accounts[0] || null;
    } catch (error) {
        return null;
    }
};

/**
 * Check if on Sepolia network
 */
export const isOnSepolia = async () => {
    try {
        const provider = getProvider();
        const network = await provider.getNetwork();
        return Number(network.chainId) === SEPOLIA_CHAIN_ID_DECIMAL;
    } catch (error) {
        return false;
    }
};

/**
 * Format address for display (0x1234...5678)
 */
export const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Convert basis points to percentage for display
// Example: 9843 becomes 98.43
export const basisPointsToPercent = (basisPoints) => {
    return (Number(basisPoints) / 100).toFixed(2);
};

/**
 * Get Etherscan URL for transaction
 */
export const getEtherscanUrl = (txHash) => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
};

/**
 * Generate a simple hash from a string
 */
export const generateHash = (input) => {
    return ethers.keccak256(ethers.toUtf8Bytes(input));
};
