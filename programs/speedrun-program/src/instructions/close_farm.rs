use anchor_lang::prelude::*;

use crate::Farm;

#[derive(Accounts)]
pub struct CloseFarm<'info> {
    #[account(mut, close = payer, seeds = [b"farm".as_ref(), payer.key().as_ref()], bump = farm.bump)]
    pub farm: Account<'info, Farm>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl CloseFarm<'_> {
    pub fn handler(_ctx: Context<CloseFarm>) -> Result<()> {
        Ok(())
    }
}
