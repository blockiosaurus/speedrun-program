#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PlantType {
    BSol,
    LaineSol,
}

#[account]
pub struct Crop {
    pub plant_type: PlantType,
    pub plant_time: i64,
    pub planted_amount: u64,
    pub planted_value: u64,
    pub token_account: Pubkey,
}
