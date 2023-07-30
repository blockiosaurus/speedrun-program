use anchor_lang::prelude::*;

use crate::{Farm, FARM_SIZE};

#[derive(Accounts)]
pub struct InitFarm<'info> {
    #[account(init, space = FARM_SIZE, seeds = [b"farm".as_ref(), payer.key().as_ref()], bump, payer = payer)]
    pub farm: Account<'info, Farm>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl InitFarm<'_> {
    pub fn handler(ctx: Context<InitFarm>) -> Result<()> {
        *ctx.accounts.farm = Farm {
            owner: ctx.accounts.payer.key(),
            bump: *ctx.bumps.get("farm").unwrap(),
            has_bed: false,
            has_bench: false,
            has_dresser: false,
            avatar: None,
        };

        Ok(())
    }
}
