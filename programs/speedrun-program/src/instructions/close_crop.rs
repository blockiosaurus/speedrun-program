use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::Crop;

#[derive(Accounts)]
pub struct CloseCrop<'info> {
    #[account(mut, close = payer, seeds = [b"crop".as_ref(), mint.key().as_ref(), payer.key().as_ref()], bump = crop.bump)]
    pub crop: Account<'info, Crop>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl CloseCrop<'_> {
    pub fn handler(_ctx: Context<CloseCrop>) -> Result<()> {
        Ok(())
    }
}
