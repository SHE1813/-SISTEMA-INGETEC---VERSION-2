import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import {
  FaChartBar,
  FaPrint,
  FaSearch
} from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";


const API = "http://127.0.0.1:3000";


function Reports() {

  // =========================
  // ESTADOS
  // =========================

  const [projects, setProjects] =
    useState([]);

  const [tasks, setTasks] =
    useState([]);

  const [searchProject, setSearchProject] =
    useState("");

  const [searchTask, setSearchTask] =
    useState("");


  // =========================
  // TOKEN
  // =========================

  const getToken = () => {

    return localStorage.getItem("token");

  };


  // =========================
  // OBTENER DATOS
  // =========================

  const getData = async () => {

    try {

      const token = getToken();


      // =========================
      // PROYECTOS
      // =========================

      const projectsResponse =
        await axios.get(

          `${API}/projects`,

          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }

        );


      // =========================
      // TAREAS
      // =========================

      const tasksResponse =
        await axios.get(

          `${API}/tasks`,

          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }

        );


      setProjects(
        projectsResponse.data || []
      );


      setTasks(
        tasksResponse.data || []
      );


    } catch (error) {

      console.error(
        "Error obteniendo datos del reporte:",
        error
      );


      if (
        error.response?.status === 401
      ) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href = "/";

      }


      if (
        error.response?.status === 403
      ) {

        alert(
          error.response?.data?.message ||
          "No tienes permisos para acceder a los reportes."
        );

      }

    }

  };


  useEffect(() => {

    getData();

  }, []);


  // =========================
  // IMPRIMIR REPORTE
  // =========================

  const generatePDF = () => {

    window.print();

  };


  // =========================
  // DATOS DEL GRÁFICO
  // =========================

  const chartData = [

    {
      nombre: "Proyectos",
      total: projects.length
    },

    {
      nombre: "Tareas",
      total: tasks.length
    }

  ];


  // =========================
  // FILTRAR PROYECTOS
  // =========================

  const filteredProjects =
    projects.filter((project) => {

      const texto =
        searchProject.toLowerCase();

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
  // FILTRAR TAREAS
  // =========================

  const filteredTasks =
    tasks.filter((task) => {

      const texto =
        searchTask.toLowerCase();

      return (

        (task.titulo || "")
          .toLowerCase()
          .includes(texto)

        ||

        (task.responsable || "")
          .toLowerCase()
          .includes(texto)

        ||

        (task.estado || "")
          .toLowerCase()
          .includes(texto)

      );

    });


  // =========================
  // RENDER
  // =========================

  return (

    <div className="flex min-h-screen">

      {/* =========================
          SIDEBAR
      ========================= */}

      <div className="print:hidden">

        <Sidebar />

      </div>


      {/* =========================
          CONTENIDO
      ========================= */}

      <div className="flex-1 bg-slate-100 min-h-screen">

        {/* NAVBAR */}

        <div className="print:hidden">

          <Navbar />

        </div>


        <div className="p-8">


          {/* =========================
              ENCABEZADO
          ========================= */}

          <div className="bg-white rounded-2xl shadow-xl p-8">


            <div className="flex justify-between items-center mb-8">

              <div>

                <h1 className="text-4xl font-bold">

                  Reportes del Sistema

                </h1>

                <p className="text-gray-500 mt-2">

                  Consulta y supervisa la información general de Ingetec.

                </p>

              </div>


              <button

                onClick={generatePDF}

                className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl shadow-lg print:hidden"

              >

                <FaPrint />

                Imprimir PDF

              </button>

            </div>


            {/* =========================
                TARJETAS
            ========================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">


              {/* PROYECTOS */}

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-xl font-bold text-blue-800">

                      Total de Proyectos

                    </h3>


                    <p className="text-5xl mt-4 font-bold text-blue-700">

                      {projects.length}

                    </p>

                  </div>


                  <FaChartBar className="text-5xl text-blue-600" />

                </div>

              </div>


              {/* TAREAS */}

              <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-xl font-bold text-green-800">

                      Total de Tareas

                    </h3>


                    <p className="text-5xl mt-4 font-bold text-green-600">

                      {tasks.length}

                    </p>

                  </div>


                  <FaChartBar className="text-5xl text-green-600" />

                </div>

              </div>

            </div>


            {/* =========================
                GRÁFICO
            ========================= */}

            <div className="bg-slate-50 border rounded-2xl p-8 mb-10">

              <h2 className="text-2xl font-bold mb-6">

                Estadísticas del Sistema

              </h2>


              <ResponsiveContainer

                width="100%"

                height={350}

              >

                <BarChart data={chartData}>

                  <XAxis
                    dataKey="nombre"
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="total"
                    fill="#2563EB"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/* =========================
                PROYECTOS
            ========================= */}

            <div className="mb-10">


              <div className="flex justify-between items-center mb-5">

                <div>

                  <h2 className="text-2xl font-bold">

                    Lista de Proyectos

                  </h2>

                  <p className="text-gray-500">

                    Proyectos registrados en el sistema.

                  </p>

                </div>

              </div>


              {/* BUSCADOR */}

              <div className="relative mb-5 print:hidden">

                <FaSearch

                  className="absolute left-4 top-4 text-gray-400"

                />


                <input

                  type="text"

                  placeholder="Buscar proyecto..."

                  value={searchProject}

                  onChange={(e) =>
                    setSearchProject(e.target.value)
                  }

                  className="w-full border rounded-xl pl-12 p-3 outline-none focus:ring-2 focus:ring-blue-500"

                />

              </div>


              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b bg-blue-700 text-white">

                      <th className="p-4 text-left">

                        ID

                      </th>

                      <th className="p-4 text-left">

                        Proyecto

                      </th>

                      <th className="p-4">

                        Responsable

                      </th>

                      <th className="p-4">

                        Estado

                      </th>

                      <th className="p-4">

                        Fecha

                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredProjects.length === 0 ? (

                      <tr>

                        <td

                          colSpan="5"

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

                            <td className="p-4">

                              {project.id}

                            </td>


                            <td className="p-4 font-semibold">

                              {project.nombre}

                            </td>


                            <td className="p-4 text-center">

                              {project.responsable}

                            </td>


                            <td className="p-4 text-center">

                              {project.estado}

                            </td>


                            <td className="p-4 text-center">

                              {project.fecha
                                ? project.fecha.split("T")[0]
                                : "-"}

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>


            {/* =========================
                TAREAS
            ========================= */}

            <div>


              <div className="mb-5">

                <h2 className="text-2xl font-bold">

                  Lista de Tareas

                </h2>

                <p className="text-gray-500">

                  Tareas registradas en el sistema.

                </p>

              </div>


              {/* BUSCADOR */}

              <div className="relative mb-5 print:hidden">

                <FaSearch

                  className="absolute left-4 top-4 text-gray-400"

                />


                <input

                  type="text"

                  placeholder="Buscar tarea..."

                  value={searchTask}

                  onChange={(e) =>
                    setSearchTask(e.target.value)
                  }

                  className="w-full border rounded-xl pl-12 p-3 outline-none focus:ring-2 focus:ring-green-500"

                />

              </div>


              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b bg-green-700 text-white">

                      <th className="p-4 text-left">

                        ID

                      </th>

                      <th className="p-4 text-left">

                        Tarea

                      </th>

                      <th className="p-4">

                        Responsable

                      </th>

                      <th className="p-4">

                        Estado

                      </th>

                      <th className="p-4">

                        Fecha

                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredTasks.length === 0 ? (

                      <tr>

                        <td

                          colSpan="5"

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

                            <td className="p-4">

                              {task.id}

                            </td>


                            <td className="p-4 font-semibold">

                              {task.titulo}

                            </td>


                            <td className="p-4 text-center">

                              {task.responsable}

                            </td>


                            <td className="p-4 text-center">

                              {task.estado}

                            </td>


                            <td className="p-4 text-center">

                              {task.fecha
                                ? task.fecha.split("T")[0]
                                : "-"}

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

      </div>

    </div>

  );

}

export default Reports;