import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    username: string

    @IsOptional()
    @IsString()
    email?: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    uid?: string;


    @IsOptional()
    @IsString()
    phoneNumber?: string;
}

export class LoginUserDto {
    @IsString()
    username: string

    @MinLength(8)
    @IsString()
    password: string

    @IsOptional()
    @IsString()
    token?: string;
}

