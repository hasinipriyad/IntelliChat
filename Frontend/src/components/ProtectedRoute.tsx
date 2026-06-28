import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";


const ProtectedRoute = ({ children }: { children: ReactNode }) => {

    const {isAuthenticated, loading} = useAuth();

    if (loading){
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading...</p>
            </div>
        )
    }

    if(!isAuthenticated){
        return <Navigate to="/login" replace />
    }
     // Authenticated — render the protected page.
  return <>{children}</>;

}

export default ProtectedRoute