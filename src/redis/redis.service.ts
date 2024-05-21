import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  // 获取数组的全部数据
  async getListAll(key: string) {
    const results = [];
    const fields = await this.redisClient.hKeys(key);
    for (const field of fields) {
      const value = await this.redisClient.hGet(key, field);
      results.push(JSON.parse(value));
    }
    return results;
  }

  // 按顺序放入一个数组并设置过期时间
  async pushArray(
    key: string,
    array: { id: string; [key: string]: any }[],
    ttl?: number,
  ) {
    for (const item of array) {
      await this.redisClient.hSet(key, item.id, JSON.stringify(item));
    }
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  // 追加一个元素到数组的尾部
  async appendToList(key: string, id: string, value: any) {
    await this.redisClient.hSet(key, id, JSON.stringify(value));
  }

  // 删除数组中指定 ID 的元素
  async removeElementById(key: string, id: string) {
    await this.redisClient.hDel(key, id);
  }

  // 更新数组中指定 ID 的元素
  async updateElementById(key: string, id: string, value: any) {
    const json_data = await this.redisClient.hGet(key, id);
    const data = JSON.parse(json_data);
    const end = { ...data, ...value };
    await this.redisClient.hSet(key, id, JSON.stringify(end));
  }
}
