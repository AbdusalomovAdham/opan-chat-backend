import { IsString, MinLength, IsOptional } from 'class-validator';

export class SignInDto {
    @IsString()
    username: string

    @IsOptional()
    @IsString()
    email?: string;

    @IsString()
    @MinLength(8)
    password: string;
}

export class SignUpDto {
    @IsString()
    username: string

    @MinLength(8)
    @IsString()
    password: string
}

