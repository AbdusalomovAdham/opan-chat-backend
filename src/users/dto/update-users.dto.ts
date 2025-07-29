import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
    @IsString()
    username: string

    @IsOptional()
    @IsString()
    email?: string;

    @IsString()
    @MinLength(8)
    password?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsString()
    uid: string;

    @IsOptional()
    @IsString()
    phone_number?: string
}

export class updateUser {
    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    bio?: string;
}
