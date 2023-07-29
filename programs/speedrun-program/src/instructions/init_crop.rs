use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};
use switchboard_v2::AggregatorAccountData;

use crate::{Crop, CROP_SIZE};

#[derive(Accounts)]
pub struct InitCrop<'info> {
    #[account(init, space = CROP_SIZE, seeds = [b"crop".as_ref(), mint.key().as_ref(), payer.key().as_ref()], bump, payer = payer)]
    pub crop: Account<'info, Crop>,

    pub mint: Account<'info, Mint>,

    #[account(
        associated_token::mint = mint, 
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub aggregator: AccountLoader<'info, AggregatorAccountData>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct InitCropArgs {
    pub position_x: u32,
    pub position_y: u32,
}

impl InitCrop<'_> {
    pub fn handler(ctx: Context<InitCrop>, args: InitCropArgs) -> Result<()> {
        let current_time = Clock::get()?.unix_timestamp;
        let data_feed = ctx.accounts.aggregator.load()?;
        let value: f64 = data_feed.get_result()?.try_into()?;
        let value: u64 = (value * 10e9) as u64;
        solana_program::msg!("data feed: {:?}", value);

        *ctx.accounts.crop = Crop {
            owner: ctx.accounts.payer.key(),
            mint: ctx.accounts.mint.key(),
            plant_time: current_time,
            planted_amount: ctx.accounts.token_account.amount,
            planted_value: value,
            update_time: current_time,
            update_value: value,
            position_x: args.position_x,
            position_y: args.position_y,
            bump: *ctx.bumps.get("crop").unwrap(),
        };

        
        Ok(())
    }
}