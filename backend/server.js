  require("dotenv").config();

  const express = require("express");
  const cors = require("cors");
  const bcrypt = require("bcryptjs");

  const db = require("./db");

  const app = express()

  app.use(cors())
  app.use(express.json())

  // ==========================
// CONFIGURACIÓN INICIAL
// ==========================

app.get("/setup", (req, res) => {

  const sql = `
    SELECT COUNT(*) AS total
    FROM users
    WHERE rol = 'Administrador'
  `;

  db.query(sql, (error, result) => {

    if (error) {
      return res.status(500).json(error);
    }

    res.json({

      adminExists: result[0].total > 0

    });

  });

});

  // ==========================
  // LOGIN
  // ==========================

  app.post("/login", (req, res) => {

    const { email, password } = req.body;

    console.log("================================");
    console.log("Email recibido:", email);

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        console.log("Resultado SQL:", result);

        if (result.length === 0) {

            console.log("NO SE ENCONTRÓ EL USUARIO");

            return res.json({
                success:false,
                message:"Usuario no encontrado"
            });

        }

        const user = result[0];

        console.log("Usuario encontrado:", user.email);

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        console.log("Password válida:", validPassword);

        if(!validPassword){

            return res.json({
                success:false,
                message:"Contraseña incorrecta"
            });

        }

        res.json({
            success:true,
            user
        });

    });

});

  // ==========================
// REGISTRO
// ==========================

app.post("/register", async (req, res) => {

  const {
    nombres,
    apellidos,
    telefono,
    cargo,
    area,
    email,
    password
  } = req.body;

  try {

    // Verificar si el correo ya existe
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, result) => {

        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error del servidor"
          });
        }

        if (result.length > 0) {
          return res.json({
            success: false,
            message: "El correo ya está registrado"
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `

          INSERT INTO users
          (
            nombres,
            apellidos,
            email,
            telefono,
            cargo,
            area,
            password,
            rol,
            estado
          )

          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

        `;

        db.query(

          sql,

          [
            nombres,
            apellidos,
            email,
            telefono,
            cargo,
            area,
            hashedPassword,
            "Administrador",
            "Activo"
          ],

          (error) => {

            if (error) {

              console.log(error);

              return res.status(500).json({

                success: false,
                message: "Error al registrar usuario"

              });

            }

            res.json({

              success: true,
              message: "Administrador registrado correctamente"

            });

          }

        );

      }

    );

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      message: "Error interno"

    });

  }

});
  // ==========================
  // OBTENER PROYECTOS
  // ==========================

  app.get("/projects", (req, res) => {

    const sql =
      "SELECT * FROM projects"

    db.query(sql, (error, results) => {

      if (error) {

        return res.status(500).json(error)

      }

      res.json(results)

    })

  })

  // ==========================
  // GUARDAR PROYECTO
  // ==========================

  app.post("/projects", (req, res) => {

    const {
      nombre,
      responsable,
      estado,
      fecha
    } = req.body

    const sql = `

      INSERT INTO projects
      (nombre, responsable, estado, fecha)

      VALUES (?, ?, ?, ?)

    `

    db.query(

      sql,

      [
        nombre,
        responsable,
        estado,
        fecha
      ],

      (error, result) => {

        if (error) {

          console.log(error)

          return res.status(500).json(error)

        }

        res.json({

          success: true,
          mensaje: "Proyecto guardado"

        })

      }

    )

  })

  // ==========================
  // ACTUALIZAR PROYECTO
  // ==========================

  app.put("/projects/:id", (req, res) => {

    const { id } = req.params

    const {
      nombre,
      responsable,
      estado,
      fecha
    } = req.body

    const sql = `

      UPDATE projects

      SET
        nombre = ?,
        responsable = ?,
        estado = ?,
        fecha = ?

      WHERE id = ?

    `

    db.query(

      sql,

      [
        nombre,
        responsable,
        estado,
        fecha,
        id
      ],

      (error, result) => {

        if (error) {

          return res.status(500).json(error)

        }

        res.json({

          success: true,
          mensaje: "Proyecto actualizado"

        })

      }

    )

  })

  // ==========================
  // ELIMINAR PROYECTO
  // ==========================

  app.delete("/projects/:id", (req, res) => {

    const { id } = req.params

    const sql =
      "DELETE FROM projects WHERE id = ?"

    db.query(sql, [id], (error, result) => {

      if (error) {

        return res.status(500).json(error)

      }

      res.json({

        success: true,
        mensaje: "Proyecto eliminado"

      })

    })

  })

  // ==========================
  // OBTENER TAREAS
  // ==========================

  app.get("/tasks", (req, res) => {

    const sql =
      "SELECT * FROM tasks"

    db.query(sql, (error, results) => {

      if (error) {

        return res.status(500).json(error)

      }

      res.json(results)

    })

  })

  // ==========================
  // GUARDAR TAREA
  // ==========================

  app.post("/tasks", (req, res) => {

    const {
      titulo,
      responsable,
      estado,
      fecha
    } = req.body

    const sql = `

      INSERT INTO tasks
      (titulo, responsable, estado, fecha)

      VALUES (?, ?, ?, ?)

    `

    db.query(

      sql,

      [
        titulo,
        responsable,
        estado,
        fecha
      ],

      (error, result) => {

        if (error) {

          console.log(error)

          return res.status(500).json(error)

        }

        res.json({

          success: true,
          mensaje: "Tarea guardada"

        })

      }

    )

  })

  // ==========================
  // ACTUALIZAR TAREA
  // ==========================

  app.put("/tasks/:id", (req, res) => {

    const { id } = req.params

    const {
      titulo,
      responsable,
      estado,
      fecha
    } = req.body

    const sql = `

      UPDATE tasks

      SET
        titulo = ?,
        responsable = ?,
        estado = ?,
        fecha = ?

      WHERE id = ?

    `

    db.query(

      sql,

      [
        titulo,
        responsable,
        estado,
        fecha,
        id
      ],

      (error, result) => {

        if (error) {

          return res.status(500).json(error)

        }

        res.json({

          success: true,
          mensaje: "Tarea actualizada"

        })

      }

    )

  })

  // ==========================
  // ELIMINAR TAREA
  // ==========================

  app.delete("/tasks/:id", (req, res) => {

    const { id } = req.params

    const sql =
      "DELETE FROM tasks WHERE id = ?"

    db.query(sql, [id], (error, result) => {

      if (error) {

        return res.status(500).json(error)

      }

      res.json({

        success: true,
        mensaje: "Tarea eliminada"

      })

    })

  })

  // ==========================
  // DASHBOARD
  // ==========================

  app.get("/dashboard", (req, res) => {

    const sqlProjects =
      "SELECT COUNT(*) AS total FROM projects"

    const sqlTasks =
      "SELECT COUNT(*) AS total FROM tasks"

    const sqlPending =
      "SELECT COUNT(*) AS total FROM tasks WHERE estado = 'Pendiente'"

    const sqlDelayedTasks = `

      SELECT * FROM tasks

      WHERE estado = 'Pendiente'
      AND fecha < CURDATE()

    `

    const sqlDelayedProjects = `

      SELECT * FROM projects

      WHERE estado != 'Completado'
      AND fecha < CURDATE()

    `

    db.query(sqlProjects, (error, projectResult) => {

      if (error) {

        return res.status(500).json(error)

      }

      db.query(sqlTasks, (error, taskResult) => {

        if (error) {

          return res.status(500).json(error)

        }

        db.query(sqlPending, (error, pendingResult) => {

          if (error) {

            return res.status(500).json(error)

          }

          db.query(sqlDelayedTasks, (error, delayedTasks) => {

            if (error) {

              return res.status(500).json(error)

            }

            db.query(sqlDelayedProjects, (error, delayedProjects) => {

              if (error) {

                return res.status(500).json(error)

              }

              res.json({

                proyectos:
                  projectResult[0].total,

                tareas:
                  taskResult[0].total,

                pendientes:
                  pendingResult[0].total,

                retrasadas:
                  delayedTasks.length,

                tareasRetrasadas:
                  delayedTasks,

                proyectosRetrasados:
                  delayedProjects.length,

                listaProyectosRetrasados:
                  delayedProjects,

                reportes: 8

              })

            })

          })

        })

      })

    })

  })

  // ==========================
  // SERVIDOR
  // ==========================

    const PORT =
      process.env.PORT || 3000

    app.listen(PORT, () => {

      console.log(
        `Servidor ejecutándose en puerto ${PORT}`
      )

  })  