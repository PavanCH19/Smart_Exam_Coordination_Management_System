const seatRepository = require("./seat.repository");
const allocationRepository = require("../allocation_mng/allocation.repository");
const examRepository = require("../exam_mng/exam.repository");
const studentRepository = require("../std_mng/students.repository");
const ApiError = require("../../shared/utils/ApiError");

const SEATS_PER_ROW = 10;

const seatLabel = (index) => {
    const row = Math.floor(index / SEATS_PER_ROW);
    const col = (index % SEATS_PER_ROW) + 1;
    const rowLetter = String.fromCharCode(65 + row);
    return `${rowLetter}${col}`;
};

// Round-robin interleave by section so consecutive seats rarely share a
// section — the "intelligent"/mixed seating mode.
const interleaveBySection = (students) => {
    const groups = {};
    students.forEach((student) => {
        const key = student.section || "default";
        if (!groups[key]) groups[key] = [];
        groups[key].push(student);
    });

    const queues = Object.values(groups);
    const result = [];
    let remaining = students.length;

    while (remaining > 0) {
        for (const queue of queues) {
            if (queue.length > 0) {
                result.push(queue.shift());
                remaining -= 1;
            }
        }
    }

    return result;
};

const shapeSeat = (seatInstance) => {
    const seat = seatInstance.toJSON ? seatInstance.toJSON() : seatInstance;
    const student = seat.Student || {};

    return {
        seat_number: seat.seat_number,
        student_id: seat.student_id,
        usn: student.usn,
        name: student.name,
        section: student.section
    };
};

const getSeatingByAllocationId = async (allocationId) => {
    const seats = await seatRepository.findSeatsByAllocationId(allocationId);

    if (seats.length === 0) {
        throw new ApiError(404, "No seating has been generated for this room yet");
    }

    return seats.map(shapeSeat);
};

const generateSeating = async (allocationId, { mixed = true }) => {

    const allocation = await allocationRepository.findAllocationById(allocationId);
    if (!allocation) {
        throw new ApiError(404, "Room allocation not found");
    }

    const exam = await examRepository.findExamById(allocation.exam_id);
    if (!exam) {
        throw new ApiError(404, "Exam not found");
    }

    // Don't re-seat a student who's already been placed in another room for
    // the same exam.
    const siblingAllocations = await allocationRepository.findAllocationsByExamId(allocation.exam_id);
    const siblingAllocationIds = siblingAllocations.map((a) => a.allocation_id);
    const alreadySeatedIds = await seatRepository.findSeatedStudentIdsForAllocations(siblingAllocationIds);

    const { rows: candidateStudents } = await studentRepository.findAllStudents(
        { department: exam.department, semester: exam.semester },
        1,
        1000
    );

    let eligibleStudents = candidateStudents.filter(
        (student) => !alreadySeatedIds.includes(student.student_id)
    );

    eligibleStudents = eligibleStudents.slice(0, allocation.student_count);

    if (eligibleStudents.length === 0) {
        throw new ApiError(400, "No eligible students found to seat for this room");
    }

    if (mixed) {
        eligibleStudents = interleaveBySection([...eligibleStudents]);
    }

    const seats = eligibleStudents.map((student, index) => ({
        allocation_id: Number(allocationId),
        seat_number: seatLabel(index),
        student_id: student.student_id
    }));

    await seatRepository.deleteSeatsByAllocationId(allocationId);
    await seatRepository.insertSeats(seats);

    return await getSeatingByAllocationId(allocationId);
};

const saveSeating = async (allocationId, seats) => {

    const allocation = await allocationRepository.findAllocationById(allocationId);
    if (!allocation) {
        throw new ApiError(404, "Room allocation not found");
    }

    const studentIds = seats.map((seat) => seat.student_id);
    const existingStudents = await studentRepository.findAllStudents(
        { student_id: studentIds },
        1,
        studentIds.length || 1
    );

    if (existingStudents.count !== studentIds.length) {
        throw new ApiError(400, "One or more students in the seating list could not be found");
    }

    await seatRepository.deleteSeatsByAllocationId(allocationId);
    await seatRepository.insertSeats(
        seats.map((seat) => ({
            allocation_id: Number(allocationId),
            seat_number: seat.seat_number,
            student_id: seat.student_id
        }))
    );

    return await getSeatingByAllocationId(allocationId);
};

module.exports = {
    getSeatingByAllocationId,
    generateSeating,
    saveSeating
};
