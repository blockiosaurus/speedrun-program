#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;

pub mod constants;
pub mod instructions;

pub use constants::*;
pub use instructions::*;

declare_id!("FARMTfoLHaQeoYgK1tP3dgC8emwkMtfxyg6ZTS7iMhgr");

#[program]
pub mod speedrun_program {
    use super::*;

    pub fn plant_bsol(ctx: Context<PlantBSolAccounts>, args: PlantBSolArgs) -> Result<()> {
        PlantBSolAccounts::handler(ctx, args)
    }

    pub fn harvest_bsol(ctx: Context<HarvestBSolAccounts>, args: HarvestBSolArgs) -> Result<()> {
        HarvestBSolAccounts::handler(ctx, args)
    }

    pub fn plant_lainesol(
        ctx: Context<PlantLaineSolAccounts>,
        args: PlantLaineSolArgs,
    ) -> Result<()> {
        PlantLaineSolAccounts::handler(ctx, args)
    }

    pub fn harvest_lainesol(
        ctx: Context<HarvestLaineSolAccounts>,
        args: HarvestLaineSolArgs,
    ) -> Result<()> {
        HarvestLaineSolAccounts::handler(ctx, args)
    }
}

#[error_code]
pub enum SpeedrunError {
    #[msg("Invalid Stake Pool Program")]
    InvalidStakePoolProgram,

    #[msg("Invalid Stake Pool Account")]
    InvalidStakePoolAccount,

    #[msg("Invalid Stake Pool Withdrawal Authority")]
    InvalidStakePoolWithdrawalAuth,

    #[msg("Invalid Stake Pool Reserve Stake Account")]
    InvalidStakePoolReserveStakeAccount,

    #[msg("Invalid Stake Pool Fee Account")]
    InvalidStakePoolFeeAccount,

    #[msg("Invalid Token Program")]
    InvalidTokenProgram,

    #[msg("Invalid Pool Mint")]
    InvalidPoolMint,

    #[msg("Invalid Activation Account")]
    InvalidActivationAccount,

    #[msg("Invalid Stake Program")]
    InvalidStakeProgram,
}
