import {
  useEffect,
  useState,
  useContext
} from "react";

import {
  useNavigate
} from "react-router-dom";

import axios from "axios";

import {
  FaProjectDiagram,
  FaTasks,
  FaChartBar
} from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import {
  ThemeContext
} from "../context/ThemeContext";

import Sidebar from "../components/Sidebar";

function Dashboard() {

  const navigate = useNavigate();

  const {
    darkMode,
    setDarkMode
  } = useContext(ThemeContext);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [stats, setStats] = useState({

    proyectos: 0,

    tareas: 0,

    reportes: 0,

    pendientes: 0,

    retrasadas: 0,

    proyectosRetrasados: 0

  });

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/");

  };

  // =========================
  // OBTENER ESTADÍSTICAS
  // =========================

  const getStats = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:3000/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStats(response.data);

    } catch (error) {

      console.log(
        "Error obteniendo estadísticas:",
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

    }

  };

  useEffect(() => {

    getStats();

  }, []);

  // =========================
  // DATOS DEL GRÁFICO
  // =========================

  const chartData = [

    {
      nombre: "Proyectos",
      total: stats.proyectos
    },

    {
      nombre: "Tareas",
      total: stats.tareas
    },

    {
      nombre: "Pendientes",
      total: stats.pendientes
    },

    {
      nombre: "Retrasadas",
      total: stats.retrasadas
    }

  ];

  return (

    <div className="flex min-h-screen">

      {/* =========================
          SIDEBAR
      ========================= */}

      <Sidebar />

      {/* =========================
          CONTENIDO PRINCIPAL
      ========================= */}

      <div
        className={`
          flex-1 p-5 md:p-10
          transition-all duration-300
          ${
            darkMode
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-black"
          }
        `}
      >

        {/* =========================
            TOPBAR
        ========================= */}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">

          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            className="bg-gray-800 text-white px-5 py-2 rounded-xl"
          >

            {darkMode
              ? "☀️ Modo Claro"
              : "🌙 Modo Oscuro"
            }

          </button>

          <button
            onClick={logout}
            className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700"
          >

            Cerrar Sesión

          </button>

        </div>

        {/* =========================
            TÍTULO
        ========================= */}

        <h2
          className={`
            text-3xl md:text-4xl
            font-bold
            text-center md:text-left
            ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }
          `}
        >

          Panel Administrativo

        </h2>

        <p className="text-gray-500 mt-2">

          Bienvenido:

          <span className="font-bold ml-2">

            {user?.email}

          </span>

        </p>

        {/* =========================
            ALERTA PENDIENTES
        ========================= */}

        {stats.pendientes > 0 && (

          <div className="bg-yellow-100 border-l-8 border-yellow-500 text-yellow-700 p-5 rounded-xl mt-6 mb-8">

            <h3 className="text-2xl font-bold">

              ⚠ Tareas Pendientes

            </h3>

            <p className="mt-2 text-lg">

              Existen {stats.pendientes}
              tareas pendientes.

            </p>

          </div>

        )}

        {/* =========================
            ALERTA RETRASADAS
        ========================= */}

        {(
          stats.retrasadas > 0 ||
          stats.proyectosRetrasados > 0
        ) && (

          <div className="bg-red-100 border-l-8 border-red-600 text-red-700 p-5 rounded-xl mt-6 mb-8">

            <h3 className="text-2xl font-bold">

              ⚠{" "}

              {
                stats.proyectosRetrasados > 0
                  ? "Proyectos Retrasados"
                  : "Tareas Retrasadas"
              }

            </h3>

            <div className="mt-2 text-lg">

              {stats.proyectosRetrasados > 0 ? (

                <p>

                  Existen{" "}

                  {stats.proyectosRetrasados}

                  {" "}proyectos retrasados.

                </p>

              ) : (

                <p>

                  Existen{" "}

                  {stats.retrasadas}

                  {" "}tareas retrasadas.

                </p>

              )}

            </div>

          </div>

        )}

        {/* =========================
            TARJETAS
        ========================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

          {/* PROYECTOS */}

          <div
            className={`
              p-6 rounded-2xl shadow-xl
              hover:scale-105
              transition duration-300
              ${
                darkMode
                  ? "bg-gray-800"
                  : "bg-white"
              }
            `}
          >

            <div className="flex justify-between items-center">

              <div>

                <h3 className="text-xl font-bold">

                  Proyectos

                </h3>

                <p className="text-4xl mt-4 text-blue-700 font-bold">

                  {stats.proyectos}

                </p>

              </div>

              <FaProjectDiagram className="text-5xl text-blue-500" />

            </div>

          </div>

          {/* TAREAS */}

          <div
            className={`
              p-6 rounded-2xl shadow-xl
              hover:scale-105
              transition duration-300
              ${
                darkMode
                  ? "bg-gray-800"
                  : "bg-white"
              }
            `}
          >

            <div className="flex justify-between items-center">

              <div>

                <h3 className="text-xl font-bold">

                  Tareas

                </h3>

                <p className="text-4xl mt-4 text-green-600 font-bold">

                  {stats.tareas}

                </p>

              </div>

              <FaTasks className="text-5xl text-green-500" />

            </div>

          </div>

          {/* REPORTES */}

          <div
            className={`
              p-6 rounded-2xl shadow-xl
              hover:scale-105
              transition duration-300
              ${
                darkMode
                  ? "bg-gray-800"
                  : "bg-white"
              }
            `}
          >

            <div className="flex justify-between items-center">

              <div>

                <h3 className="text-xl font-bold">

                  Reportes

                </h3>

                <p className="text-4xl mt-4 text-purple-600 font-bold">

                  {stats.reportes}

                </p>

              </div>

              <FaChartBar className="text-5xl text-purple-500" />

            </div>

          </div>

        </div>

        {/* =========================
            GRÁFICO
        ========================= */}

        <div
          className={`
            p-8 rounded-2xl shadow-xl mt-10
            ${
              darkMode
                ? "bg-gray-800"
                : "bg-white"
            }
          `}
        >

          <h2
            className={`
              text-3xl font-bold mb-6
              ${
                darkMode
                  ? "text-white"
                  : "text-black"
              }
            `}
          >

            Estadísticas del Sistema

          </h2>

          <ResponsiveContainer
            width="100%"
            height={400}
          >

            <BarChart data={chartData}>

              <XAxis
                dataKey="nombre"
                stroke={
                  darkMode
                    ? "#ffffff"
                    : "#000000"
                }
              />

              <YAxis
                stroke={
                  darkMode
                    ? "#ffffff"
                    : "#000000"
                }
              />

              <Tooltip />

              <Bar
                dataKey="total"
                fill="#2563EB"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;