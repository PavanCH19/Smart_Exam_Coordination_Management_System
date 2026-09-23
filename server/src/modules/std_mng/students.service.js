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

    const student = await studentRepository.insertStudent({ usn, name, email, phone, department, semester, section, course });

    // Auto-provision a login account and email the credentials — fire and
    // forget in the sense that a failure here never blocks student creation
    // (provisionLoginAccount already swallows its own email errors).
    const { provisionLoginAccount } = require("../../shared/utils/userAccount.util");
    await provisionLoginAccount({
        name: student.name,
        email: student.email,
        role: "STUDENT",
        studentId: student.student_id
    });

    return student;

};

const getAllStudents = async (filters, page, limit) => {
    const { rows, count } = await studentRepository.findAllStudents(filters, page, limit);

    return {
        students: rows,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

const getStudentById = async (studentId) => {

    const student = await studentRepository.findStudentById(studentId);

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return student;
};

const updateStudent = async (studentUsn, student) => {

    const existingStudent = await studentRepository.findStudentByUSN(studentUsn)

    if (!existingStudent) {
        throw new ApiError(404, "Student not found")
    }

    // Check if USN is being changed
    if (student.usn && student.usn !== existingStudent.usn) {

        const existingUSN = await studentRepository.findStudentByUSN(student.usn)

        if (existingUSN) {
            throw new ApiError( 409, "Student with this USN already exists" )
        }
    }

    // Check if email is being changed
    if (student.email && student.email !== existingStudent.email) {

        const existingEmail = await studentRepository.findStudentByEmail(student.email)

        if (existingEmail) {
            throw new ApiError( 409, "Student with this email already exists" )
        }
    }

    // Update using the existing student's USN, which is the route identifier.
    await studentRepository.updateStudent( studentUsn, student )

    // Return updated student
    return await studentRepository.findStudentByUSN(student.usn || studentUsn)
}

const deleteStudent = async (studentUsn) => {

    const student = await studentRepository.findStudentByUSN(studentUsn);

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    await studentRepository.deleteStudent(studentUsn);

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

    // Provision a login account + send credentials email for every student
    // just inserted. Run sequentially and never let an individual email
    // failure abort the batch — provisionLoginAccount already contains its
    // own error handling for the email step.
    const { provisionLoginAccount } = require("../../shared/utils/userAccount.util");

    let accountsCreated = 0;
    let emailsSent = 0;

    for (const student of insertedStudents) {
        // eslint-disable-next-line no-await-in-loop
        const result = await provisionLoginAccount({
            name: student.name,
            email: student.email,
            role: "STUDENT",
            studentId: student.student_id
        });

        if (result.created) {
            accountsCreated += 1;
            if (result.emailSent) emailsSent += 1;
        }
    }

    return {
        count: insertedStudents.length,
        students: insertedStudents,
        accountsCreated,
        emailsSent
    };
};

const getStudentExams = async (studentId) => {

    const student = await studentRepository.findStudentById(studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    // Reuses the same venue/seat-resolving logic the admit card PDF uses,
    // so the student portal's Timetable and Venue & Seat pages get
    // identical, correct data.
    const admitcardService = require("../admitcard_mng/admitcard.service");
    return await admitcardService.getStudentExamScheduleForAdmitCard(student);
};

const getStudentAttendance = async (studentId) => {

    const student = await studentRepository.findStudentById(studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const Attendance = require("../attendance_mng/attendance.model");
    const Exam = require("../exam_mng/exam.model");
    const Subject = require("../subject_mng/subject.model");

    const records = await Attendance.findAll({
        where: { student_id: studentId },
        include: [{
            model: Exam,
            include: [{ model: Subject, attributes: ["subject_name", "subject_code"] }]
        }]
    });

    return records.map((record) => ({
        exam_id: record.exam_id,
        subject_name: record.Exam?.Subject?.subject_name,
        subject_code: record.Exam?.Subject?.subject_code,
        exam_date: record.Exam?.exam_date,
        status: record.status || "NOT MARKED"
    }));
};

module.exports = {
    addStd,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    bulkUploadStudents,
    getStudentExams,
    getStudentAttendance
};
