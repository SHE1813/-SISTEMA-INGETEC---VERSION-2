import { useEffect, useState } from "react";
import axios from "axios";

import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API = "http://127.0.0.1:3000";

export default function Tasks() {

  // =====================================================
  // ESTADOS
  // =====================================================

  const [tasks, setTasks] = useState([]);

  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] = useState({
    titulo: "",
    responsable: "",
    project_id: "",
    estado: "",
    fecha: "",
  });

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // OBTENER TAREAS
  // =====================================================

  const getTasks = async () => {

    try {

      const token = getToken();

      const response = await axios.get(
        `${API}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(
        response.data || []
      );

    } catch (error) {

      console.error(
        "Error obteniendo tareas:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {

        alert(
          error.response?.data?.message ||
          "No tienes permisos para acceder a las tareas."
        );

      }

    }

  };

  // =====================================================
  // OBTENER PROYECTOS
  // =====================================================

  const getProjects = async () => {

    try {

      const token = getToken();

      const response = await axios.get(
        `${API}/tasks/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects(
        response.data || []
      );

    } catch (error) {

      console.error(
        "Error obteniendo proyectos:",
        error
      );

    }

  };

  // =====================================================
  // CARGAR DATOS
  // =====================================================

  useEffect(() => {

    getTasks();
    getProjects();

  }, []);

  // =====================================================
  // CAMBIAR FORMULARIO
  // =====================================================

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  // =====================================================
  // NUEVA TAREA
  // =====================================================

  const nuevaTarea = () => {

    setEditingId(null);

    setForm({
      titulo: "",
      responsable: "",
      project_id: "",
      estado: "",
      fecha: "",
    });

    setMostrarFormulario(true);

  };

  // =====================================================
  // GUARDAR TAREA
  // =====================================================

  const saveTask = async (e) => {

    e.preventDefault();

    if (!form.titulo.trim()) {

      alert(
        "Ingrese el título de la tarea."
      );

      return;

    }

    if (!form.responsable.trim()) {

      alert(
        "Ingrese el responsable de la tarea."
      );

      return;

    }

    if (!form.project_id) {

      alert(
        "Seleccione el proyecto."
      );

      return;

    }

    if (!form.estado) {

      alert(
        "Seleccione el estado de la tarea."
      );

      return;

    }

    if (!form.fecha) {

      alert(
        "Seleccione la fecha de la tarea."
      );

      return;

    }

    try {

      const token = getToken();

      const response = await axios.post(
        `${API}/tasks`,
        {
          titulo: form.titulo,
          responsable: form.responsable,
          project_id: Number(form.project_id),
          estado: form.estado,
          fecha: form.fecha,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data?.message ||
        "Tarea guardada correctamente."
      );

      cerrarFormulario();

      getTasks();

    } catch (error) {

      console.error(
        "Error guardando tarea:",
        error
      );

      alert(
        error.response?.data?.message ||
        "No se pudo guardar la tarea."
      );

    }

  };

  // =====================================================
  // PREPARAR EDICIÓN
  // =====================================================

  const startEdit = (task) => {

    setEditingId(task.id);

    setForm({

      titulo:
        task.titulo || "",

      responsable:
        task.responsable || "",

      project_id:
        task.project_id
          ? String(task.project_id)
          : "",

      estado:
        task.estado || "",

      fecha:
        task.fecha
          ? String(task.fecha).split("T")[0]
          : "",

    });

    setMostrarFormulario(true);

  };

  // =====================================================
  // ACTUALIZAR TAREA
  // =====================================================

  const updateTask = async (e) => {

    e.preventDefault();

    if (!form.titulo.trim()) {

      alert(
        "Ingrese el título de la tarea."
      );

      return;

    }

    if (!form.responsable.trim()) {

      alert(
        "Ingrese el responsable de la tarea."
      );

      return;

    }

    if (!form.project_id) {

      alert(
        "Seleccione el proyecto."
      );

      return;

    }

    if (!form.estado) {

      alert(
        "Seleccione el estado de la tarea."
      );

      return;

    }

    if (!form.fecha) {

      alert(
        "Seleccione la fecha de la tarea."
      );

      return;

    }

    try {

      const token = getToken();

      const response = await axios.put(
        `${API}/tasks/${editingId}`,
        {
          titulo: form.titulo,
          responsable: form.responsable,
          project_id: Number(form.project_id),
          estado: form.estado,
          fecha: form.fecha,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data?.message ||
        "Tarea actualizada correctamente."
      );

      cerrarFormulario();

      getTasks();

    } catch (error) {

      console.error(
        "Error actualizando tarea:",
        error
      );

      alert(
        error.response?.data?.message ||
        "No se pudo actualizar la tarea."
      );

    }

  };

  // =====================================================
  // ELIMINAR TAREA
  // =====================================================

  const deleteTask = async (task) => {

    const confirmar = window.confirm(
      `¿Deseas eliminar la tarea "${task.titulo}"?`
    );

    if (!confirmar) {
      return;
    }

    try {

      const token = getToken();

      const response = await axios.delete(
        `${API}/tasks/${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data?.message ||
        "Tarea eliminada correctamente."
      );

      getTasks();

    } catch (error) {

      console.error(
        "Error eliminando tarea:",
        error
      );

      alert(
        error.response?.data?.message ||
        "No se pudo eliminar la tarea."
      );

    }

  };

  // =====================================================
  // CERRAR FORMULARIO
  // =====================================================

  const cerrarFormulario = () => {

    setMostrarFormulario(false);

    setEditingId(null);

    setForm({
      titulo: "",
      responsable: "",
      project_id: "",
      estado: "",
      fecha: "",
    });

  };

  // =====================================================
  // FILTRAR TAREAS
  // =====================================================

  const filteredTasks =
    tasks.filter((task) => {

      const texto =
        search.toLowerCase();

      return (

        (task.titulo || "")
          .toLowerCase()
          .includes(texto)

        ||

        (task.responsable || "")
          .toLowerCase()
          .includes(texto)

        ||

        (task.proyecto || "")
          .toLowerCase()
          .includes(texto)

        ||

        (task.estado || "")
          .toLowerCase()
          .includes(texto)

      );

    });

  // =====================================================
  // COLOR ESTADO
  // =====================================================

  const colorEstado = (estado) => {

    if (
      estado === "Completado" ||
      estado === "Completada"
    ) {

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

  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div className="flex">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />

      {/* =================================================
          CONTENIDO
      ================================================= */}

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar />

        <div className="p-8">

          <div className="bg-white rounded-2xl shadow-xl p-8">

            {/* =================================================
                ENCABEZADO
            ================================================= */}

            <div className="flex justify-between items-center">

              <div>

                <h1 className="text-4xl font-bold">

                  Gestión de Tareas

                </h1>

                <p className="text-gray-500 mt-2">

                  Administra y supervisa las tareas de Ingetec.

                </p>

              </div>

              <button
                onClick={nuevaTarea}
                className="flex items-center gap-3 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl shadow-lg"
              >

                <FaPlus />

                Nueva Tarea

              </button>

            </div>

            {/* =================================================
                BUSCADOR
            ================================================= */}

            <div className="relative mt-8 mb-6">

              <FaSearch
                className="absolute left-4 top-4 text-gray-400"
              />

              <input
                type="text"
                placeholder="Buscar tarea..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full border rounded-xl pl-12 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* =================================================
                TABLA
            ================================================= */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-3">
                      ID
                    </th>

                    <th className="text-left">
                      Tarea
                    </th>

                    <th className="text-left">
                      Proyecto
                    </th>

                    <th>
                      Responsable
                    </th>

                    <th>
                      Estado
                    </th>

                    <th>
                      Fecha
                    </th>

                    <th>
                      Acciones
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredTasks.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="text-center py-8 text-gray-500"
                      >

                        No se encontraron tareas.

                      </td>

                    </tr>

                  ) : (

                    filteredTasks.map(
                      (task) => (

                        <tr
                          key={task.id}
                          className="border-b hover:bg-slate-50"
                        >

                          <td className="py-4">

                            {task.id}

                          </td>

                          <td>

                            <span className="font-semibold">

                              {task.titulo}

                            </span>

                          </td>

                          <td>

                            <span className="font-semibold">

                              {task.proyecto ||
                                "Sin proyecto"}

                            </span>

                          </td>

                          <td className="text-center">

                            {task.responsable}

                          </td>

                          <td className="text-center">

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${colorEstado(
                                task.estado
                              )}`}
                            >

                              {task.estado}

                            </span>

                          </td>

                          <td className="text-center">

                            {task.fecha
                              ? String(
                                  task.fecha
                                ).split("T")[0]
                              : "-"}

                          </td>

                          <td>

                            <div className="flex justify-center gap-4">

                              <button
                                onClick={() =>
                                  startEdit(task)
                                }
                                className="hover:scale-110 transition"
                                title="Editar tarea"
                              >

                                <FaEdit className="text-blue-700" />

                              </button>

                              <button
                                onClick={() =>
                                  deleteTask(task)
                                }
                                className="hover:scale-110 transition"
                                title="Eliminar tarea"
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

        </div>

      </div>

      {/* =====================================================
          MODAL NUEVA / EDITAR TAREA
      ===================================================== */}

      {mostrarFormulario && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* CABECERA */}

            <div className="flex justify-between items-center p-6 border-b">

              <div>

                <h2 className="text-2xl font-bold">

                  {editingId
                    ? "Editar Tarea"
                    : "Nueva Tarea"}

                </h2>

                <p className="text-gray-500 mt-1">

                  {editingId
                    ? "Actualiza la información de la tarea."
                    : "Registra una nueva tarea para un proyecto de Ingetec."}

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
              onSubmit={
                editingId
                  ? updateTask
                  : saveTask
              }
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* TÍTULO */}

                <div>

                  <label className="block font-semibold mb-2">

                    Título de la tarea

                  </label>

                  <input
                    type="text"
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    placeholder="Ingrese el título de la tarea"
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                {/* RESPONSABLE */}

                <div>

                  <label className="block font-semibold mb-2">

                    Responsable

                  </label>

                  <input
                    type="text"
                    name="responsable"
                    value={form.responsable}
                    onChange={handleChange}
                    placeholder="Nombre del responsable"
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                {/* PROYECTO */}

                <div>

                  <label className="block font-semibold mb-2">

                    Proyecto

                  </label>

                  <select
                    name="project_id"
                    value={form.project_id}
                    onChange={handleChange}
                    className="w-full border rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  >

                    <option value="">

                      Seleccione proyecto

                    </option>

                    {projects.map(
                      (project) => (

                        <option
                          key={project.id}
                          value={project.id}
                        >

                          {project.nombre}

                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* ESTADO */}

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

                {/* FECHA */}

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

              {/* AVISO */}

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">

                <p className="text-blue-800 text-sm">

                  <strong>Administrador:</strong>{" "}

                  desde esta sección puedes registrar,
                  editar y eliminar tareas de los proyectos.

                </p>

              </div>

              {/* BOTONES */}

              <div className="flex justify-end gap-4 mt-6">

                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100"
                >

                  <FaTimes />

                  Cancelar

                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white"
                >

                  <FaPlus />

                  {editingId
                    ? "Guardar cambios"
                    : "Crear Tarea"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}