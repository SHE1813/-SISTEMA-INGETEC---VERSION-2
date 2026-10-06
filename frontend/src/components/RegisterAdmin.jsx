import { useEffect, useState } from "react";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaBuilding,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaUserShield,
  FaExclamationTriangle
} from "react-icons/fa";

import axios from "axios";

export default function RegisterAdmin({
  onSubmit,
  goLogin,
  loading
}) {

  // =====================================================
  // API
  // =====================================================

  const API = "http://127.0.0.1:3000";

  // =====================================================
  // ESTADOS
  // =====================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [checkingSetup, setCheckingSetup] =
    useState(true);

  const [adminExists, setAdminExists] =
    useState(false);

  const [form, setForm] = useState({

    nombres: "",
    apellidos: "",
    telefono: "",
    cargo: "",
    area: "",
    email: "",
    password: "",
    confirmPassword: ""

  });

  // =====================================================
  // COMPROBAR SI YA EXISTE ADMINISTRADOR
  // =====================================================

  useEffect(() => {

    checkAdmin();

  }, []);

  const checkAdmin = async () => {

    try {

      setCheckingSetup(true);

      const response =
        await axios.get(
          `${API}/setup`
        );

      console.log(
        "Estado del sistema:",
        response.data
      );

      setAdminExists(
        response.data.adminExists === true
      );

    }

    catch (error) {

      console.error(
        "Error comprobando administrador:",
        error
      );

      // Por seguridad, si no podemos comprobar
      // el estado del sistema, NO permitimos
      // crear un administrador.

      setAdminExists(true);

    }

    finally {

      setCheckingSetup(false);

    }

  };

  // =====================================================
  // CAMBIAR INPUT
  // =====================================================

  function handleChange(e) {

    setForm({

      ...form,

      [e.target.name]:
        e.target.value

    });

  }

  // =====================================================
  // ENVIAR FORMULARIO
  // =====================================================

  function submit(e) {

    e.preventDefault();

    // -----------------------------------------------
    // SEGURIDAD
    // -----------------------------------------------

    if (adminExists) {

      alert(
        "Ya existe un administrador. No es posible crear otro."
      );

      return;

    }

    // -----------------------------------------------
    // VALIDAR CONTRASEÑA
    // -----------------------------------------------

    if (
      form.password !==
      form.confirmPassword
    ) {

      alert(
        "Las contraseñas no coinciden."
      );

      return;

    }

    // -----------------------------------------------
    // VALIDAR LONGITUD
    // -----------------------------------------------

    if (
      form.password.length < 8
    ) {

      alert(
        "La contraseña debe tener al menos 8 caracteres."
      );

      return;

    }

    // -----------------------------------------------
    // NO ENVIAR confirmPassword
    // -----------------------------------------------

    const dataToSend = {

      nombres:
        form.nombres,

      apellidos:
        form.apellidos,

      telefono:
        form.telefono,

      cargo:
        form.cargo,

      area:
        form.area,

      email:
        form.email,

      password:
        form.password

    };

    onSubmit(
      dataToSend
    );

  }

  // =====================================================
  // CARGANDO COMPROBACIÓN
  // =====================================================

  if (checkingSetup) {

    return (

      <div
        className="
          bg-white
          rounded-3xl
          shadow-2xl
          p-10
          w-full
          max-w-2xl
          text-center
        "
      >

        <div
          className="
            w-20
            h-20
            bg-blue-100
            rounded-full
            flex
            items-center
            justify-center
            mx-auto
          "
        >

          <FaUserShield
            className="
              text-4xl
              text-blue-700
            "
          />

        </div>

        <h2
          className="
            mt-6
            text-2xl
            font-bold
          "
        >
          Verificando configuración
        </h2>

        <p
          className="
            text-gray-500
            mt-3
          "
        >
          Comprobando si el sistema ya tiene un administrador...
        </p>

      </div>

    );

  }

  // =====================================================
  // SI YA EXISTE ADMINISTRADOR
  // =====================================================

  if (adminExists) {

    return (

      <div
        className="
          bg-white
          rounded-3xl
          shadow-2xl
          p-10
          w-full
          max-w-2xl
          text-center
        "
      >

        <div
          className="
            w-24
            h-24
            bg-yellow-100
            rounded-full
            flex
            items-center
            justify-center
            mx-auto
          "
        >

          <FaExclamationTriangle
            className="
              text-5xl
              text-yellow-600
            "
          />

        </div>

        <h2
          className="
            mt-6
            text-3xl
            font-bold
            text-gray-800
          "
        >
          Administrador ya registrado
        </h2>

        <p
          className="
            text-gray-500
            mt-4
            leading-relaxed
          "
        >
          El sistema ya tiene un administrador
          registrado. Por motivos de seguridad,
          no se permite crear otro administrador
          desde esta pantalla.
        </p>

        <div
          className="
            bg-blue-50
            rounded-xl
            p-5
            mt-8
          "
        >

          <p
            className="
              text-blue-700
              font-semibold
            "
          >
            Utilice el botón de inicio de sesión
            para ingresar al sistema.
          </p>

        </div>

        <button

          type="button"

          onClick={goLogin}

          className="
            mt-8
            flex
            items-center
            justify-center
            gap-2
            bg-blue-700
            text-white
            px-8
            py-4
            rounded-xl
            hover:bg-blue-800
            w-full
          "

        >

          <FaArrowLeft />

          Volver al inicio de sesión

        </button>

      </div>

    );

  }

  // =====================================================
  // FORMULARIO
  // =====================================================

  return (

    <form

      onSubmit={submit}

      className="
        bg-white
        rounded-3xl
        shadow-2xl
        p-10
        w-full
        max-w-2xl
      "

    >

      {/* ================================================
          CABECERA
      ================================================ */}

      <div className="text-center">

        <div
          className="
            w-24
            h-24
            bg-blue-100
            rounded-full
            flex
            items-center
            justify-center
            mx-auto
          "
        >

          <FaUserShield
            className="
              text-5xl
              text-blue-700
            "
          />

        </div>

        <h2
          className="
            mt-6
            text-4xl
            font-bold
          "
        >
          Registrar Administrador
        </h2>

        <p
          className="
            text-gray-500
            mt-3
          "
        >
          Primera configuración del sistema.
        </p>

      </div>

      {/* ================================================
          DATOS PERSONALES
      ================================================ */}

      <div
        className="
          grid
          md:grid-cols-2
          gap-5
          mt-10
        "
      >

        {/* NOMBRES */}

        <div className="relative">

          <FaUser
            className="
              absolute
              left-4
              top-5
              text-gray-400
            "
          />

          <input

            name="nombres"

            placeholder="Nombres"

            value={
              form.nombres
            }

            onChange={
              handleChange
            }

            required

            className="
              w-full
              border
              rounded-xl
              py-4
              pl-12
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "

          />

        </div>

        {/* APELLIDOS */}

        <div className="relative">

          <FaUser
            className="
              absolute
              left-4
              top-5
              text-gray-400
            "
          />

          <input

            name="apellidos"

            placeholder="Apellidos"

            value={
              form.apellidos
            }

            onChange={
              handleChange
            }

            required

            className="
              w-full
              border
              rounded-xl
              py-4
              pl-12
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "

          />

        </div>

        {/* TELÉFONO */}

        <div className="relative">

          <FaPhone
            className="
              absolute
              left-4
              top-5
              text-gray-400
            "
          />

          <input

            name="telefono"

            placeholder="Teléfono"

            value={
              form.telefono
            }

            onChange={
              handleChange
            }

            required

            className="
              w-full
              border
              rounded-xl
              py-4
              pl-12
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "

          />

        </div>

        {/* CARGO */}

        <div className="relative">

          <FaBriefcase
            className="
              absolute
              left-4
              top-5
              text-gray-400
            "
          />

          <input

            name="cargo"

            placeholder="Cargo"

            value={
              form.cargo
            }

            onChange={
              handleChange
            }

            required

            className="
              w-full
              border
              rounded-xl
              py-4
              pl-12
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "

          />

        </div>

        {/* ÁREA */}

        <div className="relative">

          <FaBuilding
            className="
              absolute
              left-4
              top-5
              text-gray-400
            "
          />

          <input

            name="area"

            placeholder="Área"

            value={
              form.area
            }

            onChange={
              handleChange
            }

            required

            className="
              w-full
              border
              rounded-xl
              py-4
              pl-12
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "

          />

        </div>

        {/* CORREO */}

        <div className="relative">

          <FaEnvelope
            className="
              absolute
              left-4
              top-5
              text-gray-400
            "
          />

          <input

            type="email"

            name="email"

            placeholder="Correo"

            value={
              form.email
            }

            onChange={
              handleChange
            }

            required

            className="
              w-full
              border
              rounded-xl
              py-4
              pl-12
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "

          />

        </div>

      </div>

      {/* ================================================
          CONTRASEÑAS
      ================================================ */}

      <div
        className="
          grid
          md:grid-cols-2
          gap-5
          mt-5
        "
      >

        {/* CONTRASEÑA */}

        <div className="relative">

          <FaLock
            className="
              absolute
              left-4
              top-5
              text-gray-400
            "
          />

          <input

            type={
              showPassword
                ? "text"
                : "password"
            }

            name="password"

            placeholder="Contraseña"

            value={
              form.password
            }

            onChange={
              handleChange
            }

            required

            className="
              w-full
              border
              rounded-xl
              py-4
              pl-12
              pr-12
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "

          />

          <button

            type="button"

            className="
              absolute
              right-4
              top-5
              text-gray-500
            "

            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }

          >

            {
              showPassword
                ?
                <FaEyeSlash />
                :
                <FaEye />
            }

          </button>

        </div>

        {/* CONFIRMAR */}

        <div className="relative">

          <FaLock
            className="
              absolute
              left-4
              top-5
              text-gray-400
            "
          />

          <input

            type={
              showConfirm
                ? "text"
                : "password"
            }

            name="confirmPassword"

            placeholder="Confirmar contraseña"

            value={
              form.confirmPassword
            }

            onChange={
              handleChange
            }

            required

            className="
              w-full
              border
              rounded-xl
              py-4
              pl-12
              pr-12
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "

          />

          <button

            type="button"

            className="
              absolute
              right-4
              top-5
              text-gray-500
            "

            onClick={() =>
              setShowConfirm(
                !showConfirm
              )
            }

          >

            {
              showConfirm
                ?
                <FaEyeSlash />
                :
                <FaEye />
            }

          </button>

        </div>

      </div>

      {/* ================================================
          INFORMACIÓN DEL ROL
      ================================================ */}

      <div
        className="
          bg-blue-50
          rounded-xl
          p-5
          mt-8
        "
      >

        <h3
          className="
            font-bold
            text-blue-700
          "
        >
          Rol asignado automáticamente
        </h3>

        <p
          className="
            text-blue-600
            mt-2
          "
        >
          Administrador
        </p>

        <p
          className="
            text-sm
            text-blue-500
            mt-2
          "
        >
          Este rol solo puede asignarse durante
          la configuración inicial del sistema.
        </p>

      </div>

      {/* ================================================
          BOTONES
      ================================================ */}

      <div
        className="
          flex
          justify-between
          mt-8
        "
      >

        <button

          type="button"

          onClick={
            goLogin
          }

          className="
            flex
            items-center
            gap-2
            text-blue-700
            hover:text-blue-900
          "

        >

          <FaArrowLeft />

          Volver

        </button>

        <button

          type="submit"

          disabled={
            loading
          }

          className="
            bg-blue-700
            text-white
            px-8
            py-4
            rounded-xl
            hover:bg-blue-800
            disabled:opacity-50
            disabled:cursor-not-allowed
          "

        >

          {
            loading
              ?
              "Registrando..."
              :
              "Crear Administrador"
          }

        </button>

      </div>

    </form>

  );

}