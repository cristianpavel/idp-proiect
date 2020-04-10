var express = require("express");
router = express.Router();
controller = require('../controllers/register-controller.js');


router.post('/', controller.register);

module.exports = router;





