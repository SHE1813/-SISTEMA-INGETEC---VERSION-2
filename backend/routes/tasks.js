const express = require("express");
const router = express.Router();

const db = require("../db");

const {
  authenticateToken,
  requireAdmin
} = require("../middleware/auth");


// ============================================================
// PERMITIR ADMINISTRADOR O ENCARGADO
// ============================================================

function requireAdminOrEncargado(req, res, next) {

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "No autenticado."
    });
  }

  if (
    req.user.rol !== "Administrador" &&
    req.user.rol !== "Encargado"
  ) {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado."
    });
  }

  next();
}


// ============================================================
// GET /tasks
// ============================================================
// ADMINISTRADOR:
//    Puede ver todas las tareas.
//
// ENCARGADO:
//    Solo puede ver sus propias tareas.
// ============================================================

router.get(
  "/",
  authenticateToken,
  requireAdminOrEncargado,
  (req, res) => {

    console.log("");
    console.log("==============================================");
    console.log("📥 GET /tasks");
    console.log("👤 USUARIO:", req.user);
    console.log("==============================================");


    // ========================================================
    // ADMINISTRADOR
    // ========================================================

    if (req.user.rol === "Administrador") {

      const sql = `
        SELECT
          t.id,
          t.project_id,
          t.titulo,
          t.responsable,
          t.estado,
          t.fecha,
          t.user_id,
          u.nombres,
          u.apellidos,
          u.email
        FROM tasks t
        LEFT JOIN users u
          ON t.user_id = u.id
        ORDER BY t.id DESC
      `;


      db.query(
        sql,
        [],
        (error, results) => {

          if (error) {

            console.error("");
            console.error("❌ ERROR MYSQL OBTENIENDO TAREAS:");
            console.error(error);
            console.error("❌ MESSAGE:", error.message);
            console.error("❌ SQL MESSAGE:", error.sqlMessage);
            console.error("❌ CODE:", error.code);

            return res.status(500).json({
              success: false,
              message: "Error obteniendo tareas.",
              error: error.message,
              sqlMessage: error.sqlMessage,
              code: error.code
            });
          }


          console.log(
            "📊 TOTAL DE TAREAS:",
            results.length
          );


          return res.json(results);
        }
      );

      return;
    }


    // ========================================================
    // ENCARGADO
    // ========================================================

    const sql = `
      SELECT
        t.id,
        t.project_id,
        t.titulo,
        t.responsable,
        t.estado,
        t.fecha,
        t.user_id,
        u.nombres,
        u.apellidos,
        u.email
      FROM tasks t
      LEFT JOIN users u
        ON t.user_id = u.id
      WHERE t.user_id = ?
      ORDER BY t.id DESC
    `;


    db.query(
      sql,
      [req.user.id],
      (error, results) => {

        if (error) {

          console.error("");
          console.error(
            "❌ ERROR MYSQL OBTENIENDO TAREAS DEL ENCARGADO:"
          );
          console.error(error);
          console.error("❌ MESSAGE:", error.message);
          console.error("❌ SQL MESSAGE:", error.sqlMessage);
          console.error("❌ CODE:", error.code);

          return res.status(500).json({
            success: false,
            message: "Error obteniendo tus tareas.",
            error: error.message,
            sqlMessage: error.sqlMessage,
            code: error.code
          });
        }


        console.log(
          `📊 TAREAS DEL ENCARGADO ${req.user.id}:`,
          results.length
        );


        return res.json(results);
      }
    );
  }
);


// ============================================================
// POST /tasks
// ============================================================
// ADMINISTRADOR:
//    Crea tarea y la asigna al Encargado indicado.
//
// ENCARGADO:
//    Puede crear una tarea para sí mismo.
// ============================================================

router.post(
  "/",
  authenticateToken,
  requireAdminOrEncargado,
  (req, res) => {

    console.log("");
    console.log("==============================================");
    console.log("📥 POST /tasks");
    console.log("👤 USUARIO:", req.user);
    console.log("📦 DATOS RECIBIDOS:", req.body);
    console.log("==============================================");


    const {
      project_id,
      titulo,
      responsable,
      estado,
      fecha
    } = req.body;


    // ========================================================
    // VALIDAR TÍTULO
    // ========================================================

    if (!titulo || !titulo.trim()) {

      return res.status(400).json({
        success: false,
        message: "El título de la tarea es obligatorio."
      });
    }


    // ========================================================
    // VALIDAR RESPONSABLE
    // ========================================================

    if (!responsable || !responsable.trim()) {

      return res.status(400).json({
        success: false,
        message: "El responsable es obligatorio."
      });
    }


    // ========================================================
    // SI ES ENCARGADO
    // ========================================================
    // Se asigna automáticamente a él mismo.
    // ========================================================

    if (req.user.rol === "Encargado") {

      const userId = req.user.id;


      const sql = `
        INSERT INTO tasks
        (
          project_id,
          titulo,
          responsable,
          estado,
          fecha,
          user_id
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;


      const valores = [
        project_id || null,
        titulo.trim(),
        responsable.trim(),
        estado || "Pendiente",
        fecha || null,
        userId
      ];


      console.log("📝 INSERT ENCARGADO");
      console.log("👤 USER_ID:", userId);
      console.log("📌 VALORES:", valores);


      db.query(
        sql,
        valores,
        (error, result) => {

          if (error) {

            console.error("");
            console.error(
              "❌ ERROR MYSQL GUARDANDO TAREA:"
            );
            console.error(error);
            console.error("❌ MESSAGE:", error.message);
            console.error("❌ SQL MESSAGE:", error.sqlMessage);
            console.error("❌ CODE:", error.code);

            return res.status(500).json({
              success: false,
              message: "Error guardando tarea.",
              error: error.message,
              sqlMessage: error.sqlMessage,
              code: error.code
            });
          }


          console.log("");
          console.log("✅ TAREA CREADA");
          console.log("🆔 ID:", result.insertId);
          console.log("👤 USER_ID:", userId);
          console.log("==============================================");


          return res.status(201).json({
            success: true,
            mensaje: "Tarea guardada correctamente.",
            id: result.insertId,
            user_id: userId
          });
        }
      );


      return;
    }


    // ========================================================
    // SI ES ADMINISTRADOR
    // ========================================================
    // Busca al Encargado mediante el campo responsable.
    //
    // Ejemplo:
    //
    // responsable = "ana"
    //
    // Busca:
    // Ana en users
    //
    // y obtiene:
    // ID = 16
    // ========================================================

    const responsableBuscado =
      responsable.trim();


    const sqlBuscarUsuario = `
      SELECT
        id,
        nombres,
        apellidos,
        email,
        rol,
        estado
      FROM users
      WHERE rol = 'Encargado'
      AND estado = 'Activo'
      AND (
        LOWER(nombres) = LOWER(?)
        OR LOWER(email) = LOWER(?)
        OR LOWER(CONCAT(nombres, ' ', apellidos)) = LOWER(?)
        OR LOWER(CONCAT(nombres, ' ', apellidos)) LIKE LOWER(?)
      )
      LIMIT 1
    `;


    const nombreCompleto =
      responsableBuscado;

    const nombreLike =
      `%${responsableBuscado}%`;


    console.log(
      "🔎 BUSCANDO ENCARGADO:",
      responsableBuscado
    );


    db.query(
      sqlBuscarUsuario,
      [
        responsableBuscado,
        responsableBuscado,
        nombreCompleto,
        nombreLike
      ],
      (error, usuarios) => {

        if (error) {

          console.error("");
          console.error(
            "❌ ERROR BUSCANDO ENCARGADO:"
          );
          console.error(error);
          console.error("❌ MESSAGE:", error.message);
          console.error("❌ SQL MESSAGE:", error.sqlMessage);

          return res.status(500).json({
            success: false,
            message: "Error buscando al responsable.",
            error: error.message,
            sqlMessage: error.sqlMessage
          });
        }


        // ====================================================
        // NO ENCONTRÓ AL ENCARGADO
        // ====================================================

        if (
          !usuarios ||
          usuarios.length === 0
        ) {

          console.error(
            "❌ NO SE ENCONTRÓ AL ENCARGADO:",
            responsableBuscado
          );


          return res.status(400).json({
            success: false,
            message:
              `No se encontró un Encargado activo llamado "${responsableBuscado}".`
          });
        }


        // ====================================================
        // ENCARGADO ENCONTRADO
        // ====================================================

        const encargado =
          usuarios[0];


        const encargadoId =
          encargado.id;


        console.log("");
        console.log("==============================================");
        console.log("✅ ENCARGADO ENCONTRADO");
        console.log("🆔 ID:", encargado.id);
        console.log("👤 NOMBRE:", encargado.nombres);
        console.log("👤 APELLIDOS:", encargado.apellidos);
        console.log("📧 EMAIL:", encargado.email);
        console.log("==============================================");


        // ====================================================
        // INSERTAR TAREA
        // ====================================================

        const sqlInsertar = `
          INSERT INTO tasks
          (
            project_id,
            titulo,
            responsable,
            estado,
            fecha,
            user_id
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `;


        const valoresInsertar = [
          project_id || null,
          titulo.trim(),
          responsable.trim(),
          estado || "Pendiente",
          fecha || null,
          encargadoId
        ];


        console.log("");
        console.log("📝 GUARDANDO TAREA");
        console.log("👤 USER_ID ASIGNADO:", encargadoId);
        console.log(
          "📌 VALORES:",
          valoresInsertar
        );


        db.query(
          sqlInsertar,
          valoresInsertar,
          (error, result) => {

            if (error) {

              console.error("");
              console.error(
                "❌ ERROR MYSQL GUARDANDO TAREA:"
              );
              console.error(error);
              console.error("❌ MESSAGE:", error.message);
              console.error(
                "❌ SQL MESSAGE:",
                error.sqlMessage
              );
              console.error(
                "❌ CODE:",
                error.code
              );


              return res.status(500).json({
                success: false,
                message: "Error guardando tarea.",
                error: error.message,
                sqlMessage: error.sqlMessage,
                code: error.code
              });
            }


            console.log("");
            console.log("==============================================");
            console.log("✅ TAREA GUARDADA CORRECTAMENTE");
            console.log("🆔 ID:", result.insertId);
            console.log("👤 USER_ID:", encargadoId);
            console.log("==============================================");


            return res.status(201).json({
              success: true,
              mensaje:
                "Tarea guardada correctamente.",
              id: result.insertId,
              user_id: encargadoId
            });
          }
        );
      }
    );
  }
);


// ============================================================
// PUT /tasks/:id
// ============================================================
// ADMINISTRADOR:
//    Puede editar cualquier tarea.
//
// ENCARGADO:
//    Solo puede editar sus propias tareas.
// ============================================================

router.put(
  "/:id",
  authenticateToken,
  requireAdminOrEncargado,
  (req, res) => {

    const taskId =
      req.params.id;


    const {
      project_id,
      titulo,
      responsable,
      estado,
      fecha
    } = req.body;


    if (!titulo || !titulo.trim()) {

      return res.status(400).json({
        success: false,
        message: "El título es obligatorio."
      });
    }


    if (!responsable || !responsable.trim()) {

      return res.status(400).json({
        success: false,
        message: "El responsable es obligatorio."
      });
    }


    // ========================================================
    // ADMINISTRADOR
    // ========================================================

    if (req.user.rol === "Administrador") {

      const sql = `
        UPDATE tasks
        SET
          project_id = ?,
          titulo = ?,
          responsable = ?,
          estado = ?,
          fecha = ?
        WHERE id = ?
      `;


      db.query(
        sql,
        [
          project_id || null,
          titulo.trim(),
          responsable.trim(),
          estado || "Pendiente",
          fecha || null,
          taskId
        ],
        (error, result) => {

          if (error) {

            console.error(
              "❌ ERROR ACTUALIZANDO TAREA:",
              error
            );

            return res.status(500).json({
              success: false,
              message:
                "Error actualizando tarea.",
              error: error.message,
              sqlMessage: error.sqlMessage
            });
          }


          return res.json({
            success: true,
            mensaje:
              "Tarea actualizada correctamente.",
            affectedRows:
              result.affectedRows
          });
        }
      );


      return;
    }


    // ========================================================
    // ENCARGADO
    // ========================================================

    const sql = `
      UPDATE tasks
      SET
        titulo = ?,
        responsable = ?,
        estado = ?,
        fecha = ?
      WHERE id = ?
      AND user_id = ?
    `;


    db.query(
      sql,
      [
        titulo.trim(),
        responsable.trim(),
        estado || "Pendiente",
        fecha || null,
        taskId,
        req.user.id
      ],
      (error, result) => {

        if (error) {

          console.error(
            "❌ ERROR ACTUALIZANDO TAREA:",
            error
          );

          return res.status(500).json({
            success: false,
            message:
              "Error actualizando tarea.",
            error: error.message,
            sqlMessage: error.sqlMessage
          });
        }


        if (
          result.affectedRows === 0
        ) {

          return res.status(403).json({
            success: false,
            message:
              "No tienes permiso para modificar esta tarea."
          });
        }


        return res.json({
          success: true,
          mensaje:
            "Tarea actualizada correctamente."
        });
      }
    );
  }
);


// ============================================================
// DELETE /tasks/:id
// ============================================================
// SOLO ADMINISTRADOR
// ============================================================

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  (req, res) => {

    const taskId =
      req.params.id;


    console.log("");
    console.log("==============================================");
    console.log("🗑️ DELETE /tasks/:id");
    console.log("🆔 ID:", taskId);
    console.log("👤 ADMIN:", req.user);
    console.log("==============================================");


    const sql = `
      DELETE FROM tasks
      WHERE id = ?
    `;


    db.query(
      sql,
      [taskId],
      (error, result) => {

        if (error) {

          console.error(
            "❌ ERROR ELIMINANDO TAREA:",
            error
          );

          return res.status(500).json({
            success: false,
            message:
              "Error eliminando tarea.",
            error: error.message,
            sqlMessage: error.sqlMessage
          });
        }


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({
            success: false,
            message:
              "Tarea no encontrada."
          });
        }


        console.log(
          "✅ TAREA ELIMINADA:",
          taskId
        );


        return res.json({
          success: true,
          mensaje:
            "Tarea eliminada correctamente."
        });
      }
    );
  }
);


// ============================================================
// EXPORTAR ROUTER
// ============================================================

module.exports = router;