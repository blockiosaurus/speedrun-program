use anchor_lang::prelude::*;
use solana_program::{program::invoke, pubkey};

use crate::Farm;

const TREASURY: Pubkey = pubkey!("farmywvb5jLLh2WTYhJed9YjVhE88MLChR4vXnVQJfr");
const PRICE: u64 = 10000000;

#[derive(Accounts)]
pub struct SetAvatar<'info> {
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
pub struct SetAvatarArgs {
    pub avatar: String,
}

impl SetAvatar<'_> {
    pub fn handler(ctx: Context<SetAvatar>, args: SetAvatarArgs) -> Result<()> {
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

        ctx.accounts.farm.avatar = Some(args.avatar);

        Ok(())
    }
}
