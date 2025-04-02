const express = require("express");
const multer = require("multer");
const { uploadFile, addCredentials, listFiles, fetchCredentials, changePreferredPlatform, fetchNotifications, fetchPreferredPlatform, deleteFile } = require("../controllers/file.controller");

const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });



router.post("/upload", upload.single("file"), uploadFile);
router.post("/add-credentials", addCredentials);
router.post('/list', listFiles);
router.post('/fetch-credentials', fetchCredentials);
router.post('/update-preferred-platform', changePreferredPlatform);
router.post('/fetch-notifications', fetchNotifications);
router.post('/fetch-preferred-platform', fetchPreferredPlatform);
router.post('/delete', deleteFile);

module.exports = router;
