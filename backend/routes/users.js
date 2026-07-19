const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
    
const db = require("../db");

console.log("✅ users.js cargado");
// =====================================
// OBTENER TODOS LOS USUARIOS
// =====================================

router.get("/", (req, res) => {

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
            return res.status(500).json(err);
        }

        res.json(result);

    });

});


// =====================================
// CREAR USUARIO
// =====================================

router.post("/", async (req, res) => {

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

        const hash = await bcrypt.hash(password, 10);

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

            VALUES
            (
                ?,?,?,?,?,?,?,?,
                'Activo'
            )
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
                hash,
                rol
            ],

            (err, result) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "El Usuario fue creado correctamente"
                });

            }

        );

    }

    catch (error) {

        console.log(error);

        res.status(500).json(error);

    }

});


// =====================================
// ACTUALIZAR USUARIO
// =====================================

router.put("/:id", (req, res) => {

    const { id } = req.params;

    const {

        nombres,
        apellidos,
        email,
        telefono,
        cargo,
        area,
        rol,
        estado

    } = req.body;

    const sql = `

        UPDATE users

        SET

            nombres=?,
            apellidos=?,
            email=?,
            telefono=?,
            cargo=?,
            area=?,
            rol=?,
            estado=?

        WHERE id=?

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
            rol,
            estado,
            id

        ],

        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json(err);

            }

            res.json({

                success: true,
                message: "Usuario actualizado"

            });

        }

    );

});


// =====================================
// ELIMINAR USUARIO
// =====================================

router.delete("/:id", (req, res) => {

    const { id } = req.params;

    db.query(

        "DELETE FROM users WHERE id=?",

        [id],

        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json(err);

            }

            res.json({

                success: true,
                message: "Usuario eliminado"

            });

        }

    );

});

module.exports = router;