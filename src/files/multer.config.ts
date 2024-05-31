import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import fs from 'fs';
import { diskStorage } from 'multer';
import path, { join } from 'path';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  getRootPath = () => {
    return process.cwd();
  };

  // Kiểm tra folder đã có hay chưa. Nếu chưa có thì tạo folder. Nếu có rồi thì k tạo (Thư viện fs có sẵn ở nodejs)
  ensureExists(targetDirectory: string) {
    fs.mkdir(targetDirectory, { recursive: true }, (error) => {
      if (!error) {
        console.log('Directory successfully created, or it already exists.');
        return;
      }
      switch (error.code) {
        case 'EEXIST':
          // Error:
          // Requested location already exists, but it's not a directory.
          break;
        case 'ENOTDIR':
          // Error:
          // The parent hierarchy contains a file with the same name as the dir
          // you're trying to create.
          break;
        default:
          // Some other error like permission denied.
          console.error(error);
          break;
      }
    });
  }

  //   createMulterOptions(): MulterModuleOptions {
  //     return {
  //       storage: diskStorage({
  //         // Địa chỉ lưu file
  //         destination: (req, file, cb) => {
  //           const folder = req?.headers?.folder_type ?? 'default'; // Lấy ra tham số truyền vào header. Nếu không truyền thì lưu vào mục deafauls
  //           this.ensureExists(`public/images/${folder}`); // tạo folder theo header truyền lên
  //           cb(null, join(this.getRootPath(), `public/images/${folder}`));
  //         },
  //         // Tạo file name theo định dạng: BaseName-Date-exeption
  //         filename: (req, file, cb) => {
  //           //get image extension
  //           let extName = path.extname(file.originalname);
  //           //get image's name (without extension)
  //           let baseName = path.basename(file.originalname, extName);
  //           let finalName = `${baseName}-${Date.now()}${extName}`;
  //           cb(null, finalName);
  //         },
  //       }),
  //     };
  //   }
  // }

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folder = req?.headers?.folder_type ?? 'default'; // Lấy ra tham số truyền vào header. Nếu không truyền thì lưu vào mục deafauls
          this.ensureExists(`public/images/${folder}`); // tạo folder theo header truyền lên
          cb(null, join(this.getRootPath(), `public/images/${folder}`));
        },
        filename: (req, file, cb) => {
          //get image extension
          let extName = path.extname(file.originalname);
          //get image's name (without extension)
          let baseName = path.basename(file.originalname, extName);
          let finalName = `${baseName}-${Date.now()}${extName}`;
          cb(null, finalName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedFileTypes = [
          'jpg',
          'jpeg',
          'png',
          'gif',
          'pdf',
          'doc',
          'docx',
        ];
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        const isValidFileType = allowedFileTypes.includes(fileExtension);
        if (!isValidFileType) {
          cb(
            new HttpException(
              'Invalid file type',
              HttpStatus.UNPROCESSABLE_ENTITY,
            ),
            null,
          );
        } else cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 1, // 1MB
      },
    };
  }
}
