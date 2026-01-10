export interface IStorageRepository {
  uploadFile(file: Buffer, filename: string, mimetype: string): Promise<string>;
}
