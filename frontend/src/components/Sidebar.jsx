import {
  FaTachometerAlt,
  FaUsers,
  FaProjectDiagram,
  FaTasks,
  FaChartBar,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

export default function Sidebar() {

  const menu = [

    {
      nombre: "Dashboard",
      icono: <FaTachometerAlt />,
      ruta: "/dashboard"
    },

    {
      nombre: "Usuarios",
      icono: <FaUsers />,
      ruta: "/usuarios"
    },

    {
      nombre: "Proyectos",
      icono: <FaProjectDiagram />,
      ruta: "/projects"
    },

    {
      nombre: "Tareas",
      icono: <FaTasks />,
      ruta: "/tasks"
    },

    {
      nombre: "Reportes",
      icono: <FaChartBar />,
      ruta: "/reports"
    },

    {
      nombre: "Configuración",
      icono: <FaCog />,
      ruta: "/settings"
    }

  ];

  return (

    <aside className="w-72 bg-slate-900 text-white min-h-screen shadow-xl flex flex-col">

      {/* LOGO */}

      <div className="p-8 border-b border-slate-700">

        <h1 className="text-4xl font-black tracking-wide text-blue-400">

          INGETEC

        </h1>

        <p className="text-sm text-slate-400 mt-2">

          Panel Administrador

        </p>

      </div>

      {/* MENÚ */}

      <nav className="flex-1 mt-6">

        {

          menu.map((item) => (

            <NavLink

              key={item.nombre}

              to={item.ruta}

              className={({ isActive }) =>

                `flex items-center gap-4 px-8 py-4 transition

                ${

                  isActive

                    ? "bg-blue-700"

                    : "hover:bg-slate-800"

                }`

              }

            >

              <span className="text-xl">

                {item.icono}

              </span>

              <span className="font-medium">

                {item.nombre}

              </span>

            </NavLink>

          ))

        }

      </nav>

      {/* CERRAR SESIÓN */}

      <div className="border-t border-slate-700 p-6">

        <button

          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 py-3 rounded-xl transition"

        >

          <FaSignOutAlt />

          Cerrar sesión

        </button>

      </div>

    </aside>

  );

}