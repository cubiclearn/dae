export const checkFileType = (file: File, types: string[]) =>
  types.includes(file.type)

export const checkFileSize = (file: File, size: number) => file.size <= size
