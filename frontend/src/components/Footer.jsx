import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la Cafetería */}
          <div>
            <h3 className="text-xl font-bold mb-4">Café Delight</h3>
            <p className="text-gray-300">
              Disfruta del mejor café de especialidad y deliciosos postres artesanales.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/menu" className="text-gray-300 hover:text-white">
                  Menú
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <ul className="space-y-2 text-gray-300">
              <li>📍 Av. Principal 123</li>
              <li>📞 +56 9 1234 5678</li>
              <li>✉️ info@cafedelight.com</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Café Delight. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 