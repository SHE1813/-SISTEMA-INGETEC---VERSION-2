import { useState } from "react";
import axios from "axios";
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

  const API = "http://127.0.0.1:3000";

  const [loading, setLoading] = useState(false);

  const [showRegister, setShowRegister] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  // ===========================
  // LOGIN
  // ===========================

  const login = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

        const { data } = await axios.post(`${API}/login`, {
            email,
            password
        });

        console.log("Respuesta:", data);

        if (!data.success) {

            alert(data.message);
            setLoading(false);
            return;

        }

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        console.log(localStorage.getItem("user"));

        navigate("/dashboard");

    } catch (error) {

        console.log(error);
        alert("No fue posible iniciar sesión.");

    } finally {

        setLoading(false);

    }

};

  // ===========================
  // REGISTRAR ADMINISTRADOR
  // ===========================

  const registerAdmin = async (form) => {

    setLoading(true);

    try {

      const { data } = await axios.post(

        `${API}/register`,

        form

      );

      alert(data.message);

      if (data.success) {

        setShowRegister(false);

      }

    }

    catch (error) {

      console.log(error);

      alert("Error al registrar administrador.");

    }

    setLoading(false);

  };

  return (

    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-100">

      {/* ==========================
          PANEL IZQUIERDO
      ========================== */}

      <section className="hidden lg:flex relative overflow-hidden">

        <img

          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80"

          alt=""

          className="absolute inset-0 w-full h-full object-cover"

        />

        <div className="absolute inset-0 bg-blue-950/80"></div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">

          <h1 className="text-6xl font-black tracking-wide">

            INGETEC

          </h1>

          <div className="w-24 h-1 bg-blue-400 rounded-full mt-6"></div>

          <h2 className="mt-8 text-4xl font-bold leading-tight">

            Sistema Integral para la

            <br />

            Supervisión y Control

            <br />

            de Proyectos

            <span className="text-blue-300">

              {" "}de Ingeniería

            </span>

          </h2>

          <div className="space-y-8 mt-16">

            <div className="flex gap-5">

              <FaChartLine size={28}/>

              <div>

                <h3 className="font-semibold text-xl">

                  Administración de proyectos

                </h3>

                <p className="text-blue-200">

                  Control total del avance.

                </p>

              </div>

            </div>

            <div className="flex gap-5">

              <FaUsers size={28}/>

              <div>

                <h3 className="font-semibold text-xl">

                  Gestión del personal

                </h3>

                <p className="text-blue-200">

                  Organización de supervisores e ingenieros.

                </p>

              </div>

            </div>

            <div className="flex gap-5">

              <FaShieldAlt size={28}/>

              <div>

                <h3 className="font-semibold text-xl">

                  Seguridad

                </h3>

                <p className="text-blue-200">

                  Acceso mediante roles.

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* PANEL DERECHO */}

      <section className="flex items-center justify-center p-10">
        {
          showRegister
            ?
            <RegisterAdmin
              loading={loading}
              onSubmit={registerAdmin}
              goLogin={()=>setShowRegister(false)}
            />
            :
            <AuthForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              onSubmit={login}
              goRegister={()=>setShowRegister(true)}
            />
        }
      </section>

    </div>

  );

}