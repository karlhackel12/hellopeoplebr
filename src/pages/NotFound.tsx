
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { H1 } from "@/components/ui/typography";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <H1 className="mb-4">404</H1>
        <p className="text-xl text-gray-600 mb-4">Ops! Página não encontrada</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Voltar para o Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
