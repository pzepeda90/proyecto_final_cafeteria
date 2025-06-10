import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mt-2">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block px-6 py-3 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 