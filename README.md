## 1. Basic Use

```typescript
const { FilesConnector } = require('files-connector'); // Or name defined in package.json

const filesConnector = new FilesConnector('localhost', 3040); // Needs to set name of host, and port when the file service are running

module.exports = filesConnector;
```

## 2. How to use in controller

### 2.1 middleware methods

#### 2.1.1 Download file
```typescript
  // If is sent a file in multipart/data-form, it will be saved in files microservice and return the reference info 
  // in object inside of request, called fileConnector.savedFiles, this data is an array of files
  // if you are using feathers it will be inside of context/hook.params.fileConnector.
  router.get('/route', filesConnector.getFilesMiddleware(), method);
```

#### 2.1.2 Download Zip
```typescript
  // Is neded to send a zipName in params,
  //  and a query string with property name fileId about all filesId that you want to get it inside the zip
  router.get('/route/:zipName', filesConnector.downloadZip(), method);
```
### 2.2 controller methods

1. Get All files:
```typescript
  const files = await filesConnector.getAllFiles(); // returns promise with array of files
```

2. Get File data by Id:
```typescript
  const files = await filesConnector.getFile("5d0223eccc5d2961fd927f4a"); // returns promise with data of file
```

3. Delete File by Id:
```typescript
 // returns promise with data of file deleted, and it will be delete from file system
  const files = await filesConnector.deleteFile("5d0223eccc5d2961fd927f4a"); 
```