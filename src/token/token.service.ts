import { Injectable } from '@nestjs/common';
import { SolanaAgentKit } from 'solana-agent-kit';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, keypairIdentity } from '@metaplex-foundation/umi';
import {
  createFungible,
  mintV1,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from '@metaplex-foundation/umi-web3js-adapters';
import {
  AuthorityType,
  mplToolbox,
  setAuthority,
} from '@metaplex-foundation/mpl-toolbox';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class TokenService {
  async findAll() {
    try {
      const agent = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY!,
        process.env.RPC_URL!,
        {
          OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
        },
      );

      // Create UMI instance
      const umi = createUmi(agent.connection.rpcEndpoint).use(mplToolbox());
      umi.use(keypairIdentity(fromWeb3JsKeypair(agent.wallet)));

      // Token metadata
      const tokenMetadata = {
        name: 'Gaming Credits',
        symbol: 'GCRED',
        uri: 'https://example.com/token-metadata.json',
        decimals: 6,
        initialSupply: 1_000_000,
      };

      // Create mint signer
      const mint = generateSigner(umi);

      // Create token
      let builder = createFungible(umi, {
        name: tokenMetadata.name,
        uri: tokenMetadata.uri,
        symbol: tokenMetadata.symbol,
        sellerFeeBasisPoints: {
          basisPoints: 0n,
          identifier: '%',
          decimals: 2,
        },
        decimals: tokenMetadata.decimals,
        mint,
        isMutable: false, // 메타데이터 수정 불가 (러그풀 방지)
      });

      // Add initial supply if specified
      if (tokenMetadata.initialSupply) {
        builder = builder
          .add(
            mintV1(umi, {
              mint: mint.publicKey,
              tokenStandard: TokenStandard.Fungible,
              tokenOwner: fromWeb3JsPublicKey(agent.wallet_address),
              amount:
                tokenMetadata.initialSupply *
                Math.pow(10, tokenMetadata.decimals),
            }),
          )
          .add(
            setAuthority(umi, {
              owned: mint.publicKey, // 토큰 계정
              owner: fromWeb3JsPublicKey(agent.wallet_address), // 현재 소유자
              newAuthority: null, // 새로운 권한 (제거)
              authorityType: AuthorityType.MintTokens, // Mint 권한
            }),
          )
          .add(
            setAuthority(umi, {
              owned: mint.publicKey, // 토큰 계정
              owner: fromWeb3JsPublicKey(agent.wallet_address), // 현재 소유자
              newAuthority: null, // 새로운 권한 (제거)
              authorityType: AuthorityType.FreezeAccount, // Freeze 권한
            }),
          );
      }

      // Send and confirm transaction
      await builder.sendAndConfirm(umi, {
        confirm: { commitment: 'finalized' },
      });

      return {
        mint: toWeb3JsPublicKey(mint.publicKey).toString(),
      };
    } catch (error: any) {
      throw new Error(`Token deployment failed: ${error.message}`);
    }
  }
}
