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
    phoneNumber?: string
}

export class updateUserPassword {
    @IsOptional()
    @IsString()
    phoneNumber: string

    @IsString()
    @MinLength(8)
    password: string;
}
