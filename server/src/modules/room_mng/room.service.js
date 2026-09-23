const roomRepository = require("./room.repository");
const ApiError = require("../../shared/utils/ApiError");

const addRoom = async ({ room_number, building, floor, capacity, room_type, status }) => {

    const existingRoom = await roomRepository.findRoomByNumber(room_number);

    if (existingRoom) {
        throw new ApiError(409, "A room with this number already exists");
    }

    return await roomRepository.insertRoom({ room_number, building, floor, capacity, room_type, status });

};

const getAllRooms = async (filters, page, limit) => {
    const { rows, count } = await roomRepository.findAllRooms(filters, page, limit);

    return {
        rooms: rows,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

const getRoomById = async (roomId) => {

    const room = await roomRepository.findRoomById(roomId);

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    return room;
};

const updateRoom = async (roomId, room) => {

    const existingRoom = await roomRepository.findRoomById(roomId);

    if (!existingRoom) {
        throw new ApiError(404, "Room not found");
    }

    if (room.room_number && room.room_number !== existingRoom.room_number) {

        const duplicateRoom = await roomRepository.findRoomByNumber(room.room_number);

        if (duplicateRoom) {
            throw new ApiError(409, "A room with this number already exists");
        }
    }

    await roomRepository.updateRoom(roomId, room);

    return await roomRepository.findRoomById(roomId);
};

const updateRoomStatus = async (roomId, status) => {

    const existingRoom = await roomRepository.findRoomById(roomId);

    if (!existingRoom) {
        throw new ApiError(404, "Room not found");
    }

    await roomRepository.updateRoom(roomId, { status });

    return await roomRepository.findRoomById(roomId);
};

const deleteRoom = async (roomId) => {

    const room = await roomRepository.findRoomById(roomId);

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    await roomRepository.deleteRoom(roomId);

    return { message: "Room deleted successfully" };
};

module.exports = {
    addRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    updateRoomStatus,
    deleteRoom
};
