import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import config from '../../../server/config.js';
import { Controller } from '../../../server/controller.js';
import { handler } from '../../../server/routes.js';
import TestUtil from '../_util/testUtil.js';

const {
  constants: { contentType },
  location,
  pages,
} = config;

describe('# Routes', () => {
  test('GET / - should redirect to home page', async () => {
    const params = TestUtil.getHandleParams({ url: '/' });

    await handler(...params.values());

    expect(params.response.writeHead).toBeCalledWith(302, {
      Location: location.home,
    });
    expect(params.response.end).toHaveBeenCalled();
  });

  test(`GET /home - should response with ${pages.homeHTML} file stream`, async () => {
    const params = TestUtil.getHandleParams({ url: '/home' });
    const mockFileStream = TestUtil.generateReadableStream(['data']);

    const getFileStreamSpy = jest
      .spyOn(Controller.prototype, 'getFileStream')
      .mockResolvedValue({ stream: mockFileStream });
    const streamPipeSpy = jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(getFileStreamSpy).toBeCalledWith(pages.homeHTML);
    expect(streamPipeSpy).toHaveBeenCalledWith(params.response);
  });

  test(`GET /controller - should response with ${pages.controllerHTML} file stream`, async () => {
    const params = TestUtil.getHandleParams({ url: '/controller' });
    const mockFileStream = TestUtil.generateReadableStream(['data']);

    const getFileStreamSpy = jest
      .spyOn(Controller.prototype, 'getFileStream')
      .mockResolvedValue({ stream: mockFileStream });
    const streamPipeSpy = jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(getFileStreamSpy).toBeCalledWith(pages.controllerHTML);
    expect(streamPipeSpy).toHaveBeenCalledWith(params.response);
  });

  test(`GET /index.html - should response with file stream`, async () => {
    const filename = '/index.html';
    const expectedType = '.html';
    const params = TestUtil.getHandleParams({ url: filename });
    const mockFileStream = TestUtil.generateReadableStream(['data']);
    const getFileStreamSpy = jest
      .spyOn(Controller.prototype, 'getFileStream')
      .mockResolvedValue({ stream: mockFileStream, type: expectedType });
    const streamPipeSpy = jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(getFileStreamSpy).toBeCalledWith(filename);
    expect(streamPipeSpy).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': contentType[expectedType],
    });
  });

  test(`GET /file.ext - should response with file stream`, async () => {
    const filename = '/file.ext';
    const expectedType = '.ext';
    const params = TestUtil.getHandleParams({ url: filename });
    const mockFileStream = TestUtil.generateReadableStream(['data']);
    const getFileStreamSpy = jest
      .spyOn(Controller.prototype, 'getFileStream')
      .mockResolvedValue({ stream: mockFileStream, type: expectedType });
    const streamPipeSpy = jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(getFileStreamSpy).toBeCalledWith(filename);
    expect(streamPipeSpy).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).not.toHaveBeenCalled();
  });

  test(`POST /unknown - given an inexistent route it should response with 404`, async () => {
    const params = TestUtil.getHandleParams({
      method: 'POST',
      url: '/unknown',
    });

    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalledWith(404);
    expect(params.response.end).toHaveBeenCalled();
  });

  describe('exceptions', () => {
    test('given inexistent file it should respond with 404', async () => {
      const params = TestUtil.getHandleParams({ url: '/index.png' });
      const getFileStreamSpy = jest
        .spyOn(Controller.prototype, 'getFileStream')
        .mockRejectedValue(new Error('Error: ENOENT: no such file or directy'));

      await handler(...params.values());

      expect(getFileStreamSpy).toBeCalledWith('/index.png');
      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalled();
    });

    test('given an error it should respond with 500', async () => {
      const params = TestUtil.getHandleParams({ url: '/index.png' });
      const getFileStreamSpy = jest
        .spyOn(Controller.prototype, 'getFileStream')
        .mockRejectedValue(new Error('Error:'));

      await handler(...params.values());

      expect(getFileStreamSpy).toBeCalledWith('/index.png');
      expect(params.response.writeHead).toHaveBeenCalledWith(500);
      expect(params.response.end).toHaveBeenCalled();
    });
  });
});
