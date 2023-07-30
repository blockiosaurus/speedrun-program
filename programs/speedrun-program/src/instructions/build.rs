use anchor_lang::prelude::*;
use solana_program::{program::invoke, pubkey};

use crate::Farm;

const TREASURY: Pubkey = pubkey!("farmywvb5jLLh2WTYhJed9YjVhE88MLChR4vXnVQJfr");
const PRICE: u64 = 10000000;

#[derive(Accounts)]
pub struct Build<'info> {
    #[account(mut, seeds = [b"farm".as_ref(), payer.key().as_ref()], bump=farm.bump)]
    pub farm: Account<'info, Farm>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Checked in constraints
    #[account(mut, address = TREASURY)]
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum Item {
    Bed,
    Bench,
    Dresser,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct BuildArgs {
    pub item: Item,
}

impl Build<'_> {
    pub fn handler(ctx: Context<Build>, args: BuildArgs) -> Result<()> {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            ctx.accounts.payer.key,
            &TREASURY,
            PRICE,
        );

        invoke(
            &ix,
            &[
                ctx.accounts.payer.to_account_info().clone(),
                ctx.accounts.treasury.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
        )?;

        match args.item {
            Item::Bed => {
                ctx.accounts.farm.has_bed = true;
            }
            Item::Bench => {
                ctx.accounts.farm.has_bench = true;
            }
            Item::Dresser => {
                ctx.accounts.farm.has_dresser = true;
            }
        }

        Ok(())
    }
}
