var express = require("express");
router = express.Router();
controller = require('../controllers/login-controller.js');


router.post('/', controller.login);

module.exports = router;





