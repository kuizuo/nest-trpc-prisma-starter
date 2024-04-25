import { Global, Module, Provider } from '@nestjs/common'

import { FileController } from './file.controller'
import { FileService } from './file.service'

const providers: Provider[] = [FileService]

@Module({
  controllers: [FileController],
  providers,
  exports: providers,
})
@Global()
export class FileModule { }
