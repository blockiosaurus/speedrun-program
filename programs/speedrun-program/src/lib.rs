#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;

pub mod constants;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use instructions::*;
pub use state::*;

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

    pub fn init_crop(ctx: Context<InitCrop>, args: InitCropArgs) -> Result<()> {
        InitCrop::handler(ctx, args)
    }

    pub fn close_crop(ctx: Context<CloseCrop>) -> Result<()> {
        CloseCrop::handler(ctx)
    }

    pub fn update_crop(ctx: Context<UpdateCrop>) -> Result<()> {
        UpdateCrop::handler(ctx)
    }

    pub fn init_farm(ctx: Context<InitFarm>) -> Result<()> {
        InitFarm::handler(ctx)
    }

    pub fn build(ctx: Context<Build>, args: BuildArgs) -> Result<()> {
        Build::handler(ctx, args)
    }

    pub fn close_farm(ctx: Context<CloseFarm>) -> Result<()> {
        CloseFarm::handler(ctx)
    }

    pub fn set_avatar(ctx: Context<SetAvatar>, args: SetAvatarArgs) -> Result<()> {
        SetAvatar::handler(ctx, args)
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
