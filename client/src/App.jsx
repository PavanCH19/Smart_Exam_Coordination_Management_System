import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PortalLayout from "./components/PortalLayout";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentManagement from "./pages/StudentManagement";
import StaffManagement from "./pages/StaffManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import CourseManagement from "./pages/CourseManagement";
import SubjectManagement from "./pages/SubjectManagement";
import RoomManagement from "./pages/RoomManagement";
import ExamManagement from "./pages/ExamManagement";
import TimetableManagement from "./pages/TimetableManagement";
import AllocationManagement from "./pages/AllocationManagement";
import SeatingManagement from "./pages/SeatingManagement";
import AdmitCardManagement from "./pages/AdmitCardManagement";
import AttendanceManagement from "./pages/AttendanceManagement";
import AdminNotifications from "./pages/AdminNotifications";
import AdminIssues from "./pages/AdminIssues";
import AdminReports from "./pages/AdminReports";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminUsers from "./pages/AdminUsers";
import ChangePassword from "./pages/ChangePassword";
import StaffDuties from "./pages/StaffDuties";
import StaffAttendance from "./pages/StaffAttendance";
import StaffIssues from "./pages/StaffIssues";
import StaffNotifications from "./pages/StaffNotifications";
import StudentTimetable from "./pages/StudentTimetable";
import StudentAdmitCard from "./pages/StudentAdmitCard";
import StudentVenueSeat from "./pages/StudentVenueSeat";
import StudentNotifications from "./pages/StudentNotifications";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
          <Route element={<PortalLayout title="Admin Control Centre" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentManagement />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/departments" element={<DepartmentManagement />} />
            <Route path="/admin/courses" element={<CourseManagement />} />
            <Route path="/admin/subjects" element={<SubjectManagement />} />
            <Route path="/admin/rooms" element={<RoomManagement />} />
            <Route path="/admin/exams" element={<ExamManagement />} />
            <Route path="/admin/timetable" element={<TimetableManagement />} />
            <Route path="/admin/allocations" element={<AllocationManagement />} />
            <Route path="/admin/seating" element={<SeatingManagement />} />
            <Route path="/admin/admit-cards" element={<AdmitCardManagement />} />
            <Route path="/admin/attendance" element={<AttendanceManagement />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/issues" element={<AdminIssues />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/change-password" element={<ChangePassword />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute roles={["STAFF"]} />}>
          <Route element={<PortalLayout title="Staff Portal" />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/duties" element={<StaffDuties />} />
            <Route path="/staff/attendance" element={<StaffAttendance />} />
            <Route path="/staff/issues" element={<StaffIssues />} />
            <Route path="/staff/notifications" element={<StaffNotifications />} />
            <Route path="/staff/change-password" element={<ChangePassword />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
          <Route element={<PortalLayout title="Student Portal" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/timetable" element={<StudentTimetable />} />
            <Route path="/student/admit-card" element={<StudentAdmitCard />} />
            <Route path="/student/venue-seat" element={<StudentVenueSeat />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
            <Route path="/student/change-password" element={<ChangePassword />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
