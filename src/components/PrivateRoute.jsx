import React from 'react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkAuth } from '../utils/auth';
import { Loader2 } from 'lucide-react';

export default function PrivateRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    (async () => {
      const isValid = await checkAuth();
      setIsAuth(isValid);
    })();
  }, []);

  if (isAuth === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return isAuth ? children : <Navigate to="/login" replace />;
}
