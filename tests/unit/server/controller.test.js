import { beforeEach, describe, jest, test } from '@jest/globals';
import { Controller } from '../../../server/controller';
import { Service } from '../../../server/service';
import TestUtil from '../_util/testUtil';

describe('# Controller', () => {
  describe('getFileStream', () => {
    let controller;
    const file = 'file.txt';
    const fileType = '.txt';

    beforeEach(() => {
      controller = new Controller();
    });

    test('should return file stream', () => {
      const mockFileStream = TestUtil.generateReadableStream(['data']);
      const getFileStreamSpy = jest
        .spyOn(Service.prototype, 'getFileStream')
        .mockReturnValue({ stream: mockFileStream, type: fileType });
      const result = controller.getFileStream(file);

      expect(result).toEqual({ stream: mockFileStream, type: fileType });
      expect(getFileStreamSpy).toBeCalledWith(file);
    });

    test("should throw when file doesn't exist", () => {
      const mockFileStream = TestUtil.generateReadableStream(['data']);
      const getFileStreamSpy = jest
        .spyOn(Service.prototype, 'getFileStream')
        .mockRejectedValue(new Error('ENOENT'));

      expect(controller.getFileStream(file)).rejects.toThrow(/ENOENT/);
      expect(getFileStreamSpy).toBeCalledWith(file);
    });
  });
});
