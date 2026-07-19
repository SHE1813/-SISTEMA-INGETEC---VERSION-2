import {
  FaSearch,
  FaBell,
  FaUserCircle
} from "react-icons/fa";

export default function Navbar() {

  const user = JSON.parse(localStorage.getItem("user"));

  return (

    <header className="h-20 bg-white shadow-md flex items-center justify-between px-8">

      {/* Título */}

      <div>

        <h2 className="text-3xl font-bold text-slate-800">

          Panel de Administración

        </h2>

        <p className="text-gray-500">

          Bienvenido al sistema de supervisión y control.

        </p>

      </div>

      {/* Barra de búsqueda */}

      <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-3 w-96">

        <FaSearch className="text-gray-400"/>

        <input

          type="text"

          placeholder="Buscar..."

          className="bg-transparent ml-3 outline-none w-full"

        />

      </div>

      {/* Usuario */}

      <div className="flex items-center gap-6">

        <button className="relative">

          <FaBell
            className="text-2xl text-slate-600"
          />

          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">

            3

          </span>

        </button>

        <div className="flex items-center gap-3">

          <FaUserCircle
            className="text-5xl text-blue-700"
          />

          <div>

            <h4 className="font-bold">

              {user?.nombres || "Administrador"}

            </h4>

            <p className="text-sm text-gray-500">

              {user?.rol || "Administrador"}

            </p>

          </div>

        </div>

      </div>

    </header>

  );

}