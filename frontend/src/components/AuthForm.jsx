import { useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

export default function AuthForm({

  email,
  setEmail,

  password,
  setPassword,

  onSubmit,

  loading,

  goRegister

}) {

  const [showPassword, setShowPassword] = useState(false);

  return (

    <form
      onSubmit={onSubmit}
      className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md"
    >

      {/* LOGO */}

      <div className="text-center">

        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto">

          <span className="text-5xl font-black text-blue-700">

            I

          </span>

        </div>

        <h2 className="mt-6 text-4xl font-bold text-slate-800">

          Bienvenido

        </h2>

        <p className="mt-2 text-gray-500">

          Ingrese sus credenciales para continuar.

        </p>

      </div>

      {/* EMAIL */}

      <div className="mt-10 relative">

        <FaEnvelope
          className="absolute left-4 top-5 text-gray-400"
        />

        <input

          type="email"

          required

          value={email}

          onChange={(e)=>setEmail(e.target.value)}

          placeholder="Correo electrónico"

          className="w-full border rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"

        />

      </div>

      {/* PASSWORD */}

      <div className="mt-6 relative">

        <FaLock
          className="absolute left-4 top-5 text-gray-400"
        />

        <input

          type={

            showPassword

            ? "text"

            : "password"

          }

          required

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

          placeholder="Contraseña"

          className="w-full border rounded-xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-blue-500 outline-none"

        />

        <button

          type="button"

          onClick={()=>setShowPassword(!showPassword)}

          className="absolute right-4 top-5"

        >

          {

            showPassword

            ?

            <FaEyeSlash/>

            :

            <FaEye/>

          }

        </button>

      </div>

      {/* BOTÓN */}

      <button

        disabled={loading}

        className="mt-8 w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-4 rounded-xl font-bold hover:shadow-xl transition"

      >

        {

          loading

          ?

          "Ingresando..."

          :

          "Iniciar sesión"

        }

      </button>

      {/* OLVIDÓ */}

      <div className="mt-6 text-center">

        <button

          type="button"

          className="text-blue-700 hover:underline"

        >

          ¿Olvidó su contraseña?

        </button>

      </div>

      {/* REGISTRO */}

      <div className="mt-10 border-t pt-6 text-center">

        <p className="text-gray-500">

          ¿Primera vez utilizando el sistema?

        </p>

        <button

          type="button"

          onClick={goRegister}

          className="mt-3 text-blue-700 font-bold hover:underline"

        >

          Registrar Administrador

        </button>

      </div>

      <div className="mt-10 text-center text-gray-400 text-sm">

        © 2026 INGETEC

      </div>

    </form>

  );

}