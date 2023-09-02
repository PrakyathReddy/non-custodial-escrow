# non-custodial-escrow

This is a non-custodial escrow program that lives on the Solana Blockchain. With the help of this account, anyone can exchange their assets for new ones without having to trust a third party.

This function is a simple 3-function non-custodial escrow that operates on-chain. Users will be able to:
- create a new escrow linked to the assets they wish to exchange for a new one.
- accept the escrow and exchange the current assets for a new one.
- if they don't wish to exchange their assets for new ones, they can cancel the escrow

Our first instruction, "initialize" will create a new escrow account associated with our old token account for a new one. For this program, we are going to sell our 'x_token' for 'y_token'. In order to make this program non-custodial, we will first transfer our 'x_token' to the program's owned 'escrowed_x_tokens' accounts.

Second instruction is "accept", which will allow a user to accept an open escrow and exchange their old assets for a new ones. And 'buyer' is looking to exchange his 'y_token' for 'x_token'.

The last instruction is 'cancel'. If the 'seller' changes their minds, they are free to close their escrows without anyone's consent.
