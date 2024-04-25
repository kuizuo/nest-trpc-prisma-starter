import path from 'node:path'

import { BadRequestException, Controller, Delete, Get, Param, Post, Query, Req, Res } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { Bypass } from '@server/common/decorators/bypass.decorator'
import { PagerDto } from '@server/common/dto/pager.dto'
import { BizException } from '@server/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { alphabet } from '@server/constants/other.constant'
import { FastifyReply, FastifyRequest } from 'fastify'
import { lookup } from 'mime-types'

import { customAlphabet } from 'nanoid'

import { Public } from '../auth/decorators/public.decorator'

import { FileQueryDto, FileUploadDto } from './file.dto'
import { FileService } from './file.service'

@ApiTags('System - 文件模块')
@Controller(['objects', 'files'])
export class FileController {
  constructor(
    private readonly fileService: FileService,
  ) { }

  @Get('/:type')
  async getTypes(@Query() query: PagerDto, @Param() params: FileUploadDto) {
    const { type = 'file' } = params
    // const { page, size } = query
    const dir = await this.fileService.getDir(type)
    return Promise.all(
      dir.map(async (name) => {
        return { name, url: await this.fileService.resolveFileUrl(type, name) }
      }),
    )
  }

  @Get('/:type/:name')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Bypass()
  @Public()
  async get(@Param() params: FileQueryDto, @Res() res: FastifyReply) {
    const { type, name } = params
    const ext = path.extname(name)
    const mimetype = lookup(ext)

    try {
      const stream = await this.fileService.getFileStream(type, name)
      if (mimetype) {
        res.type(mimetype)
        res.header('cache-control', 'public, max-age=31536000')
        res.header(
          'expires',
          new Date(Date.now() + 31536000 * 1000).toUTCString(),
        )
      }

      return res.send(stream)
    }
    catch {
      throw new BizException(ErrorCodeEnum.ResourceNotFound)
    }
  }

  @Post('/upload')
  async upload(@Query() query: FileUploadDto, @Req() req: FastifyRequest) {
    const file = await req.file()

    if (!file)
      throw new BadRequestException('仅供上传文件！')

    if (file.fieldname !== 'file')
      throw new BadRequestException('字段必须为 file')

    const { type = 'file' } = query

    const ext = path.extname(file.filename)

    const filename = customAlphabet(alphabet)(18) + ext.toLowerCase()

    if (!(await this.fileService.exists(type, filename)))
      await this.fileService.writeFile(type, filename, file.file)

    // TODO: save record in dabase
    return {
      url: await this.fileService.resolveFileUrl(type, filename),
      name: filename,
    }
  }

  @Post('/upload/multiple')
  async uploadMultiple(@Query() query: FileUploadDto, @Req() req: FastifyRequest) {
    const { type = 'file' } = query
    const uploadedFiles: any[] = []

    const files = req.files()

    for await (const file of files) {
      const ext = path.extname(file.filename)
      const filename = customAlphabet(alphabet)(18) + ext.toLowerCase()

      if (!(await this.fileService.exists(type, filename)))
        await this.fileService.writeFile(type, filename, file.file)

      uploadedFiles.push({
        url: await this.fileService.resolveFileUrl(type, filename),
        name: filename,
      })
    }

    return uploadedFiles
  }

  @Delete('/:type/:name')
  async delete(@Param() params: FileQueryDto) {
    const { type, name } = params
    await this.fileService.deleteFile(type, name)
  }
}
