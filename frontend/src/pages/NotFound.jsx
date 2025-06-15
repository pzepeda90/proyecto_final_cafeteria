import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import tazaImg from '../img/taza_404.png';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToMenu = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-4 relative">
      {/* Fondo decorativo con patrón de café */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-4xl w-full text-center z-10">
        {/* 404 con taza de café como el 0 del medio - Tamaño ajustado */}
        <div className="flex items-center justify-center mb-8">
          <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold text-amber-800 leading-none">4</span>
          <div className="mx-1 sm:mx-2 md:mx-3 lg:mx-4">
            <img
              src={tazaImg}
              alt="Taza de café"
              className="h-[5.5rem] sm:h-[6rem] md:h-[9rem] lg:h-[10.5rem] w-auto object-contain drop-shadow-2xl transform lg:translate-y-3"
            />
          </div>
          <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold text-amber-800 leading-none">4</span>
        </div>

        {/* Mensaje principal */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-900 mb-3 leading-tight">
            ¡Oops!
          </h1>
          <p className="text-base sm:text-lg text-amber-700 max-w-xl mx-auto leading-relaxed px-4">
            Parece que el delicioso olor a café recién molido te distrajo y perdiste el camino. 
            <br className="hidden sm:block" />
            <span className="font-medium text-amber-800">¡No te preocupes!</span> Vuelve al menú principal para seguir disfrutando.
          </p>
        </div>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleGoHome}
            variant="primary"
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-lg transform hover:scale-105 transition-all duration-200 min-w-[160px]"
          >
            🏠 Ir al Inicio
          </Button>
          <Button
            onClick={handleGoToMenu}
            variant="outline"
            size="lg"
            className="border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white focus:ring-amber-500 shadow-lg transform hover:scale-105 transition-all duration-200 min-w-[160px]"
          >
            ☕ Ver Menú
          </Button>
        </div>

        {/* Decoración adicional */}
        <div className="mt-12 flex justify-center space-x-2 opacity-60">
          <span className="text-2xl">☕</span>
          <span className="text-lg">•</span>
          <span className="text-2xl">🥐</span>
          <span className="text-lg">•</span>
          <span className="text-2xl">🍰</span>
        </div>
      </div>

      {/* Elementos decorativos flotantes */}
      <div className="absolute top-10 left-10 opacity-20 animate-bounce">
        <span className="text-4xl">☕</span>
      </div>
      <div className="absolute top-20 right-16 opacity-20 animate-pulse">
        <span className="text-3xl">🥯</span>
      </div>
      <div className="absolute bottom-20 left-20 opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>
        <span className="text-3xl">🧁</span>
      </div>
      <div className="absolute bottom-16 right-12 opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>
        <span className="text-4xl">🍪</span>
      </div>
    </div>
  );
};

export default NotFound; 