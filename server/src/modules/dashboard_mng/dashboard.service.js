const { Op } = require("sequelize");

const authRepository = require("../auth/auth.repository");
const studentRepository = require("../std_mng/students.repository");
const staffRepository = require("../staff_mng/staff.repository");
const dutyService = require("../duty_mng/duty.service");

// ---------- Admin ----------

const getAdminDashboard = async () => {
    const Student = require("../std_mng/students.model");
    const Staff = require("../staff_mng/staff.model");
    const Department = require("../dept_mng/department.model");
    const Room = require("../room_mng/room.model");
    const Exam = require("../exam_mng/exam.model");
    const Subject = require("../subject_mng/subject.model");
    const RoomAllocation = require("../allocation_mng/allocation.model");
    const StaffDuty = require("../duty_mng/duty.model");
    const Issue = require("../issue_mng/issue.model");

    const today = new Date().toISOString().slice(0, 10);

    const [totalStudents, totalStaff, totalDepartments, totalRooms, upcomingExams, activeIssues] = await Promise.all([
        Student.count(),
        Staff.count(),
        Department.count(),
        Room.count(),
        Exam.count({ where: { exam_date: { [Op.gte]: today }, status: "SCHEDULED" } }),
        Issue.count({ where: { status: { [Op.ne]: "RESOLVED" } } })
    ]);

    // Students by department
    const allStudents = await Student.findAll({ attributes: ["department"] });
    const deptCounts = {};
    allStudents.forEach((s) => { deptCounts[s.department] = (deptCounts[s.department] || 0) + 1; });
    const studentsByDepartment = Object.entries(deptCounts).map(([department, count]) => ({ department, count }));

    // Hall utilization
    const rooms = await Room.findAll();
    const allocations = await RoomAllocation.findAll();
    const allocatedByRoom = {};
    allocations.forEach((a) => { allocatedByRoom[a.room_id] = (allocatedByRoom[a.room_id] || 0) + a.student_count; });
    const hallUtilization = rooms.slice(0, 10).map((r) => ({
        room: r.room_number,
        capacity: r.capacity,
        allocated: allocatedByRoom[r.room_id] || 0
    }));

    // Staff workload
    const duties = await StaffDuty.findAll({ include: [{ model: Staff, attributes: ["name"] }] });
    const workloadByStaff = {};
    duties.forEach((d) => {
        const name = d.Staff?.name || "Unknown";
        workloadByStaff[name] = (workloadByStaff[name] || 0) + 1;
    });
    const staffWorkload = Object.entries(workloadByStaff)
        .map(([name, count]) => ({ name, duties: count }))
        .sort((a, b) => b.duties - a.duties)
        .slice(0, 10);

    // Recent/upcoming exams
    const recentExamRows = await Exam.findAll({
        where: { exam_date: { [Op.gte]: today } },
        include: [{ model: Subject, attributes: ["subject_name"] }],
        order: [["exam_date", "ASC"]],
        limit: 8
    });
    const recentExams = recentExamRows.map((e) => ({
        exam_id: e.exam_id,
        subject_name: e.Subject?.subject_name,
        exam_date: e.exam_date,
        start_time: e.start_time,
        department: e.department,
        status: e.status
    }));

    return {
        totalStudents,
        totalStaff,
        totalDepartments,
        totalRooms,
        upcomingExams,
        activeIssues,
        studentsByDepartment,
        hallUtilization,
        staffWorkload,
        recentExams
    };
};

// ---------- Staff ----------

const getStaffDashboard = async (userId) => {

    const todayDuty = await dutyService.getTodaysDutyForStaffUser(userId).catch(() => null);
    const allDuties = await dutyService.getMyDuties(userId, "all").catch(() => []);

    const today = new Date().toISOString().slice(0, 10);
    const upcomingDuties = allDuties
        .filter((d) => d.exam_date >= today)
        .slice(0, 6);

    const totalDuties = allDuties.length;
    const completedDuties = allDuties.filter((d) => d.status === "PRESENT").length;

    return {
        todayDuty,
        upcomingDuties,
        totalDuties,
        completedDuties
    };
};

// ---------- Student ----------

const getStudentDashboard = async (userId) => {

    const user = await authRepository.findUserById(userId);
    if (!user || !user.student_id) {
        return {
            upcomingExam: null,
            examsCount: 0,
            admitCardAvailable: false,
            unreadNotifications: 0
        };
    }

    const student = await studentRepository.findStudentById(user.student_id);

    const Exam = require("../exam_mng/exam.model");
    const Subject = require("../subject_mng/subject.model");
    const RoomAllocation = require("../allocation_mng/allocation.model");
    const Room = require("../room_mng/room.model");
    const Seat = require("../seating_mng/seat.model");
    const AdmitCard = require("../admitcard_mng/admitcard.model");
    const { Notification, NotificationRead } = require("../notification_mng/notification.model");

    const today = new Date().toISOString().slice(0, 10);

    const exams = await Exam.findAll({
        where: { department: student.department, semester: student.semester },
        include: [{ model: Subject, attributes: ["subject_name", "subject_code"] }],
        order: [["exam_date", "ASC"]]
    });

    const examsCount = exams.length;
    const upcomingExamRow = exams.find((e) => e.exam_date >= today);

    let upcomingExam = null;

    if (upcomingExamRow) {
        const seat = await Seat.findOne({
            where: { student_id: student.student_id },
            include: [{
                model: RoomAllocation,
                where: { exam_id: upcomingExamRow.exam_id },
                include: [{ model: Room, attributes: ["room_number", "building"] }]
            }]
        }).catch(() => null);

        upcomingExam = {
            subject_name: upcomingExamRow.Subject?.subject_name,
            subject_code: upcomingExamRow.Subject?.subject_code,
            exam_date: upcomingExamRow.exam_date,
            start_time: upcomingExamRow.start_time,
            end_time: upcomingExamRow.end_time,
            building: seat?.RoomAllocation?.Room?.building || null,
            room_number: seat?.RoomAllocation?.Room?.room_number || null,
            seat_number: seat?.seat_number || null
        };
    }

    const admitCard = await AdmitCard.findByPk(student.student_id);
    const admitCardAvailable = admitCard?.admit_card_status === "READY";

    const notifications = await Notification.findAll({ where: { audience: { [Op.in]: ["ALL", "STUDENTS"] } } });
    const reads = await NotificationRead.findAll({ where: { user_id: userId } });
    const readIds = new Set(reads.map((r) => r.notification_id));
    const unreadNotifications = notifications.filter((n) => !readIds.has(n.notification_id)).length;

    return {
        upcomingExam,
        examsCount,
        admitCardAvailable,
        unreadNotifications
    };
};

module.exports = {
    getAdminDashboard,
    getStaffDashboard,
    getStudentDashboard
};
