const express = require("express");

const roomController = require("./room.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const {
    createRoomSchema,
    updateRoomSchema,
    updateRoomStatusSchema
} = require("./room.validation");

const router = express.Router();

// List rooms — readable by any authenticated role (Room/Staff Allocation
// page needs this regardless of caller's role in a future extension).
router.get( "/", authenticate, roomController.getAllRooms );

// Add a room
router.post( "/", authenticate, authorize("ADMIN"), validate(createRoomSchema), roomController.addRoom );

// Edit room
router.put( "/:id", authenticate, authorize("ADMIN"), validate(updateRoomSchema), roomController.updateRoom );

// Update room status only
router.patch( "/:id/status", authenticate, authorize("ADMIN"), validate(updateRoomStatusSchema), roomController.updateRoomStatus );

// Delete room
router.delete( "/:id", authenticate, authorize("ADMIN"), roomController.deleteRoom );

module.exports = router;
