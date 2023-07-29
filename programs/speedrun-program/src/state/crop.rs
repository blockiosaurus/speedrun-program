// #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
// pub enum PlantType {
//     BSol,
//     LaineSol,
// }

use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;

#[account]
pub struct Crop {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub plant_time: i64,
    pub planted_amount: u64,
    pub planted_value: u64,
    pub update_time: i64,
    pub update_value: u64,
    pub position_x: u32,
    pub position_y: u32,
    pub bump: u8,
}

pub const CROP_SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 4 + 4 + 1 + 128;
