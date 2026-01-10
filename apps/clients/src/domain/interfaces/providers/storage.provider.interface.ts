export interface IStorageProvider {
  uploadFile(file: Buffer, filename: string, mimetype: string): Promise<string>;
}
