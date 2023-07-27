use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use solana_program::{pubkey, program::invoke};
use crate::SpeedrunError;

const LAINESOL_STAKE_POOL: Pubkey = pubkey!("2qyEeSAWKfU18AFthrF7JA8z8ZCi1yt76Tqs917vwQTV");
const LAINESOL_MINT: Pubkey = pubkey!("LAinEtNLgpmCP9Rvsf5Hn8W6EhNiKLZQti1xfWMLy6X");
const LAINESOL_WITHDRAW_AUTH: Pubkey = pubkey!("AAbVVaokj2VSZCmSU5Uzmxi6mxrG1n6StW9mnaWwN6cv");
const LAINESOL_RESERVE_STAKE: Pubkey = pubkey!("H2HfvQc8JcZxCvAQNdYou9jYHSo2oUU8aadqo2wQ1vK");
const LAINESOL_FEE_ACCOUNT: Pubkey = pubkey!("FQLvrMDsqJ2brYQRqG2Cgp5hvAJ7Z8C7boMtdi75iX7W");

#[derive(Accounts)]
pub struct PlantLaineSolAccounts<'info> {
    /// CHECK: Checked in constraints
    #[account(address = spl_stake_pool::ID @ SpeedrunError::InvalidStakePoolProgram)]
    pub stake_pool_program_id: UncheckedAccount<'info>,

    /// CHECK: Checked in constraints
    #[account(mut, address = LAINESOL_STAKE_POOL @ SpeedrunError::InvalidStakePoolAccount)]
    pub stake_pool: UncheckedAccount<'info>,

    /// CHECK: Checked in constraints
    #[account(address = LAINESOL_WITHDRAW_AUTH @ SpeedrunError::InvalidStakePoolWithdrawalAuth)]
    pub stake_pool_withdraw_authority: UncheckedAccount<'info>,

    /// CHECK: Checked in constraints
    #[account(mut, address = LAINESOL_RESERVE_STAKE @ SpeedrunError::InvalidStakePoolReserveStakeAccount)]
    pub reserve_stake_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = payer, 
        associated_token::mint = pool_mint, 
        associated_token::authority = payer
    )]
    pub pool_tokens_to: Account<'info, TokenAccount>,

    #[account(mut, address = LAINESOL_FEE_ACCOUNT @ SpeedrunError::InvalidStakePoolFeeAccount)]
    pub manager_fee_account: Account<'info, TokenAccount>,

    // This is the same as the pools_token_to address
    // referrer_pool_tokens_account: Account<'info, TokenAccount>,

    #[account(mut, address = LAINESOL_MINT @ SpeedrunError::InvalidPoolMint)]
    pub pool_mint: Account<'info, Mint>,

    /// CHECK: Checked in constraints
    // #[account(mut, address = SOLPAY_API_ACTIVATION @ SpeedrunError::InvalidActivationAccount)]
    // pub activation_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct PlantLaineSolArgs {
    pub amount: u64,
}

impl PlantLaineSolAccounts<'_> {
    pub fn handler(ctx: Context<PlantLaineSolAccounts>, args: PlantLaineSolArgs) -> Result<()> {
        // let activation_ix = anchor_lang::solana_program::system_instruction::transfer(
        //     ctx.accounts.payer.key,
        //     ctx.accounts.activation_account.key,
        //     5000,
        // );

        // invoke(
        //     &activation_ix,
        //     &[
        //         ctx.accounts.activation_account.to_account_info().clone(),
        //         ctx.accounts.payer.to_account_info().clone(),
        //         ctx.accounts.system_program.to_account_info().clone(),
        //     ],
        // )?;

        let stake_ix = spl_stake_pool::instruction::deposit_sol(
            &ctx.accounts.stake_pool_program_id.key(),
            &ctx.accounts.stake_pool.key(),
            &ctx.accounts.stake_pool_withdraw_authority.key(),
            &ctx.accounts.reserve_stake_account.key(),
            &ctx.accounts.payer.key(),
            &ctx.accounts.pool_tokens_to.key(),
            &ctx.accounts.manager_fee_account.key(),
            &ctx.accounts.pool_tokens_to.key(),
            &ctx.accounts.pool_mint.key(),
            &ctx.accounts.token_program.key(),
            args.amount,
        );

        invoke(
            &stake_ix,
            &[
                ctx.accounts.stake_pool_program_id.to_account_info().clone(),
                ctx.accounts.stake_pool.to_account_info().clone(),
                ctx.accounts
                    .stake_pool_withdraw_authority
                    .to_account_info()
                    .clone(),
                ctx.accounts.reserve_stake_account.to_account_info().clone(),
                ctx.accounts.payer.to_account_info().clone(),
                ctx.accounts.pool_tokens_to.to_account_info().clone(),
                ctx.accounts.manager_fee_account.to_account_info().clone(),
                ctx.accounts.payer.to_account_info().clone(),
                ctx.accounts.pool_mint.to_account_info().clone(),
                ctx.accounts.token_program.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
                ctx.accounts
                    .associated_token_program
                    .to_account_info()
                    .clone(),
            ],
        )?;

        Ok(())
    }
}