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
    FaSearch,
    FaClock,
    FaExclamationTriangle,
    FaCheckCircle
} from "react-icons/fa";


export default function EncargadoTasks() {

    const navigate = useNavigate();


    // =====================================================
    // USUARIO LOGUEADO
    // =====================================================

    const token =
        localStorage.getItem("token");

    const userStorage =
        localStorage.getItem("user");


    let user = {};


    try {

        user =
            JSON.parse(
                userStorage || "{}"
            );

    } catch (error) {

        console.error(
            "Error leyendo usuario:",
            error
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");

        return null;

    }


    // =====================================================
    // ESTADOS
    // =====================================================

    const [tasks, setTasks] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);


    // =====================================================
    // OBTENER TAREAS
    // =====================================================

    const getTasks = async () => {

        try {

            if (!token) {

                navigate("/");

                return;

            }


            const response =
                await axios.get(
                    `${API}/tasks`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            console.log(
                "📋 TAREAS RECIBIDAS:",
                response.data
            );


            /*
             * IMPORTANTE:
             *
             * El backend ya devuelve únicamente
             * las tareas de los proyectos asignados
             * al Encargado.
             *
             * Por eso NO debemos hacer:
             *
             * task.user_id === user.id
             *
             * porque user_id representa quién creó
             * la tarea, no quién tiene asignado
             * el proyecto.
             */


            const receivedTasks =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            setTasks(receivedTasks);


        } catch (error) {

            console.error(
                "❌ ERROR OBTENIENDO TAREAS:",
                error
            );


            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {

                localStorage.removeItem("token");

                localStorage.removeItem("user");

                navigate("/");

                return;

            }

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // CARGAR TAREAS AL ENTRAR
    // =====================================================

    useEffect(() => {

        getTasks();

    }, []);


    // =====================================================
    // CERRAR SESIÓN
    // =====================================================

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/");

    };


    // =====================================================
    // BUSCAR TAREAS
    // =====================================================

    const filteredTasks =
        tasks.filter((task) => {

            const texto =
                search
                    .toLowerCase()
                    .trim();


            if (!texto) {

                return true;

            }


            return (

                task.titulo
                    ?.toLowerCase()
                    .includes(texto)

                ||

                task.responsable
                    ?.toLowerCase()
                    .includes(texto)

                ||

                task.proyecto
                    ?.toLowerCase()
                    .includes(texto)

                ||

                task.estado
                    ?.toLowerCase()
                    .includes(texto)

            );

        });


    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

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


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (

        <div className="flex min-h-screen bg-slate-100">


            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside className="w-72 bg-slate-900 text-white flex flex-col">


                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="p-8 border-b border-slate-700">

                    <h1 className="text-4xl font-black tracking-wide text-blue-400">

                        INGETEC

                    </h1>

                    <p className="text-sm text-slate-400 mt-2">

                        Panel del Encargado

                    </p>

                </div>


                {/* =================================================
                    MENÚ
                ================================================= */}

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


                    {/* MIS TAREAS */}

                    <Link
                        to="/encargado/tareas"
                        className="flex items-center gap-4 px-8 py-4 bg-blue-700"
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


                {/* =================================================
                    CERRAR SESIÓN
                ================================================= */}

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


            {/* =====================================================
                CONTENIDO PRINCIPAL
            ===================================================== */}

            <main className="flex-1">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="bg-white shadow-sm px-10 py-6 flex justify-between items-center">


                    <div>

                        <h2 className="text-3xl font-bold text-slate-800">

                            Mis Tareas

                        </h2>

                        <p className="text-gray-500 mt-1">

                            Consulta y supervisa las tareas asignadas.

                        </p>

                    </div>


                    {/* =================================================
                        USUARIO
                    ================================================= */}

                    <div className="flex items-center gap-4">

                        <div className="text-right">

                            <p className="font-bold text-slate-800">

                                {user.nombres || ""}{" "}

                                {user.apellidos || ""}

                            </p>

                            <p className="text-sm text-gray-500">

                                {user.cargo || "Encargado"}

                            </p>

                        </div>


                        <div className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold">

                            {user.nombres
                                ?.charAt(0)
                                ?.toUpperCase() || "E"}

                        </div>

                    </div>


                </header>


                {/* =================================================
                    CONTENIDO
                ================================================= */}

                <div className="p-10">


                    <div className="bg-white rounded-3xl shadow-xl p-8">


                        {/* =================================================
                            TÍTULO
                        ================================================= */}

                        <div className="flex justify-between items-center mb-8">

                            <div>

                                <h1 className="text-3xl font-bold text-slate-800">

                                    Mis Tareas

                                </h1>

                                <p className="text-gray-500 mt-1">

                                    Tareas de los proyectos asignados.

                                </p>

                            </div>


                            <div className="bg-purple-100 text-purple-700 px-5 py-3 rounded-xl font-bold">

                                {tasks.length}{" "}

                                {tasks.length === 1
                                    ? "tarea"
                                    : "tareas"}

                            </div>

                        </div>


                        {/* =================================================
                            ESTADÍSTICAS
                        ================================================= */}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">


                            {/* PENDIENTES */}

                            <div className="border rounded-2xl p-5">

                                <div className="flex justify-between">

                                    <div>

                                        <p className="text-gray-500">

                                            Pendientes

                                        </p>

                                        <p className="text-3xl font-bold text-yellow-500 mt-2">

                                            {pendientes}

                                        </p>

                                    </div>

                                    <FaClock className="text-3xl text-yellow-500" />

                                </div>

                            </div>


                            {/* EN PROCESO */}

                            <div className="border rounded-2xl p-5">

                                <div className="flex justify-between">

                                    <div>

                                        <p className="text-gray-500">

                                            En proceso

                                        </p>

                                        <p className="text-3xl font-bold text-orange-500 mt-2">

                                            {enProceso}

                                        </p>

                                    </div>

                                    <FaExclamationTriangle className="text-3xl text-orange-500" />

                                </div>

                            </div>


                            {/* COMPLETADAS */}

                            <div className="border rounded-2xl p-5">

                                <div className="flex justify-between">

                                    <div>

                                        <p className="text-gray-500">

                                            Completadas

                                        </p>

                                        <p className="text-3xl font-bold text-green-600 mt-2">

                                            {completadas}

                                        </p>

                                    </div>

                                    <FaCheckCircle className="text-3xl text-green-600" />

                                </div>

                            </div>


                        </div>


                        {/* =================================================
                            BUSCADOR
                        ================================================= */}

                        <div className="relative mb-8">

                            <FaSearch
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    transform
                                    -translate-y-1/2
                                    text-gray-400
                                "
                            />

                            <input
                                type="text"
                                placeholder="Buscar tarea..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    border
                                    border-gray-200
                                    rounded-xl
                                    py-4
                                    pl-12
                                    pr-4
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    text-black
                                "
                            />

                        </div>


                        {/* =================================================
                            CARGANDO
                        ================================================= */}

                        {loading ? (

                            <div className="text-center py-12">

                                <p className="text-gray-500">

                                    Cargando tareas...

                                </p>

                            </div>


                        ) : filteredTasks.length === 0 ? (

                            /* =================================================
                               SIN TAREAS
                            ================================================= */

                            <div className="text-center py-14">

                                <FaTasks
                                    className="
                                        mx-auto
                                        text-5xl
                                        text-gray-300
                                        mb-4
                                    "
                                />

                                <h3 className="text-xl font-bold text-gray-600">

                                    No tienes tareas asignadas

                                </h3>

                                <p className="text-gray-400 mt-2">

                                    Las tareas de tus proyectos aparecerán aquí.

                                </p>

                            </div>


                        ) : (

                            /* =================================================
                               TABLA
                            ================================================= */

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>

                                        <tr className="border-b">

                                            <th className="text-left p-4">

                                                ID

                                            </th>

                                            <th className="text-left p-4">

                                                Tarea

                                            </th>

                                            <th className="text-left p-4">

                                                Proyecto

                                            </th>

                                            <th className="text-center p-4">

                                                Responsable

                                            </th>

                                            <th className="text-center p-4">

                                                Estado

                                            </th>

                                            <th className="text-center p-4">

                                                Fecha

                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredTasks.map(
                                            (task) => (

                                                <tr
                                                    key={task.id}
                                                    className="border-b hover:bg-slate-50"
                                                >

                                                    {/* ID */}

                                                    <td className="p-4">

                                                        {task.id}

                                                    </td>


                                                    {/* TAREA */}

                                                    <td className="p-4 font-medium">

                                                        {task.titulo}

                                                    </td>


                                                    {/* PROYECTO */}

                                                    <td className="p-4">

                                                        {task.proyecto ||
                                                            "Sin proyecto"}

                                                    </td>


                                                    {/* RESPONSABLE */}

                                                    <td className="p-4 text-center">

                                                        {task.responsable}

                                                    </td>


                                                    {/* ESTADO */}

                                                    <td className="p-4 text-center">

                                                        <span
                                                            className={`
                                                                px-3
                                                                py-1
                                                                rounded-full
                                                                text-sm
                                                                font-medium

                                                                ${
                                                                    task.estado === "Completada"

                                                                        ? "bg-green-100 text-green-700"

                                                                        : task.estado === "En proceso"

                                                                            ? "bg-orange-100 text-orange-700"

                                                                            : "bg-yellow-100 text-yellow-700"
                                                                }
                                                            `}
                                                        >

                                                            {task.estado}

                                                        </span>

                                                    </td>


                                                    {/* FECHA */}

                                                    <td className="p-4 text-center">

                                                        {task.fecha
                                                            ? String(task.fecha)
                                                                .split("T")[0]
                                                            : "-"}

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </div>

            </main>

        </div>

    );

}