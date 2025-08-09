import { ContactsRepository } from './repositories/contacts.repository';
import { JwtTokenService } from './../auth/jwt/token.service';
import { BadGatewayException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ContactsService {
    private logger = new Logger(ContactsService.name)
    constructor(
        private readonly jwtTokenService: JwtTokenService,
        private readonly contactsRepository: ContactsRepository
    ) { }

    async getContacts(authHeader: string) {
        try {
            this.logger.log(`Start get all contacts`)
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.logger.warn(`Token not provided or invalid format`)
                throw new UnauthorizedException('Token not provided or invalid format');
            }
            const verifyToken = await this.jwtTokenService.verifyToken(authHeader)
            const contactList = await this.contactsRepository.getContact(verifyToken.sub)
            this.logger.debug(`Complate get all contacts`)
            return contactList
        } catch (error) {
            this.logger.error(`Failed get contacts`, error.stack)
            throw new InternalServerErrorException(error.message)
        }
    }

    async createContact({ authHeader, username }: { authHeader: string, username: string }) {
        try {
            this.logger.log(`Start create contact: ${username}`)
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.logger.warn(`Token not provided or invalid format`)
                throw new UnauthorizedException('Token not provided or invalid format');
            }
            const verifyToken = await this.jwtTokenService.verifyToken(authHeader)
            this.logger.log(`User uid: ${verifyToken.sub}`)
            const uid = verifyToken.sub
            const contact = await this.contactsRepository.createContact({ username, uid })
            this.logger.debug(`Complate create contact: ${contact}`)
            return contact
        } catch (error) {
            this.logger.error(`Filed create contact: ${username}`, error.stack)
            throw new BadGatewayException(error.message)
        }
    }

    async deleteContact({ contact_uid, authHeader }: { contact_uid: string, authHeader: string }) {
        try {
            this.logger.log(`Start delete contact: ${contact_uid}`)
            const verifyToken = await this.jwtTokenService.verifyToken(authHeader)
            const { sub } = verifyToken
            const deleteContact = await this.contactsRepository.deleteContact({ user_uid: sub, contact_uid })
            this.logger.debug(`Complate delete contact: ${deleteContact}`)
            return { message: 'Delete contact!' }
        } catch (error) {
            this.logger.log(`Faild delete contact: ${contact_uid}`)
            throw new InternalServerErrorException(error.message)
        }
    }
}
