import React, { useState, useEffect } from "react";
import { connectWallet, getCurrentAccount, isOnSepolia, formatAddress } from "../utils/web3";
import { toast } from "react-toastify";

const WalletConnect = () => {
    const [account, setAccount] = useState(null);
    const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        checkConnection();
        setupListeners();
    }, []);

    const checkConnection = async () => {
        const currentAccount = await getCurrentAccount();
        if (currentAccount) {
            setAccount(currentAccount);
            const onSepolia = await isOnSepolia();
            setIsCorrectNetwork(onSepolia);
        }
    };

    const setupListeners = () => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                }
            });

            window.ethereum.on("chainChanged", () => {
                window.location.reload();
            });
        }
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const connectedAccount = await connectWallet();
            setAccount(connectedAccount);
            setIsCorrectNetwork(true);
            toast.success("Wallet connected successfully!");
        } catch (error) {
            console.error("Connection error:", error);
            toast.error(error.message || "Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    if (!account) {
        return (
            <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="btn btn-primary"
                style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}
            >
                <i className="fas fa-wallet"></i>
                {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
        );
    }

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {!isCorrectNetwork && (
                <span
                    style={{
                        color: "#f44336",
                        fontSize: "12px",
                        padding: "4px 8px",
                        background: "#ffebee",
                        borderRadius: "4px"
                    }}
                >
                    ⚠️ Wrong Network
                </span>
            )}
            <div
                style={{
                    padding: "8px 16px",
                    background: isCorrectNetwork ? "#e8f5e9" : "#fff3e0",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    border: `1px solid ${isCorrectNetwork ? "#4caf50" : "#ff9800"}`
                }}
            >
                <span
                    style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: isCorrectNetwork ? "#4caf50" : "#ff9800"
                    }}
                ></span>
                <i className="fas fa-wallet"></i>
                <span style={{ fontWeight: "500" }}>{formatAddress(account)}</span>
                {isCorrectNetwork && (
                    <span style={{ color: "#666", fontSize: "12px" }}>(Sepolia)</span>
                )}
            </div>
        </div>
    );
};

export default WalletConnect;
