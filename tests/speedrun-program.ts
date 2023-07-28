import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import * as solanaStakePool from '@solana/spl-stake-pool';
import { SpeedrunProgram } from "../target/types/speedrun_program";
import { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { solToLamports } from "@solana/spl-stake-pool/dist/utils";

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

describe("speedrun-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SpeedrunProgram as Program<SpeedrunProgram>;

  it("Is initialized!", async () => {
    const payer = anchor.web3.Keypair.generate();
    let airdrop0 = await anchor.getProvider().connection.requestAirdrop(payer.publicKey, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop0, "finalized");
    let airdrop1 = await anchor.getProvider().connection.requestAirdrop(BSOL_WITHDRAW_AUTH, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop1, "finalized");
    let airdrop2 = await anchor.getProvider().connection.requestAirdrop(SOLPAY_API_ACTIVATION, 10000000000);
    await anchor.getProvider().connection.confirmTransaction(airdrop2, "finalized");

    let bsolATA = getAssociatedTokenAddressSync(BSOL_MINT, payer.publicKey);

    // Add your test here.
    const tx0 = await program.methods
      .plantBsol({amount: new anchor.BN(1000000000)})
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
      .rpc({skipPreflight: true});
    console.log("Your transaction signature", tx0);

    let laineSolATA = getAssociatedTokenAddressSync(LAINESOL_MINT, payer.publicKey);

    const tx1 = await program.methods
      .plantLainesol({amount: new anchor.BN(1000000000)})
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
      .rpc({skipPreflight: true});
    console.log("Your transaction signature", tx1);

    // Add your test here.
    const tx2 = await program.methods
      .harvestBsol({amount: new anchor.BN(900000000)})
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
      .rpc({skipPreflight: true});

      // Add your test here.
    const tx3 = await program.methods
    .harvestLainesol({amount: new anchor.BN(900000000)})
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
    .rpc({skipPreflight: true});
    console.log("Your transaction signature", tx3);
  });
});
