import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { Program } from "@project-serum/anchor";
import { NonCustodialEscrow } from "../target/types/non_custodial_escrow";
import { LAMPORTS_PER_SOL, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

describe("non-custodial-escrow", () => {
  const provider = anchor.Provider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);
  const program = anchor.workspace.NonCustodialEscrow as Program<NonCustodialEscrow>;
  const seller = provider.wallet.publicKey;
  const payer = (provider.wallet.publicKey);
  const buyer = anchor.web3.Keypair.generate();
  const escrowedXtokens = anchor.web3.Keypair.generate();
  let x_mint;
  let y_mint;
  let sellers_x_token;
  let sellers_y_token;
  let buyer_x_token;
  let buyer_y_token;
  let escrow: anchor.web3.PublicKey;
  before(async () => {
    await provider.connection.requestAirdrop(buyer.publicKey, 1*LAMPORTS_PER_SOL);
    [escrow] = await anchor.web3.PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("escrow"),
      seller.toBuffer(),
    ],
    program.programId)

    x_mint = await splToken.Token.createMint(
      provider.connection,
      payer,
      provider.wallet.publicKey,
      provider.wallet.publicKey,
      6,
      splToken.TOKEN_PROGRAM_ID,
    );

    y_mint = await splToken.Token.createMint(
      provider.connection,
      payer,
      provider.wallet.publicKey,
      null,
      6,
      splToken.TOKEN_PROGRAM_ID,
    );

    // Seller's x and y token accounts
    sellers_x_token = await x_mint.createAccount(seller);
    await x_mint.mintTo(sellers_x_token, payer, [], 10_000_000_000);
    sellers_y_token = await y_mint.createAccount(seller);

    // Buyer's x and y token accounts
    buyer_x_token = await x_mint.createAccount(buyer.publicKey);
    buyer_y_token = await y_mint.createAccount(buyer.publicKey);
    await y_mint.mintTo(buyer_y_token, payer, [], 10_000_000_000);
  })

  it("initialize escrow", async () => {
    const x_amount = new anchor.BN(40);
    const y_amount = new anchor.BN(40);
    const tx = await program.methods.initialize(x_amount, y_amount)
      .accounts({
        seller: seller,
        xMint: x_mint.publicKey,
        yMint: y_mint.publicKey,
        sellerXToken: sellers_x_token,
        escrow: escrow,
        escrowedXTokens: escrowedXTokens.publicKey,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([escrowedXtokens])
      .rpc()
  });

  it("execute the trade", async () => {
    const tx = await program.methods.execute()
      .accounts({
        buyer: buyer.publicKey,
        escrow: escrow,
        escrowedXTokens: escrowedXTokens.publicKey,
        sellersYTokens: sellers_y_token,
        buyerXToken: buyer_x_token,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
      })
      .signers([buyer])
      .rpc()
  });

  it("cancel the trade", async () => {
    const tx = await program.mnethods.cancel()
      .accounts({
        seller: seller,
        escrow: escrow,
        escrowedXTokens: escrowedXTokens.publicKey,
        sellerXToken: sellers_x_token,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
      })
      .rpc()
  });
});
