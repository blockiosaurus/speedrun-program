# Honeypot Fields (DeFi portfolio management and farming sim)

## Overview

The Honeypot Fields smart contract stores and manages a wallet's Solana DeFi portfolio. The data is meant to be accessed through the [Honeypot Fields frontend client](https://github.com/blockiosaurus/speedrun-xnft)

## Accounts

### Farm

#### PDA Seeds

- "farm"
- owner public key

#### Fields

- owner: The owner of the farm
- bump: The PDA bump
- has_bed: Whether or not the user has built a bed in their house
- has_bench: Whether or not the user has built a bench in their house
- has_dresser: Whether or not the user has built a dresser in their house
- avatar: The user's avatar that the frontend will display

### Crop

#### PDA Seeds

- "crop"
- owner public key
- mint of the crop

#### Fields

- owner: The owner of the crop
- mint: The mint of the token that has been planted
- plant_time: The time the crop was planted
- planted_amount: The amount of the token that has been planted
- planted_value: The value of the token in USD as fetched from a Switchboard Data Feed
- update_time: The last time the crop was updated
- update_value: The value of the token in USD when it was last updated
- position_x: The Y position of the crop
- position_y: The Y position of the crop
- bump: u8: The bump of the crop PDA

## Instructions

### InitFarm

Initializes a Farm account for the user. This should be done when they first play the game.

### CloseFarm

Delete a Farm account. This should only be called for the purpose of debugging.

### InitCrop

Initializes a Crop account for the user. The amount planted is set to the balance of the user's token account. The value of the crop is fetched from a Switchboard data feed and stored.

### CloseCrop

Delete a Crop account.

### UpdateCrop

Update a crop by fetching it's current value from the data feed and store it in the crop account. This instruction may eventually be updated to include the ability to add additional tokens to the crop.

### Build

This instruction is used to build a bed, dresser, or bench in the user's home. The associated bool is set to true in the Farm account. Each upgrade from this instruction is currently set to a flat value of 0.01 SOL.

### SetAvatar

This sets the user's avatar to the passed in string and stores the avatar string in the Farm account. Each change of the avatar is currently set to a flat value of 0.01 SOL.

### PlantBsol

Swaps amount of SOL specified in the arguments for the corresponding value in BSOL using the StakeBlaze StakePool.

### HarvestBsol

Swaps amount of BSOL specified in the arguments for the corresponding value in SOL using the StakeBlaze StakePool.

### PlantLsol

Swaps amount of SOL specified in the arguments for the corresponding value in LaineSOL using the Laine StakePool.

### HarvestLsol

Swaps amount of LaineSOL specified in the arguments for the corresponding value in SOL using the Laine StakePool.
