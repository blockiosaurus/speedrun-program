import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import * as solanaStakePool from '@solana/spl-stake-pool';
import { SpeedrunProgram } from "../target/types/speedrun_program";
import { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { assert } from "chai";

const BSOL_STAKE_POOL = new anchor.web3.PublicKey("stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi");
const BSOL_MINT = new anchor.web3.PublicKey("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1");
const BSOL_WITHDRAW_AUTH = new anchor.web3.PublicKey("6WecYymEARvjG5ZyqkrVQ6YkhPfujNzWpSPwNKXHCbV2");
const BSOL_RESERVE_STAKE = new anchor.web3.PublicKey("rsrxDvYUXjH1RQj2Ke36LNZEVqGztATxFkqNukERqFT");
const BSOL_FEE_ACCOUNT = new anchor.web3.PublicKey("Dpo148tVGewDPyh2FkGV18gouWctbdX2fHJopJGe9xv1");
const SOLPAY_API_ACTIVATION = new anchor.web3.PublicKey("7f18MLpvAp48ifA1B8q8FBdrGQhyt9u5Lku2VBYejzJL");

const LAINESOL_STAKE_POOL = new anchor.web3.PublicKey("2qyEeSAWKfU18AFthrF7JA8z8ZCi1yt76Tqs917vwQTV");
const LAINESOL_MINT = new anchor.web3.PublicKey("LAinEtNLgpmCP9Rvsf5Hn8W6EhNiKLZQti1xfWMLy6X");
const LAINESOL_WITHDRAW_AUTH = new anchor.web3.PublicKey("AAbVVaokj2VSZCmSU5Uzmxi6mxrG1n6StW9mnaWwN6cv");
const LAINESOL_RESERVE_STAKE = new anchor.web3.PublicKey("H2HfvQc8JcZxCvAQNdYou9jYHSo2oUU8aadqo2wQ1vK");
const LAINESOL_FEE_ACCOUNT = new anchor.web3.PublicKey("FQLvrMDsqJ2brYQRqG2Cgp5hvAJ7Z8C7boMtdi75iX7W");

const BONK_MINT = new anchor.web3.PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");

const TREASURY = new anchor.web3.PublicKey("farmywvb5jLLh2WTYhJed9YjVhE88MLChR4vXnVQJfr");

describe("speedrun-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SpeedrunProgram as Program<SpeedrunProgram>;

  it("Stake/Unstake BSOL", async () => {
    const payer = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(payer.publicKey, 10000000000);
    await confirmTransaction(airdrop0, "finalized");
    let airdrop1 = await anchor.getProvider().connection.requestAirdrop(BSOL_WITHDRAW_AUTH, 10000000000);
    await confirmTransaction(airdrop1, "finalized");
    let airdrop2 = await anchor.getProvider().connection.requestAirdrop(SOLPAY_API_ACTIVATION, 10000000000);
    await confirmTransaction(airdrop2, "finalized");

    let bsolATA = getAssociatedTokenAddressSync(BSOL_MINT, payer.publicKey);

    // Add your test here.
    const stake_tx = await program.methods
      .plantBsol({ amount: new anchor.BN(1000000000) })
      .accounts({
        stakePoolProgramId: solanaStakePool.STAKE_POOL_PROGRAM_ID,
        stakePool: BSOL_STAKE_POOL,
        stakePoolWithdrawAuthority: BSOL_WITHDRAW_AUTH,
        reserveStakeAccount: BSOL_RESERVE_STAKE,
        payer: payer.publicKey,
        poolTokensTo: bsolATA,
        managerFeeAccount: BSOL_FEE_ACCOUNT,
        poolMint: BSOL_MINT,
        activationAccount: SOLPAY_API_ACTIVATION,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    // console.log("Your transaction signature", stake_tx);

    const before_balance = await anchor.getProvider().connection.getTokenAccountBalance(bsolATA);
    console.log("Your balance", before_balance.value.uiAmount);

    // Add your test here.
    const unstake_tx = await program.methods
      .harvestBsol({ amount: new anchor.BN(900000000) })
      .accounts({
        stakePoolProgramId: solanaStakePool.STAKE_POOL_PROGRAM_ID,
        stakePool: BSOL_STAKE_POOL,
        stakePoolWithdrawAuthority: BSOL_WITHDRAW_AUTH,
        reserveStakeAccount: BSOL_RESERVE_STAKE,
        payer: payer.publicKey,
        poolTokensFrom: bsolATA,
        managerFeeAccount: BSOL_FEE_ACCOUNT,
        poolMint: BSOL_MINT,
        activationAccount: SOLPAY_API_ACTIVATION,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        stakeHistory: anchor.web3.SYSVAR_STAKE_HISTORY_PUBKEY,
        stakeProgram: anchor.web3.StakeProgram.programId,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    // console.log("Your transaction signature", unstake_tx);
    const after_balance = await anchor.getProvider().connection.getTokenAccountBalance(bsolATA);
    console.log("Your balance", after_balance.value.uiAmount);
  });

  it("Stake/Unstake LaineSOL", async () => {
    const payer = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(payer.publicKey, 10000000000);
    await confirmTransaction(airdrop0, "finalized");

    let laineSolATA = getAssociatedTokenAddressSync(LAINESOL_MINT, payer.publicKey);

    const stake_tx = await program.methods
      .plantLainesol({ amount: new anchor.BN(1000000000) })
      .accounts({
        stakePoolProgramId: solanaStakePool.STAKE_POOL_PROGRAM_ID,
        stakePool: LAINESOL_STAKE_POOL,
        stakePoolWithdrawAuthority: LAINESOL_WITHDRAW_AUTH,
        reserveStakeAccount: LAINESOL_RESERVE_STAKE,
        payer: payer.publicKey,
        poolTokensTo: laineSolATA,
        managerFeeAccount: LAINESOL_FEE_ACCOUNT,
        poolMint: LAINESOL_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    // console.log("Your transaction signature", stake_tx);

    const before_balance = await anchor.getProvider().connection.getTokenAccountBalance(laineSolATA);
    console.log("Your balance", before_balance.value.uiAmount);

    // Add your test here.
    const unstake_tx = await program.methods
      .harvestLainesol({ amount: new anchor.BN(900000000) })
      .accounts({
        stakePoolProgramId: solanaStakePool.STAKE_POOL_PROGRAM_ID,
        stakePool: LAINESOL_STAKE_POOL,
        stakePoolWithdrawAuthority: LAINESOL_WITHDRAW_AUTH,
        reserveStakeAccount: LAINESOL_RESERVE_STAKE,
        payer: payer.publicKey,
        poolTokensFrom: laineSolATA,
        managerFeeAccount: LAINESOL_FEE_ACCOUNT,
        poolMint: LAINESOL_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        stakeHistory: anchor.web3.SYSVAR_STAKE_HISTORY_PUBKEY,
        stakeProgram: anchor.web3.StakeProgram.programId,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    // console.log("Your transaction signature", unstake_tx);
    const after_balance = await anchor.getProvider().connection.getTokenAccountBalance(laineSolATA);
    console.log("Your balance", after_balance.value.uiAmount);
  });

  it("Plant BSOL Crop", async () => {
    const payer = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(payer.publicKey, 10000000000);
    await confirmTransaction(airdrop0, "finalized");
    let airdrop1 = await anchor.getProvider().connection.requestAirdrop(BSOL_WITHDRAW_AUTH, 10000000000);
    await confirmTransaction(airdrop1, "finalized");
    let airdrop2 = await anchor.getProvider().connection.requestAirdrop(SOLPAY_API_ACTIVATION, 10000000000);
    await confirmTransaction(airdrop2, "finalized");

    let bsolATA = getAssociatedTokenAddressSync(BSOL_MINT, payer.publicKey);

    // Add your test here.
    const stake_tx = await program.methods
      .plantBsol({ amount: new anchor.BN(1000000000) })
      .accounts({
        stakePoolProgramId: solanaStakePool.STAKE_POOL_PROGRAM_ID,
        stakePool: BSOL_STAKE_POOL,
        stakePoolWithdrawAuthority: BSOL_WITHDRAW_AUTH,
        reserveStakeAccount: BSOL_RESERVE_STAKE,
        payer: payer.publicKey,
        poolTokensTo: bsolATA,
        managerFeeAccount: BSOL_FEE_ACCOUNT,
        poolMint: BSOL_MINT,
        activationAccount: SOLPAY_API_ACTIVATION,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    // console.log("Your transaction signature", stake_tx);

    const before_balance = await anchor.getProvider().connection.getTokenAccountBalance(bsolATA);
    console.log("Your balance", before_balance.value.uiAmount);

    const cropAddress = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("crop"), BSOL_MINT.toBuffer(), payer.publicKey.toBuffer()],
      program.programId
    );

    const init_tx = await program.methods
      .initCrop({ positionX: 0, positionY: 0 })
      .accounts({
        crop: cropAddress[0],
        mint: BSOL_MINT,
        tokenAccount: bsolATA,
        payer: payer.publicKey,
        aggregator: new anchor.web3.PublicKey("EeSBrqRNbPkWY25BQZZMSfBLeLnLpkZ3oMYnPn15yjQp"),
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    confirmTransaction(init_tx, "finalized");

    // const crop0 = await program.account.crop.fetch(cropAddress[0]);
    // console.log("Crop", JSON.stringify(crop0, null, 2));

    await new Promise(resolve => setTimeout(resolve, 1000));

    const update_tx = await program.methods
      .updateCrop()
      .accounts({
        crop: cropAddress[0],
        mint: BSOL_MINT,
        tokenAccount: bsolATA,
        payer: payer.publicKey,
        aggregator: new anchor.web3.PublicKey("EeSBrqRNbPkWY25BQZZMSfBLeLnLpkZ3oMYnPn15yjQp"),
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    confirmTransaction(update_tx, "finalized");

    const crop1 = await program.account.crop.fetch(cropAddress[0]);
    console.log("Crop", JSON.stringify(crop1, null, 2));

    const close_tx = await program.methods
      .closeCrop()
      .accounts({
        crop: cropAddress[0],
        mint: BSOL_MINT,
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    confirmTransaction(update_tx, "finalized");

    const crop2 = await anchor.getProvider().connection.getAccountInfo(cropAddress[0])
    // console.log("Crop", JSON.stringify(crop2, null, 2));
    assert(crop2 === null, "Crop account not closed");

    // Add your test here.
    const unstake_tx = await program.methods
      .harvestBsol({ amount: new anchor.BN(900000000) })
      .accounts({
        stakePoolProgramId: solanaStakePool.STAKE_POOL_PROGRAM_ID,
        stakePool: BSOL_STAKE_POOL,
        stakePoolWithdrawAuthority: BSOL_WITHDRAW_AUTH,
        reserveStakeAccount: BSOL_RESERVE_STAKE,
        payer: payer.publicKey,
        poolTokensFrom: bsolATA,
        managerFeeAccount: BSOL_FEE_ACCOUNT,
        poolMint: BSOL_MINT,
        activationAccount: SOLPAY_API_ACTIVATION,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        stakeHistory: anchor.web3.SYSVAR_STAKE_HISTORY_PUBKEY,
        stakeProgram: anchor.web3.StakeProgram.programId,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    // console.log("Your transaction signature", unstake_tx);
    const after_balance = await anchor.getProvider().connection.getTokenAccountBalance(bsolATA);
    console.log("Your balance", after_balance.value.uiAmount);
  });

  it("Plant LaineSOL Crop", async () => {
    const payer = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(payer.publicKey, 10000000000);
    await confirmTransaction(airdrop0, "finalized");

    let laineSolATA = getAssociatedTokenAddressSync(LAINESOL_MINT, payer.publicKey);

    const stake_tx = await program.methods
      .plantLainesol({ amount: new anchor.BN(1000000000) })
      .accounts({
        stakePoolProgramId: solanaStakePool.STAKE_POOL_PROGRAM_ID,
        stakePool: LAINESOL_STAKE_POOL,
        stakePoolWithdrawAuthority: LAINESOL_WITHDRAW_AUTH,
        reserveStakeAccount: LAINESOL_RESERVE_STAKE,
        payer: payer.publicKey,
        poolTokensTo: laineSolATA,
        managerFeeAccount: LAINESOL_FEE_ACCOUNT,
        poolMint: LAINESOL_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    // console.log("Your transaction signature", stake_tx);

    const before_balance = await anchor.getProvider().connection.getTokenAccountBalance(laineSolATA);
    console.log("Your balance", before_balance.value.uiAmount);

    const cropAddress = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("crop"), LAINESOL_MINT.toBuffer(), payer.publicKey.toBuffer()],
      program.programId
    );

    const init_tx = await program.methods
      .initCrop({ positionX: 0, positionY: 0 })
      .accounts({
        crop: cropAddress[0],
        mint: LAINESOL_MINT,
        tokenAccount: laineSolATA,
        payer: payer.publicKey,
        aggregator: new anchor.web3.PublicKey("2EU8d2ohBgKBYnHUFQL3oqQWX2jFkZiKBPmaDAbZMRdP"),
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    confirmTransaction(init_tx, "finalized");

    // const crop0 = await program.account.crop.fetch(cropAddress[0]);
    // console.log("Crop", JSON.stringify(crop0, null, 2));

    await new Promise(resolve => setTimeout(resolve, 1000));

    const update_tx = await program.methods
      .updateCrop()
      .accounts({
        crop: cropAddress[0],
        mint: LAINESOL_MINT,
        tokenAccount: laineSolATA,
        payer: payer.publicKey,
        aggregator: new anchor.web3.PublicKey("2EU8d2ohBgKBYnHUFQL3oqQWX2jFkZiKBPmaDAbZMRdP"),
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    confirmTransaction(update_tx, "finalized");

    const crop1 = await program.account.crop.fetch(cropAddress[0]);
    console.log("Crop", JSON.stringify(crop1, null, 2));

    // Add your test here.
    const unstake_tx = await program.methods
      .harvestLainesol({ amount: new anchor.BN(900000000) })
      .accounts({
        stakePoolProgramId: solanaStakePool.STAKE_POOL_PROGRAM_ID,
        stakePool: LAINESOL_STAKE_POOL,
        stakePoolWithdrawAuthority: LAINESOL_WITHDRAW_AUTH,
        reserveStakeAccount: LAINESOL_RESERVE_STAKE,
        payer: payer.publicKey,
        poolTokensFrom: laineSolATA,
        managerFeeAccount: LAINESOL_FEE_ACCOUNT,
        poolMint: LAINESOL_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        stakeHistory: anchor.web3.SYSVAR_STAKE_HISTORY_PUBKEY,
        stakeProgram: anchor.web3.StakeProgram.programId,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    // console.log("Your transaction signature", unstake_tx);
    const after_balance = await anchor.getProvider().connection.getTokenAccountBalance(laineSolATA);
    console.log("Your balance", after_balance.value.uiAmount);
  });

  it("Plant BONK Crop", async () => {
    const payer = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(payer.publicKey, 10000000000);
    await confirmTransaction(airdrop0, "finalized");

    let bonkATA = getAssociatedTokenAddressSync(BONK_MINT, payer.publicKey);
    let ix = createAssociatedTokenAccountInstruction(
      payer.publicKey, // payer
      bonkATA, // ata
      payer.publicKey, // owner
      BONK_MINT, // mint
    );

    const cropAddress = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("crop"), BONK_MINT.toBuffer(), payer.publicKey.toBuffer()],
      program.programId
    );

    const init_tx = await program.methods
      .initCrop({ positionX: 0, positionY: 0 })
      .accounts({
        crop: cropAddress[0],
        mint: BONK_MINT,
        tokenAccount: bonkATA,
        payer: payer.publicKey,
        aggregator: new anchor.web3.PublicKey("6qBqGAYmoZw2r4fda7671NSUbcDWE4XicJdJoWqK8aTe"),
      })
      .preInstructions([ix])
      .signers([payer])
      .rpc({ skipPreflight: true });
    confirmTransaction(init_tx, "finalized");

    // const crop0 = await program.account.crop.fetch(cropAddress[0]);
    // console.log("Crop", JSON.stringify(crop0, null, 2));

    await new Promise(resolve => setTimeout(resolve, 1000));

    const update_tx = await program.methods
      .updateCrop()
      .accounts({
        crop: cropAddress[0],
        mint: BONK_MINT,
        tokenAccount: bonkATA,
        payer: payer.publicKey,
        aggregator: new anchor.web3.PublicKey("6qBqGAYmoZw2r4fda7671NSUbcDWE4XicJdJoWqK8aTe"),
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    confirmTransaction(update_tx, "finalized");

    const crop1 = await program.account.crop.fetch(cropAddress[0]);
    console.log("Crop", JSON.stringify(crop1, null, 2));
  });

  it("Init Farm/Build Bed", async () => {
    const payer = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(payer.publicKey, 10000000000);
    await confirmTransaction(airdrop0, "finalized");

    const farmAddress = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("farm"), payer.publicKey.toBuffer()],
      program.programId
    );

    const init_tx = await program.methods
      .initFarm()
      .accounts({
        farm: farmAddress[0],
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    await confirmTransaction(init_tx, "finalized");

    const farm0 = await program.account.farm.fetch(farmAddress[0]);
    console.log("Farm", JSON.stringify(farm0, null, 2));

    const bed_tx = await program.methods
      .build({ item: { bed: {} } })
      .accounts({
        farm: farmAddress[0],
        payer: payer.publicKey,
        treasury: TREASURY,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    await confirmTransaction(bed_tx, "finalized");

    const farm1 = await program.account.farm.fetch(farmAddress[0]);
    console.log("Farm", JSON.stringify(farm1, null, 2));

    const close_tx = await program.methods
      .closeFarm()
      .accounts({
        farm: farmAddress[0],
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    await confirmTransaction(init_tx, "finalized");
  });

  it("Set Avatar", async () => {
    const payer = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(payer.publicKey, 10000000000);
    await confirmTransaction(airdrop0, "finalized");

    const farmAddress = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("farm"), payer.publicKey.toBuffer()],
      program.programId
    );

    const init_tx = await program.methods
      .initFarm()
      .accounts({
        farm: farmAddress[0],
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    await confirmTransaction(init_tx, "finalized");

    const farm0 = await program.account.farm.fetch(farmAddress[0]);
    console.log("Farm", JSON.stringify(farm0, null, 2));

    const avatar_tx = await program.methods
      .setAvatar({ avatar: "DTP" })
      .accounts({
        farm: farmAddress[0],
        payer: payer.publicKey,
        treasury: TREASURY,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    await confirmTransaction(avatar_tx, "finalized");

    const farm1 = await program.account.farm.fetch(farmAddress[0]);
    console.log("Farm", JSON.stringify(farm1, null, 2));

    const close_tx = await program.methods
      .closeFarm()
      .accounts({
        farm: farmAddress[0],
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc({ skipPreflight: true });
    await confirmTransaction(init_tx, "finalized");
  });
});

async function confirmTransaction(signature: anchor.web3.TransactionSignature, commitment?: anchor.web3.Commitment) {
  const latestBlockHash = await anchor.getProvider().connection.getLatestBlockhash();
  await anchor.getProvider().connection.confirmTransaction({
    signature,
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  }, commitment || "confirmed");
}