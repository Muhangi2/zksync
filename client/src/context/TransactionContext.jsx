import React, { useEffect, useState } from "react";
import { Web3 } from "web3";
import { ZKsyncPlugin} from "web3-plugin-zksync";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

export const TransactionsProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [formData, setFormData] = useState({ addressTo: "", amount: "", gmail: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const web3Instance = new Web3(window.ethereum);
        web3Instance.registerPlugin(new ZKsyncPlugin("https://sepolia.era.zksync.dev"));
        setWeb3(web3Instance);

        const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
        console.log("Contract instance:", contractInstance);
        setContract(contractInstance);

        try {
          const accounts = await web3Instance.eth.requestAccounts();
          setCurrentAccount(accounts[0]);
        } catch (error) {
          console.error("User denied account access");
        }

        // Fetch transactions after initializing Web3 and contract
        await getAllTransactions(web3Instance, contractInstance);
      } else {
        console.log('Please install MetaMask!');
      }
    };

    initializeWeb3();
  }, []);

  useEffect(() => {
    if (currentAccount) {
      updateBalance();
    }
  }, [currentAccount]);

  const updateBalance = async () => {
    if (web3 && currentAccount) {
      const balanceWei = await web3.eth.getBalance(currentAccount);
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      console.log("Current balance:", balanceEth, "ETH");
      setBalance(balanceEth);
    }
  };


  const sendTransaction = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (!web3 || !contract) throw new Error("Web3 or Contract is not initialized");
      
      const { addressTo, amount, gmail, message } = formData;
      
      console.log("Current network ID:", await web3.eth.net.getId());
      console.log("Current account:", currentAccount);

      const networkId = await web3.eth.net.getId();
      console.log("Current network ID:", networkId);
      if (networkId !== 300n) { // ZKSync Era Testnet network ID
        throw new Error(`Wrong network. Please connect to ZKSync Era Testnet.`);
      }

      const balance = await web3.eth.getBalance(currentAccount);
      console.log("Current balance:", web3.utils.fromWei(balance, 'ether'), "ETH");

      const gasPrice = await web3.eth.getGasPrice();
      console.log("Current gas price:", web3.utils.fromWei(gasPrice, 'gwei'), "Gwei");

      const gasLimit = await contract.methods.addToBlockchain(
        addressTo, 
        web3.utils.toWei(amount, "ether"), 
        message, 
        gmail
      ).estimateGas({from: currentAccount});
      console.log("Estimated gas limit:", gasLimit);

      const txCost = BigInt(gasPrice) * BigInt(gasLimit);
      const totalCost = BigInt(web3.utils.toWei(amount, "ether")) + txCost;

      if (BigInt(balance) < totalCost) {
        throw new Error("Insufficient ETH for transaction");
      }

      console.log("Sending transaction...");
      const receipt = await contract.methods.addToBlockchain(
        addressTo, 
        web3.utils.toWei(amount, "ether"), 
        message, 
        gmail
      ).send({ 
        from: currentAccount,
        gasPrice: gasPrice,
        gas: gasLimit
      });

      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
      console.log("Transaction receipt:", receipt);
      
      setIsLoading(false);
      updateBalance();
      getAllTransactions();
    } catch (error) {
      console.error("Error in sendTransaction:", error);
      setError(error.message || "An unknown error occurred");
      setIsLoading(false);
    }
  };

  const getAllTransactions = async (web3Instance, contractInstance) => {
    try {
      if (!contractInstance) {
        console.error("Contract is not initialized");
        return;
      }
      
      const availableTransactions = await contractInstance.methods.getAllTransactions().call();
      console.log("Available transactions:", availableTransactions);
  
      const structuredTransactions = availableTransactions.map((transaction) => ({
        addressFrom: transaction.sender,
        addressTo: transaction.receiver,
        amount: web3Instance.utils.fromWei(transaction.amount.toString(), "ether") + " ETH",
        message: transaction.message,
        timestamp: new Date(Number(transaction.timestamp) * 1000).toLocaleString(),
        keyword: transaction.keyword
      }));
      console.log("Structured transactions:", structuredTransactions);
      setTransactions(structuredTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!web3) throw new Error("Web3 is not initialized");

      const accounts = await web3.eth.requestAccounts();
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError(error.message || "Failed to connect wallet");
    }
  };

 

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        balance,
        formData,
        setFormData,
        handleChange: (e, name) => setFormData((prevState) => ({ ...prevState, [name]: e.target.value })),
        sendTransaction,
        transactions,
        getAllTransactions,
        isLoading,
        error
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};