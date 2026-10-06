// ============================================================
// INGETEC - SERVIDOR PRINCIPAL
// ============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./db");

const app = express();

// ============================================================
// CONFIGURACIÓN
// ============================================================

const PORT = process.env.PORT || 3000;

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "INGETEC_SECRET_CAMBIAR_EN_ENV";

const ADMIN_SETUP_KEY =
    process.env.ADMIN_SETUP_KEY ||
    "INGETEC_ADMIN_2026";

// ============================================================
// MIDDLEWARES
// ============================================================

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// FUNCIÓN PARA HACER CONSULTAS MYSQL
// ============================================================
// IMPORTANTE:
// NO usamos await db.query() directamente.
// Esta función convierte db.query callback en Promise.
// ============================================================

function query(sql, params = []) {

    return new Promise((resolve, reject) => {

        db.query(
            sql,
            params,
            (error, results) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(results);

            }
        );

    });

}

// ============================================================
// TOKEN
// ============================================================

function generateToken(user) {

    return jwt.sign(

        {
            id: user.id,
            email: user.email,
            rol: user.rol
        },

        JWT_SECRET,

        {
            expiresIn: "8h"
        }

    );

}

// ============================================================
// USUARIO SEGURO
// ============================================================

function safeUser(user) {

    return {

        id: user.id,

        nombres:
            user.nombres || "",

        apellidos:
            user.apellidos || "",

        email:
            user.email || "",

        telefono:
            user.telefono || "",

        cargo:
            user.cargo || "",

        area:
            user.area || "",

        rol:
            user.rol || "",

        estado:
            user.estado || "Activo"

    };

}

// ============================================================
// AUTENTICACIÓN
// ============================================================

function authenticateToken(req, res, next) {

    const authHeader =
        req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({

            success: false,

            message:
                "No autorizado. Token requerido."

        });

    }

    const token =
        authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : null;

    if (!token) {

        return res.status(401).json({

            success: false,

            message:
                "Token inválido."

        });

    }

    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        req.user = decoded;

        next();

    } catch (error) {

        console.error(
            "❌ TOKEN INVÁLIDO:",
            error.message
        );

        return res.status(401).json({

            success: false,

            message:
                "Sesión expirada o token inválido."

        });

    }

}

// ============================================================
// SOLO ADMINISTRADOR
// ============================================================

function requireAdmin(req, res, next) {

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "No autenticado."

        });

    }

    if (
        req.user.rol !==
        "Administrador"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Acceso permitido únicamente al Administrador."

        });

    }

    next();

}

// ============================================================
// ADMINISTRADOR O ENCARGADO
// ============================================================

function requireAdminOrEncargado(
    req,
    res,
    next
) {

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "No autenticado."

        });

    }

    if (
        req.user.rol !== "Administrador" &&
        req.user.rol !== "Encargado"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "No tienes permisos para realizar esta acción."

        });

    }

    next();

}

// ============================================================
// RUTA PRINCIPAL
// ============================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "Backend INGETEC funcionando correctamente."

    });

});

// ============================================================
// HEALTH
// ============================================================

app.get("/health", (req, res) => {

    res.json({

        success: true,

        status: "OK",

        message:
            "Servidor INGETEC operativo."

    });

});

// ============================================================
// SETUP
// ============================================================

app.get("/setup", async (req, res) => {

    try {

        const result =
            await query(`
                SELECT COUNT(*) AS total
                FROM users
                WHERE rol = 'Administrador'
            `);

        res.json({

            success: true,

            adminExists:
                Number(result[0].total) > 0

        });

    } catch (error) {

        console.error(
            "❌ ERROR /setup:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Error consultando administrador."

        });

    }

});

// ============================================================
// LOGIN
// ============================================================

app.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Correo y contraseña son obligatorios."

            });

        }

        const results =
            await query(
                `
                SELECT *
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [email.trim()]
            );

        if (
            !results ||
            results.length === 0
        ) {

            return res.json({

                success: false,

                message:
                    "Usuario no encontrado."

            });

        }

        const user = results[0];

        if (
            user.estado &&
            user.estado !== "Activo"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "El usuario se encuentra inactivo."

            });

        }

        const validPassword =
            await bcrypt.compare(
                String(password),
                String(user.password)
            );

        if (!validPassword) {

            return res.json({

                success: false,

                message:
                    "Contraseña incorrecta."

            });

        }

        const token =
            generateToken(user);

        return res.json({

            success: true,

            token,

            user:
                safeUser(user)

        });

    } catch (error) {

        console.error(
            "❌ ERROR LOGIN:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Error en la base de datos."

        });

    }

});

// ============================================================
// REGISTRO DEL PRIMER ADMINISTRADOR
// ============================================================

app.post(
    "/register",
    async (req, res) => {

        try {

            const {
                nombres,
                apellidos,
                telefono,
                cargo,
                area,
                email,
                password,
                setupKey
            } = req.body;

            if (
                !nombres ||
                !apellidos ||
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Complete los campos obligatorios."

                });

            }

            if (
                setupKey !==
                ADMIN_SETUP_KEY
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Clave de configuración incorrecta."

                });

            }

            const admins =
                await query(`
                    SELECT COUNT(*) AS total
                    FROM users
                    WHERE rol = 'Administrador'
                `);

            if (
                Number(admins[0].total) >= 1
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Ya existe un Administrador registrado."

                });

            }

            const existing =
                await query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [email.trim()]
                );

            if (existing.length > 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "El correo ya está registrado."

                });

            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const result =
                await query(
                    `
                    INSERT INTO users
                    (
                        nombres,
                        apellidos,
                        telefono,
                        cargo,
                        area,
                        email,
                        password,
                        rol,
                        estado
                    )
                    VALUES
                    (?, ?, ?, ?, ?, ?, ?, 'Administrador', 'Activo')
                    `,
                    [
                        nombres.trim(),
                        apellidos.trim(),
                        telefono || null,
                        cargo ||
                            "Administrador",
                        area ||
                            "Administración",
                        email.trim(),
                        hashedPassword
                    ]
                );

            res.status(201).json({

                success: true,

                message:
                    "Administrador registrado correctamente.",

                id:
                    result.insertId

            });

        } catch (error) {

            console.error(
                "❌ ERROR REGISTER:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error registrando administrador.",

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// ============================================================
// USUARIOS
// ============================================================
// ============================================================

// ------------------------------------------------------------
// OBTENER USUARIOS
// SOLO ADMINISTRADOR
// ------------------------------------------------------------

app.get(
    "/users",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const users =
                await query(`
                    SELECT
                        id,
                        nombres,
                        apellidos,
                        email,
                        telefono,
                        cargo,
                        area,
                        rol,
                        estado
                    FROM users
                    ORDER BY id DESC
                `);

            res.json(users);

        } catch (error) {

            console.error(
                "❌ ERROR GET /users:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error obteniendo usuarios.",

                error:
                    error.message

            });

        }

    }
);

// ------------------------------------------------------------
// CREAR USUARIO
// SOLO ADMINISTRADOR
// ------------------------------------------------------------

app.post(
    "/users",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                nombres,
                apellidos,
                email,
                password,
                telefono,
                cargo,
                area,
                rol
            } = req.body;

            if (
                !nombres ||
                !apellidos ||
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Nombres, apellidos, correo y contraseña son obligatorios."

                });

            }

            // No se permite crear otro administrador
            if (
                rol === "Administrador"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "No se puede crear otro Administrador."

                });

            }

            const rolesPermitidos = [
                "Encargado",
                "Ingeniero",
                "Personal"
            ];

            const rolFinal =
                rolesPermitidos.includes(rol)
                    ? rol
                    : "Ingeniero";

            const existing =
                await query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [email.trim()]
                );

            if (existing.length > 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "El correo ya está registrado."

                });

            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const result =
                await query(
                    `
                    INSERT INTO users
                    (
                        nombres,
                        apellidos,
                        email,
                        password,
                        telefono,
                        cargo,
                        area,
                        rol,
                        estado
                    )
                    VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, 'Activo')
                    `,
                    [
                        nombres.trim(),
                        apellidos.trim(),
                        email.trim(),
                        hashedPassword,
                        telefono || null,
                        cargo || "",
                        area || "",
                        rolFinal
                    ]
                );

            res.status(201).json({

                success: true,

                message:
                    "Usuario creado correctamente.",

                id:
                    result.insertId

            });

        } catch (error) {

            console.error(
                "❌ ERROR POST /users:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error creando usuario.",

                error:
                    error.message

            });

        }

    }
);

// ------------------------------------------------------------
// ACTUALIZAR USUARIO
// SOLO ADMINISTRADOR
// ------------------------------------------------------------

app.put(
    "/users/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const {
                nombres,
                apellidos,
                email,
                telefono,
                cargo,
                area,
                estado
            } = req.body;

            if (
                !nombres ||
                !apellidos ||
                !email
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Nombres, apellidos y correo son obligatorios."

                });

            }

            // No permitir modificar al administrador
            const user =
                await query(
                    `
                    SELECT id, rol
                    FROM users
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (user.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Usuario no encontrado."

                });

            }

            if (
                user[0].rol ===
                "Administrador"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "El Administrador principal no puede modificarse desde esta sección."

                });

            }

            const duplicate =
                await query(
                    `
                    SELECT id
                    FROM users
                    WHERE email = ?
                    AND id <> ?
                    LIMIT 1
                    `,
                    [
                        email.trim(),
                        id
                    ]
                );

            if (duplicate.length > 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "El correo ya pertenece a otro usuario."

                });

            }

            const result =
                await query(
                    `
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
                    `,
                    [
                        nombres.trim(),
                        apellidos.trim(),
                        email.trim(),
                        telefono || null,
                        cargo || "",
                        area || "",
                        estado || "Activo",
                        id
                    ]
                );

            if (
                result.affectedRows === 0
            ) {

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

        } catch (error) {

            console.error(
                "❌ ERROR PUT /users:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error actualizando usuario.",

                error:
                    error.message

            });

        }

    }
);

// ------------------------------------------------------------
// ELIMINAR USUARIO
// SOLO ADMINISTRADOR
// ------------------------------------------------------------

app.delete(
    "/users/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const user =
                await query(
                    `
                    SELECT id, rol
                    FROM users
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (user.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Usuario no encontrado."

                });

            }

            if (
                user[0].rol ===
                "Administrador"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "El Administrador principal no puede ser eliminado."

                });

            }

            const result =
                await query(
                    `
                    DELETE FROM users
                    WHERE id = ?
                    `,
                    [id]
                );

            res.json({

                success: true,

                message:
                    "Usuario eliminado correctamente."

            });

        } catch (error) {

            console.error(
                "❌ ERROR DELETE /users:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "No se pudo eliminar el usuario.",

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// ============================================================
// PROYECTOS
// ============================================================
// ============================================================

// ------------------------------------------------------------
// OBTENER PROYECTOS
// ADMINISTRADOR = TODOS
// ENCARGADO = SOLO LOS SUYOS
// ------------------------------------------------------------

app.get(
    "/projects",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            let projects;

            if (
                req.user.rol ===
                "Administrador"
            ) {

                projects =
                    await query(`
                        SELECT
                            p.*,
                            u.nombres AS encargado_nombres,
                            u.apellidos AS encargado_apellidos,
                            u.email AS encargado_email
                        FROM projects p
                        LEFT JOIN users u
                            ON p.user_id = u.id
                        ORDER BY p.id DESC
                    `);

            } else {

                projects =
                    await query(
                        `
                        SELECT
                            p.*,
                            u.nombres AS encargado_nombres,
                            u.apellidos AS encargado_apellidos,
                            u.email AS encargado_email
                        FROM projects p
                        LEFT JOIN users u
                            ON p.user_id = u.id
                        WHERE p.user_id = ?
                        ORDER BY p.id DESC
                        `,
                        [req.user.id]
                    );

            }

            res.json(projects);

        } catch (error) {

            console.error(
                "❌ ERROR GET /projects:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error obteniendo proyectos.",

                error:
                    error.message

            });

        }

    }
);

// ------------------------------------------------------------
// CREAR PROYECTO
// SOLO ADMINISTRADOR
// ------------------------------------------------------------

app.post(
    "/projects",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                nombre,
                responsable,
                estado,
                fecha
            } = req.body;

            console.log("");
            console.log(
                "=========================================="
            );
            console.log(
                "📥 POST /projects"
            );
            console.log(
                "📦 BODY:",
                req.body
            );

            if (
                !nombre ||
                !nombre.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "El nombre del proyecto es obligatorio."

                });

            }

            if (
                !responsable ||
                !String(responsable).trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "El responsable es obligatorio."

                });

            }

            if (!estado) {

                return res.status(400).json({

                    success: false,

                    message:
                        "El estado es obligatorio."

                });

            }

            if (!fecha) {

                return res.status(400).json({

                    success: false,

                    message:
                        "La fecha es obligatoria."

                });

            }

            // ------------------------------------------------
            // BUSCAR ENCARGADO
            // ------------------------------------------------

            const responsableTexto =
                String(responsable).trim();

            const usuarios =
                await query(
                    `
                    SELECT
                        id,
                        nombres,
                        apellidos,
                        email,
                        rol,
                        estado
                    FROM users
                    WHERE
                        rol = 'Encargado'
                        AND estado = 'Activo'
                        AND
                        (
                            CAST(id AS CHAR) = ?
                            OR LOWER(TRIM(email))
                                = LOWER(TRIM(?))
                            OR LOWER(TRIM(nombres))
                                = LOWER(TRIM(?))
                            OR LOWER(
                                TRIM(
                                    CONCAT(
                                        nombres,
                                        ' ',
                                        apellidos
                                    )
                                )
                            )
                                = LOWER(TRIM(?))
                        )
                    LIMIT 1
                    `,
                    [
                        responsableTexto,
                        responsableTexto,
                        responsableTexto,
                        responsableTexto
                    ]
                );

            if (
                !usuarios ||
                usuarios.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        `No se encontró un Encargado activo con el dato "${responsableTexto}".`

                });

            }

            const encargado =
                usuarios[0];

            const nombreResponsable =
                `${encargado.nombres || ""} ${encargado.apellidos || ""}`
                    .trim();

            console.log(
                "👤 ENCARGADO ENCONTRADO:",
                encargado.id,
                nombreResponsable
            );

            // ------------------------------------------------
            // INSERTAR PROYECTO
            // ------------------------------------------------

            const result =
                await query(
                    `
                    INSERT INTO projects
                    (
                        nombre,
                        responsable,
                        estado,
                        fecha,
                        user_id
                    )
                    VALUES
                    (?, ?, ?, ?, ?)
                    `,
                    [
                        nombre.trim(),
                        nombreResponsable,
                        estado,
                        fecha,
                        encargado.id
                    ]
                );

            console.log(
                "✅ PROYECTO GUARDADO:",
                result.insertId
            );

            console.log(
                "👤 USER_ID:",
                encargado.id
            );

            console.log(
                "=========================================="
            );

            res.status(201).json({

                success: true,

                message:
                    "Proyecto creado y asignado correctamente.",

                mensaje:
                    "Proyecto guardado.",

                id:
                    result.insertId,

                user_id:
                    encargado.id,

                responsable:
                    nombreResponsable

            });

        } catch (error) {

            console.error("");
            console.error(
                "❌ ERROR POST /projects"
            );
            console.error(
                "CODE:",
                error.code
            );
            console.error(
                "MESSAGE:",
                error.message
            );
            console.error(
                "SQL MESSAGE:",
                error.sqlMessage
            );

            res.status(500).json({

                success: false,

                message:
                    "Error guardando proyecto.",

                error:
                    error.message,

                code:
                    error.code,

                sqlMessage:
                    error.sqlMessage

            });

        }

    }
);

// ------------------------------------------------------------
// ACTUALIZAR PROYECTO
// SOLO ADMINISTRADOR
// ------------------------------------------------------------

app.put(
    "/projects/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const {
                nombre,
                responsable,
                estado,
                fecha
            } = req.body;

            if (
                !nombre ||
                !responsable ||
                !estado ||
                !fecha
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Todos los campos del proyecto son obligatorios."

                });

            }

            // Buscar nuevo encargado
            const usuarios =
                await query(
                    `
                    SELECT
                        id,
                        nombres,
                        apellidos,
                        email,
                        rol,
                        estado
                    FROM users
                    WHERE
                        rol = 'Encargado'
                        AND estado = 'Activo'
                        AND
                        (
                            CAST(id AS CHAR) = ?
                            OR LOWER(TRIM(email))
                                = LOWER(TRIM(?))
                            OR LOWER(TRIM(nombres))
                                = LOWER(TRIM(?))
                            OR LOWER(
                                TRIM(
                                    CONCAT(
                                        nombres,
                                        ' ',
                                        apellidos
                                    )
                                )
                            )
                                = LOWER(TRIM(?))
                        )
                    LIMIT 1
                    `,
                    [
                        String(responsable).trim(),
                        String(responsable).trim(),
                        String(responsable).trim(),
                        String(responsable).trim()
                    ]
                );

            if (usuarios.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "El responsable indicado no corresponde a un Encargado activo."

                });

            }

            const encargado =
                usuarios[0];

            const nombreResponsable =
                `${encargado.nombres || ""} ${encargado.apellidos || ""}`
                    .trim();

            const result =
                await query(
                    `
                    UPDATE projects
                    SET
                        nombre = ?,
                        responsable = ?,
                        estado = ?,
                        fecha = ?,
                        user_id = ?
                    WHERE id = ?
                    `,
                    [
                        nombre.trim(),
                        nombreResponsable,
                        estado,
                        fecha,
                        encargado.id,
                        id
                    ]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Proyecto no encontrado."

                });

            }

            res.json({

                success: true,

                message:
                    "Proyecto actualizado correctamente."

            });

        } catch (error) {

            console.error(
                "❌ ERROR PUT /projects:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error actualizando proyecto.",

                error:
                    error.message

            });

        }

    }
);

// ------------------------------------------------------------
// ELIMINAR PROYECTO
// SOLO ADMINISTRADOR
// ------------------------------------------------------------

app.delete(
    "/projects/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const result =
                await query(
                    `
                    DELETE FROM projects
                    WHERE id = ?
                    `,
                    [id]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Proyecto no encontrado."

                });

            }

            res.json({

                success: true,

                message:
                    "Proyecto eliminado correctamente."

            });

        } catch (error) {

            console.error(
                "❌ ERROR DELETE /projects:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error eliminando proyecto.",

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// ============================================================
// TAREAS
// ============================================================
// ============================================================

// ------------------------------------------------------------
// OBTENER TAREAS
// ADMINISTRADOR = TODAS
// ENCARGADO = SOLO DE SUS PROYECTOS
// ------------------------------------------------------------

app.get(
    "/tasks",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            let tasks;

            if (
                req.user.rol ===
                "Administrador"
            ) {

                tasks =
                    await query(`
                        SELECT
                            t.id,
                            t.project_id,
                            t.titulo,
                            t.responsable,
                            t.estado,
                            t.fecha,
                            t.user_id,
                            p.nombre AS proyecto,
                            p.nombre AS proyecto_nombre
                        FROM tasks t
                        LEFT JOIN projects p
                            ON t.project_id = p.id
                        ORDER BY t.id DESC
                    `);

            } else {

                tasks =
                    await query(
                        `
                        SELECT
                            t.id,
                            t.project_id,
                            t.titulo,
                            t.responsable,
                            t.estado,
                            t.fecha,
                            t.user_id,
                            p.nombre AS proyecto,
                            p.nombre AS proyecto_nombre
                        FROM tasks t
                        INNER JOIN projects p
                            ON t.project_id = p.id
                        WHERE
                            p.user_id = ?
                            OR t.user_id = ?
                        ORDER BY t.id DESC
                        `,
                        [
                            req.user.id,
                            req.user.id
                        ]
                    );

            }

            res.json(tasks);

        } catch (error) {

            console.error(
                "❌ ERROR GET /tasks:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error obteniendo tareas.",

                error:
                    error.message

            });

        }

    }
);

// ------------------------------------------------------------
// OBTENER PROYECTOS PARA TAREAS
// ------------------------------------------------------------

app.get(
    "/tasks/projects",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            let projects;

            if (
                req.user.rol ===
                "Administrador"
            ) {

                projects =
                    await query(`
                        SELECT
                            id,
                            nombre,
                            responsable,
                            user_id,
                            estado,
                            fecha
                        FROM projects
                        ORDER BY id DESC
                    `);

            } else {

                projects =
                    await query(
                        `
                        SELECT
                            id,
                            nombre,
                            responsable,
                            user_id,
                            estado,
                            fecha
                        FROM projects
                        WHERE user_id = ?
                        ORDER BY id DESC
                        `,
                        [req.user.id]
                    );

            }

            res.json(projects);

        } catch (error) {

            console.error(
                "❌ ERROR /tasks/projects:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error obteniendo proyectos."

            });

        }

    }
);

// ------------------------------------------------------------
// CREAR TAREA
// ADMINISTRADOR O ENCARGADO
// ------------------------------------------------------------

app.post(
    "/tasks",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            const {
                titulo,
                responsable,
                estado,
                fecha,
                project_id
            } = req.body;

            if (
                !titulo ||
                !titulo.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "El título de la tarea es obligatorio."

                });

            }

            if (
                !responsable ||
                !responsable.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "El responsable es obligatorio."

                });

            }

            if (!project_id) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Debe seleccionar un proyecto."

                });

            }

            // --------------------------------------------
            // OBTENER PROYECTO
            // --------------------------------------------

            const projects =
                await query(
                    `
                    SELECT
                        id,
                        nombre,
                        user_id
                    FROM projects
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [project_id]
                );

            if (projects.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "El proyecto indicado no existe."

                });

            }

            const project =
                projects[0];

            // --------------------------------------------
            // ENCARGADO SOLO PUEDE USAR SU PROYECTO
            // --------------------------------------------

            if (
                req.user.rol ===
                "Encargado"
            ) {

                if (
                    Number(project.user_id) !==
                    Number(req.user.id)
                ) {

                    return res.status(403).json({

                        success: false,

                        message:
                            "No puedes registrar tareas en un proyecto que no te pertenece."

                    });

                }

            }

            // --------------------------------------------
            // LA TAREA HEREDA EL ENCARGADO DEL PROYECTO
            // --------------------------------------------

            const assignedUserId =
                project.user_id || null;

            const result =
                await query(
                    `
                    INSERT INTO tasks
                    (
                        titulo,
                        responsable,
                        estado,
                        fecha,
                        project_id,
                        user_id
                    )
                    VALUES
                    (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        titulo.trim(),
                        responsable.trim(),
                        estado ||
                            "Pendiente",
                        fecha || null,
                        project_id,
                        assignedUserId
                    ]
                );

            res.status(201).json({

                success: true,

                message:
                    "Tarea guardada correctamente.",

                mensaje:
                    "Tarea guardada.",

                id:
                    result.insertId,

                project_id:
                    project_id,

                user_id:
                    assignedUserId

            });

        } catch (error) {

            console.error(
                "❌ ERROR POST /tasks:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error guardando tarea.",

                error:
                    error.message,

                code:
                    error.code,

                sqlMessage:
                    error.sqlMessage

            });

        }

    }
);

// ------------------------------------------------------------
// ACTUALIZAR TAREA
// ------------------------------------------------------------

app.put(
    "/tasks/:id",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const {
                titulo,
                responsable,
                estado,
                fecha,
                project_id
            } = req.body;

            if (
                !titulo ||
                !responsable ||
                !project_id
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Título, responsable y proyecto son obligatorios."

                });

            }

            const projects =
                await query(
                    `
                    SELECT
                        id,
                        user_id
                    FROM projects
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [project_id]
                );

            if (projects.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Proyecto no encontrado."

                });

            }

            const project =
                projects[0];

            if (
                req.user.rol ===
                "Encargado"
            ) {

                const taskOwner =
                    await query(
                        `
                        SELECT
                            id,
                            user_id,
                            project_id
                        FROM tasks
                        WHERE id = ?
                        LIMIT 1
                        `,
                        [id]
                    );

                if (
                    taskOwner.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Tarea no encontrada."

                    });

                }

                if (
                    Number(project.user_id) !==
                    Number(req.user.id)
                ) {

                    return res.status(403).json({

                        success: false,

                        message:
                            "No puedes mover la tarea a un proyecto que no te pertenece."

                    });

                }

            }

            const result =
                await query(
                    `
                    UPDATE tasks
                    SET
                        titulo = ?,
                        responsable = ?,
                        estado = ?,
                        fecha = ?,
                        project_id = ?,
                        user_id = ?
                    WHERE id = ?
                    `,
                    [
                        titulo.trim(),
                        responsable.trim(),
                        estado ||
                            "Pendiente",
                        fecha || null,
                        project_id,
                        project.user_id || null,
                        id
                    ]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Tarea no encontrada."

                });

            }

            res.json({

                success: true,

                message:
                    "Tarea actualizada correctamente."

            });

        } catch (error) {

            console.error(
                "❌ ERROR PUT /tasks:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error actualizando tarea.",

                error:
                    error.message

            });

        }

    }
);

// ------------------------------------------------------------
// ELIMINAR TAREA
// SOLO ADMINISTRADOR
// ------------------------------------------------------------

app.delete(
    "/tasks/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const result =
                await query(
                    `
                    DELETE FROM tasks
                    WHERE id = ?
                    `,
                    [id]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Tarea no encontrada."

                });

            }

            res.json({

                success: true,

                message:
                    "Tarea eliminada correctamente."

            });

        } catch (error) {

            console.error(
                "❌ ERROR DELETE /tasks:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error eliminando tarea.",

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// ============================================================
// DASHBOARD
// ============================================================
// ============================================================

app.get(
    "/dashboard",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const projects =
                await query(`
                    SELECT COUNT(*) AS total
                    FROM projects
                `);

            const tasks =
                await query(`
                    SELECT COUNT(*) AS total
                    FROM tasks
                `);

            const pending =
                await query(`
                    SELECT COUNT(*) AS total
                    FROM tasks
                    WHERE estado = 'Pendiente'
                `);

            const delayedTasks =
                await query(`
                    SELECT *
                    FROM tasks
                    WHERE
                        estado = 'Pendiente'
                        AND fecha IS NOT NULL
                        AND fecha < CURDATE()
                `);

            const delayedProjects =
                await query(`
                    SELECT *
                    FROM projects
                    WHERE
                        estado != 'Completado'
                        AND fecha IS NOT NULL
                        AND fecha < CURDATE()
                `);

            res.json({

                proyectos:
                    Number(
                        projects[0].total
                    ),

                tareas:
                    Number(
                        tasks[0].total
                    ),

                pendientes:
                    Number(
                        pending[0].total
                    ),

                retrasadas:
                    delayedTasks.length,

                tareasRetrasadas:
                    delayedTasks,

                proyectosRetrasados:
                    delayedProjects.length,

                listaProyectosRetrasados:
                    delayedProjects,

                reportes: 8

            });

        } catch (error) {

            console.error(
                "❌ ERROR /dashboard:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error obteniendo dashboard.",

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// ============================================================
// REPORTES
// ============================================================
// ============================================================

app.get(
    "/reports",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const totalProjects =
                await query(`
                    SELECT COUNT(*) AS total
                    FROM projects
                `);

            const totalTasks =
                await query(`
                    SELECT COUNT(*) AS total
                    FROM tasks
                `);

            const pendingTasks =
                await query(`
                    SELECT COUNT(*) AS total
                    FROM tasks
                    WHERE estado = 'Pendiente'
                `);

            const processTasks =
                await query(`
                    SELECT COUNT(*) AS total
                    FROM tasks
                    WHERE estado = 'En proceso'
                `);

            const completedTasks =
                await query(`
                    SELECT COUNT(*) AS total
                    FROM tasks
                    WHERE estado = 'Completado'
                `);

            res.json({

                proyectos:
                    Number(
                        totalProjects[0].total
                    ),

                tareas:
                    Number(
                        totalTasks[0].total
                    ),

                pendientes:
                    Number(
                        pendingTasks[0].total
                    ),

                enProceso:
                    Number(
                        processTasks[0].total
                    ),

                completadas:
                    Number(
                        completedTasks[0].total
                    )

            });

        } catch (error) {

            console.error(
                "❌ ERROR /reports:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error obteniendo reportes.",

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// ============================================================
// PERSONAL / OBREROS
// ============================================================
// ============================================================

// ------------------------------------------------------------
// OBTENER PERSONAL
// ------------------------------------------------------------

app.get(
    "/personal",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            let sql;
            let params = [];

            if (
                req.user.rol ===
                "Administrador"
            ) {

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
                        pr.nombre AS proyecto,
                        pr.responsable
                    FROM personal p
                    LEFT JOIN projects pr
                        ON p.project_id = pr.id
                    ORDER BY p.id DESC
                `;

            } else {

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
                        pr.nombre AS proyecto,
                        pr.responsable
                    FROM personal p
                    INNER JOIN projects pr
                        ON p.project_id = pr.id
                    WHERE pr.user_id = ?
                    ORDER BY p.id DESC
                `;

                params = [
                    req.user.id
                ];

            }

            const personal =
                await query(
                    sql,
                    params
                );

            res.json(personal);

        } catch (error) {

            console.error(
                "❌ ERROR /personal:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error obteniendo personal.",

                error:
                    error.message

            });

        }

    }
);

// ------------------------------------------------------------
// OBTENER PERSONAL DE PROYECTOS
// ------------------------------------------------------------

app.get(
    "/personal/proyectos",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            let personal;

            if (
                req.user.rol ===
                "Administrador"
            ) {

                personal =
                    await query(`
                        SELECT
                            p.id,
                            p.nombres,
                            p.apellidos,
                            p.dni,
                            p.cargo,
                            p.telefono,
                            p.estado,
                            p.project_id,
                            pr.nombre AS proyecto,
                            pr.responsable
                        FROM personal p
                        INNER JOIN projects pr
                            ON p.project_id = pr.id
                        ORDER BY p.id DESC
                    `);

            } else {

                personal =
                    await query(
                        `
                        SELECT
                            p.id,
                            p.nombres,
                            p.apellidos,
                            p.dni,
                            p.cargo,
                            p.telefono,
                            p.estado,
                            p.project_id,
                            pr.nombre AS proyecto,
                            pr.responsable
                        FROM personal p
                        INNER JOIN projects pr
                            ON p.project_id = pr.id
                        WHERE pr.user_id = ?
                        ORDER BY p.id DESC
                        `,
                        [req.user.id]
                    );

            }

            res.json(personal);

        } catch (error) {

            console.error(
                "❌ ERROR /personal/proyectos:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error obteniendo personal."

            });

        }

    }
);

// ------------------------------------------------------------
// CREAR PERSONAL
// ------------------------------------------------------------

// ------------------------------------------------------------
// CREAR PERSONAL + ASIGNAR TAREAS
// ------------------------------------------------------------

app.post(
    "/personal",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            const {
                nombres,
                apellidos,
                dni,
                cargo,
                telefono,
                estado,
                project_id,
                task_ids
            } = req.body;

            // ------------------------------------------------
            // VALIDACIONES
            // ------------------------------------------------

            if (
                !nombres ||
                !apellidos ||
                !dni ||
                !cargo
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Nombres, apellidos, DNI y cargo son obligatorios."

                });

            }

            if (!project_id) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Debe seleccionar un proyecto."

                });

            }

            // ------------------------------------------------
            // NORMALIZAR TAREAS
            // ------------------------------------------------

            const tareasSeleccionadas =
                Array.isArray(task_ids)
                    ? [
                        ...new Set(
                            task_ids
                                .map(Number)
                                .filter(
                                    id =>
                                        Number.isInteger(id) &&
                                        id > 0
                                )
                        )
                    ]
                    : [];

            // ------------------------------------------------
            // VERIFICAR PROYECTO
            // ------------------------------------------------

            const projects =
                await query(
                    `
                    SELECT
                        id,
                        user_id
                    FROM projects
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [project_id]
                );

            if (projects.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "El proyecto no existe."

                });

            }

            // ------------------------------------------------
            // ENCARGADO SOLO PUEDE USAR SUS PROYECTOS
            // ------------------------------------------------

            if (
                req.user.rol === "Encargado" &&
                Number(projects[0].user_id) !==
                Number(req.user.id)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "No puedes asignar personal a un proyecto que no te pertenece."

                });

            }

            // ------------------------------------------------
            // VERIFICAR QUE LAS TAREAS PERTENEZCAN AL PROYECTO
            // ------------------------------------------------

            if (tareasSeleccionadas.length > 0) {

                const placeholders =
                    tareasSeleccionadas
                        .map(() => "?")
                        .join(",");

                const tareasValidas =
                    await query(
                        `
                        SELECT id
                        FROM tasks
                        WHERE project_id = ?
                        AND id IN (${placeholders})
                        `,
                        [
                            project_id,
                            ...tareasSeleccionadas
                        ]
                    );

                if (
                    tareasValidas.length !==
                    tareasSeleccionadas.length
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Una o más tareas no pertenecen al proyecto seleccionado."

                    });

                }

            }

            // ------------------------------------------------
            // VERIFICAR DNI
            // ------------------------------------------------

            const dniExistente =
                await query(
                    `
                    SELECT id
                    FROM personal
                    WHERE dni = ?
                    LIMIT 1
                    `,
                    [dni.trim()]
                );

            if (dniExistente.length > 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "El DNI ya está registrado."

                });

            }

            // ------------------------------------------------
            // INSERTAR PERSONAL
            // ------------------------------------------------

            const result =
                await query(
                    `
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
                    VALUES
                    (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        nombres.trim(),
                        apellidos.trim(),
                        dni.trim(),
                        cargo.trim(),
                        telefono || null,
                        estado || "Activo",
                        project_id
                    ]
                );

            const personalId =
                result.insertId;

            // ------------------------------------------------
            // ASIGNAR TAREAS
            // ------------------------------------------------

            for (
                const taskId
                of tareasSeleccionadas
            ) {

                await query(
                    `
                    INSERT INTO personal_tareas
                    (
                        personal_id,
                        task_id
                    )
                    VALUES
                    (?, ?)
                    `,
                    [
                        personalId,
                        taskId
                    ]
                );

            }

            // ------------------------------------------------
            // RESPUESTA
            // ------------------------------------------------

            res.status(201).json({

                success: true,

                message:
                    "Personal registrado y tareas asignadas correctamente.",

                id:
                    personalId,

                task_ids:
                    tareasSeleccionadas

            });

        } catch (error) {

            console.error(
                "❌ ERROR POST /personal:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error registrando personal.",

                error:
                    error.message

            });

        }

    }
);

// ------------------------------------------------------------
// ACTUALIZAR PERSONAL
// ------------------------------------------------------------

// ------------------------------------------------------------
// ACTUALIZAR PERSONAL + TAREAS
// ------------------------------------------------------------

app.put(
    "/personal/:id",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const {
                nombres,
                apellidos,
                dni,
                cargo,
                telefono,
                estado,
                project_id,
                task_ids
            } = req.body;

            // ------------------------------------------------
            // VALIDACIONES
            // ------------------------------------------------

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
                        "Complete todos los campos obligatorios."

                });

            }

            // ------------------------------------------------
            // NORMALIZAR TAREAS
            // ------------------------------------------------

            const tareasSeleccionadas =
                Array.isArray(task_ids)
                    ? [
                        ...new Set(
                            task_ids
                                .map(Number)
                                .filter(
                                    taskId =>
                                        Number.isInteger(taskId) &&
                                        taskId > 0
                                )
                        )
                    ]
                    : [];

            // ------------------------------------------------
            // VERIFICAR PERSONAL
            // ------------------------------------------------

            const personalExistente =
                await query(
                    `
                    SELECT
                        id,
                        project_id
                    FROM personal
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (
                personalExistente.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Personal no encontrado."

                });

            }

            // ------------------------------------------------
            // VERIFICAR PROYECTO
            // ------------------------------------------------

            const projects =
                await query(
                    `
                    SELECT
                        id,
                        user_id
                    FROM projects
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [project_id]
                );

            if (
                projects.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Proyecto no encontrado."

                });

            }

            // ------------------------------------------------
            // ENCARGADO SOLO PUEDE USAR SUS PROYECTOS
            // ------------------------------------------------

            if (
                req.user.rol === "Encargado" &&
                Number(projects[0].user_id) !==
                Number(req.user.id)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "No puedes asignar personal a ese proyecto."

                });

            }

            // ------------------------------------------------
            // VERIFICAR TAREAS DEL PROYECTO
            // ------------------------------------------------

            if (
                tareasSeleccionadas.length > 0
            ) {

                const placeholders =
                    tareasSeleccionadas
                        .map(() => "?")
                        .join(",");

                const tareasValidas =
                    await query(
                        `
                        SELECT id
                        FROM tasks
                        WHERE project_id = ?
                        AND id IN (${placeholders})
                        `,
                        [
                            project_id,
                            ...tareasSeleccionadas
                        ]
                    );

                if (
                    tareasValidas.length !==
                    tareasSeleccionadas.length
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Una o más tareas no pertenecen al proyecto seleccionado."

                    });

                }

            }

            // ------------------------------------------------
            // VERIFICAR DNI DUPLICADO
            // ------------------------------------------------

            const duplicate =
                await query(
                    `
                    SELECT id
                    FROM personal
                    WHERE dni = ?
                    AND id <> ?
                    LIMIT 1
                    `,
                    [
                        dni.trim(),
                        id
                    ]
                );

            if (
                duplicate.length > 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "El DNI ya pertenece a otro trabajador."

                });

            }

            // ------------------------------------------------
            // ACTUALIZAR PERSONAL
            // ------------------------------------------------

            const result =
                await query(
                    `
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
                    `,
                    [
                        nombres.trim(),
                        apellidos.trim(),
                        dni.trim(),
                        cargo.trim(),
                        telefono || null,
                        estado || "Activo",
                        project_id,
                        id
                    ]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Personal no encontrado."

                });

            }

            // ------------------------------------------------
            // ELIMINAR ASIGNACIONES ANTERIORES
            // ------------------------------------------------

            await query(
                `
                DELETE FROM personal_tareas
                WHERE personal_id = ?
                `,
                [id]
            );

            // ------------------------------------------------
            // GUARDAR NUEVAS TAREAS
            // ------------------------------------------------

            for (
                const taskId
                of tareasSeleccionadas
            ) {

                await query(
                    `
                    INSERT INTO personal_tareas
                    (
                        personal_id,
                        task_id
                    )
                    VALUES
                    (?, ?)
                    `,
                    [
                        id,
                        taskId
                    ]
                );

            }

            // ------------------------------------------------
            // RESPUESTA
            // ------------------------------------------------

            res.json({

                success: true,

                message:
                    "Personal y tareas actualizados correctamente.",

                task_ids:
                    tareasSeleccionadas

            });

        } catch (error) {

            console.error(
                "❌ ERROR PUT /personal:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error actualizando personal.",

                error:
                    error.message

            });

        }

    }
);

// ------------------------------------------------------------
// OBTENER TAREAS DISPONIBLES DE UN PROYECTO
// ------------------------------------------------------------

app.get(
    "/personal/proyectos/:projectId/tareas",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            const {
                projectId
            } = req.params;

            // ------------------------------------------------
            // VERIFICAR PROYECTO
            // ------------------------------------------------

            const projects =
                await query(
                    `
                    SELECT
                        id,
                        user_id,
                        nombre
                    FROM projects
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [projectId]
                );

            if (
                projects.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Proyecto no encontrado."

                });

            }

            // ------------------------------------------------
            // ENCARGADO SOLO PUEDE CONSULTAR SUS PROYECTOS
            // ------------------------------------------------

            if (
                req.user.rol === "Encargado" &&
                Number(projects[0].user_id) !==
                Number(req.user.id)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "No puedes consultar las tareas de este proyecto."

                });

            }

            // ------------------------------------------------
            // OBTENER TAREAS
            // ------------------------------------------------

            const tasks =
                await query(
                    `
                    SELECT
                        id,
                        titulo,
                        responsable,
                        estado,
                        fecha,
                        project_id
                    FROM tasks
                    WHERE project_id = ?
                    ORDER BY id DESC
                    `,
                    [projectId]
                );

            res.json(tasks);

        } catch (error) {

            console.error(
                "❌ ERROR GET TAREAS DEL PROYECTO:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error obteniendo las tareas del proyecto.",

                error:
                    error.message

            });

        }

    }
);

// ------------------------------------------------------------
// OBTENER TAREAS ASIGNADAS A UN TRABAJADOR
// ------------------------------------------------------------

app.get(
    "/personal/:id/tareas",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            // ------------------------------------------------
            // VERIFICAR PERSONAL Y PROYECTO
            // ------------------------------------------------

            const personal =
                await query(
                    `
                    SELECT
                        p.id,
                        p.project_id,
                        pr.user_id
                    FROM personal p
                    LEFT JOIN projects pr
                        ON p.project_id = pr.id
                    WHERE p.id = ?
                    LIMIT 1
                    `,
                    [id]
                );

            if (
                personal.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Personal no encontrado."

                });

            }

            // ------------------------------------------------
            // ENCARGADO SOLO PUEDE VER SU PERSONAL
            // ------------------------------------------------

            if (
                req.user.rol === "Encargado" &&
                Number(personal[0].user_id) !==
                Number(req.user.id)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "No puedes consultar este trabajador."

                });

            }

            // ------------------------------------------------
            // OBTENER TAREAS ASIGNADAS
            // ------------------------------------------------

            const tasks =
                await query(
                    `
                    SELECT
                        t.id,
                        t.titulo,
                        t.estado,
                        t.project_id
                    FROM personal_tareas pt
                    INNER JOIN tasks t
                        ON pt.task_id = t.id
                    WHERE pt.personal_id = ?
                    ORDER BY t.id DESC
                    `,
                    [id]
                );

            res.json(tasks);

        } catch (error) {

            console.error(
                "❌ ERROR GET /personal/:id/tareas:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error obteniendo las tareas del trabajador.",

                error:
                    error.message

            });

        }

    }
);
// ------------------------------------------------------------
// ELIMINAR PERSONAL
// SOLO ADMINISTRADOR
// ------------------------------------------------------------

app.delete(
    "/personal/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const result =
                await query(
                    `
                    DELETE FROM personal
                    WHERE id = ?
                    `,
                    [id]
                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Personal no encontrado."

                });

            }

            res.json({

                success: true,

                message:
                    "Personal eliminado correctamente."

            });

        } catch (error) {

            console.error(
                "❌ ERROR DELETE /personal:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error eliminando personal.",

                error:
                    error.message

            });

        }

    }
);

// ============================================================
// RUTA PARA TAREAS DEL ENCARGADO
// ============================================================

app.get(
    "/personal/tareas",
    authenticateToken,
    requireAdminOrEncargado,
    async (req, res) => {

        try {

            let tasks;

            if (
                req.user.rol ===
                "Administrador"
            ) {

                tasks =
                    await query(`
                        SELECT
                            t.*,
                            p.nombre AS proyecto
                        FROM tasks t
                        LEFT JOIN projects p
                            ON t.project_id = p.id
                        ORDER BY t.id DESC
                    `);

            } else {

                tasks =
                    await query(
                        `
                        SELECT
                            t.*,
                            p.nombre AS proyecto
                        FROM tasks t
                        INNER JOIN projects p
                            ON t.project_id = p.id
                        WHERE
                            p.user_id = ?
                            OR t.user_id = ?
                        ORDER BY t.id DESC
                        `,
                        [
                            req.user.id,
                            req.user.id
                        ]
                    );

            }

            res.json(tasks);

        } catch (error) {

            console.error(
                "❌ ERROR /personal/tareas:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Error obteniendo tareas."

            });

        }

    }
);

// ============================================================
// 404
// ============================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                `Ruta no encontrada: ${req.method} ${req.originalUrl}`

        });

    }
);

// ============================================================
// MANEJO GENERAL DE ERRORES
// ============================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "❌ ERROR GENERAL DEL SERVIDOR:",
            error
        );

        if (
            res.headersSent
        ) {

            return next(error);

        }

        res.status(500).json({

            success: false,

            message:
                "Error interno del servidor.",

            error:
                error.message

        });

    }
);

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "=================================================="
        );

        console.log(
            "🚀 SERVIDOR INGETEC INICIADO CORRECTAMENTE"
        );

        console.log(
            `📡 Puerto: ${PORT}`
        );

        console.log(
            `🌐 http://localhost:${PORT}`
        );

        console.log(
            "🗄️ Base de datos: ingetec_db"
        );

        console.log(
            "🔐 Autenticación JWT activa"
        );

        console.log(
            "👤 Roles: Administrador / Encargado / Ingeniero / Personal"
        );

        console.log(
            "=================================================="
        );

        console.log("");

    }
);