import { Body, Controller, Get, Logger, Headers, InternalServerErrorException, Param } from '@nestjs/common';
import { CallService } from './call.service';

@Controller('calls')
export class CallController {
    private logger = new Logger(CallController.name)
    constructor(private readonly callService: CallService) { }

    @Get()
    async getChats(@Headers() headers: any): Promise<any> {
        try {
            this.logger.log(`Start get call list`)
            const { authorization } = headers
            const callsList = await this.callService.getCalls(authorization)
            this.logger.debug(`Complate get chats`)
            return callsList
        } catch (error) {
            this.logger.error('Failed get all chats', error.stack)
            throw new InternalServerErrorException(error.message)

        }
    }

}
