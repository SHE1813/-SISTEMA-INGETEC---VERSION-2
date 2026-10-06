import { useEffect, useState } from "react";
import axios from "axios";
import API from "../config/api";

import {
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUserTie,
} from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";


export default function Usuarios() {

  // =====================================================
  // ESTADOS
  // =====================================================

  const [usuarios, setUsuarios] = useState([]);
  const [buscar, setBuscar] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);

  const [cargando, setCargando] = useState(false);

  const [formulario, setFormulario] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    telefono: "",
    cargo: "",
    area: "",
  });


  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };


  // =====================================================
  // OBTENER USUARIOS
  // =====================================================

  const obtenerUsuarios = async () => {

    try {

      setCargando(true);

      const token = getToken();

      if (!token) {
        alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
        return;
      }

      const response = await axios.get(
        `${API}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {

        setUsuarios(response.data.users || []);

      } else if (Array.isArray(response.data)) {

        setUsuarios(response.data);

      } else {

        setUsuarios([]);

      }

    } catch (error) {

      console.error(
        "Error obteniendo usuarios:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {

        alert(
          error.response?.data?.message ||
          "No tienes permisos para acceder a esta sección."
        );

      } else {

        alert(
          error.response?.data?.message ||
          "No se pudieron cargar los usuarios."
        );

      }

    } finally {

      setCargando(false);

    }

  };


  // =====================================================
  // CARGAR AL INICIAR
  // =====================================================

  useEffect(() => {

    obtenerUsuarios();

  }, []);


  // =====================================================
  // CAMBIAR CAMPOS
  // =====================================================

  const manejarCambio = (e) => {

    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =====================================================
  // FORMULARIO VACÍO
  // =====================================================

  const formularioInicial = {
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    telefono: "",
    cargo: "",
    area: "",
  };


  // =====================================================
  // NUEVO ENCARGADO
  // =====================================================

  const nuevoUsuario = () => {

    setEditando(null);

    setFormulario({
      ...formularioInicial,
    });

    setMostrarFormulario(true);

  };


  // =====================================================
  // EDITAR USUARIO
  // =====================================================

  const editarUsuario = (usuario) => {

    // Nunca permitir editar al Administrador
    if (usuario.rol === "Administrador") {

      alert(
        "El Administrador principal no puede ser modificado desde esta sección."
      );

      return;
    }

    setEditando(usuario.id);

    setFormulario({

      nombres: usuario.nombres || "",
      apellidos: usuario.apellidos || "",
      email: usuario.email || "",
      password: "",
      telefono: usuario.telefono || "",
      cargo: usuario.cargo || "",
      area: usuario.area || "",

    });

    setMostrarFormulario(true);

  };


  // =====================================================
  // CERRAR FORMULARIO
  // =====================================================

  const cerrarFormulario = () => {

    setMostrarFormulario(false);

    setEditando(null);

    setFormulario({
      ...formularioInicial,
    });

  };


  // =====================================================
  // GUARDAR USUARIO
  // =====================================================

  const guardarUsuario = async (e) => {

    e.preventDefault();

    // -------------------------------------------------
    // VALIDACIONES
    // -------------------------------------------------

    if (!formulario.nombres.trim()) {

      alert("Ingrese los nombres.");

      return;
    }


    if (!formulario.apellidos.trim()) {

      alert("Ingrese los apellidos.");

      return;
    }


    if (!formulario.email.trim()) {

      alert("Ingrese el correo electrónico.");

      return;
    }


    if (!editando && !formulario.password) {

      alert("Ingrese una contraseña.");

      return;
    }


    if (
      !editando &&
      formulario.password.length < 8
    ) {

      alert(
        "La contraseña debe tener mínimo 8 caracteres."
      );

      return;
    }


    try {

      const token = getToken();

      if (!token) {

        alert(
          "Tu sesión ha expirado. Inicia sesión nuevamente."
        );

        return;
      }


      // =================================================
      // EDITAR ENCARGADO
      // =================================================

      if (editando) {

        const response = await axios.put(

          `${API}/users/${editando}`,

          {
            nombres: formulario.nombres.trim(),
            apellidos: formulario.apellidos.trim(),
            email: formulario.email.trim(),
            telefono: formulario.telefono.trim(),
            cargo: formulario.cargo.trim(),
            area: formulario.area.trim(),
            estado: "Activo",
          },

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }

        );


        alert(
          response.data?.message ||
          "Encargado actualizado correctamente."
        );

      }


      // =================================================
      // CREAR ENCARGADO
      // =================================================

      else {

        const response = await axios.post(

          `${API}/users`,

          {
            nombres: formulario.nombres.trim(),
            apellidos: formulario.apellidos.trim(),
            email: formulario.email.trim(),
            password: formulario.password,
            telefono: formulario.telefono.trim(),
            cargo: formulario.cargo.trim(),
            area: formulario.area.trim(),

            // IMPORTANTE:
            // El backend asignará automáticamente:
            // rol = "Encargado"
          },

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }

        );


        alert(
          response.data?.message ||
          "Encargado creado correctamente."
        );

      }


      // =================================================
      // ACTUALIZAR TABLA
      // =================================================

      cerrarFormulario();

      obtenerUsuarios();

    } catch (error) {

      console.error(
        "Error guardando usuario:",
        error
      );

      console.error(
        "Respuesta del servidor:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Ocurrió un error al guardar el encargado."
      );

    }

  };


  // =====================================================
  // ELIMINAR USUARIO
  // =====================================================

  const eliminarUsuario = async (usuario) => {

    // Nunca eliminar Administrador
    if (usuario.rol === "Administrador") {

      alert(
        "El Administrador principal no puede ser eliminado."
      );

      return;
    }


    const confirmar = window.confirm(

      `¿Estás seguro de eliminar a ${usuario.nombres} ${usuario.apellidos}?`

    );


    if (!confirmar) {
      return;
    }


    try {

      const token = getToken();

      if (!token) {

        alert(
          "Tu sesión ha expirado. Inicia sesión nuevamente."
        );

        return;
      }


      const response = await axios.delete(

        `${API}/users/${usuario.id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

      );


      alert(
        response.data?.message ||
        "Encargado eliminado correctamente."
      );


      obtenerUsuarios();

    } catch (error) {

      console.error(
        "Error eliminando usuario:",
        error
      );

      console.error(
        "Respuesta del servidor:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        "No se pudo eliminar el encargado."
      );

    }

  };


  // =====================================================
  // FILTRAR
  // =====================================================

  const usuariosFiltrados = usuarios.filter(
    (usuario) => {

      const texto = buscar
        .toLowerCase()
        .trim();

      if (!texto) {
        return true;
      }


      const nombreCompleto =
        `${usuario.nombres || ""} ${usuario.apellidos || ""}`
          .toLowerCase();


      return (

        nombreCompleto.includes(texto) ||

        (usuario.email || "")
          .toLowerCase()
          .includes(texto) ||

        (usuario.cargo || "")
          .toLowerCase()
          .includes(texto) ||

        (usuario.area || "")
          .toLowerCase()
          .includes(texto) ||

        (usuario.rol || "")
          .toLowerCase()
          .includes(texto)

      );

    }
  );


  // =====================================================
  // COLOR DEL ROL
  // =====================================================

  const colorRol = (rol) => {

    if (rol === "Administrador") {

      return "bg-purple-100 text-purple-700";
    }

    if (rol === "Encargado") {

      return "bg-blue-100 text-blue-700";
    }

    return "bg-gray-100 text-gray-700";

  };


  // =====================================================
  // COLOR DEL ESTADO
  // =====================================================

  const colorEstado = (estado) => {

    if (estado === "Activo") {

      return "bg-green-100 text-green-700";
    }

    return "bg-red-100 text-red-700";

  };


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <div className="flex min-h-screen bg-slate-100">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />


      {/* =================================================
          CONTENIDO
      ================================================= */}

      <div className="flex-1 min-w-0">

        <Navbar />


        <main className="p-8">

          <div className="bg-white rounded-2xl shadow-xl p-8">


            {/* ============================================
                ENCABEZADO
            ============================================ */}

            <div className="flex justify-between items-center">

              <div>

                <h1 className="text-4xl font-bold text-slate-800">

                  Gestión de Usuarios

                </h1>


                <p className="text-gray-500 mt-2">

                  Administra los encargados de Ingetec.

                </p>

              </div>


              <button

                onClick={nuevoUsuario}

                className="
                  flex
                  items-center
                  gap-3
                  bg-blue-700
                  hover:bg-blue-800
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  shadow-lg
                  transition
                "

              >

                <FaUserPlus />

                Nuevo Encargado

              </button>

            </div>


            {/* ============================================
                BUSCADOR
            ============================================ */}

            <div className="mt-8">

              <div className="relative">

                <FaSearch
                  className="
                    absolute
                    left-4
                    top-4
                    text-gray-400
                  "
                />


                <input

                  type="text"

                  placeholder="Buscar encargado..."

                  value={buscar}

                  onChange={(e) =>
                    setBuscar(e.target.value)
                  }

                  className="
                    w-full
                    border
                    rounded-xl
                    pl-12
                    p-3
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "

                />

              </div>

            </div>


            {/* ============================================
                TABLA
            ============================================ */}

            <div className="overflow-x-auto mt-6">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-3">
                      Nombre
                    </th>

                    <th className="text-center">
                      Cargo
                    </th>

                    <th className="text-center">
                      Área
                    </th>

                    <th className="text-center">
                      Correo
                    </th>

                    <th className="text-center">
                      Rol
                    </th>

                    <th className="text-center">
                      Estado
                    </th>

                    <th className="text-center">
                      Acciones
                    </th>

                  </tr>

                </thead>


                <tbody>


                  {cargando ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="
                          text-center
                          py-10
                          text-gray-500
                        "
                      >

                        Cargando usuarios...

                      </td>

                    </tr>

                  ) : usuariosFiltrados.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="
                          text-center
                          py-10
                          text-gray-500
                        "
                      >

                        No se encontraron usuarios.

                      </td>

                    </tr>

                  ) : (

                    usuariosFiltrados.map(
                      (usuario) => (

                        <tr

                          key={usuario.id}

                          className="
                            border-b
                            hover:bg-slate-50
                          "

                        >

                          {/* NOMBRE */}

                          <td className="py-4">

                            <div className="flex items-center gap-3">

                              <div
                                className="
                                  w-10
                                  h-10
                                  rounded-full
                                  bg-blue-100
                                  text-blue-700
                                  flex
                                  items-center
                                  justify-center
                                "
                              >

                                <FaUserTie />

                              </div>


                              <div>

                                <p className="font-semibold">

                                  {usuario.nombres}{" "}

                                  {usuario.apellidos}

                                </p>

                              </div>

                            </div>

                          </td>


                          {/* CARGO */}

                          <td className="text-center">

                            {usuario.cargo || "-"}

                          </td>


                          {/* ÁREA */}

                          <td className="text-center">

                            {usuario.area || "-"}

                          </td>


                          {/* CORREO */}

                          <td className="text-center">

                            {usuario.email || "-"}

                          </td>


                          {/* ROL */}

                          <td className="text-center">

                            <span
                              className={`
                                px-3
                                py-1
                                rounded-full
                                text-sm
                                font-semibold
                                ${colorRol(usuario.rol)}
                              `}
                            >

                              {usuario.rol}

                            </span>

                          </td>


                          {/* ESTADO */}

                          <td className="text-center">

                            <span
                              className={`
                                px-3
                                py-1
                                rounded-full
                                text-sm
                                font-semibold
                                ${colorEstado(usuario.estado)}
                              `}
                            >

                              {usuario.estado}

                            </span>

                          </td>


                          {/* ACCIONES */}

                          <td>

                            <div className="flex justify-center gap-4">


                              {/* EDITAR */}

                              {usuario.rol !== "Administrador" && (

                                <button

                                  onClick={() =>
                                    editarUsuario(usuario)
                                  }

                                  className="
                                    hover:scale-110
                                    transition
                                  "

                                  title="Editar encargado"

                                >

                                  <FaEdit
                                    className="text-blue-700"
                                  />

                                </button>

                              )}


                              {/* ELIMINAR */}

                              {usuario.rol !== "Administrador" && (

                                <button

                                  onClick={() =>
                                    eliminarUsuario(usuario)
                                  }

                                  className="
                                    hover:scale-110
                                    transition
                                  "

                                  title="Eliminar encargado"

                                >

                                  <FaTrash
                                    className="text-red-600"
                                  />

                                </button>

                              )}


                              {/* ADMINISTRADOR */}

                              {usuario.rol === "Administrador" && (

                                <span
                                  className="
                                    text-xs
                                    text-gray-400
                                    font-semibold
                                  "
                                >

                                  Principal

                                </span>

                              )}

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


      {/* =================================================
          MODAL
      ================================================= */}

      {mostrarFormulario && (

        <div
          className="
            fixed
            inset-0
            bg-black/50
            flex
            items-center
            justify-center
            z-50
            p-4
          "
        >

          <div
            className="
              bg-white
              rounded-2xl
              shadow-2xl
              w-full
              max-w-2xl
              max-h-[90vh]
              overflow-y-auto
            "
          >


            {/* ==========================================
                CABECERA
            ========================================== */}

            <div
              className="
                flex
                justify-between
                items-center
                p-6
                border-b
              "
            >

              <div>

                <h2 className="text-2xl font-bold">

                  {editando
                    ? "Editar Encargado"
                    : "Nuevo Encargado"}

                </h2>


                <p className="text-gray-500 mt-1">

                  {editando
                    ? "Actualiza los datos del encargado."
                    : "Registra un nuevo encargado para Ingetec."}

                </p>

              </div>


              <button

                onClick={cerrarFormulario}

                className="
                  text-gray-500
                  hover:text-red-600
                  text-xl
                "

              >

                <FaTimes />

              </button>

            </div>


            {/* ==========================================
                FORMULARIO
            ========================================== */}

            <form

              onSubmit={guardarUsuario}

              className="p-6"

            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                {/* NOMBRES */}

                <div>

                  <label className="block font-semibold mb-2">

                    Nombres

                  </label>


                  <input

                    type="text"

                    name="nombres"

                    value={formulario.nombres}

                    onChange={manejarCambio}

                    className="
                      w-full
                      border
                      rounded-xl
                      p-3
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "

                    placeholder="Ingrese los nombres"

                  />

                </div>


                {/* APELLIDOS */}

                <div>

                  <label className="block font-semibold mb-2">

                    Apellidos

                  </label>


                  <input

                    type="text"

                    name="apellidos"

                    value={formulario.apellidos}

                    onChange={manejarCambio}

                    className="
                      w-full
                      border
                      rounded-xl
                      p-3
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "

                    placeholder="Ingrese los apellidos"

                  />

                </div>


                {/* CORREO */}

                <div>

                  <label className="block font-semibold mb-2">

                    Correo electrónico

                  </label>


                  <input

                    type="email"

                    name="email"

                    value={formulario.email}

                    onChange={manejarCambio}

                    className="
                      w-full
                      border
                      rounded-xl
                      p-3
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "

                    placeholder="ejemplo@ingetec.com"

                  />

                </div>


                {/* CONTRASEÑA */}

                {!editando && (

                  <div>

                    <label className="block font-semibold mb-2">

                      Contraseña

                    </label>


                    <input

                      type="password"

                      name="password"

                      value={formulario.password}

                      onChange={manejarCambio}

                      className="
                        w-full
                        border
                        rounded-xl
                        p-3
                        outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "

                      placeholder="Mínimo 8 caracteres"

                    />

                  </div>

                )}


                {/* TELÉFONO */}

                <div>

                  <label className="block font-semibold mb-2">

                    Teléfono

                  </label>


                  <input

                    type="text"

                    name="telefono"

                    value={formulario.telefono}

                    onChange={manejarCambio}

                    className="
                      w-full
                      border
                      rounded-xl
                      p-3
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "

                    placeholder="Número telefónico"

                  />

                </div>


                {/* CARGO */}

                <div>

                  <label className="block font-semibold mb-2">

                    Cargo

                  </label>


                  <input

                    type="text"

                    name="cargo"

                    value={formulario.cargo}

                    onChange={manejarCambio}

                    className="
                      w-full
                      border
                      rounded-xl
                      p-3
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "

                    placeholder="Ej. Ingeniero de proyectos"

                  />

                </div>


                {/* ÁREA */}

                <div>

                  <label className="block font-semibold mb-2">

                    Área

                  </label>


                  <input

                    type="text"

                    name="area"

                    value={formulario.area}

                    onChange={manejarCambio}

                    className="
                      w-full
                      border
                      rounded-xl
                      p-3
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "

                    placeholder="Ej. Obras"

                  />

                </div>


                {/* ROL */}

                <div>

                  <label className="block font-semibold mb-2">

                    Tipo de usuario

                  </label>


                  <div
                    className="
                      w-full
                      border
                      rounded-xl
                      p-3
                      bg-blue-50
                      border-blue-200
                      text-blue-800
                      font-semibold
                    "
                  >

                    Encargado

                  </div>

                </div>


              </div>


              {/* ========================================
                  AVISO
              ======================================== */}

              <div
                className="
                  mt-6
                  bg-blue-50
                  border
                  border-blue-200
                  rounded-xl
                  p-4
                "
              >

                <p className="text-blue-800 text-sm">

                  <strong>Importante:</strong>{" "}

                  Los usuarios creados desde esta sección
                  tendrán automáticamente el rol de{" "}

                  <strong>Encargado</strong>.

                </p>


                <p className="text-blue-700 text-sm mt-2">

                  El Administrador principal no puede ser
                  creado, modificado ni eliminado desde esta
                  sección.

                </p>

              </div>


              {/* ========================================
                  BOTONES
              ======================================== */}

              <div className="flex justify-end gap-4 mt-6">


                <button

                  type="button"

                  onClick={cerrarFormulario}

                  className="
                    px-6
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                    hover:bg-gray-100
                  "

                >

                  Cancelar

                </button>


                <button

                  type="submit"

                  className="
                    px-6
                    py-3
                    rounded-xl
                    bg-blue-700
                    hover:bg-blue-800
                    text-white
                  "

                >

                  {editando
                    ? "Guardar cambios"
                    : "Crear Encargado"}

                </button>


              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}