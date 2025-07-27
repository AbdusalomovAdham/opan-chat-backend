import { BadGatewayException, Controller, Get, Logger, Headers, Head, Body, Post, Delete, InternalServerErrorException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contacts.dto';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
    private logger = new Logger(ContactsController.name)
    constructor(private readonly contactsService: ContactsService) { }

    @Get()
    async getContacts(@Headers() headers: any): Promise<any> {
        try {
            const authHeader = headers?.authorization
            console.log(authHeader)
            const contactsList = await this.contactsService.getContacts(authHeader)
            return contactsList
        } catch (error) {
            this.logger.error(`Error get contacts`, error.stack)
            throw new BadGatewayException(error.message)
        }
    }

    @Post()
    async createContac(@Body() dto: CreateContactDto, @Headers() headers: any) {
        try {
            const { username } = dto
            this.logger.log(`Start create contact: ${username}`)
            const authHeader = headers?.authorization
            const createContact = await this.contactsService.createContact({ authHeader, username })
            this.logger.debug(`Complate create contact ${createContact.uid}`)
            return createContact
        } catch (error) {
            this.logger.error(`Failed create contact: ${dto.username}`)
            throw new BadGatewayException(error.message)
        }
    }

    @Delete()
    async deleteContac(@Body() body: any, @Headers() headers: any) {
        try {
            console.log('body', body)
            const { contact_uid } = body
            this.logger.log(`Start delete contact: ${body.contact_uid}`)
            console.log('contact_uid', contact_uid)
            const authHeader = headers?.authorization
            const deleteContact = await this.contactsService.deleteContact({ authHeader, contact_uid })
            this.logger.debug(`Complate delete contact: ${deleteContact}`)
            return deleteContact
        } catch (error) {
            this.logger.error(`Failed delete contact: ${body.contact_uid}`, error.stack)
            throw new InternalServerErrorException(error.message)
        }
    }

}
