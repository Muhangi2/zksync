import React, { useContext, useEffect } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";

const TransactionsCard = ({ addressTo, addressFrom, timestamp, message, amount, keyword }) => {
  console.log("keyword", keyword)
  return (
    <div className="bg-gray-800 m-4 flex flex-1
      2xl:min-w-[450px]
      2xl:max-w-[500px]
      sm:min-w-[270px]
      sm:max-w-[300px]
      min-w-full
      flex-col p-5 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="flex flex-col items-start w-full mt-3">
        <div className="flex flex-col w-full mb-6 space-y-3">
          <a href={`https://explorer.testnet.swisstronik.com/address/${addressFrom}`} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors duration-200">
            <p className="text-gray-300 text-sm">From: <span className="text-white font-medium">{shortenAddress(addressFrom)}</span></p>
          </a>
          <a href={`https://explorer.testnet.swisstronik.com/address/${addressTo}`} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors duration-200">
            <p className="text-gray-300 text-sm">To: <span className="text-white font-medium">{shortenAddress(addressTo)}</span></p>
          </a>
          <p className="text-gray-300 text-sm">Amount: <span className="text-white font-medium">{amount} ETH</span></p>
          {message && (
            <>
              <p className="text-gray-300 text-sm">Email: <span className="text-white font-medium">{keyword}</span></p>
              <p className="text-gray-300 text-sm">Message: <span className="text-white font-medium">{message}</span></p>
            </>
          )}
        </div>
        <div className="bg-gray-900 p-2 px-4 rounded-full shadow-inner self-end">
          <p className="text-blue-400 text-xs font-semibold">{timestamp}</p>
        </div>
      </div>
    </div>
  );
};

const Transactions = () => {
  const { transactions, currentAccount, getAllTransactions } = useContext(TransactionContext);
  console.log("transactionssssssss", transactions)

  useEffect(() => {
    if (currentAccount) {
      getAllTransactions();
    }
  }, [currentAccount, getAllTransactions]);

  return (
    <div className="flex w-full justify-center items-center 2xl:px-20 bg-gradient-to-r from-gray-900 to-gray-800 py-12">
      <div className="flex flex-col md:p-12 py-12 px-4 max-w-7xl w-full">
        <h3 className="text-white text-3xl font-bold text-center mb-8">
          {currentAccount ? "Latest Transactions" : "Connect your account to see the latest transactions"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {transactions.reverse().map((transaction, i) => (
            <TransactionsCard key={i} {...transaction} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transactions;