import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

// =====================================
// PÁGINAS DEL ADMINISTRADOR
// =====================================

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import Tasks from "../pages/Tasks";
import Reports from "../pages/Reports";
import Usuarios from "../pages/Usuarios";

// =====================================
// PÁGINAS DEL ENCARGADO
// =====================================

import Encargado from "../pages/Encargado";
import Personal from "../pages/Personal";
import EncargadoProjects from "../pages/EncargadoProjects";
import EncargadoTasks from "../pages/EncargadoTasks";


function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>


                {/* =====================================================
                    LOGIN
                ===================================================== */}

                <Route
                    path="/"
                    element={<Login />}
                />


                {/* =====================================================
                    ================= ADMINISTRADOR =====================
                ===================================================== */}


                {/* -------------------------------------
                    DASHBOARD
                    SOLO ADMINISTRADOR
                ------------------------------------- */}

                <Route
                    path="/dashboard"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Administrador"]}
                        >

                            <Dashboard />

                        </ProtectedRoute>

                    }
                />


                {/* -------------------------------------
                    PROYECTOS
                    SOLO ADMINISTRADOR
                ------------------------------------- */}

                <Route
                    path="/projects"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Administrador"]}
                        >

                            <Projects />

                        </ProtectedRoute>

                    }
                />


                {/* -------------------------------------
                    TAREAS
                    SOLO ADMINISTRADOR
                ------------------------------------- */}

                <Route
                    path="/tasks"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Administrador"]}
                        >

                            <Tasks />

                        </ProtectedRoute>

                    }
                />


                {/* -------------------------------------
                    REPORTES
                    SOLO ADMINISTRADOR
                ------------------------------------- */}

                <Route
                    path="/reports"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Administrador"]}
                        >

                            <Reports />

                        </ProtectedRoute>

                    }
                />


                {/* -------------------------------------
                    USUARIOS
                    SOLO ADMINISTRADOR
                ------------------------------------- */}

                <Route
                    path="/usuarios"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Administrador"]}
                        >

                            <Usuarios />

                        </ProtectedRoute>

                    }
                />


                {/* =====================================================
                    ===================== ENCARGADO =====================
                ===================================================== */}


                {/* -------------------------------------
                    PANEL PRINCIPAL
                ------------------------------------- */}

                <Route
                    path="/encargado"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Encargado"]}
                        >

                            <Encargado />

                        </ProtectedRoute>

                    }
                />


                {/* -------------------------------------
                    MIS PROYECTOS
                ------------------------------------- */}

                <Route
                    path="/encargado/proyectos"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Encargado"]}
                        >

                            <EncargadoProjects />

                        </ProtectedRoute>

                    }
                />


                {/* -------------------------------------
                    MIS TAREAS
                ------------------------------------- */}

                <Route
                    path="/encargado/tareas"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Encargado"]}
                        >

                            <EncargadoTasks />

                        </ProtectedRoute>

                    }
                />


                {/* -------------------------------------
                    PERSONAL
                ------------------------------------- */}

                <Route
                    path="/personal"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Encargado"]}
                        >

                            <Personal />

                        </ProtectedRoute>

                    }
                />


                {/* =====================================================
                    RUTA NO ENCONTRADA
                ===================================================== */}

                <Route
                    path="*"
                    element={<Login />}
                />


            </Routes>

        </BrowserRouter>

    );

}


export default AppRoutes;