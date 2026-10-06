import {
    useEffect,
    useState
} from "react";

import axios from "axios";
import API from "../config/api";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    FaHome,
    FaProjectDiagram,
    FaTasks,
    FaUsers,
    FaBell,
    FaSignOutAlt,
    FaClipboardList,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle
} from "react-icons/fa";


export default function Encargado() {

    const navigate = useNavigate();

    // =====================================
    // USUARIO LOGUEADO
    // =====================================

    const userStorage = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    let user = {};

    try {

        user = JSON.parse(userStorage || "{}");

    } catch (error) {

        console.log("Error leyendo usuario:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");

    }


    // =====================================
    // ESTADOS
    // =====================================

    const [projects, setProjects] = useState([]);

    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);


    // =====================================
    // OBTENER INFORMACIÓN
    // =====================================

    const getData = async () => {

        if (!token || !user?.id) {

            setLoading(false);

            return;

        }

        try {

            const config = {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            };


            const [
                projectsResponse,
                tasksResponse
            ] = await Promise.all([

                axios.get(
                    `${API}/projects`,
                    config
                ),

                axios.get(
                    `${API}/tasks`,
                    config
                )

            ]);


            const allProjects =
                projectsResponse.data || [];


            const allTasks =
                tasksResponse.data || [];


            // =====================================
            // SOLO INFORMACIÓN DEL ENCARGADO
            // =====================================

            const myProjects =
                allProjects.filter(

                    (project) =>
                        Number(project.user_id) ===
                        Number(user.id)

                );


            const myTasks =
                allTasks.filter(

                    (task) =>
                        Number(task.user_id) ===
                        Number(user.id)

                );


            setProjects(myProjects);

            setTasks(myTasks);


        } catch (error) {

            console.log(
                "Error obteniendo información:",
                error
            );


            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {

                localStorage.removeItem("token");

                localStorage.removeItem("user");

                navigate("/");

            }

        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // CARGAR DATOS
    // =====================================

    useEffect(() => {

        getData();

    }, []);


    // =====================================
    // CERRAR SESIÓN
    // =====================================

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/");

    };


    // =====================================
    // ESTADÍSTICAS
    // =====================================

    const pendientes =

        tasks.filter(

            (task) =>
                task.estado === "Pendiente"

        ).length;


    const enProceso =

        tasks.filter(

            (task) =>
                task.estado === "En proceso"

        ).length;


    const completadas =

        tasks.filter(

            (task) =>
                task.estado === "Completada"

        ).length;


    // =====================================
    // INTERFAZ
    // =====================================

    return (

        <div className="flex min-h-screen bg-slate-100">


            {/* =====================================
                SIDEBAR
            ===================================== */}

            <aside className="w-72 bg-slate-900 text-white flex flex-col">


                {/* LOGO */}

                <div className="p-8 border-b border-slate-700">

                    <h1 className="text-4xl font-black tracking-wide text-blue-400">

                        INGETEC

                    </h1>

                    <p className="text-sm text-slate-400 mt-2">

                        Panel del Encargado

                    </p>

                </div>


                {/* MENÚ */}

                <nav className="flex-1 mt-6">


                    {/* INICIO */}

                    <Link
                        to="/encargado"
                        className="flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition"
                    >

                        <FaHome className="text-xl" />

                        <span className="font-medium">

                            Inicio

                        </span>

                    </Link>


                    {/* MIS PROYECTOS */}

                    <Link
                        to="/encargado/proyectos"
                        className="flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition"
                    >

                        <FaProjectDiagram className="text-xl" />

                        <span className="font-medium">

                            Mis Proyectos

                        </span>

                    </Link>


                    {/* =====================================
                        MIS TAREAS
                        IMPORTANTE:
                        NO usar /tasks
                    ===================================== */}

                    <Link
                        to="/encargado/tareas"
                        className="flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition"
                    >

                        <FaTasks className="text-xl" />

                        <span className="font-medium">

                            Mis Tareas

                        </span>

                    </Link>


                    {/* PERSONAL */}

                    <Link
                        to="/personal"
                        className="flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition"
                    >

                        <FaUsers className="text-xl" />

                        <span className="font-medium">

                            Personal

                        </span>

                    </Link>


                    {/* NOTIFICACIONES */}

                    <button
                        type="button"
                        className="w-full flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition text-left"
                    >

                        <FaBell className="text-xl" />

                        <span className="font-medium">

                            Notificaciones

                        </span>

                    </button>


                </nav>


                {/* CERRAR SESIÓN */}

                <div className="border-t border-slate-700 p-6">

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 py-3 rounded-xl transition"
                    >

                        <FaSignOutAlt />

                        Cerrar sesión

                    </button>

                </div>


            </aside>


            {/* =====================================
                CONTENIDO
            ===================================== */}

            <main className="flex-1">


                {/* =====================================
                    HEADER
                ===================================== */}

                <header className="bg-white shadow-sm px-10 py-6 flex justify-between items-center">


                    <div>

                        <h2 className="text-3xl font-bold text-slate-800">

                            Panel del Encargado

                        </h2>

                        <p className="text-gray-500 mt-1">

                            Gestión y seguimiento de tus proyectos y tareas.

                        </p>

                    </div>


                    {/* USUARIO */}

                    <div className="flex items-center gap-4">


                        <div className="text-right">

                            <p className="font-bold text-slate-800">

                                {user.nombres} {user.apellidos}

                            </p>

                            <p className="text-sm text-gray-500">

                                {user.cargo || "Encargado"}

                            </p>

                        </div>


                        <div className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold">

                            {user.nombres?.charAt(0)?.toUpperCase() || "E"}

                        </div>


                    </div>


                </header>


                {/* =====================================
                    CONTENIDO PRINCIPAL
                ===================================== */}

                <div className="p-10">


                    {/* BIENVENIDA */}

                    <div className="bg-blue-700 text-white rounded-3xl p-8 shadow-xl mb-8">

                        <h1 className="text-3xl font-bold">

                            ¡Bienvenido, {user.nombres}! 👋

                        </h1>

                        <p className="mt-2 text-blue-100 text-lg">

                            Desde aquí puedes gestionar tus proyectos,
                            supervisar tus tareas y coordinar con el personal.

                        </p>

                    </div>


                    {/* =====================================
                        TARJETAS
                    ===================================== */}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">


                        {/* PROYECTOS */}

                        <div className="bg-white rounded-2xl shadow-lg p-6">

                            <div className="flex justify-between items-center">

                                <div>

                                    <p className="text-gray-500">

                                        Mis Proyectos

                                    </p>

                                    <h3 className="text-4xl font-bold text-blue-700 mt-2">

                                        {projects.length}

                                    </h3>

                                </div>

                                <FaProjectDiagram className="text-4xl text-blue-600" />

                            </div>

                        </div>


                        {/* TAREAS */}

                        <div className="bg-white rounded-2xl shadow-lg p-6">

                            <div className="flex justify-between items-center">

                                <div>

                                    <p className="text-gray-500">

                                        Mis Tareas

                                    </p>

                                    <h3 className="text-4xl font-bold text-purple-600 mt-2">

                                        {tasks.length}

                                    </h3>

                                </div>

                                <FaClipboardList className="text-4xl text-purple-600" />

                            </div>

                        </div>


                        {/* PENDIENTES */}

                        <div className="bg-white rounded-2xl shadow-lg p-6">

                            <div className="flex justify-between items-center">

                                <div>

                                    <p className="text-gray-500">

                                        Pendientes

                                    </p>

                                    <h3 className="text-4xl font-bold text-yellow-500 mt-2">

                                        {pendientes}

                                    </h3>

                                </div>

                                <FaClock className="text-4xl text-yellow-500" />

                            </div>

                        </div>


                        {/* COMPLETADAS */}

                        <div className="bg-white rounded-2xl shadow-lg p-6">

                            <div className="flex justify-between items-center">

                                <div>

                                    <p className="text-gray-500">

                                        Completadas

                                    </p>

                                    <h3 className="text-4xl font-bold text-green-600 mt-2">

                                        {completadas}

                                    </h3>

                                </div>

                                <FaCheckCircle className="text-4xl text-green-600" />

                            </div>

                        </div>


                    </div>


                    {/* =====================================
                        MIS PROYECTOS
                    ===================================== */}

                    <div className="bg-white rounded-3xl shadow-xl mt-10 p-8">


                        <div className="flex justify-between items-center mb-6">

                            <div>

                                <h2 className="text-2xl font-bold">

                                    Mis Proyectos

                                </h2>

                                <p className="text-gray-500">

                                    Proyectos bajo tu responsabilidad.

                                </p>

                            </div>


                            <Link
                                to="/encargado/proyectos"
                                className="bg-blue-700 text-white px-5 py-2 rounded-xl hover:bg-blue-800"
                            >

                                Ver proyectos

                            </Link>


                        </div>


                        {loading ? (

                            <p className="text-gray-500">

                                Cargando proyectos...

                            </p>

                        ) : projects.length === 0 ? (

                            <div className="text-center py-10 text-gray-500">

                                <FaProjectDiagram className="mx-auto text-4xl mb-3 text-gray-300" />

                                <p>

                                    No tienes proyectos asignados actualmente.

                                </p>

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>

                                        <tr className="border-b">

                                            <th className="text-left py-4">

                                                Proyecto

                                            </th>

                                            <th className="text-center">

                                                Estado

                                            </th>

                                            <th className="text-center">

                                                Fecha

                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {projects
                                            .slice(0, 5)
                                            .map((project) => (

                                                <tr
                                                    key={project.id}
                                                    className="border-b hover:bg-slate-50"
                                                >

                                                    <td className="py-4 font-medium">

                                                        {project.nombre}

                                                    </td>

                                                    <td className="text-center">

                                                        {project.estado}

                                                    </td>

                                                    <td className="text-center">

                                                        {project.fecha}

                                                    </td>

                                                </tr>

                                            ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>


                    {/* =====================================
                        MIS TAREAS
                    ===================================== */}

                    <div className="bg-white rounded-3xl shadow-xl mt-8 p-8">


                        <div className="flex justify-between items-center mb-6">

                            <div>

                                <h2 className="text-2xl font-bold">

                                    Mis Tareas

                                </h2>

                                <p className="text-gray-500">

                                    Seguimiento de las tareas que tienes bajo tu responsabilidad.

                                </p>

                            </div>


                            <Link
                                to="/encargado/tareas"
                                className="bg-blue-700 text-white px-5 py-2 rounded-xl hover:bg-blue-800"
                            >

                                Ver tareas

                            </Link>

                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


                            {/* PENDIENTES */}

                            <div className="border rounded-2xl p-5">

                                <FaClock className="text-yellow-500 text-3xl mb-3" />

                                <p className="text-gray-500">

                                    Pendientes

                                </p>

                                <p className="text-3xl font-bold">

                                    {pendientes}

                                </p>

                            </div>


                            {/* EN PROCESO */}

                            <div className="border rounded-2xl p-5">

                                <FaExclamationTriangle className="text-orange-500 text-3xl mb-3" />

                                <p className="text-gray-500">

                                    En proceso

                                </p>

                                <p className="text-3xl font-bold">

                                    {enProceso}

                                </p>

                            </div>


                            {/* COMPLETADAS */}

                            <div className="border rounded-2xl p-5">

                                <FaCheckCircle className="text-green-600 text-3xl mb-3" />

                                <p className="text-gray-500">

                                    Completadas

                                </p>

                                <p className="text-3xl font-bold">

                                    {completadas}

                                </p>

                            </div>


                        </div>

                    </div>


                </div>


            </main>


        </div>

    );

}