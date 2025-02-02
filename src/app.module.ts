import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agent/agent.module';
import { TokenModule } from './token/token.module';
import { CookieModule } from './cookie/cookie.module';

@Module({
  imports: [AgentModule, TokenModule, CookieModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
