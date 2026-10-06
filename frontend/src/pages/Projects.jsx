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

export default function Projects() {

  // ==========================================
  // ESTADOS
  // ==========================================

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] = useState({
    nombre: "",
    responsable: "",
    estado: "",
    fecha: "",
  });


  // ==========================================
  // TOKEN
  // ==========================================

  const getToken = () => {
    return localStorage.getItem("token");
  };


  // ==========================================
  // OBTENER PROYECTOS
  // ==========================================

  const getProjects = async () => {

    try {

      const token = getToken();

      if (!token) {
        console.error("No existe token de autenticación.");
        return;
      }

      const response = await axios.get(
        `${API}/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Proyectos obtenidos:", response.data);

      setProjects(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "❌ Error obteniendo proyectos:",
        error
      );

      console.error(
        "Respuesta del servidor:",
        error.response?.data
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        alert(
          error.response?.data?.message ||
          "Tu sesión ha expirado o no tienes permisos."
        );

        window.location.href = "/";

      } else {

        alert(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "No se pudieron obtener los proyectos."
        );

      }

    }

  };


  // ==========================================
  // CARGAR AL INICIAR
  // ==========================================

  useEffect(() => {

    getProjects();

  }, []);


  // ==========================================
  // CAMBIAR FORMULARIO
  // ==========================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

  };


  // ==========================================
  // NUEVO PROYECTO
  // ==========================================

  const nuevoProyecto = () => {

    setEditingId(null);

    setForm({
      nombre: "",
      responsable: "",
      estado: "",
      fecha: "",
    });

    setMostrarFormulario(true);

  };


  // ==========================================
  // GUARDAR PROYECTO
  // ==========================================

  const saveProject = async (e) => {

    e.preventDefault();

    // -------------------------------
    // VALIDACIONES
    // -------------------------------

    if (!form.nombre.trim()) {

      alert(
        "Ingrese el nombre del proyecto."
      );

      return;
    }


    if (!form.responsable.trim()) {

      alert(
        "Ingrese el responsable del proyecto."
      );

      return;
    }


    if (!form.estado) {

      alert(
        "Seleccione el estado del proyecto."
      );

      return;
    }


    if (!form.fecha) {

      alert(
        "Seleccione la fecha del proyecto."
      );

      return;
    }


    // -------------------------------
    // GUARDAR
    // -------------------------------

    try {

      const token = getToken();

      if (!token) {

        alert(
          "No existe una sesión activa. Inicie sesión nuevamente."
        );

        window.location.href = "/";

        return;
      }


      console.log(
        "📤 Enviando proyecto:",
        form
      );


      const response = await axios.post(
        `${API}/projects`,
        {
          nombre: form.nombre.trim(),
          responsable: form.responsable.trim(),
          estado: form.estado,
          fecha: form.fecha,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


      console.log(
        "✅ Respuesta del servidor:",
        response.data
      );


      alert(
        response.data?.message ||
        response.data?.mensaje ||
        "Proyecto guardado correctamente."
      );


      cerrarFormulario();

      await getProjects();


    } catch (error) {

      // ==================================
      // MOSTRAR ERROR REAL
      // ==================================

      console.error(
        "===================================="
      );

      console.error(
        "❌ ERROR AL GUARDAR PROYECTO"
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "DATA:",
        error.response?.data
      );

      console.error(
        "MESSAGE:",
        error.response?.data?.message
      );

      console.error(
        "ERROR:",
        error.response?.data?.error
      );

      console.error(
        "CODE:",
        error.response?.data?.code
      );

      console.error(
        "SQL MESSAGE:",
        error.response?.data?.sqlMessage
      );

      console.error(
        "AXIOS:",
        error.message
      );

      console.error(
        "===================================="
      );


      const datos =
        error.response?.data;


      // -------------------------------
      // SESIÓN
      // -------------------------------

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {

        alert(
          datos?.message ||
          "Tu sesión ha expirado o no tienes permisos."
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/";

        return;
      }


      // -------------------------------
      // ERROR MYSQL / SERVIDOR
      // -------------------------------

      const mensajeError =
        datos?.sqlMessage ||
        datos?.error ||
        datos?.message ||
        error.message ||
        "No se pudo guardar el proyecto.";


      alert(
        `Error al guardar proyecto:\n\n${mensajeError}`
      );

    }

  };


  // ==========================================
  // PREPARAR EDICIÓN
  // ==========================================

  const startEdit = (project) => {

    setEditingId(project.id);

    setForm({
      nombre: project.nombre || "",

      responsable:
        project.responsable || "",

      estado:
        project.estado || "",

      fecha:
        project.fecha
          ? project.fecha.split("T")[0]
          : "",
    });

    setMostrarFormulario(true);

  };


  // ==========================================
  // ACTUALIZAR PROYECTO
  // ==========================================

  const updateProject = async (e) => {

    e.preventDefault();


    // -------------------------------
    // VALIDACIONES
    // -------------------------------

    if (!form.nombre.trim()) {

      alert(
        "Ingrese el nombre del proyecto."
      );

      return;
    }


    if (!form.responsable.trim()) {

      alert(
        "Ingrese el responsable del proyecto."
      );

      return;
    }


    if (!form.estado) {

      alert(
        "Seleccione el estado del proyecto."
      );

      return;
    }


    if (!form.fecha) {

      alert(
        "Seleccione la fecha del proyecto."
      );

      return;
    }


    try {

      const token = getToken();

      if (!token) {

        alert(
          "No existe una sesión activa. Inicie sesión nuevamente."
        );

        window.location.href = "/";

        return;
      }


      console.log(
        "📤 Actualizando proyecto:",
        form
      );


      const response = await axios.put(
        `${API}/projects/${editingId}`,
        {
          nombre: form.nombre.trim(),
          responsable: form.responsable.trim(),
          estado: form.estado,
          fecha: form.fecha,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


      console.log(
        "✅ Proyecto actualizado:",
        response.data
      );


      alert(
        response.data?.message ||
        response.data?.mensaje ||
        "Proyecto actualizado correctamente."
      );


      cerrarFormulario();

      await getProjects();


    } catch (error) {

      console.error(
        "===================================="
      );

      console.error(
        "❌ ERROR ACTUALIZANDO PROYECTO"
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "DATA:",
        error.response?.data
      );

      console.error(
        "MESSAGE:",
        error.response?.data?.message
      );

      console.error(
        "ERROR:",
        error.response?.data?.error
      );

      console.error(
        "SQL MESSAGE:",
        error.response?.data?.sqlMessage
      );

      console.error(
        "===================================="
      );


      const datos =
        error.response?.data;


      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {

        alert(
          datos?.message ||
          "No tienes permisos para actualizar este proyecto."
        );

        return;
      }


      alert(
        datos?.sqlMessage ||
        datos?.error ||
        datos?.message ||
        error.message ||
        "No se pudo actualizar el proyecto."
      );

    }

  };


  // ==========================================
  // ELIMINAR PROYECTO
  // ==========================================

  const deleteProject = async (project) => {

    const confirmar =
      window.confirm(
        `¿Deseas eliminar el proyecto "${project.nombre}"?`
      );


    if (!confirmar) {
      return;
    }


    try {

      const token = getToken();

      if (!token) {

        alert(
          "No existe una sesión activa."
        );

        window.location.href = "/";

        return;
      }


      const response = await axios.delete(
        `${API}/projects/${project.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      alert(
        response.data?.message ||
        response.data?.mensaje ||
        "Proyecto eliminado correctamente."
      );


      await getProjects();


    } catch (error) {

      console.error(
        "❌ Error eliminando proyecto:",
        error
      );

      console.error(
        "Respuesta:",
        error.response?.data
      );


      const datos =
        error.response?.data;


      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {

        alert(
          datos?.message ||
          "No tienes permisos para eliminar proyectos."
        );

        return;
      }


      alert(
        datos?.sqlMessage ||
        datos?.error ||
        datos?.message ||
        "No se pudo eliminar el proyecto."
      );

    }

  };


  // ==========================================
  // CERRAR FORMULARIO
  // ==========================================

  const cerrarFormulario = () => {

    setMostrarFormulario(false);

    setEditingId(null);

    setForm({
      nombre: "",
      responsable: "",
      estado: "",
      fecha: "",
    });

  };


  // ==========================================
  // FILTRAR PROYECTOS
  // ==========================================

  const filteredProjects =
    projects.filter((project) => {

      const texto =
        search.toLowerCase().trim();


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


  // ==========================================
  // COLOR DEL ESTADO
  // ==========================================

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


  // ==========================================
  // INTERFAZ
  // ==========================================

  return (

    <div className="flex">


      {/* ====================================
          SIDEBAR
      ==================================== */}

      <Sidebar />


      {/* ====================================
          CONTENIDO
      ==================================== */}

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar />


        <div className="p-8">

          <div className="bg-white rounded-2xl shadow-xl p-8">


            {/* =================================
                ENCABEZADO
            ================================= */}

            <div className="flex justify-between items-center">

              <div>

                <h1 className="text-4xl font-bold">

                  Gestión de Proyectos

                </h1>

                <p className="text-gray-500 mt-2">

                  Administra y supervisa los proyectos de Ingetec.

                </p>

              </div>


              <button
                onClick={nuevoProyecto}
                className="flex items-center gap-3 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl shadow-lg"
              >

                <FaPlus />

                Nuevo Proyecto

              </button>

            </div>


            {/* =================================
                BUSCADOR
            ================================= */}

            <div className="relative mt-8 mb-6">

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
                className="w-full border rounded-xl pl-12 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* =================================
                TABLA
            ================================= */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-3">
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
                        className="text-center py-8 text-gray-500"
                      >

                        No se encontraron proyectos.

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
                              : "-"
                            }

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

        </div>

      </div>


      {/* ====================================
          MODAL NUEVO / EDITAR
      ==================================== */}

      {mostrarFormulario && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">


            {/* =================================
                CABECERA DEL MODAL
            ================================= */}

            <div className="flex justify-between items-center p-6 border-b">

              <div>

                <h2 className="text-2xl font-bold">

                  {editingId
                    ? "Editar Proyecto"
                    : "Nuevo Proyecto"
                  }

                </h2>


                <p className="text-gray-500 mt-1">

                  {editingId
                    ? "Actualiza la información del proyecto."
                    : "Registra un nuevo proyecto de Ingetec."
                  }

                </p>

              </div>


              <button
                onClick={cerrarFormulario}
                className="text-gray-500 hover:text-red-600 text-xl"
              >

                <FaTimes />

              </button>

            </div>


            {/* =================================
                FORMULARIO
            ================================= */}

            <form
              onSubmit={
                editingId
                  ? updateProject
                  : saveProject
              }
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                {/* ==============================
                    NOMBRE
                ============================== */}

                <div>

                  <label className="block font-semibold mb-2">

                    Nombre del proyecto

                  </label>


                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ingrese el nombre del proyecto"
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>


                {/* ==============================
                    RESPONSABLE
                ============================== */}

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


                {/* ==============================
                    ESTADO
                ============================== */}

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


                {/* ==============================
                    FECHA
                ============================== */}

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


              {/* =================================
                  AVISO
              ================================= */}

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">

                <p className="text-blue-800 text-sm">

                  <strong>
                    Administrador:
                  </strong>{" "}

                  desde esta sección puedes registrar,
                  editar y eliminar proyectos.

                </p>

              </div>


              {/* =================================
                  BOTONES
              ================================= */}

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
                    : "Crear Proyecto"
                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}