export class CreateChatsDto {
    uid: string

    type: 'GROUP' | 'P2P'

    create_by: string

    craete_at?: Date
}