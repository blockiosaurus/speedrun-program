use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use solana_program::program::invoke;
use crate::{SpeedrunError, constants::bsol::*};

#[derive(Accounts)]
pub struct HarvestBSolAccounts<'info> {
    /// CHECK: Checked in constraints
    #[account(address = spl_stake_pool::ID @ SpeedrunError::InvalidStakePoolProgram)]
    pub stake_pool_program_id: UncheckedAccount<'info>,

    /// CHECK: Checked in constraints
    #[account(mut, address = BSOL_STAKE_POOL @ SpeedrunError::InvalidStakePoolAccount)]
    pub stake_pool: UncheckedAccount<'info>,

    /// CHECK: Checked in constraints
    #[account(address = BSOL_WITHDRAW_AUTH @ SpeedrunError::InvalidStakePoolWithdrawalAuth)]
    pub stake_pool_withdraw_authority: UncheckedAccount<'info>,

    /// CHECK: Checked in constraints
    #[account(mut, address = BSOL_RESERVE_STAKE @ SpeedrunError::InvalidStakePoolReserveStakeAccount)]
    pub reserve_stake_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = payer, 
        associated_token::mint = pool_mint, 
        associated_token::authority = payer
    )]
    pub pool_tokens_from: Account<'info, TokenAccount>,

    #[account(mut, address = BSOL_FEE_ACCOUNT @ SpeedrunError::InvalidStakePoolFeeAccount)]
    pub manager_fee_account: Account<'info, TokenAccount>,

    // This is the same as the pools_token_to address
    // referrer_pool_tokens_account: Account<'info, TokenAccount>,

    #[account(mut, address = BSOL_MINT @ SpeedrunError::InvalidPoolMint)]
    pub pool_mint: Account<'info, Mint>,

    /// CHECK: Checked in constraints
    #[account(mut, address = SOLPAY_API_ACTIVATION @ SpeedrunError::InvalidActivationAccount)]
    pub activation_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
    pub stake_history: Sysvar<'info, StakeHistory>,

    /// CHECK: Checked in constraints
    #[account(address = solana_program::stake::program::ID @ SpeedrunError::InvalidStakeProgram)]
    pub stake_program: UncheckedAccount<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct HarvestBSolArgs {
    pub amount: u64,
}

impl HarvestBSolAccounts<'_> {
    pub fn handler(ctx: Context<HarvestBSolAccounts>, args: HarvestBSolArgs) -> Result<()> {
        let activation_ix = anchor_lang::solana_program::system_instruction::transfer(
            ctx.accounts.payer.key,
            ctx.accounts.activation_account.key,
            5000,
        );

        invoke(
            &activation_ix,
            &[
                ctx.accounts.activation_account.to_account_info().clone(),
                ctx.accounts.payer.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
        )?;

        let stake_ix = spl_stake_pool::instruction::withdraw_sol(
            // Stake pool program ID
            &ctx.accounts.stake_pool_program_id.key(),
            // Stake pool
            &ctx.accounts.stake_pool.key(),
            // Stake pool withdraw authority
            &ctx.accounts.stake_pool_withdraw_authority.key(),
            // User transfer authority, for pool token account
            &ctx.accounts.payer.key(),
            // User account to burn pool tokens
            &ctx.accounts.pool_tokens_from.key(),
            // Reserve stake account, to withdraw SOL
            &ctx.accounts.reserve_stake_account.key(),
            // Account receiving the lamports from the reserve, must be a system account
            &ctx.accounts.payer.key(),
            // Account to receive pool fee tokens
            &ctx.accounts.manager_fee_account.key(),
            // Pool token mint account
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
                ctx.accounts.pool_tokens_from.to_account_info().clone(),
                ctx.accounts.manager_fee_account.to_account_info().clone(),
                ctx.accounts.payer.to_account_info().clone(),
                ctx.accounts.pool_mint.to_account_info().clone(),
                ctx.accounts.token_program.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
                ctx.accounts
                    .associated_token_program
                    .to_account_info()
                    .clone(),
                ctx.accounts.clock.to_account_info().clone(),
                ctx.accounts.stake_history.to_account_info().clone(),
            ],
        )?;

        Ok(())
    }
}