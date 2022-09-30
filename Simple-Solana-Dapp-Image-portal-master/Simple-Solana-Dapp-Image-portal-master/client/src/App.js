import React, { useEffect, useState } from 'react';
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import './App.css';
import kp from './keypair.json'


const App = () => {


  const [account, setAccount] = useState(null);
  const [memesList, setMemesList] = useState([]);
  const [value, setValue] = useState([]);

  //sets out network to devnet
  const network = clusterApiUrl('devnet');

  //preflightCommitment is to set when the transaction needs to be confirmed. here we just wait for the transaction to succeed
  const opts = {
    preflightCommitment: 'processed',
  };

  //systemprogram is ref to solana runtime
  const { SystemProgram } = web3;

  //create a keypair for an account to hold the data of memes
  const arr = Object.values(kp._keypair.secretKey)
  const secret = new Uint8Array(arr)
  const baseAccount = web3.Keypair.fromSecretKey(secret)

  //get program id from idl file
  let programID = new PublicKey(idl.metadata.address);

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (account) {
      console.log('Fetching GIfs');
      //call solana function
      getMemeList();
    }
  }, [account]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom Wallet Detected');
          const res = await solana.connect({ onlyIfTrusted: true });
          console.log('Connected with ', res.publicKey.toString());
          setAccount(res.publicKey.toString());
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const connectWallet = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          const res = await solana.connect();
          console.log('Connected with', res.publicKey.toString());
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  //to make a provider we need a connected wallet
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const getMemeList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log('account(storage) is ', account);
      console.log('memes list ', account.memesList);
      setMemesList(account.memesList);
    } catch (error) {
      console.log(error);
      setMemesList(null);
    }
  };

  //we need to call the startstuffoff to initialize the base account(storage account)
  const createMemeAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log('Created base Account ', baseAccount.publicKey.toString());
      await getMemeList();
    } catch (error) {
      console.log(error);
    }
  };

  const notConnectedContainer = () => (
    <button
      className='cta-button connect-wallet-button'
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const sendMeme = async () => {
    if (value.length > 0) {
      console.log('Link is', value);
      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
        await program.rpc.addMeme(value, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          },
        });
        console.log('Meme Sent to Program');
        await getMemeList();
      } catch (error) {
        console.log(error);
      }
      setValue('');
    } else {
      console.log('Empty Input');
    }
  };

  const connectedContainer = () => {
    // If we hit this, it means the program account hasn't been initialized.
    if (memesList === null) {
      return (
        <div className='connected-container'>
          <button
            className='cta-button submit-meme-button'
            onClick={createMemeAccount}
          >
            Do One-Time Initialization For MEME Program Account
          </button>
        </div>
      );
    } else {
      return (
        <div className='connected-container'>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMeme();
            }}
          >
            <input
              type='text'
              placeholder='Enter Meme link!'
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
            />
            <button type='submit' className='cta-button submit-meme-button'>
              Submit
            </button>
          </form>
          <div className='meme-grid'>
            {memesList.map((meme, index) => (
              <div className='meme-item' key={index}>
                <img src={meme.memeLink} alt={meme} />
                <a className='text-under-image' href={`https://explorer.solana.com/address/${meme.userAddress.toString()}?cluster=devnet`}>Created by {meme.userAddress.toString()}</a>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };
  return (
    <div className='App'>
      <div className={account ? 'authed-container' : 'container'}>
        <div className='header-container'>
          <p className='header'>Meme Portal</p>
          <p className='sub-text'>
            Submit Your Memes and View it in the Metaverse!
          </p>
          {!account ? notConnectedContainer() : connectedContainer()}
        </div>
      </div>
    </div>
  );
};

export default App;
