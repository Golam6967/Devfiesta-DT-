// PBL module routes, nested under /pbl/* in the main app router
import React from "react";
import { Routes, Route } from 'react-router-dom';
import Loginpage from '../Pages/loginPage';
import ProjectDashboard from '../Pages/ProjectDashboard.jsx';
import SupervisorDashboard from "../Pages/SupervisorDashboard";
import StudentPersonal from "../Pages/StudentPersonal";
import Spladmin from "../Pages/SPLAdminPage";
import Evaluator from "../Pages/evaluatorPage";
import HostPBL from "../Pages/HostPBL";

function PblRoutes() {
    return (
        <Routes>
            <Route path="" element={<Loginpage />} />
            <Route path="login" element={<Loginpage />} />
            <Route path="host" element={<HostPBL />} />
            <Route path="supervisor-dashboard" element={<SupervisorDashboard />} />
            <Route path="project-dashboard" element={<ProjectDashboard />} />
            <Route path="student-personal" element={<StudentPersonal />} />
            <Route path="SPLadmin" element={<Spladmin />} />
            <Route path="Eval" element={<Evaluator />} />
        </Routes>
    );
}

export default PblRoutes;
