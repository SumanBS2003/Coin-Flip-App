import React, { useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import "./App.css";

const CONTRACT_ADDRESS = "0x73837a5fD7942b9f67e14b9c04a94AC52fD2e2A7";
const ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "won",
          "type": "bool"
        }
      ],
      "name": "FlipResult",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "_side",
          "type": "bool"
        }
      ],
      "name": "flip",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [side, setSide] = useState("");
  const [result, setResult] = useState("");

  const connectWallet = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    setProvider(provider);
    setSigner(signer);
  };

  const flipCoin = async () => {
    if (!betAmount || !side) {
      alert("Please select an amount and a side to bet on.");
      return;
    }
  
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  
      // Call the flip function on the smart contract
      const transaction = await contract.flip(side === "heads", {
        value: ethers.utils.parseEther(betAmount),
      });
  
      // Wait for the transaction to be mined
      await transaction.wait();
  
      // Get the signer's address
      const address = await signer.getAddress();
  
      // Listen for the FlipResult event
      contract.once("FlipResult", (player, amount, flipResult) => {
        if (player.toLowerCase() === address.toLowerCase()) {
          setResult(flipResult ? "You Won!" : "You Lost!");
        }
      });
    } catch (error) {
      console.error("Error during the flip:", error);
      alert("There was an error with your flip. Please try again.");
    }
  };
  
  // const flipCoin = async () => {
  //   if (!betAmount || !side) {
  //     alert("Please select an amount and a side to bet on.");
  //     return;
  //   }

  //   const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  //   const transaction = await contract.flip(side === "heads", {
  //     value: ethers.utils.parseEther(betAmount),
  //   });
  //   await transaction.wait();

  //   const flipResult = await contract.lastFlipResult();
  //   setResult(flipResult ? "You Won!" : "You Lost!");
  // };

  return (
    <div className="app">
      <h1>CoinFlip Game</h1>
      {!signer ? (
        <button className="btn" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div className="game">
          <div className="bet-section">
            <input
              type="text"
              placeholder="Bet Amount (ETH)"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
            />
            <div className="side-selection">
              <button
                className={`side-btn ${side === "heads" ? "selected" : ""}`}
                onClick={() => setSide("heads")}
              >
                Heads
              </button>
              <button
                className={`side-btn ${side === "tails" ? "selected" : ""}`}
                onClick={() => setSide("tails")}
              >
                Tails
              </button>
            </div>
            <button className="btn flip-btn" onClick={flipCoin}>
              Flip Coin
            </button>
          </div>
          {result && <div className="result">{result}</div>}
        </div>
      )}
    </div>
  );
}

export default App;
