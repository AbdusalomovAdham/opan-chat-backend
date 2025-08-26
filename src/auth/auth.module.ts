import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '@/auth/auth.service';
import { JwtStrategy } from './guards/jwt.strategy';
import { UsersModule } from '@/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, AuthSchema } from './schema/auth.schema';
import { RedisModule } from '@/redis/redis.module';
import { AuthController } from './auth.controller';
import { JwtTokenService } from './jwt/token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        JwtModule.registerAsync({
            useFactory: async () => ({
                secret: 'SECRET_KEY',
                signOptions: { expiresIn: '24h' },
            }),
        }),
        forwardRef(() => UsersModule),
        MongooseModule.forFeature([{
            name: User.name,
            schema: AuthSchema
        }]),
        RedisModule,
    ],

    providers: [AuthService, JwtStrategy, JwtTokenService, JwtAuthGuard],
    exports: [AuthService, JwtTokenService],
    controllers: [AuthController]
})
export class AuthModule { }
