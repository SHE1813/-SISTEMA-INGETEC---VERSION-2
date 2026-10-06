const express = require("express");
const router = express.Router();

const db = require("../db");

const {
  authenticateToken,
  requireAdmin
} = require("../middleware/auth");


// ============================================================
// FUNCIÓN AUXILIAR
// ============================================================

// Verifica si un proyecto pertenece al usuario encargado
function verificarProyectoDelEncargado(projectId, userId, callback) {

  const sql = `
    SELECT id
    FROM projects
    WHERE id = ?
    AND user_id = ?
    LIMIT 1
  `;

  db.query(
    sql,
    [projectId, userId],
    (error, results) => {

      if (error) {
        console.error(
          "❌ Error verificando proyecto:",
          error
        );

        return callback(error, false);
      }

      return callback(
        null,
        results.length > 0
      );
    }
  );
}


// ============================================================
// OBTENER PERSONAL
// ============================================================

router.get(
  "/",
  authenticateToken,
  (req, res) => {

    console.log("");
    console.log("==========================================");
    console.log("📥 GET /personal");
    console.log("👤 USUARIO:", req.user);
    console.log("==========================================");

    let sql;
    let params = [];

    // --------------------------------------------------------
    // ADMINISTRADOR
    // --------------------------------------------------------

    if (req.user.rol === "Administrador") {

      sql = `
        SELECT
          p.id,
          p.nombres,
          p.apellidos,
          p.dni,
          p.cargo,
          p.telefono,
          p.estado,
          p.project_id,
          pr.nombre AS proyecto
        FROM personal p
        LEFT JOIN projects pr
          ON p.project_id = pr.id
        ORDER BY p.id DESC
      `;

    }

    // --------------------------------------------------------
    // ENCARGADO
    // --------------------------------------------------------

    else {

      sql = `
        SELECT
          p.id,
          p.nombres,
          p.apellidos,
          p.dni,
          p.cargo,
          p.telefono,
          p.estado,
          p.project_id,
          pr.nombre AS proyecto
        FROM personal p
        INNER JOIN projects pr
          ON p.project_id = pr.id
        WHERE pr.user_id = ?
        ORDER BY p.id DESC
      `;

      params = [req.user.id];

    }


    db.query(
      sql,
      params,
      (error, results) => {

        if (error) {

          console.error(
            "❌ ERROR OBTENIENDO PERSONAL:",
            error
          );

          return res.status(500).json({
            success: false,
            message: "Error obteniendo personal.",
            error: error.message,
            sqlMessage: error.sqlMessage
          });

        }

        console.log(
          "👥 PERSONAL ENCONTRADO:",
          results.length
        );

        return res.json(results);

      }
    );

  }
);


// ============================================================
// OBTENER PROYECTOS PARA EL FORMULARIO
// ============================================================

router.get(
  "/proyectos",
  authenticateToken,
  (req, res) => {

    console.log("");
    console.log("==========================================");
    console.log("📥 GET /personal/proyectos");
    console.log("👤 USUARIO:", req.user);
    console.log("==========================================");

    let sql;
    let params = [];


    // --------------------------------------------------------
    // ADMINISTRADOR
    // --------------------------------------------------------

    if (req.user.rol === "Administrador") {

      sql = `
        SELECT
          id,
          nombre,
          responsable,
          estado,
          fecha,
          user_id
        FROM projects
        ORDER BY nombre ASC
      `;

    }

    // --------------------------------------------------------
    // ENCARGADO
    // --------------------------------------------------------

    else {

      sql = `
        SELECT
          id,
          nombre,
          responsable,
          estado,
          fecha,
          user_id
        FROM projects
        WHERE user_id = ?
        ORDER BY nombre ASC
      `;

      params = [req.user.id];

    }


    db.query(
      sql,
      params,
      (error, results) => {

        if (error) {

          console.error(
            "❌ ERROR OBTENIENDO PROYECTOS:",
            error
          );

          return res.status(500).json({
            success: false,
            message: "Error obteniendo proyectos.",
            error: error.message,
            sqlMessage: error.sqlMessage
          });

        }

        console.log(
          "📁 PROYECTOS DISPONIBLES:",
          results.length
        );

        return res.json(results);

      }
    );

  }
);


// ============================================================
// REGISTRAR PERSONAL
// ============================================================

router.post(
  "/",
  authenticateToken,
  (req, res) => {

    console.log("");
    console.log("==========================================");
    console.log("📥 POST /personal");
    console.log("👤 USUARIO:", req.user);
    console.log("📦 DATOS:", req.body);
    console.log("==========================================");


    const {
      nombres,
      apellidos,
      dni,
      cargo,
      telefono,
      estado,
      project_id
    } = req.body;


    // --------------------------------------------------------
    // VALIDACIÓN
    // --------------------------------------------------------

    if (
      !nombres ||
      !apellidos ||
      !dni ||
      !cargo ||
      !project_id
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Complete los campos obligatorios."
      });

    }


    // --------------------------------------------------------
    // VALIDAR PROYECTO
    // --------------------------------------------------------

    function continuarRegistro() {

      const verificarDni = `
        SELECT id
        FROM personal
        WHERE dni = ?
        LIMIT 1
      `;


      db.query(
        verificarDni,
        [dni],
        (error, results) => {

          if (error) {

            console.error(
              "❌ ERROR VERIFICANDO DNI:",
              error
            );

            return res.status(500).json({
              success: false,
              message:
                "Error verificando el DNI.",
              error: error.message
            });

          }


          // --------------------------------------------------
          // DNI DUPLICADO
          // --------------------------------------------------

          if (results.length > 0) {

            return res.status(409).json({
              success: false,
              message:
                "El DNI ya está registrado."
            });

          }


          // --------------------------------------------------
          // INSERTAR PERSONAL
          // --------------------------------------------------

          const sql = `
            INSERT INTO personal
            (
              nombres,
              apellidos,
              dni,
              cargo,
              telefono,
              estado,
              project_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;


          db.query(
            sql,
            [
              nombres,
              apellidos,
              dni,
              cargo,
              telefono || "",
              estado || "Activo",
              project_id
            ],
            (insertError, result) => {

              if (insertError) {

                console.error(
                  "❌ ERROR REGISTRANDO PERSONAL:",
                  insertError
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Error registrando personal.",
                  error:
                    insertError.message,
                  sqlMessage:
                    insertError.sqlMessage
                });

              }


              console.log(
                "✅ PERSONAL REGISTRADO. ID:",
                result.insertId
              );


              return res.status(201).json({
                success: true,
                message:
                  "Personal registrado correctamente.",
                id: result.insertId
              });

            }
          );

        }
      );

    }


    // --------------------------------------------------------
    // ADMINISTRADOR
    // --------------------------------------------------------

    if (req.user.rol === "Administrador") {

      continuarRegistro();

      return;
    }


    // --------------------------------------------------------
    // ENCARGADO
    // --------------------------------------------------------

    verificarProyectoDelEncargado(
      project_id,
      req.user.id,
      (error, pertenece) => {

        if (error) {

          return res.status(500).json({
            success: false,
            message:
              "Error verificando el proyecto.",
            error: error.message
          });

        }


        if (!pertenece) {

          return res.status(403).json({
            success: false,
            message:
              "No tienes permiso para registrar personal en este proyecto."
          });

        }


        continuarRegistro();

      }
    );

  }
);


// ============================================================
// ACTUALIZAR PERSONAL
// ============================================================

router.put(
  "/:id",
  authenticateToken,
  (req, res) => {

    const { id } = req.params;

    const {
      nombres,
      apellidos,
      dni,
      cargo,
      telefono,
      estado,
      project_id
    } = req.body;


    console.log("");
    console.log("==========================================");
    console.log("📥 PUT /personal/" + id);
    console.log("👤 USUARIO:", req.user);
    console.log("📦 DATOS:", req.body);
    console.log("==========================================");


    // --------------------------------------------------------
    // VALIDACIÓN
    // --------------------------------------------------------

    if (
      !nombres ||
      !apellidos ||
      !dni ||
      !cargo ||
      !project_id
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Complete los campos obligatorios."
      });

    }


    // --------------------------------------------------------
    // CONTINUAR ACTUALIZACIÓN
    // --------------------------------------------------------

    function continuarActualizacion() {

      const verificarDni = `
        SELECT id
        FROM personal
        WHERE dni = ?
        AND id <> ?
        LIMIT 1
      `;


      db.query(
        verificarDni,
        [dni, id],
        (error, results) => {

          if (error) {

            console.error(
              "❌ ERROR VERIFICANDO DNI:",
              error
            );

            return res.status(500).json({
              success: false,
              message:
                "Error verificando el DNI.",
              error: error.message
            });

          }


          if (results.length > 0) {

            return res.status(409).json({
              success: false,
              message:
                "El DNI ya pertenece a otro personal."
            });

          }


          // ------------------------------------------------
          // ACTUALIZAR
          // ------------------------------------------------

          const sql = `
            UPDATE personal
            SET
              nombres = ?,
              apellidos = ?,
              dni = ?,
              cargo = ?,
              telefono = ?,
              estado = ?,
              project_id = ?
            WHERE id = ?
          `;


          db.query(
            sql,
            [
              nombres,
              apellidos,
              dni,
              cargo,
              telefono || "",
              estado || "Activo",
              project_id,
              id
            ],
            (updateError, result) => {

              if (updateError) {

                console.error(
                  "❌ ERROR ACTUALIZANDO PERSONAL:",
                  updateError
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Error actualizando personal.",
                  error:
                    updateError.message,
                  sqlMessage:
                    updateError.sqlMessage
                });

              }


              console.log(
                "✅ PERSONAL ACTUALIZADO:",
                id
              );


              return res.json({
                success: true,
                message:
                  "Personal actualizado correctamente."
              });

            }
          );

        }
      );

    }


    // --------------------------------------------------------
    // ADMINISTRADOR
    // --------------------------------------------------------

    if (req.user.rol === "Administrador") {

      continuarActualizacion();

      return;
    }


    // --------------------------------------------------------
    // ENCARGADO
    // --------------------------------------------------------

    verificarProyectoDelEncargado(
      project_id,
      req.user.id,
      (error, pertenece) => {

        if (error) {

          return res.status(500).json({
            success: false,
            message:
              "Error verificando el proyecto.",
            error: error.message
          });

        }


        if (!pertenece) {

          return res.status(403).json({
            success: false,
            message:
              "No tienes permiso para usar este proyecto."
          });

        }


        // ----------------------------------------------
        // Verificar que el personal también sea suyo
        // ----------------------------------------------

        const verificarPersonal = `
          SELECT p.id
          FROM personal p
          INNER JOIN projects pr
            ON p.project_id = pr.id
          WHERE p.id = ?
          AND pr.user_id = ?
          LIMIT 1
        `;


        db.query(
          verificarPersonal,
          [id, req.user.id],
          (personalError, personalResults) => {

            if (personalError) {

              console.error(
                "❌ ERROR VERIFICANDO PERSONAL:",
                personalError
              );

              return res.status(500).json({
                success: false,
                message:
                  "Error verificando el personal.",
                error:
                  personalError.message
              });

            }


            if (personalResults.length === 0) {

              return res.status(403).json({
                success: false,
                message:
                  "No tienes permiso para modificar este personal."
              });

            }


            continuarActualizacion();

          }
        );

      }
    );

  }
);


// ============================================================
// ELIMINAR PERSONAL
// ============================================================

router.delete(
  "/:id",
  authenticateToken,
  (req, res) => {

    const { id } = req.params;


    console.log("");
    console.log("==========================================");
    console.log("🗑️ DELETE /personal/" + id);
    console.log("👤 USUARIO:", req.user);
    console.log("==========================================");


    // --------------------------------------------------------
    // ADMINISTRADOR
    // --------------------------------------------------------

    if (req.user.rol === "Administrador") {

      const sql = `
        DELETE FROM personal
        WHERE id = ?
      `;


      db.query(
        sql,
        [id],
        (error, result) => {

          if (error) {

            console.error(
              "❌ ERROR ELIMINANDO PERSONAL:",
              error
            );

            return res.status(500).json({
              success: false,
              message:
                "Error eliminando personal.",
              error:
                error.message
            });

          }


          return res.json({
            success: true,
            message:
              "Personal eliminado correctamente."
          });

        }
      );

      return;
    }


    // --------------------------------------------------------
    // ENCARGADO
    // --------------------------------------------------------

    const verificarPersonal = `
      SELECT p.id
      FROM personal p
      INNER JOIN projects pr
        ON p.project_id = pr.id
      WHERE p.id = ?
      AND pr.user_id = ?
      LIMIT 1
    `;


    db.query(
      verificarPersonal,
      [id, req.user.id],
      (error, results) => {

        if (error) {

          console.error(
            "❌ ERROR VERIFICANDO PERSONAL:",
            error
          );

          return res.status(500).json({
            success: false,
            message:
              "Error verificando el personal.",
            error:
              error.message
          });

        }


        if (results.length === 0) {

          return res.status(403).json({
            success: false,
            message:
              "No tienes permiso para eliminar este personal."
          });

        }


        const sql = `
          DELETE FROM personal
          WHERE id = ?
        `;


        db.query(
          sql,
          [id],
          (deleteError) => {

            if (deleteError) {

              console.error(
                "❌ ERROR ELIMINANDO PERSONAL:",
                deleteError
              );

              return res.status(500).json({
                success: false,
                message:
                  "Error eliminando personal.",
                error:
                  deleteError.message
              });

            }


            console.log(
              "✅ PERSONAL ELIMINADO:",
              id
            );


            return res.json({
              success: true,
              message:
                "Personal eliminado correctamente."
            });

          }
        );

      }
    );

  }
);


// ============================================================
// EXPORTAR
// ============================================================

module.exports = router;