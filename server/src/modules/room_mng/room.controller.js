const roomService = require("./room.service");

const addRoom = async (req, res, next) => {

    try {
        const result = await roomService.addRoom(req.body);

        res.status(201).json({
            success: true,
            message: "Room added successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getAllRooms = async (req, res, next) => {

    try {
        const { status, room_type, page = 1, limit = 10 } = req.query;

        const filters = {
            ...(status && { status }),
            ...(room_type && { room_type })
        };

        const result = await roomService.getAllRooms(
            filters,
            Number(page),
            Number(limit)
        );

        res.status(200).json({
            success: true,
            message: "Rooms fetched successfully",
            data: result.rooms,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};


const updateRoom = async (req, res, next) => {

    try {
        const result = await roomService.updateRoom( req.params.id, req.body );

        res.status(200).json({
            success: true,
            message: "Room updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const updateRoomStatus = async (req, res, next) => {

    try {
        const result = await roomService.updateRoomStatus( req.params.id, req.body.status );

        res.status(200).json({
            success: true,
            message: "Room status updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const deleteRoom = async (req, res, next) => {

    try {
        const result = await roomService.deleteRoom( req.params.id );

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addRoom,
    getAllRooms,
    updateRoom,
    updateRoomStatus,
    deleteRoom
};
