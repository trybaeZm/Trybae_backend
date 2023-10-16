const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");

// Set up AWS SDK and S3 client
AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS,
	secretAccessKey: process.env.AWS_SECRET,
	region: "us-east-1",
});

const s3 = new AWS.S3();

const createMulter = (acl, path, prepend, trail) => {
	if (trail == "mp4") {
		return multer({
			storage: multerS3({
				s3: s3,
				bucket: process.env.BUCKET_NAME_TEST,
				acl: acl,
				key: function (req, file, cb) {
					cb(null, `${path}/${prepend}_${new Date().toISOString()}.${trail}`);
				},
				contentType: multerS3.AUTO_CONTENT_TYPE,
			}),
			fileFilter: function (req, file, done) {
				// Check if the file is a video
				if (file.mimetype.startsWith("video/")) {
					// Accept the file
					done(null, true);
				} else {
					// Reject the file
					done(new Error("File is not a video"), false);
				}
			},
		});
	} else {
		return multer({
			storage: multerS3({
				s3: s3,
				bucket: process.env.BUCKET_NAME_TEST,
				acl: acl,
				key: function (req, file, cb) {
					cb(null, `${path}/${prepend}_${new Date().toISOString()}.${trail}`);
				},
				contentType: multerS3.AUTO_CONTENT_TYPE,
			}),
			fileFilter: function (req, file, done) {
				console.log(file.mimetype)
				console.log(file)
				if (file.mimetype.includes("image")) {
					// CAN BE REPLACED WITH .startsWith()
					done(null, true);
				} else {
					// Call the done callback with an error instead of throwing an error
					done(new Error("File type is incorrect"), false);
				}
			},
		});
	}
};

module.exports = {
	createMulter,
};
