import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class CookieService {
  private readonly apiClient;

  constructor() {
    this.apiClient = axios.create({
      baseURL: 'https://api.cookie.fun/v2',
      headers: {
        'x-api-key': process.env.COOKIE_API_KEY,
      },
    });
  }

  async findAll(limit = 50) {
    try {
      const response = await this.apiClient.get('/kols', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(`쿠키 API 호출 실패: ${error.message}`);
    }
  }

  async getAuthorization() {
    try {
      const response = await this.apiClient.get('/authorization');
      return response.data;
    } catch (error) {
      throw new Error(`인증 정보 조회 실패: ${error.message}`);
    }
  }

  async getKols(limit = 50) {
    const response = await fetch(
      `https://api.cookie.fun/v1/kols?limit=${limit}`,
      {
        headers: {
          'x-api-key': process.env.COOKIE_API_KEY,
        },
      },
    );

    console.log(response);
    return 'test';
  }

  async getAgentByTwitter(username: string, interval: string = '_7Days') {
    try {
      const response = await this.apiClient.get(
        `/agents/twitterUsername/${username}`,
        {
          params: { interval },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`에이전트 정보 조회 실패: ${error.message}`);
    }
  }

  async getAgentByContract(
    contractAddress: string,
    interval: string = '_7Days',
  ) {
    try {
      const response = await this.apiClient.get(
        `/agents/contractAddress/7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o`,
        {
          params: { interval },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`컨트랙트 주소로 에이전트 조회 실패: ${error.message}`);
    }
  }
}
