import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from 'uuid'

export const multerConfig = {
    storage: diskStorage({
        destination: './uploads/groups',
        filename: (req, file, cb) => {
            const uniqueSuffix = uuidv4()
            cb(null, `${uniqueSuffix}${extname(file.originalname)}`)
        }
    })
}