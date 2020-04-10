var express = require("express");
router = express.Router();
controller = require('../controllers/home-controller.js');


router.post('/modifySession', controller.modifySession);
router.post('/addHoliday', controller.addHoliday);
router.post('/', controller.getUserData);
router.post('/addTeam', controller.addTeam);
router.post('/getUsers', controller.getUsers);
router.post('/getDept', controller.getDept);
router.post('/getTeams', controller.getTeams);
router.post('/addDepartment', controller.addDepartment);

module.exports = router;





