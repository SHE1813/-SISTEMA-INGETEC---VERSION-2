// ============================================================
// INGETEC - CONEXIÓN MYSQL
// Compatible con XAMPP (local) y Aiven/Render (nube)
// ============================================================

const mysql = require("mysql2");

// ============================================================
// CONFIGURACIÓN
// ============================================================

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",

    port: Number(
        process.env.DB_PORT || 3306
    ),

    user:
        process.env.DB_USER || "root",

    password:
        process.env.DB_PASSWORD || "",

    database:
        process.env.DB_NAME || "ingetec_db",

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,

    // Aiven requiere conexión SSL.
    // En local/XAMPP no se utiliza SSL.
    ssl:
        process.env.DB_SSL === "true"
            ? {
                  rejectUnauthorized: false
              }
            : undefined
});

// ============================================================
// COMPROBAR CONEXIÓN
// ============================================================

db.getConnection((error, connection) => {

    if (error) {

        console.error("");
        console.error(
            "❌ ERROR DE CONEXIÓN A MYSQL"
        );

        console.error(
            "Código:",
            error.code
        );

        console.error(
            "Mensaje:",
            error.message
        );

        console.error("");

        return;
    }

    console.log("");
    console.log(
        "=================================================="
    );

    console.log(
        "✅ CONEXIÓN MYSQL ESTABLECIDA"
    );

    console.log(
        `🗄️ Base de datos: ${
            process.env.DB_NAME || "ingetec_db"
        }`
    );

    console.log(
        `🌐 Host: ${
            process.env.DB_HOST || "localhost"
        }`
    );

    console.log(
        `🔌 Puerto: ${
            process.env.DB_PORT || 3306
        }`
    );

    console.log(
        `👤 Usuario: ${
            process.env.DB_USER || "root"
        }`
    );

    console.log(
        `🔐 SSL: ${
            process.env.DB_SSL === "true"
                ? "ACTIVADO"
                : "DESACTIVADO"
        }`
    );

    console.log(
        "=================================================="
    );

    console.log("");

    connection.release();
});

// ============================================================
// EXPORTAR CONEXIÓN
// ============================================================

module.exports = db;