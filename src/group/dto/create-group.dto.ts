import { IsString, IsEnum, IsOptional } from "class-validator";


export class CreateGroupDto {
    @IsString()
    uid: string

    @IsEnum(['GROUP'])
    type: string

    @IsString()
    created_by: string

    @IsOptional()
    created_at?: Date

    @IsString()
    avatar?: string
}