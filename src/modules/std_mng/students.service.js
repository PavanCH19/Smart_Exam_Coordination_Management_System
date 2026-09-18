const studentRepository = require("./students.repository");
const ApiError = require("../../shared/utils/ApiError");
const { parse } = require("csv-parse/sync");

const requiredColumns = [
    "usn",
    "name",
    "email",
    "phone",
    "department",
    "semester",
    "section",
    "course"
];

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

const bulkUploadStudents = async (file) => {
    if (!file || !file.buffer) {
        throw new ApiError(400, "CSV file is required in the 'file' field");
    }

    let rows;

    try {
        rows = parse(file.buffer, {
            bom: true,
            columns: (headers) => headers.map((header) => header.trim().toLowerCase()),
            skip_empty_lines: true,
            skip_records_with_empty_values: false,
            trim: true
        });
    } catch (error) {
        throw new ApiError(400, `Invalid CSV file: ${error.message}`);
    }

    if (rows.length === 0) {
        throw new ApiError(400, "CSV file must contain a header and at least one student");
    }

    const columns = Object.keys(rows[0]);
    const missingColumns = requiredColumns.filter((column) => !columns.includes(column));

    if (missingColumns.length > 0) {
        throw new ApiError(400, `Missing required CSV columns: ${missingColumns.join(", ")}`);
    }

    const students = rows.map((row, index) => {
        const rowNumber = index + 2;
        const student = Object.fromEntries(
            requiredColumns.map((column) => [column, row[column] === "" ? null : row[column]])
        );

        const missingValues = requiredColumns.filter(
            (column) => column !== "phone" && !student[column]
        );

        if (missingValues.length > 0) {
            throw new ApiError(400, `Row ${rowNumber} is missing: ${missingValues.join(", ")}`);
        }

        const semester = Number(student.semester);
        if (!Number.isInteger(semester)) {
            throw new ApiError(400, `Row ${rowNumber} has an invalid semester`);
        }

        return { ...student, semester };
    });

    const usns = new Set();
    const emails = new Set();

    students.forEach((student, index) => {
        const rowNumber = index + 2;
        const normalizedUSN = student.usn.toLowerCase();
        const normalizedEmail = student.email.toLowerCase();

        if (usns.has(normalizedUSN)) {
            throw new ApiError(400, `Duplicate USN in CSV at row ${rowNumber}: ${student.usn}`);
        }
        if (emails.has(normalizedEmail)) {
            throw new ApiError(400, `Duplicate email in CSV at row ${rowNumber}: ${student.email}`);
        }

        usns.add(normalizedUSN);
        emails.add(normalizedEmail);
        student.usn = normalizedUSN;
        student.email = normalizedEmail;
    });

    const [existingUSNs, existingEmails] = await Promise.all([
        studentRepository.findStudentsByUSNs([...usns]),
        studentRepository.findStudentsByEmails([...emails])
    ]);

    if (existingUSNs.length > 0) {
        throw new ApiError(409, `Student with this USN already exists: ${existingUSNs[0].usn}`);
    }
    if (existingEmails.length > 0) {
        throw new ApiError(409, `Student with this email already exists: ${existingEmails[0].email}`);
    }

    const insertedStudents = await studentRepository.insertStudents(students);

    return {
        count: insertedStudents.length,
        students: insertedStudents
    };
};

module.exports = {
    addStd,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    bulkUploadStudents
};
