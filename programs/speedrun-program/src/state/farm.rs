use anchor_lang::prelude::*;

#[account]
pub struct Farm {
    pub owner: Pubkey,
    pub bump: u8,
    pub has_bed: bool,
    pub has_bench: bool,
    pub has_dresser: bool,
    pub avatar: Option<String>,
}

pub const FARM_SIZE: usize = 8 + 32 + 1 + 1 + 1 + 1 + (1 + 4 + 20) + 102;
