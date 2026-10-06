const jwt = require("jsonwebtoken");

const JWT_SECRET =
    process.env.JWT_SECRET || "INGETEC_SECRET_CAMBIAR_EN_ENV";


// =====================================
// VERIFICAR TOKEN
// =====================================

function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token =
        authHeader && authHeader.split(" ")[1];

    if (!token) {

        return res.status(401).json({
            success: false,
            message: "Acceso no autorizado. Token requerido."
        });

    }

    jwt.verify(
        token,
        JWT_SECRET,
        (err, user) => {

            if (err) {

                console.log("❌ Error verificando JWT:", err.message);

                return res.status(403).json({
                    success: false,
                    message: "Token inválido o expirado."
                });

            }

            console.log("✅ JWT válido:", user);

            req.user = user;

            next();

        }
    );

}


// =====================================
// VERIFICAR ADMINISTRADOR
// =====================================

function requireAdmin(req, res, next) {

    console.log(
        "🔐 Rol recibido:",
        req.user?.rol
    );

    if (!req.user) {

        return res.status(401).json({
            success: false,
            message: "No autenticado."
        });

    }

    if (req.user.rol !== "Administrador") {

        return res.status(403).json({
            success: false,
            message:
                "Acceso denegado. Solo el Administrador puede realizar esta acción."
        });

    }

    console.log("✅ Acceso de Administrador autorizado");

    next();

}


module.exports = {
    authenticateToken,
    requireAdmin
};