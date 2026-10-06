import { useState } from "react";
import axios from "axios";
import API from "../config/api";

import AuthForm from "../components/AuthForm";
import RegisterAdmin from "../components/RegisterAdmin";


import {
  FaChartLine,
  FaUsers,
  FaShieldAlt
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  // =====================================================
  // API LOCAL
  // =====================================================

  const API = "http://127.0.0.1:3000";

  // =====================================================
  // ESTADOS
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [showRegister, setShowRegister] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (e) => {

    e.preventDefault();

    if (!email || !password) {

      alert(
        "Ingrese su correo y contraseña."
      );

      return;

    }

    setLoading(true);

    try {

      console.log(
        "Intentando iniciar sesión..."
      );

      const response =
        await axios.post(

          `${API}/login`,

          {
            email,
            password
          }

        );

      const data =
        response.data;

      console.log(
        "Respuesta del servidor:",
        data
      );

      // =================================================
      // LOGIN INCORRECTO
      // =================================================

      if (!data.success) {

        alert(
          data.message ||
          "Credenciales incorrectas."
        );

        return;

      }

      // =================================================
      // VERIFICAR TOKEN
      // =================================================

      if (!data.token) {

        console.error(
          "El backend no devolvió token."
        );

        alert(
          "Error de autenticación: el servidor no devolvió el token."
        );

        return;

      }

      // =================================================
      // GUARDAR TOKEN
      // =================================================

      localStorage.setItem(
        "token",
        data.token
      );

      // =================================================
      // GUARDAR USUARIO
      // =================================================

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log(
        "TOKEN:",
        data.token
      );

      console.log(
        "USUARIO:",
        data.user
      );

      // =================================================
      // VERIFICAR ROL
      // =================================================

      const rol =
        data.user?.rol;

      console.log(
        "ROL DETECTADO:",
        rol
      );

      // =================================================
      // REDIRECCIÓN SEGÚN ROL
      // =================================================

      if (
        rol === "Administrador"
      ) {

        navigate(
          "/dashboard",
          {
            replace: true
          }
        );

      }

      else if (
        rol === "Encargado"
      ) {

        navigate(
          "/encargado",
          {
            replace: true
          }
        );

      }

      else {

        alert(
          "El usuario no tiene un rol válido."
        );

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

      }

    }

    catch (error) {

      console.error(
        "ERROR LOGIN:",
        error
      );

      if (
        error.response
      ) {

        console.error(
          "Respuesta del servidor:",
          error.response.data
        );

        alert(

          error.response.data?.message ||

          "Error al iniciar sesión."

        );

      }

      else {

        alert(
          "No se pudo conectar con el servidor."
        );

      }

    }

    finally {

      setLoading(false);

    }

  };

  // =====================================================
  // REGISTRAR ADMINISTRADOR
  // =====================================================

  const registerAdmin =
    async (form) => {

      setLoading(true);

      try {

        console.log(
          "Registrando administrador..."
        );

        const response =
          await axios.post(

            `${API}/register`,

            form

          );

        const data =
          response.data;

        console.log(
          "Respuesta registro:",
          data
        );

        alert(
          data.message ||
          "Proceso terminado."
        );

        if (
          data.success
        ) {

          setShowRegister(
            false
          );

          // Limpiar formulario de login

          setEmail("");

          setPassword("");

        }

      }

      catch (error) {

        console.error(
          "ERROR REGISTRO ADMIN:",
          error
        );

        console.error(
          "Respuesta:",
          error.response?.data
        );

        alert(

          error.response?.data?.message ||

          "Error al registrar administrador."

        );

      }

      finally {

        setLoading(false);

      }

    };

  // =====================================================
  // VISTA
  // =====================================================

  return (

    <div
      className="
        min-h-screen
        grid
        lg:grid-cols-2
        bg-slate-100
      "
    >

      {/* =================================================
          PANEL IZQUIERDO
      ================================================= */}

      <section
        className="
          hidden
          lg:flex
          relative
          overflow-hidden
        "
      >

        <img

          src="
            https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80
          "

          alt="INGETEC"

          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
          "

        />

        <div
          className="
            absolute
            inset-0
            bg-blue-950/80
          "
        />

        <div
          className="
            relative
            z-10
            flex
            flex-col
            justify-center
            px-16
            text-white
          "
        >

          <h1
            className="
              text-6xl
              font-black
              tracking-wide
            "
          >
            INGETEC
          </h1>

          <div
            className="
              w-24
              h-1
              bg-blue-400
              rounded-full
              mt-6
            "
          />

          <h2
            className="
              mt-8
              text-4xl
              font-bold
              leading-tight
            "
          >

            Sistema Integral para la

            <br />

            Supervisión y Control

            <br />

            de Proyectos

            <span
              className="
                text-blue-300
              "
            >
              {" "}de Ingeniería
            </span>

          </h2>

          <div
            className="
              space-y-8
              mt-16
            "
          >

            {/* ADMINISTRACIÓN */}

            <div
              className="
                flex
                gap-5
              "
            >

              <FaChartLine
                size={28}
              />

              <div>

                <h3
                  className="
                    font-semibold
                    text-xl
                  "
                >
                  Administración de proyectos
                </h3>

                <p
                  className="
                    text-blue-200
                  "
                >
                  Control total del avance.
                </p>

              </div>

            </div>

            {/* PERSONAL */}

            <div
              className="
                flex
                gap-5
              "
            >

              <FaUsers
                size={28}
              />

              <div>

                <h3
                  className="
                    font-semibold
                    text-xl
                  "
                >
                  Gestión del personal
                </h3>

                <p
                  className="
                    text-blue-200
                  "
                >
                  Organización de supervisores e ingenieros.
                </p>

              </div>

            </div>

            {/* SEGURIDAD */}

            <div
              className="
                flex
                gap-5
              "
            >

              <FaShieldAlt
                size={28}
              />

              <div>

                <h3
                  className="
                    font-semibold
                    text-xl
                  "
                >
                  Seguridad
                </h3>

                <p
                  className="
                    text-blue-200
                  "
                >
                  Acceso mediante roles.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          PANEL DERECHO
      ================================================= */}

      <section
        className="
          flex
          items-center
          justify-center
          p-10
        "
      >

        {showRegister ? (

          <RegisterAdmin

            loading={
              loading
            }

            onSubmit={
              registerAdmin
            }

            goLogin={() =>
              setShowRegister(false)
            }

          />

        ) : (

          <AuthForm

            email={
              email
            }

            setEmail={
              setEmail
            }

            password={
              password
            }

            setPassword={
              setPassword
            }

            loading={
              loading
            }

            onSubmit={
              login
            }

            goRegister={() =>
              setShowRegister(true)
            }

          />

        )}

      </section>

    </div>

  );

}