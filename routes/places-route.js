const { Router } = require('express');
const { check } = require('express-validator');

const placeControllers = require('../controller/places-controller');

const router = Router();

router.get('/:pid', placeControllers.getPlaceById);
router.get('/users/:uid', placeControllers.getPlacesByUserId);
router.post(
	'/',
	[
		check('title').not().isEmpty(),
		check('description').isLength({ min: 5 }),
		check('address').not().isEmpty(),
	],
	placeControllers.createPlace
);
router.patch('/:pid', placeControllers.updatePlace);
router.delete('/:pid', placeControllers.deletePlace);

module.exports = router;
