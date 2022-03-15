import { beforeEach, describe, jest, test } from '@jest/globals';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { join } from 'path';
import config from '../../../server/config';
import { Service } from '../../../server/service';
import TestUtil from '../_util/testUtil';

const { dir } = config;

describe('# Service', () => {
  let service;
  const file = 'file.txt';
  const fileType = '.txt';
  const fileFullPath = join(dir.publicDirectory, file);

  beforeEach(() => {
    service = new Service();
  });

  describe('createFileStream', () => {
    test('should return a file stream', () => {
      const mockFileStream = TestUtil.generateReadableStream(['data']);
      const createReadStreamSpy = jest
        .spyOn(fs, 'createReadStream')
        .mockReturnValue(mockFileStream);
      const result = service.createFileStream(file);

      expect(result).toBe(mockFileStream);
      expect(createReadStreamSpy).toBeCalledWith(file);
    });
  });

  describe('getFileInfo', () => {
    test('should return name and type when file exists', async () => {
      const mockFileStream = TestUtil.generateReadableStream(['data']);
      const accessSpy = jest.spyOn(fsPromises, 'access').mockReturnValue(null);
      const createFileStreamSpy = jest
        .spyOn(service, 'createFileStream')
        .mockReturnValue(mockFileStream);
      const result = await service.getFileStream(file);

      expect(result).toEqual({ stream: mockFileStream, type: fileType });
      expect(accessSpy).toBeCalledWith(fileFullPath);
      expect(createFileStreamSpy).toBeCalledWith(fileFullPath);
    });

    test("should throw when file doesn't exist", async () => {
      const accessSpy = jest
        .spyOn(fsPromises, 'access')
        .mockRejectedValue(new Error('ENOENT'));
      const createFileStreamSpy = jest
        .spyOn(service, 'createFileStream')
        .mockReturnValue(null);

      expect(service.getFileInfo(file)).rejects.toThrow(/ENOENT/);
      expect(accessSpy).toBeCalledWith(fileFullPath);
      expect(createFileStreamSpy).not.toBeCalled();
    });
  });

  describe('getFileStream', () => {
    test('should return stream and type when file exists', async () => {
      const mockFileStream = TestUtil.generateReadableStream(['data']);
      const createFileStreamSpy = jest
        .spyOn(service, 'createFileStream')
        .mockReturnValue(mockFileStream);
      const getFileInfoSpy = jest
        .spyOn(service, 'getFileInfo')
        .mockReturnValue({ name: fileFullPath, type: fileType });
      const result = await service.getFileStream(file);

      expect(result).toEqual({ stream: mockFileStream, type: fileType });
      expect(getFileInfoSpy).toBeCalledWith(file);
      expect(createFileStreamSpy).toBeCalledWith(fileFullPath);
    });

    test("should throw when file doesn't exist", async () => {
      const getFileInfoSpy = jest
        .spyOn(service, 'getFileInfo')
        .mockRejectedValue(new Error('ENOENT'));
      const createFileStreamSpy = jest
        .spyOn(service, 'createFileStream')
        .mockReturnValue(null);

      expect(service.getFileStream(file)).rejects.toThrow(/ENOENT/);
      expect(getFileInfoSpy).toBeCalledWith(file);
      expect(createFileStreamSpy).not.toBeCalled();
    });
  });
});
