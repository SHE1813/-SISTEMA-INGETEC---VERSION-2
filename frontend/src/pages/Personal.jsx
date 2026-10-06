import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaHome,
  FaProjectDiagram,
  FaTasks,
  FaBell,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

export default function Personal() {
  const navigate = useNavigate();
  const API = "http://127.0.0.1:3000";

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    user = {};
  }

  const nombreCompleto =
    `${user.nombres || ""} ${user.apellidos || ""}`.trim() || "Encargado";

  const nombreMostrar = user.nombres || "Encargado";

  const inicial = nombreMostrar.charAt(0).toUpperCase();

  const cargoUsuario = user.cargo || "Encargado";

  // =====================================================
  // ESTADOS
  // =====================================================

  const [personal, setPersonal] = useState([]);

  const [proyectos, setProyectos] = useState([]);

  const [tareasProyecto, setTareasProyecto] = useState([]);

  const [cargandoTareas, setCargandoTareas] = useState(false);

  const [search, setSearch] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [cargando, setCargando] = useState(false);

  // =====================================================
  // FORMULARIO
  // =====================================================

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    cargo: "",
    telefono: "",
    estado: "Activo",
    project_id: "",
    task_ids: []
  });

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // HEADERS
  // =====================================================

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // =====================================================
  // OBTENER PERSONAL
  // =====================================================

  const getPersonal = async () => {
    try {
      setCargando(true);

      const response = await axios.get(
        `${API}/personal`,
        getHeaders()
      );

      const lista = Array.isArray(response.data)
        ? response.data
        : [];

      // Obtener las tareas asignadas a cada trabajador
      const conTareas = await Promise.all(
        lista.map(async (persona) => {
          try {
            const tareasResponse = await axios.get(
              `${API}/personal/${persona.id}/tareas`,
              getHeaders()
            );

            return {
              ...persona,
              tareas: Array.isArray(tareasResponse.data)
                ? tareasResponse.data
                : []
            };

          } catch (error) {
            console.log(
              `No se pudieron cargar las tareas del personal ${persona.id}:`,
              error
            );

            return {
              ...persona,
              tareas: []
            };
          }
        })
      );

      setPersonal(conTareas);

    } catch (error) {
      console.error(
        "Error obteniendo personal:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      } else {
        alert(
          error.response?.data?.message ||
          "No se pudo obtener el personal."
        );
      }

    } finally {
      setCargando(false);
    }
  };

  // =====================================================
  // OBTENER PROYECTOS
  // =====================================================

  const getProyectos = async () => {
    try {
      const response = await axios.get(
        `${API}/projects`,
        getHeaders()
      );

      setProyectos(
        Array.isArray(response.data)
          ? response.data
          : []
      );

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

  // =====================================================
  // OBTENER TAREAS DEL PROYECTO
  // =====================================================

  const getTareasProyecto = async (projectId) => {

    if (!projectId) {
      setTareasProyecto([]);
      return;
    }

    try {
      setCargandoTareas(true);

      const response = await axios.get(
        `${API}/personal/proyectos/${projectId}/tareas`,
        getHeaders()
      );

      setTareasProyecto(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Error obteniendo tareas del proyecto:",
        error
      );

      setTareasProyecto([]);

      alert(
        error.response?.data?.message ||
        "No se pudieron obtener las tareas del proyecto."
      );

    } finally {
      setCargandoTareas(false);
    }
  };

  // =====================================================
  // CARGAR DATOS INICIALES
  // =====================================================

  useEffect(() => {
    getPersonal();
    getProyectos();
  }, []);

  // =====================================================
  // SELECCIONAR / DESELECCIONAR TAREA
  // =====================================================

  const toggleTarea = (taskId) => {

    const id = Number(taskId);

    setForm((prev) => {

      const actuales = Array.isArray(prev.task_ids)
        ? prev.task_ids
        : [];

      const existe = actuales.includes(id);

      return {
        ...prev,

        task_ids: existe
          ? actuales.filter(
              (item) => item !== id
            )
          : [
              ...actuales,
              id
            ]
      };
    });
  };

  // =====================================================
  // CAMBIAR PROYECTO
  // =====================================================

  const handleProjectChange = async (e) => {

    const projectId = e.target.value;

    setForm((prev) => ({
      ...prev,
      project_id: projectId,
      task_ids: []
    }));

    setTareasProyecto([]);

    if (projectId) {
      await getTareasProyecto(projectId);
    }
  };

  // =====================================================
  // CAMBIAR FORMULARIO
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // =====================================================
  // LIMPIAR FORMULARIO
  // =====================================================

  const limpiarFormulario = () => {

    setForm({
      nombres: "",
      apellidos: "",
      dni: "",
      cargo: "",
      telefono: "",
      estado: "Activo",
      project_id: "",
      task_ids: []
    });

    setTareasProyecto([]);

    setEditingId(null);

    setMostrarFormulario(false);
  };

  // =====================================================
  // REGISTRAR / ACTUALIZAR PERSONAL
  // =====================================================

  const guardarPersonal = async () => {

    // NOMBRES
    if (!form.nombres.trim()) {
      alert("Ingrese los nombres.");
      return;
    }

    // APELLIDOS
    if (!form.apellidos.trim()) {
      alert("Ingrese los apellidos.");
      return;
    }

    // DNI
    if (!form.dni.trim()) {
      alert("Ingrese el DNI.");
      return;
    }

    if (
      form.dni.trim().length !== 8 ||
      !/^\d+$/.test(form.dni.trim())
    ) {
      alert(
        "El DNI debe tener exactamente 8 dígitos numéricos."
      );
      return;
    }

    // CARGO
    if (!form.cargo.trim()) {
      alert("Ingrese el cargo.");
      return;
    }

    // PROYECTO
    if (!form.project_id) {
      alert("Seleccione un proyecto.");
      return;
    }

    try {

      // ==========================================
      // ACTUALIZAR
      // ==========================================

      if (editingId) {

        await axios.put(
          `${API}/personal/${editingId}`,
          form,
          getHeaders()
        );

        alert(
          "Personal actualizado correctamente."
        );

      }

      // ==========================================
      // REGISTRAR
      // ==========================================

      else {

        await axios.post(
          `${API}/personal`,
          form,
          getHeaders()
        );

        alert(
          "Personal registrado correctamente."
        );
      }

      limpiarFormulario();

      await getPersonal();

    } catch (error) {

      console.error(
        "Error guardando personal:",
        error
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "No se pudo guardar el personal."
      );
    }
  };

  // =====================================================
  // EDITAR PERSONAL
  // =====================================================

  const editarPersonal = async (persona) => {

    try {

      // ==========================================
      // CARGAR TAREAS DEL PROYECTO
      // ==========================================

      let tareasDisponibles = [];

      if (persona.project_id) {

        const response = await axios.get(
          `${API}/personal/proyectos/${persona.project_id}/tareas`,
          getHeaders()
        );

        tareasDisponibles =
          Array.isArray(response.data)
            ? response.data
            : [];
      }

      setTareasProyecto(
        tareasDisponibles
      );

      // ==========================================
      // CARGAR TAREAS DEL TRABAJADOR
      // ==========================================

      const tareasAsignadasResponse =
        await axios.get(
          `${API}/personal/${persona.id}/tareas`,
          getHeaders()
        );

      const tareasAsignadas =
        Array.isArray(
          tareasAsignadasResponse.data
        )
          ? tareasAsignadasResponse.data.map(
              (tarea) => Number(tarea.id)
            )
          : [];

      // ==========================================
      // CARGAR DATOS
      // ==========================================

      setForm({

        nombres:
          persona.nombres || "",

        apellidos:
          persona.apellidos || "",

        dni:
          persona.dni || "",

        cargo:
          persona.cargo || "",

        telefono:
          persona.telefono || "",

        estado:
          persona.estado || "Activo",

        project_id:
          persona.project_id || "",

        task_ids:
          tareasAsignadas
      });

      setEditingId(
        persona.id
      );

      setMostrarFormulario(
        true
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    } catch (error) {

      console.error(
        "Error cargando datos para editar:",
        error
      );

      alert(
        error.response?.data?.message ||
        "No se pudieron cargar las tareas del trabajador."
      );
    }
  };

  // =====================================================
  // ELIMINAR PERSONAL
  // =====================================================

  const eliminarPersonal = async (id) => {

    const confirmar =
      window.confirm(
        "¿Está seguro de eliminar este personal?"
      );

    if (!confirmar) {
      return;
    }

    try {

      await axios.delete(
        `${API}/personal/${id}`,
        getHeaders()
      );

      alert(
        "Personal eliminado correctamente."
      );

      await getPersonal();

    } catch (error) {

      console.error(
        "Error eliminando personal:",
        error
      );

      alert(
        error.response?.data?.message ||
        "No se pudo eliminar el personal."
      );
    }
  };

  // =====================================================
  // FILTRAR PERSONAL
  // =====================================================

  const personalFiltrado =
    personal.filter((persona) => {

      const texto =
        search
          .toLowerCase()
          .trim();

      if (!texto) {
        return true;
      }

      const tareasTexto =
        Array.isArray(persona.tareas)
          ? persona.tareas
              .map(
                (tarea) =>
                  `${tarea.titulo || ""} ${
                    tarea.estado || ""
                  }`
              )
              .join(" ")
          : "";

      return (

        persona.nombres
          ?.toLowerCase()
          .includes(texto)

        ||

        persona.apellidos
          ?.toLowerCase()
          .includes(texto)

        ||

        String(
          persona.dni || ""
        )
          .toLowerCase()
          .includes(texto)

        ||

        String(
          persona.telefono || ""
        )
          .toLowerCase()
          .includes(texto)

        ||

        persona.cargo
          ?.toLowerCase()
          .includes(texto)

        ||

        persona.proyecto
          ?.toLowerCase()
          .includes(texto)

        ||

        tareasTexto
          .toLowerCase()
          .includes(texto)
      );
    });

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="min-h-screen flex bg-slate-100">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="w-72 min-h-screen bg-slate-900 text-white flex flex-col">

        {/* LOGO */}

        <div className="px-8 py-8 border-b border-slate-700">

          <h1 className="text-4xl font-bold text-blue-500">
            INGETEC
          </h1>

          <p className="text-slate-400 mt-2">
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

            <FaHome />

            <span className="font-semibold">
              Inicio
            </span>

          </Link>

          {/* MIS PROYECTOS */}

          <Link
            to="/encargado/proyectos"
            className="flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition"
          >

            <FaProjectDiagram />

            <span className="font-semibold">
              Mis Proyectos
            </span>

          </Link>

          {/* MIS TAREAS */}

          <Link
            to="/encargado/tareas"
            className="flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition"
          >

            <FaTasks />

            <span className="font-semibold">
              Mis Tareas
            </span>

          </Link>

          {/* PERSONAL */}

          <Link
            to="/personal"
            className="flex items-center gap-4 px-8 py-4 bg-blue-700 text-white transition"
          >

            <FaUsers />

            <span className="font-semibold">
              Personal
            </span>

          </Link>

          {/* NOTIFICACIONES */}

          <button
            type="button"
            className="w-full flex items-center gap-4 px-8 py-4 hover:bg-slate-800 transition text-left"
          >

            <FaBell />

            <span className="font-semibold">
              Notificaciones
            </span>

          </button>

        </nav>

        {/* CERRAR SESIÓN */}

        <div className="p-6 border-t border-slate-700">

          <button
            onClick={cerrarSesion}
            className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-semibold transition"
          >

            <FaSignOutAlt />

            Cerrar sesión

          </button>

        </div>

      </aside>


      {/* =================================================
          CONTENIDO PRINCIPAL
      ================================================= */}

      <div className="flex-1 min-w-0">

        {/* HEADER */}

        <header className="bg-white shadow-sm px-10 py-6">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-3xl font-bold text-slate-800">
                Personal
              </h1>

              <p className="text-gray-500 mt-1">
                Personal asignado a tus proyectos.
              </p>

            </div>

            {/* USUARIO */}

            <div className="flex items-center gap-4">

              <div className="text-right">

                <p className="font-bold text-slate-800">
                  {nombreCompleto}
                </p>

                <p className="text-sm text-gray-500">
                  {cargoUsuario}
                </p>

              </div>

              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">

                {inicial}

              </div>

            </div>

          </div>

        </header>


        {/* =================================================
            CONTENIDO
        ================================================= */}

        <main className="p-10">

          <div className="bg-white rounded-3xl shadow-xl p-10">

            {/* =================================================
                ENCABEZADO
            ================================================= */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center">

                  <FaUsers className="text-2xl" />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-slate-800">
                    Gestión del Personal
                  </h2>

                  <p className="text-gray-500">
                    Registra y supervisa el personal de tus proyectos.
                  </p>

                </div>

              </div>


              {/* BOTÓN NUEVO */}

              <button
                onClick={() => {

                  setEditingId(null);

                  setForm({

                    nombres: "",
                    apellidos: "",
                    dni: "",
                    cargo: "",
                    telefono: "",
                    estado: "Activo",
                    project_id: "",
                    task_ids: []

                  });

                  setTareasProyecto([]);

                  setMostrarFormulario(true);

                }}

                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >

                <FaPlus />

                Registrar Personal

              </button>

            </div>


            {/* =================================================
                INFORMACIÓN DE PROYECTOS
            ================================================= */}

            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4">

              <p className="text-blue-800">

                <strong>
                  Proyectos disponibles:
                </strong>{" "}

                {proyectos.length}

              </p>

              {proyectos.length === 0 && (

                <p className="text-red-600 mt-1">

                  No tienes proyectos asignados.
                  Solicita al Administrador que te asigne un proyecto.

                </p>

              )}

            </div>


            {/* =================================================
                FORMULARIO
            ================================================= */}

            {mostrarFormulario && (

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 mb-8">

                <div className="flex items-center justify-between mb-6">

                  <h3 className="text-xl font-bold text-slate-800">

                    {editingId
                      ? "Editar Personal"
                      : "Registrar Nuevo Personal"
                    }

                  </h3>

                  <button
                    onClick={limpiarFormulario}
                    className="text-gray-500 hover:text-red-600 transition"
                  >

                    <FaTimes className="text-xl" />

                  </button>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* NOMBRES */}

                  <div>

                    <label className="block font-semibold text-slate-700 mb-2">
                      Nombres *
                    </label>

                    <input
                      type="text"
                      name="nombres"
                      value={form.nombres}
                      onChange={handleChange}
                      placeholder="Ingrese nombres"
                      className="w-full border border-gray-300 p-3 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>


                  {/* APELLIDOS */}

                  <div>

                    <label className="block font-semibold text-slate-700 mb-2">
                      Apellidos *
                    </label>

                    <input
                      type="text"
                      name="apellidos"
                      value={form.apellidos}
                      onChange={handleChange}
                      placeholder="Ingrese apellidos"
                      className="w-full border border-gray-300 p-3 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>


                  {/* DNI */}

                  <div>

                    <label className="block font-semibold text-slate-700 mb-2">
                      DNI *
                    </label>

                    <input
                      type="text"
                      name="dni"
                      value={form.dni}
                      onChange={handleChange}
                      placeholder="Ingrese DNI"
                      maxLength="8"
                      inputMode="numeric"
                      className="w-full border border-gray-300 p-3 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>


                  {/* CARGO */}

                  <div>

                    <label className="block font-semibold text-slate-700 mb-2">
                      Cargo *
                    </label>

                    <input
                      type="text"
                      name="cargo"
                      value={form.cargo}
                      onChange={handleChange}
                      placeholder="Ej. Albañil, Electricista..."
                      className="w-full border border-gray-300 p-3 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>


                  {/* TELÉFONO */}

                  <div>

                    <label className="block font-semibold text-slate-700 mb-2">
                      Teléfono
                    </label>

                    <input
                      type="text"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="Ingrese teléfono"
                      inputMode="tel"
                      className="w-full border border-gray-300 p-3 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>


                  {/* ESTADO */}

                  <div>

                    <label className="block font-semibold text-slate-700 mb-2">
                      Estado
                    </label>

                    <select
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >

                      <option value="Activo">
                        Activo
                      </option>

                      <option value="Inactivo">
                        Inactivo
                      </option>

                    </select>

                  </div>


                  {/* =================================================
                      PROYECTO
                  ================================================= */}

                  <div className="md:col-span-2">

                    <label className="block font-semibold text-slate-700 mb-2">
                      Proyecto *
                    </label>

                    <select
                      name="project_id"
                      value={form.project_id}
                      onChange={handleProjectChange}
                      className="w-full border border-gray-300 p-3 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >

                      <option value="">
                        Seleccione un proyecto
                      </option>

                      {proyectos.map((proyecto) => (

                        <option
                          key={proyecto.id}
                          value={proyecto.id}
                        >

                          {proyecto.nombre}

                        </option>

                      ))}

                    </select>

                    {proyectos.length === 0 && (

                      <p className="text-red-500 text-sm mt-2">

                        No hay proyectos disponibles para asignar.

                      </p>

                    )}

                  </div>


                  {/* =================================================
                      TAREAS
                  ================================================= */}

                  <div className="md:col-span-2">

                    <label className="block font-semibold text-slate-700 mb-3">

                      Tareas asignadas al trabajador

                    </label>


                    {!form.project_id ? (

                      <div className="bg-gray-100 border border-gray-200 rounded-xl p-5 text-gray-500">

                        Seleccione primero un proyecto para visualizar sus tareas.

                      </div>

                    ) : cargandoTareas ? (

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-blue-600">

                        Cargando tareas del proyecto...

                      </div>

                    ) : tareasProyecto.length === 0 ? (

                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-yellow-700">

                        Este proyecto todavía no tiene tareas registradas.

                      </div>

                    ) : (

                      <div className="border border-gray-300 rounded-xl bg-white overflow-hidden">

                        <div className="bg-slate-100 px-5 py-3 border-b">

                          <p className="font-semibold text-slate-700">

                            Seleccione las tareas que realizará este trabajador:

                          </p>

                          <p className="text-sm text-gray-500 mt-1">

                            Puede seleccionar una o varias tareas.

                          </p>

                        </div>


                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">

                          {tareasProyecto.map((tarea) => {

                            const seleccionada =
                              form.task_ids.includes(
                                Number(tarea.id)
                              );

                            return (

                              <label
                                key={tarea.id}
                                className={`
                                  flex items-start gap-3
                                  p-4 rounded-xl border
                                  cursor-pointer transition
                                  ${
                                    seleccionada
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:bg-gray-50"
                                  }
                                `}
                              >

                                <input
                                  type="checkbox"
                                  checked={seleccionada}
                                  onChange={() =>
                                    toggleTarea(tarea.id)
                                  }
                                  className="mt-1 w-5 h-5 accent-blue-600"
                                />

                                <div className="flex-1">

                                  <p className="font-semibold text-slate-800">

                                    {tarea.titulo}

                                  </p>

                                  <p className="text-sm text-gray-500 mt-1">

                                    Estado:{" "}
                                    {tarea.estado || "Pendiente"}

                                  </p>

                                </div>

                              </label>

                            );

                          })}

                        </div>


                        <div className="px-5 py-3 bg-slate-50 border-t">

                          <p className="text-sm text-gray-600">

                            <span className="font-semibold">

                              {form.task_ids.length}

                            </span>

                            {" "}

                            {form.task_ids.length === 1
                              ? "tarea seleccionada"
                              : "tareas seleccionadas"
                            }

                          </p>

                        </div>

                      </div>

                    )}

                  </div>

                </div>


                {/* BOTONES */}

                <div className="flex justify-end gap-3 mt-7">

                  <button
                    onClick={limpiarFormulario}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >

                    Cancelar

                  </button>


                  <button
                    onClick={guardarPersonal}
                    disabled={proyectos.length === 0}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition"
                  >

                    {editingId
                      ? "Actualizar Personal"
                      : "Guardar Personal"
                    }

                  </button>

                </div>

              </div>

            )}


            {/* =================================================
                BUSCADOR
            ================================================= */}

            <div className="relative mb-8">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Buscar por nombre, DNI, teléfono, cargo, proyecto o tarea..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full border border-gray-300 p-4 pl-12 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* =================================================
                TABLA
            ================================================= */}

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-blue-600 text-white">

                  <tr>

                    <th className="px-3 py-3 text-left">
                      ID
                    </th>

                    <th className="px-3 py-3 text-left">
                      Nombres
                    </th>

                    <th className="px-3 py-3 text-left">
                      Apellidos
                    </th>

                    <th className="px-3 py-3 text-left">
                      DNI
                    </th>

                    <th className="px-3 py-3 text-left">
                      Teléfono
                    </th>

                    <th className="px-3 py-3 text-left">
                      Cargo
                    </th>

                    <th className="px-3 py-3 text-left">
                      Proyecto
                    </th>

                    <th className="px-3 py-3 text-left min-w-[250px]">
                      Tareas asignadas
                    </th>

                    <th className="px-3 py-3 text-left">
                      Estado
                    </th>

                    <th className="px-3 py-3 text-center">
                      Acciones
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {cargando ? (

                    <tr>

                      <td
                        colSpan="10"
                        className="text-center p-10 text-gray-500"
                      >

                        Cargando personal...

                      </td>

                    </tr>

                  ) : personalFiltrado.length === 0 ? (

                    <tr>

                      <td
                        colSpan="10"
                        className="text-center p-12"
                      >

                        <FaUsers className="mx-auto text-5xl text-gray-300 mb-4" />

                        <p className="text-lg font-semibold text-gray-600">

                          No hay personal registrado

                        </p>

                        <p className="text-gray-400 mt-2">

                          El personal que registres aparecerá aquí.

                        </p>

                      </td>

                    </tr>

                  ) : (

                    personalFiltrado.map((persona) => (

                      <tr
                        key={persona.id}
                        className="border-b hover:bg-slate-50 transition"
                      >

                        {/* ID */}

                        <td className="px-3 py-3">

                          {persona.id}

                        </td>


                        {/* NOMBRES */}

                        <td className="px-3 py-3 font-semibold text-slate-800">

                          {persona.nombres}

                        </td>


                        {/* APELLIDOS */}

                        <td className="px-3 py-3">

                          {persona.apellidos}

                        </td>


                        {/* DNI */}

                        <td className="px-3 py-3">

                          {persona.dni}

                        </td>


                        {/* TELÉFONO */}

                        <td className="px-3 py-3 whitespace-nowrap">

                          {persona.telefono || (

                            <span className="text-gray-400">

                              Sin teléfono

                            </span>

                          )}

                        </td>


                        {/* CARGO */}

                        <td className="px-3 py-3">

                          {persona.cargo}

                        </td>


                        {/* PROYECTO */}

                        <td className="px-3 py-3 font-medium text-slate-700">

                          {persona.proyecto || (

                            <span className="text-gray-400">

                              Sin proyecto

                            </span>

                          )}

                        </td>


                        {/* TAREAS ASIGNADAS */}

                        <td className="px-3 py-3 align-middle">

                          {persona.tareas &&
                          persona.tareas.length > 0 ? (

                            <div className="flex flex-wrap gap-1.5 max-w-[420px]">

                              {persona.tareas.map((tarea) => (

                                <span
                                  key={tarea.id}
                                  className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 rounded-md px-2 py-1 text-xs font-medium"
                                  title={`Estado: ${
                                    tarea.estado || "Pendiente"
                                  }`}
                                >

                                  {tarea.titulo}

                                </span>

                              ))}

                            </div>

                          ) : (

                            <span className="text-gray-400 text-xs italic">

                              Sin tareas asignadas

                            </span>

                          )}

                        </td>


                        {/* ESTADO */}

                        <td className="px-3 py-3">

                          <span
                            className={`
                              px-2.5 py-1
                              rounded-full
                              text-xs
                              font-semibold
                              whitespace-nowrap
                              ${
                                persona.estado === "Activo"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }
                            `}
                          >

                            {persona.estado}

                          </span>

                        </td>


                        {/* ACCIONES */}

                        <td className="px-3 py-3">

                          <div className="flex justify-center gap-2">

                            <button
                              onClick={() =>
                                editarPersonal(persona)
                              }
                              className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition"
                              title="Editar"
                            >

                              <FaEdit />

                            </button>


                            <button
                              onClick={() =>
                                eliminarPersonal(persona.id)
                              }
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                              title="Eliminar"
                            >

                              <FaTrash />

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}