use anchor_lang::prelude::*;

declare_id!("ABhLzTy8jQMMPb7P1PbdggUFpSNn61XGrhnRRsVSRzAi");

#[program]
pub mod non_custodial_escrow {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
