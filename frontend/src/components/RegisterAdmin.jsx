import { useState } from "react";
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
  FaUserShield
} from "react-icons/fa";

export default function RegisterAdmin({

  onSubmit,

  goLogin,

  loading

}) {

  const [showPassword,setShowPassword]=useState(false);

  const [showConfirm,setShowConfirm]=useState(false);

  const [form,setForm]=useState({

    nombres:"",
    apellidos:"",
    telefono:"",
    cargo:"",
    area:"",
    email:"",
    password:"",
    confirmPassword:""

  });

  function handleChange(e){

    setForm({

      ...form,

      [e.target.name]:e.target.value

    });

  }

  function submit(e){

    e.preventDefault();

    if(form.password!==form.confirmPassword){

      alert("Las contraseñas no coinciden");

      return;

    }

    onSubmit(form);

  }

  return(

    <form

      onSubmit={submit}

      className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl"

    >

      <div className="text-center">

        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">

          <FaUserShield

            className="text-5xl text-blue-700"

          />

        </div>

        <h2 className="mt-6 text-4xl font-bold">

          Registrar Administrador

        </h2>

        <p className="text-gray-500 mt-3">

          Primera configuración del sistema.

        </p>

      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-10">

        <div className="relative">

          <FaUser className="absolute left-4 top-5 text-gray-400"/>

          <input

            name="nombres"

            placeholder="Nombres"

            value={form.nombres}

            onChange={handleChange}

            required

            className="w-full border rounded-xl py-4 pl-12"

          />

        </div>

        <div className="relative">

          <FaUser className="absolute left-4 top-5 text-gray-400"/>

          <input

            name="apellidos"

            placeholder="Apellidos"

            value={form.apellidos}

            onChange={handleChange}

            required

            className="w-full border rounded-xl py-4 pl-12"

          />

        </div>

        <div className="relative">

          <FaPhone className="absolute left-4 top-5 text-gray-400"/>

          <input

            name="telefono"

            placeholder="Teléfono"

            value={form.telefono}

            onChange={handleChange}

            required

            className="w-full border rounded-xl py-4 pl-12"

          />

        </div>

        <div className="relative">

          <FaBriefcase className="absolute left-4 top-5 text-gray-400"/>

          <input

            name="cargo"

            placeholder="Cargo"

            value={form.cargo}

            onChange={handleChange}

            required

            className="w-full border rounded-xl py-4 pl-12"

          />

        </div>

        <div className="relative">

          <FaBuilding className="absolute left-4 top-5 text-gray-400"/>

          <input

            name="area"

            placeholder="Área"

            value={form.area}

            onChange={handleChange}

            required

            className="w-full border rounded-xl py-4 pl-12"

          />

        </div>

        <div className="relative">

          <FaEnvelope className="absolute left-4 top-5 text-gray-400"/>

          <input

            type="email"

            name="email"

            placeholder="Correo"

            value={form.email}

            onChange={handleChange}

            required

            className="w-full border rounded-xl py-4 pl-12"

          />

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-5">

        <div className="relative">

          <FaLock className="absolute left-4 top-5 text-gray-400"/>

          <input

            type={showPassword?"text":"password"}

            name="password"

            placeholder="Contraseña"

            value={form.password}

            onChange={handleChange}

            required

            className="w-full border rounded-xl py-4 pl-12 pr-12"

          />

          <button

            type="button"

            className="absolute right-4 top-5"

            onClick={()=>setShowPassword(!showPassword)}

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

        <div className="relative">

          <FaLock className="absolute left-4 top-5 text-gray-400"/>

          <input

            type={showConfirm?"text":"password"}

            name="confirmPassword"

            placeholder="Confirmar contraseña"

            value={form.confirmPassword}

            onChange={handleChange}

            required

            className="w-full border rounded-xl py-4 pl-12 pr-12"

          />

          <button

            type="button"

            className="absolute right-4 top-5"

            onClick={()=>setShowConfirm(!showConfirm)}

          >

            {

              showConfirm

              ?

              <FaEyeSlash/>

              :

              <FaEye/>

            }

          </button>

        </div>

      </div>

      <div className="bg-blue-50 rounded-xl p-5 mt-8">

        <h3 className="font-bold text-blue-700">

          Rol asignado automáticamente

        </h3>

        <p className="text-blue-600 mt-2">

          Administrador

        </p>

      </div>

      <div className="flex justify-between mt-8">

        <button

          type="button"

          onClick={goLogin}

          className="flex items-center gap-2 text-blue-700"

        >

          <FaArrowLeft/>

          Volver

        </button>

        <button

          className="bg-blue-700 text-white px-8 py-4 rounded-xl hover:bg-blue-800"

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