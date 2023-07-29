use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};
use switchboard_v2::AggregatorAccountData;

use crate::Crop;

#[derive(Accounts)]
pub struct UpdateCrop<'info> {
    #[account(mut, seeds = [b"crop".as_ref(), mint.key().as_ref(), payer.key().as_ref()], bump=crop.bump)]
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

// #[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
// pub struct UpdateCropArgs {
//     pub position_x: u32,
//     pub position_y: u32,
// }

impl UpdateCrop<'_> {
    pub fn handler(ctx: Context<UpdateCrop>/*, args: UpdateCropArgs*/) -> Result<()> {
        assert!(ctx.accounts.crop.owner.key() == ctx.accounts.payer.key());
        let current_time = Clock::get()?.unix_timestamp;
        let data_feed = ctx.accounts.aggregator.load()?;
        let value: f64 = data_feed.get_result()?.try_into()?;
        let value: u64 = (value * 10e9) as u64;
        solana_program::msg!("data feed: {:?}", value);

        // *ctx.accounts.crop = Crop {
        //     owner: ctx.accounts.payer.key(),
        //     mint: ctx.accounts.mint.key(),
        //     plant_time: current_time,
        //     planted_amount: ctx.accounts.token_account.amount,
        //     planted_value: value,
        //     update_time: current_time,
        //     update_value: value,
        //     position_x: args.position_x,
        //     position_y: args.position_y,
        //     bump: *ctx.bumps.get("crop").unwrap(),
        // };

        ctx.accounts.crop.update_time = current_time;
        ctx.accounts.crop.update_value = value;
        
        Ok(())
    }
}