import { Link } from 'react-router-dom';
import { PUBLIC_ROUTES } from '../../constants/routes';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la empresa */}
          <div>
            <h3 className="text-lg font-semibold mb-4">L'BANDITO</h3>
            <p className="text-gray-400 text-sm">
              Tu cafetería de confianza, ofreciendo los mejores productos y servicios desde 2024.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={PUBLIC_ROUTES.HOME}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Dirección: Av. Principal 123, Santiago</li>
              <li>Teléfono: +56 9 1234 5678</li>
              <li>Email: contacto@lbandito.com</li>
            </ul>
            <div className="mt-4 flex space-x-4">
              {/* Redes sociales */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                Facebook
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                Instagram
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} L'BANDITO. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 