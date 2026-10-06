import { useEffect, useState } from "react";
import axios from "axios";
import API from "../config/api";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaHome,
  FaProjectDiagram,
  FaTasks,
  FaUsers,
  FaBell,
  FaSignOutAlt
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";


export default function EncargadoProjects() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [form, setForm] = useState({
    nombre: "",
    responsable: "",
    estado: "",
    fecha: ""
  });

  // =========================
  // TOKEN
  // =========================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================
  // OBTENER PROYECTOS
  // =========================

  const getProjects = async () => {

    try {

      const token = getToken();

      const response = await axios.get(
        `${API}/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProjects(response.data || []);

    } catch (error) {

      console.error(
        "Error obteniendo proyectos:",
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

    getProjects();

  }, []);

  // =========================
  // CAMBIAR FORMULARIO
  // =========================

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  // =========================
  // EDITAR
  // =========================

  const startEdit = (project) => {

    setEditingId(project.id);

    setForm({
      nombre: project.nombre || "",
      responsable: project.responsable || "",
      estado: project.estado || "",
      fecha: project.fecha
        ? project.fecha.split("T")[0]
        : ""
    });

    setMostrarFormulario(true);

  };

  // =========================
  // ACTUALIZAR
  // =========================

  const updateProject = async (e) => {

    e.preventDefault();

    if (
      !form.nombre.trim() ||
      !form.responsable.trim() ||
      !form.estado ||
      !form.fecha
    ) {

      alert("Complete todos los campos.");

      return;

    }

    try {

      const token = getToken();

      await axios.put(
        `${API}/projects/${editingId}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Proyecto actualizado correctamente.");

      cerrarFormulario();

      getProjects();

    } catch (error) {

      console.error(
        "Error actualizando proyecto:",
        error
      );

      alert(
        error.response?.data?.message ||
        "No se pudo actualizar el proyecto."
      );

    }

  };

  // =========================
  // ELIMINAR
  // =========================

  const deleteProject = async (project) => {

    const confirmar = window.confirm(
      `¿Deseas eliminar el proyecto "${project.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    try {

      const token = getToken();

      await axios.delete(
        `${API}/projects/${project.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Proyecto eliminado correctamente.");

      getProjects();

    } catch (error) {

      console.error(
        "Error eliminando proyecto:",
        error
      );

      alert(
        error.response?.data?.message ||
        "No se pudo eliminar el proyecto."
      );

    }

  };

  // =========================
  // CERRAR FORMULARIO
  // =========================

  const cerrarFormulario = () => {

    setMostrarFormulario(false);

    setEditingId(null);

    setForm({
      nombre: "",
      responsable: "",
      estado: "",
      fecha: ""
    });

  };

  // =========================
  // FILTRAR
  // =========================

  const filteredProjects =
    projects.filter((project) => {

      const texto =
        search.toLowerCase();

      return (
        (project.nombre || "")
          .toLowerCase()
          .includes(texto)

        ||

        (project.responsable || "")
          .toLowerCase()
          .includes(texto)

        ||

        (project.estado || "")
          .toLowerCase()
          .includes(texto)
      );

    });

  // =========================
  // COLOR ESTADO
  // =========================

  const colorEstado = (estado) => {

    if (estado === "Completado") {
      return "bg-green-100 text-green-700";
    }

    if (estado === "En proceso") {
      return "bg-blue-100 text-blue-700";
    }

    if (estado === "Pendiente") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-gray-100 text-gray-700";

  };

  // =========================
  // CERRAR SESIÓN
  // =========================

  const cerrarSesion = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");

  };

  // =========================
  // VISTA
  // =========================

  return (

    <div className="min-h-screen bg-slate-100 flex">

      {/* =========================
          SIDEBAR ENCARGADO
      ========================= */}

      <aside className="w-72 bg-slate-900 text-white min-h-screen flex flex-col">

        {/* LOGO */}

        <div className="p-8 border-b border-slate-700">

          <h1 className="text-4xl font-bold text-blue-400">
            INGETEC
          </h1>

          <p className="text-slate-400 mt-2">
            Panel del Encargado
          </p>

        </div>

        {/* MENU */}

        <nav className="flex-1 py-6">

          <Link
            to="/encargado"
            className="flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition"
          >

            <FaHome />

            <span>
              Inicio
            </span>

          </Link>


          <Link
            to="/encargado/proyectos"
            className="flex items-center gap-4 px-8 py-4 bg-blue-700"
          >

            <FaProjectDiagram />

            <span>
              Mis Proyectos
            </span>

          </Link>


          <Link
            to="/encargado/tareas"
            className="flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition"
          >

            <FaTasks />

            <span>
              Mis Tareas
            </span>

          </Link>


          <Link
            to="/encargado/personal"
            className="flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition"
          >

            <FaUsers />

            <span>
              Personal
            </span>

          </Link>


          <Link
            to="/encargado/notificaciones"
            className="flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition"
          >

            <FaBell />

            <span>
              Notificaciones
            </span>

          </Link>

        </nav>

        {/* CERRAR SESIÓN */}

        <div className="p-6 border-t border-slate-700">

          <button
            onClick={cerrarSesion}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl flex items-center justify-center gap-3"
          >

            <FaSignOutAlt />

            Cerrar sesión

          </button>

        </div>

      </aside>


      {/* =========================
          CONTENIDO
      ========================= */}

      <div className="flex-1">

        {/* HEADER */}

        <header className="bg-white shadow-sm px-10 py-6 flex justify-between items-center">

          <div>

            <h2 className="text-3xl font-bold text-slate-900">
              Mis Proyectos
            </h2>

            <p className="text-slate-500 mt-1">
              Proyectos bajo tu responsabilidad.
            </p>

          </div>


          <div className="flex items-center gap-4">

            <div className="text-right">

              <p className="font-bold text-slate-900">
                {user.nombres || "Encargado"}
              </p>

              <p className="text-sm text-slate-500">
                {user.cargo || "Personal"}
              </p>

            </div>


            <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center text-xl font-bold">

              {(user.nombres || "E")
                .charAt(0)
                .toUpperCase()}

            </div>

          </div>

        </header>


        {/* CONTENIDO */}

        <main className="p-8">

          <div className="bg-white rounded-2xl shadow-xl p-8">

            {/* TÍTULO */}

            <div className="mb-8">

              <h1 className="text-4xl font-bold text-slate-900">
                Mis Proyectos
              </h1>

              <p className="text-slate-500 mt-2">
                Consulta y supervisa los proyectos asignados.
              </p>

            </div>


            {/* BUSCADOR */}

            <div className="relative mb-8">

              <FaSearch
                className="absolute left-4 top-4 text-gray-400"
              />

              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full border rounded-xl pl-12 p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* TABLA */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-4">
                      ID
                    </th>

                    <th className="text-left">
                      Proyecto
                    </th>

                    <th className="text-center">
                      Responsable
                    </th>

                    <th className="text-center">
                      Estado
                    </th>

                    <th className="text-center">
                      Fecha
                    </th>

                    <th className="text-center">
                      Acciones
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredProjects.length === 0 ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="text-center py-12 text-gray-500"
                      >

                        No tienes proyectos registrados.

                      </td>

                    </tr>

                  ) : (

                    filteredProjects.map(
                      (project) => (

                        <tr
                          key={project.id}
                          className="border-b hover:bg-slate-50"
                        >

                          <td className="py-4">
                            {project.id}
                          </td>


                          <td>

                            <span className="font-semibold">
                              {project.nombre}
                            </span>

                          </td>


                          <td className="text-center">
                            {project.responsable}
                          </td>


                          <td className="text-center">

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${colorEstado(
                                project.estado
                              )}`}
                            >

                              {project.estado}

                            </span>

                          </td>


                          <td className="text-center">

                            {project.fecha
                              ? project.fecha.split("T")[0]
                              : "-"}

                          </td>


                          <td>

                            <div className="flex justify-center gap-4">

                              <button
                                onClick={() =>
                                  startEdit(project)
                                }
                                className="hover:scale-110 transition"
                                title="Editar proyecto"
                              >

                                <FaEdit className="text-blue-700" />

                              </button>


                              <button
                                onClick={() =>
                                  deleteProject(project)
                                }
                                className="hover:scale-110 transition"
                                title="Eliminar proyecto"
                              >

                                <FaTrash className="text-red-600" />

                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </main>

      </div>


      {/* =========================
          MODAL EDITAR
      ========================= */}

      {mostrarFormulario && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">

            {/* CABECERA */}

            <div className="flex justify-between items-center p-6 border-b">

              <div>

                <h2 className="text-2xl font-bold">
                  Editar Proyecto
                </h2>

                <p className="text-gray-500 mt-1">
                  Actualiza la información del proyecto.
                </p>

              </div>


              <button
                onClick={cerrarFormulario}
                className="text-gray-500 hover:text-red-600 text-xl"
              >

                <FaTimes />

              </button>

            </div>


            {/* FORMULARIO */}

            <form
              onSubmit={updateProject}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label className="block font-semibold mb-2">
                    Nombre del proyecto
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>


                <div>

                  <label className="block font-semibold mb-2">
                    Responsable
                  </label>

                  <input
                    type="text"
                    name="responsable"
                    value={form.responsable}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>


                <div>

                  <label className="block font-semibold mb-2">
                    Estado
                  </label>

                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  >

                    <option value="">
                      Seleccione estado
                    </option>

                    <option value="Pendiente">
                      Pendiente
                    </option>

                    <option value="En proceso">
                      En proceso
                    </option>

                    <option value="Completado">
                      Completado
                    </option>

                  </select>

                </div>


                <div>

                  <label className="block font-semibold mb-2">
                    Fecha
                  </label>

                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

              </div>


              <div className="flex justify-end gap-4 mt-8">

                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100"
                >

                  Cancelar

                </button>


                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white"
                >

                  Guardar cambios

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}