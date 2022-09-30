# Solana Dapp Image Portal
Dapp that shows images from urls saved in smart contract

## Technology Stack & Dependencies

- Rust (Writing Smart Contract)
- Javascript (Game interaction)
- [Anchor](https://github.com/coral-xyz/anchor) Development framework for rust


### 1. Clone/Download the Repository

### 2. Install Dependencies in both client and anchor project:
```
$ npm install
```

### 3. Compile Smart Contracts
```
$ anchor build
```

### 4. Test Smart Contracts
```
$ anchor test
```

### 5. Deploy to hardhat netwrok (local development blockchain)
```
$ solana-keygen new
```
```
$ solana address -k target/deploy/my_solana_project-keypair.json
```
- Copy and paste this address in .toml and .rs contract
```
$ anchor deploy
```

### 5. Run dapp
- Copy the idl in the client folder
```
$ node createKeyPaid
```
```
$ npm start
```



