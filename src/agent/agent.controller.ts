import { Controller, Get } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  findAll() {
    return this.agentService.findAll();
  }
}
