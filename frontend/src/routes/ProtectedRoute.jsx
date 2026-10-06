import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {

    const token = localStorage.getItem("token");
    const userStorage = localStorage.getItem("user");

    // =====================================
    // NO HAY SESIÓN
    // =====================================

    if (!token || !userStorage) {
        return <Navigate to="/" replace />;
    }


    // =====================================
    // OBTENER USUARIO
    // =====================================

    let user;

    try {

        user = JSON.parse(userStorage);

    } catch (error) {

        console.error("Error leyendo usuario:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/" replace />;

    }


    // =====================================
    // VERIFICAR ROL
    // =====================================

    if (
        allowedRoles &&
        !allowedRoles.includes(user.rol)
    ) {

        // Si no tiene permiso, enviarlo
        // a su página correspondiente.

        if (user.rol === "Encargado") {
            return <Navigate to="/encargado" replace />;
        }

        if (user.rol === "Administrador") {
            return <Navigate to="/dashboard" replace />;
        }

        return <Navigate to="/" replace />;

    }


    return children;

}

export default ProtectedRoute;