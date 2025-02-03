import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { CookieService } from './cookie.service';

@Controller('cookie')
export class CookieController {
  constructor(private readonly cookieService: CookieService) {}

  @Get()
  findAll() {
    console.log('test');
    return this.cookieService.findAll();
  }

  @Get('authorization')
  async getAuthorization() {
    try {
      return await this.cookieService.getAuthorization();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('kols')
  async getKols() {
    try {
      return await this.cookieService.getKols();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('agents/:username')
  async getAgentByTwitter(
    @Param('username') username: string,
    @Query('interval') interval: string = '_7Days',
  ) {
    try {
      return await this.cookieService.getAgentByTwitter(username, interval);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('agents/contract/:contractAddress')
  async getAgentByContract(
    @Param('contractAddress') contractAddress: string,
    @Query('interval') interval: string = '_7Days',
  ) {
    try {
      return await this.cookieService.getAgentByContract(
        contractAddress,
        interval,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('agents')
  getAgentsPaged(
    @Query('interval') interval: string = '_7Days',
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 25,
  ) {
    return this.cookieService.getAgentsPaged(interval, page, pageSize);
  }
}
