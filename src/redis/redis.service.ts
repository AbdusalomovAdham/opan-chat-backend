import { Injectable } from "@nestjs/common";
import Redis from 'ioredis'

@Injectable()
export class RedisService {
    private readonly client: Redis

    constructor() { this.client = new Redis() }

    async set(key: string, value: any, expireInSeconds = 3600) {
        await this.client.set(key, JSON.stringify(value), 'EX', expireInSeconds)
    }

    async get(key: string) {
        const data = await this.client.get(key)
        return data ? JSON.parse(data) : null
    }

    async delete(key: string) {
        return this.client.del(key)
    }
}