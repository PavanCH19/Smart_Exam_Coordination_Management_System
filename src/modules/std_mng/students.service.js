const studentRepository = require("./students.repository");
const ApiError = require("../../shared/errors/ApiError");

const addStd = async ({ usn, name, email, phone, department, semester, section, course }) => {

    const existingUSN = await studentRepository.findStudentByUSN(usn);

    if (existingUSN) {
        throw new ApiError(409, "Student with this USN already exists");
    }

    const existingEmail = await studentRepository.findStudentByEmail(email);

    if (existingEmail) {
        throw new ApiError(409, "Student with this email already exists");
    }

    return await studentRepository.insertStudent({ usn, name, email, phone, department, semester, section, course });

};

const getAllStudents = async (filters, page, limit) => {
    return await studentRepository.findAllStudents( filters, page, limit );
};

const getStudentById = async (studentId) => {

    const student = await studentRepository.findStudentById(studentId);

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return student;
};

const updateStudent = async (studentId, student) => {

    const existingStudent = await studentRepository.findStudentById(studentId);

    if (!existingStudent) {
        throw new ApiError(404, "Student not found");
    }

    if (student.usn && student.usn !== existingStudent.usn) {

        const existingUSN = await studentRepository.findStudentByUSN( student.usn );

        if (existingUSN) {
            throw new ApiError(409, "Student with this USN already exists");
        }
    }

    if (student.email && student.email !== existingStudent.email) {

        const existingEmail = await studentRepository.findStudentByEmail(
            student.email
        );

        if (existingEmail) {
            throw new ApiError(409, "Student with this email already exists");
        }
    }

    await studentRepository.updateStudent(studentId, student);

    return await studentRepository.findStudentById(studentId);
};

const deleteStudent = async (studentId) => {

    const student = await studentRepository.findStudentById(studentId);

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    await studentRepository.deleteStudent(studentId);

    return { message: "Student deleted successfully" };
};

module.exports = {
    addStd,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};