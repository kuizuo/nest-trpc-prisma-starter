export enum FileTypeEnum {
  icon = 'icon',
  photo = 'photo',
  file = 'file',
  avatar = 'avatar',
  video = 'video',
}
export type FileType = keyof typeof FileTypeEnum
