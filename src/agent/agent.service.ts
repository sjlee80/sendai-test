import { Injectable } from '@nestjs/common';
import { SolanaAgentKit, createSolanaTools } from 'solana-agent-kit';
import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AgentService {
  async findAll() {
    const response = await this.deployGamingToken();

    console.log(response);
    return response;
  }

  async initializeAgent() {
    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
    });

    const solanaKit = new SolanaAgentKit(
      process.env.SOLANA_PRIVATE_KEY!,
      process.env.RPC_URL!,
      {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      },
    );

    const tools = createSolanaTools(solanaKit);
    const memory = new MemorySaver();
    const config = { configurable: { thread_id: 'Solana Agent Kit!' } };

    return createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
    });
  }

  async runChat() {
    const agent = await this.initializeAgent();
    const config = { configurable: { thread_id: 'Solana Agent Kit!' } };

    // Example: Send a command to the agent
    const stream = await agent.stream(
      {
        messages: [new HumanMessage('Check my wallet balance')],
      },
      config,
    );

    // Handle the response
    for await (const chunk of stream) {
      if ('agent' in chunk) {
        console.log(chunk.agent.messages[0].content);
      } else if ('tools' in chunk) {
        console.log(chunk.tools.messages[0].content);
      }
      console.log('-------------------');
    }
  }

  async deployGamingToken() {
    // const agent = await this.initializeAgent();

    const agent = new SolanaAgentKit(
      process.env.SOLANA_PRIVATE_KEY!,
      process.env.RPC_URL!,
      {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      },
    );

    const tokenMetadata = {
      name: 'Gaming Credits',
      symbol: 'GCRED',
      uri: 'https://example.com/token-metadata.json',
      decimals: 6,
      initialSupply: 1_000_000,
    };

    const result = await agent.deployToken(
      tokenMetadata.name,
      tokenMetadata.uri,
      tokenMetadata.symbol,
      tokenMetadata.decimals,
      tokenMetadata.initialSupply,
    );

    return result.mint.toString();
  }
}
