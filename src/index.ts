/* Globals */
import rq from 'request-promise';
import request from 'request';

interface IFile {
  _id?: string;
  name: string;
  originalName: string;
  mimetype: string;
  path: string;
  encoding: string;
}

interface IFileConnector {
  savedFiles: IFile[];
}

export class FilesConnector {

  private uri: string;
  private fileConnector: IFileConnector;

  constructor(host: string, port: number) {
    if (!port || !host) {
      throw 'Port and host params are needed';
    }

    this.uri = `http://${host}:${port}/api/files`;

    this.tryConnection(host, port);
  }

  private async tryConnection(host: string, port: number): Promise<void> {
    try {
      await rq({ method: 'GET', uri: `http://${host}:${port}/status` });
    } catch (error) {
      throw JSON.stringify({
        error: {
          message: 'Unreachable connection',
          description: 'Be sure the port and host was set correctly and the file service is running'
        }
    });
    }
  }

  public async getAllFiles(): Promise<IFile[]> {
    try {
      const response = await rq({ method: 'GET', uri: this.uri });
      return JSON.parse(response);
    } catch (error) {
      throw error;
    }
  }

  public async deleteFile(fileId: string): Promise<IFile | undefined> {
    try {
      const response = await rq.delete(`${this.uri}/${fileId}`);
      return JSON.parse(response);
    } catch (error) {
      throw error;
    }
  }

  public async getFile(fileId: string): Promise<IFile> {
    try {
      const response = await rq({ method: 'GET', uri: `${this.uri}/${fileId}` });
      return JSON.parse(response);
    } catch (error) {
      throw error;
    }
  }

  public async uploadFile(data: any): Promise<any> {
    try {
      return await rq({ method: 'POST', uri: `${this.uri}/upload`,
      formData: {
        file: {
          value: data.file.buffer,
          options: {
            filename: data.file.originalname,
            contentType: data.file.mimetype
          }
        }
      }
    });
    } catch (error) {
      throw error;
    }
  }

  public getFilesMiddleware( data: any ) {

    return ( req: any, res: any, next: any) => {
      if (
        req.method === 'POST' &&
        req.headers &&
        req.headers["content-type"] &&
        req.headers["content-type"].match(/(multipart\/form\-data)/)
      ) {
        const sendRequest = rq.post(`${this.uri}/upload`);
        req.pipe(sendRequest);
        sendRequest.then((data: any) => {

          this.setResponse(req, data);

          next()
        }).catch(err => next(err));
      } else {
        next();
      }
    };
  }

  public downloadFileById() {
    return (req: any, res: any, next: any) => {
      const url = `${this.uri}/download/${req.params.fileId}`;
      req.pipe(request(url)).pipe(res);
    }
  }

  public downloadZip() {
    return (req: any, res: any, next: any) => {
      if (req.query && req.query.fileId) {
        const queryParams = `?fileId=${req.query.fileId.join('&fileId=')}`;
        const url = `${this.uri}/zip/${req.params.zipName}${queryParams}`;
        req.pipe(request(url)).pipe(res);
      } else {
        next('The fileId\'s are mandatory');
      }
    }
  }

  private setResponse(req: any, data: string) {
    this.fileConnector = {
      savedFiles: JSON.parse(data)
    };

    if (req.feathers) {
      req.feathers.fileConnector = this.fileConnector;
    } else {
      req.fileConnector = this.fileConnector;
    }
  }
}
