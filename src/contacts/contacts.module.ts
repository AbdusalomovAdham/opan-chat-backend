import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { AuthModule } from '@/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactsSchema } from './schema/contacts.schema';
import { ContactsRepository } from './repositories/contacts.repository';
import { User, UsersSchema } from '@/users/schema/users.schema';
import { Chat, ChatSchema } from '@/chat/schema/chat.schema';
import { ChatParticipant } from '@/chat/schema/participant.schema';


@Module({
  imports: [AuthModule,
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactsSchema },
      { name: User.name, schema: UsersSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: ChatParticipant.name, schema: ChatParticipant }
    ]),

  ],
  controllers: [ContactsController],
  providers: [ContactsService, ContactsRepository],
})
export class ContactsModule { }
