const multer = require("multer");
const ApiError = require("../utils/ApiError");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const isCsvMimeType = [
            "text/csv",
            "application/vnd.ms-excel"
        ].includes(file.mimetype);
        const hasCsvExtension = file.originalname.toLowerCase().endsWith(".csv");

        if (!isCsvMimeType && !hasCsvExtension) {
            return callback(new ApiError(400, "Only CSV files are allowed"));
        }

        callback(null, true);
    }
});

const uploadCsv = (req, res, next) => {
    upload.single("file")(req, res, (error) => {
        if (error) {
            return next(new ApiError(400, error.message));
        }

        if (!req.file) {
            return next(new ApiError(400, "A CSV file is required in the 'file' field"));
        }

        next();
    });
};

module.exports = uploadCsv;
