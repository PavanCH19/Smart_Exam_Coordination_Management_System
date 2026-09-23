const Room = require("./room.model");

const findRoomById = async (roomId) => {
    return await Room.findByPk(roomId);
};

const findRoomByNumber = async (roomNumber) => {
    return await Room.findOne({
        where: { room_number: roomNumber }
    });
};

const findAllRooms = async (filters = {}, page = 1, limit = 10) => {

    const offset = (page - 1) * limit;

    return await Room.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: [["room_id", "DESC"]]
    });
};

const findAvailableRooms = async () => {
    return await Room.findAll({
        where: { status: "AVAILABLE" },
        order: [["capacity", "DESC"]]
    });
};

const insertRoom = async (room) => {
    return await Room.create(room);
};

const updateRoom = async (roomId, room) => {

    return await Room.update(
        room,
        {
            where: { room_id: roomId }
        }
    );
};

const deleteRoom = async (roomId) => {

    return await Room.destroy({
        where: { room_id: roomId }
    });
};

module.exports = {
    findRoomById,
    findRoomByNumber,
    findAllRooms,
    findAvailableRooms,
    insertRoom,
    updateRoom,
    deleteRoom
};
