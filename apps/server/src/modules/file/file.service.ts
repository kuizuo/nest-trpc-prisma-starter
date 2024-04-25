import { createWriteStream } from 'node:fs'
import path from 'node:path'
import { Readable, pipeline } from 'node:stream'
import { promisify } from 'node:util'

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IAppConfig } from '@server/config/app.config'
import { STATIC_FILE_DIR } from '@server/constants/path.constant'
import fs from 'fs-extra'

import { FileType } from './file.constant'

const pump = promisify(pipeline)

@Injectable()
export class FileService {
  constructor(private readonly configService: ConfigService) { }

  private resolveFilePath(type: FileType, name: string) {
    return path.resolve(STATIC_FILE_DIR, type, name)
  }

  private async checkIsExist(path: string) {
    try {
      await fs.access(path)
      return true
    }
    catch {
      return false
    }
  }

  async getFileStream(type: FileType, name: string) {
    const exists = await this.checkIsExist(this.resolveFilePath(type, name))
    if (!exists)
      throw new NotFoundException('文件不存在')

    return fs.createReadStream(this.resolveFilePath(type, name))
  }

  async writeFile(
    type: FileType,
    name: string,
    data: Readable,
    encoding?: BufferEncoding,
  ) {
    const filePath = this.resolveFilePath(type, name)
    if (await this.checkIsExist(filePath))
      throw new BadRequestException('文件已存在')

    await fs.mkdir(path.dirname(filePath), { recursive: true })

    const writable = createWriteStream(filePath, { encoding })

    await pump(data, writable)
  }

  async deleteFile(type: FileType, name: string) {
    try {
      return await fs.unlink(this.resolveFilePath(type, name))
    }
    catch {
      return null
    }
  }

  async getDir(type: FileType) {
    await fs.mkdir(this.resolveFilePath(type, ''), { recursive: true })
    const path_1 = path.resolve(STATIC_FILE_DIR, type)
    return await fs.readdir(path_1)
  }

  async resolveFileUrl(type: FileType, name: string) {
    const { baseUrl, globalPrefix } = await this.configService.get<IAppConfig>('app')!
    return `${baseUrl.replace(/\/+$/, '')}/${globalPrefix}/files/${type}/${name}`
  }

  exists(type: FileType, name: string) {
    return this.checkIsExist(this.resolveFilePath(type, name))
  }
}
