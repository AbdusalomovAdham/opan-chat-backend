import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { AuthModule } from '@/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactsSchema } from './schema/contacts.schema';
import { ContactsRepository } from './repositories/contacts.repository';
import { User, UsersSchema } from '@/users/schema/users.schema';


@Module({
  imports: [AuthModule,
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactsSchema },
      { name: User.name, schema: UsersSchema }
    ]),

  ],
  controllers: [ContactsController],
  providers: [ContactsService, ContactsRepository],
})
export class ContactsModule { }
