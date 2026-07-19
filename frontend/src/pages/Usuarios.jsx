import { useState } from "react";
import {
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Usuarios() {

  const [buscar, setBuscar] = useState("");

  const usuarios = [
    {
      id: 1,
      nombres: "Ana",
      apellidos: "García",
      cargo: "Administrador",
      area: "Gerencia",
      correo: "ana@ingetec.com",
      estado: "Activo"
    },
    {
      id: 2,
      nombres: "Juan",
      apellidos: "Pérez",
      cargo: "Supervisor",
      area: "Obras",
      correo: "juan@ingetec.com",
      estado: "Activo"
    },
    {
      id: 3,
      nombres: "Luis",
      apellidos: "Torres",
      cargo: "Ingeniero",
      area: "Topografía",
      correo: "luis@ingetec.com",
      estado: "Inactivo"
    }
  ];

  return (

    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar />

        <div className="p-8">

          <div className="bg-white rounded-2xl shadow-xl p-8">

            <div className="flex justify-between items-center">

              <div>

                <h1 className="text-4xl font-bold">

                  Gestión de Usuarios

                </h1>

                <p className="text-gray-500 mt-2">

                  Administra el personal de Ingetec.

                </p>

              </div>

              <button className="flex items-center gap-3 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl shadow-lg">

                <FaUserPlus />

                Nuevo Usuario

              </button>

            </div>

            <div className="bg-white rounded-2xl mt-8">

              <div className="relative mb-6">

                <FaSearch
                  className="absolute left-4 top-4 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={buscar}
                  onChange={(e)=>setBuscar(e.target.value)}
                  className="w-full border rounded-xl pl-12 p-3"
                />

              </div>

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-3">Nombre</th>

                    <th>Cargo</th>

                    <th>Área</th>

                    <th>Correo</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                  </tr>

                </thead>

                <tbody>

                  {usuarios
                    .filter((u)=>
                      u.nombres
                        .toLowerCase()
                        .includes(buscar.toLowerCase())
                    )
                    .map((usuario)=>(

                      <tr
                        key={usuario.id}
                        className="border-b hover:bg-slate-50"
                      >

                        <td className="py-4">

                          {usuario.nombres} {usuario.apellidos}

                        </td>

                        <td className="text-center">

                          {usuario.cargo}

                        </td>

                        <td className="text-center">

                          {usuario.area}

                        </td>

                        <td className="text-center">

                          {usuario.correo}

                        </td>

                        <td className="text-center">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              usuario.estado === "Activo"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >

                            {usuario.estado}

                          </span>

                        </td>

                        <td>

                          <div className="flex justify-center gap-4">

                            <button>

                              <FaEdit className="text-blue-700"/>

                            </button>

                            <button>

                              <FaTrash className="text-red-600"/>

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}