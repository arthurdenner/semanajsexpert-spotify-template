import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import config from './config.js';

const { publicDirectory } = config.dir;

export class Service {
  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  async getFileInfo(filename) {
    const fullPath = path.join(publicDirectory, filename);
    // validate existence of file
    await fsPromises.access(fullPath);
    const filetype = path.extname(fullPath);

    return {
      name: fullPath,
      type: filetype,
    };
  }

  async getFileStream(filename) {
    const { name, type } = await this.getFileInfo(filename);

    return {
      stream: this.createFileStream(name),
      type,
    };
  }
}
