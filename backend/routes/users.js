const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

const db = require("../db");

const {
    authenticateToken,
    requireAdmin
} = require("../middleware/auth");

console.log("✅ users.js cargado");


// =====================================
// OBTENER TODOS LOS USUARIOS
// SOLO ADMINISTRADOR
// =====================================

router.get("/", authenticateToken, requireAdmin, (req, res) => {

    const sql = `
        SELECT
            id,
            nombres,
            apellidos,
            email,
            telefono,
            cargo,
            area,
            rol,
            estado,
            created_at
        FROM users
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Error al obtener los usuarios."
            });

        }

        res.json({
            success: true,
            users: result
        });

    });

});


// =====================================
// CREAR USUARIO
// SOLO ADMINISTRADOR
//
// ROLES PERMITIDOS:
// - Ingeniero
// - Personal
//
// NUNCA SE PUEDE CREAR OTRO ADMINISTRADOR
// =====================================

router.post("/", authenticateToken, requireAdmin, async (req, res) => {

    try {

        const {
            nombres,
            apellidos,
            email,
            telefono,
            cargo,
            area,
            password,
            rol
        } = req.body;


        // -------------------------------
        // VALIDACIONES
        // -------------------------------

        if (!nombres || !apellidos || !email || !password || !rol) {

            return res.status(400).json({
                success: false,
                message:
                    "Nombres, apellidos, email, contraseña y tipo de usuario son obligatorios."
            });

        }


        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message:
                    "La contraseña debe tener al menos 8 caracteres."
            });

        }


        // -------------------------------
        // VALIDAR ROL
        // -------------------------------

        const rolesPermitidos = [
            "Ingeniero",
            "Personal"
        ];

        if (!rolesPermitidos.includes(rol)) {

            return res.status(400).json({
                success: false,
                message:
                    "El tipo de usuario seleccionado no es válido."
            });

        }


        // -------------------------------
        // VERIFICAR EMAIL
        // -------------------------------

        db.query(
            "SELECT id FROM users WHERE email = ?",
            [email],
            async (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message:
                            "Error al verificar el usuario."
                    });

                }


                if (result.length > 0) {

                    return res.status(409).json({
                        success: false,
                        message:
                            "El correo electrónico ya está registrado."
                    });

                }


                // -------------------------------
                // ENCRIPTAR CONTRASEÑA
                // -------------------------------

                const hash = await bcrypt.hash(
                    password,
                    10
                );


                // -------------------------------
                // CREAR USUARIO
                // -------------------------------

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
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Activo')
                `;


                db.query(
                    sql,
                    [
                        nombres,
                        apellidos,
                        email,
                        telefono || "",
                        cargo || "",
                        area || "",
                        hash,
                        rol
                    ],
                    (err, result) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Error al crear el usuario."
                            });

                        }


                        res.status(201).json({

                            success: true,

                            message:
                                `El usuario ${rol} fue creado correctamente.`,

                            userId:
                                result.insertId

                        });

                    }
                );

            }
        );

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message:
                "Error interno del servidor."
        });

    }

});


// =====================================
// ACTUALIZAR USUARIO
// SOLO ADMINISTRADOR
// =====================================

router.put(
    "/:id",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        const { id } = req.params;

        const {
            nombres,
            apellidos,
            email,
            telefono,
            cargo,
            area,
            estado
        } = req.body;


        const sql = `
            UPDATE users
            SET
                nombres = ?,
                apellidos = ?,
                email = ?,
                telefono = ?,
                cargo = ?,
                area = ?,
                estado = ?
            WHERE id = ?
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
                estado,
                id
            ],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message:
                            "Error al actualizar el usuario."
                    });

                }


                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Usuario no encontrado."
                    });

                }


                res.json({

                    success: true,

                    message:
                        "Usuario actualizado correctamente."

                });

            }
        );

    }
);


// =====================================
// ELIMINAR USUARIO
// SOLO ADMINISTRADOR
// =====================================

router.delete(
    "/:id",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        const { id } = req.params;


        db.query(
            "SELECT rol FROM users WHERE id = ?",
            [id],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message:
                            "Error al verificar el usuario."
                    });

                }


                if (result.length === 0) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Usuario no encontrado."
                    });

                }


                // ---------------------------------
                // NO PERMITIR ELIMINAR ADMINISTRADOR
                // ---------------------------------

                if (
                    result[0].rol === "Administrador"
                ) {

                    return res.status(403).json({
                        success: false,
                        message:
                            "El Administrador principal no puede ser eliminado."
                    });

                }


                // ---------------------------------
                // ELIMINAR INGENIERO O PERSONAL
                // ---------------------------------

                db.query(
                    "DELETE FROM users WHERE id = ?",
                    [id],
                    (err) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Error al eliminar el usuario."
                            });

                        }


                        res.json({

                            success: true,

                            message:
                                "Usuario eliminado correctamente."

                        });

                    }
                );

            }
        );

    }
);


module.exports = router;