import HeroSection from '../../components/features/home/HeroSection';
import Card, { CardBody } from '../../components/ui/Card';

const features = [
  {
    title: 'Café de Especialidad',
    description: 'Selección premium de granos de café de las mejores regiones del mundo.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Pasteles Artesanales',
    description: 'Deliciosos pasteles elaborados diariamente con ingredientes frescos y naturales.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
      </svg>
    ),
  },
  {
    title: 'Ambiente Acogedor',
    description: 'Un espacio diseñado para tu comodidad, perfecto para trabajar o relajarte.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
];

const HomePage = () => {
  return (
    <div>
      <HeroSection />

      {/* Características */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">
              Nuestros Servicios
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Una mejor manera de disfrutar tu café
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Descubre por qué somos la cafetería preferida de nuestros clientes.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardBody>
                    <div>
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                        {feature.icon}
                      </div>
                      <div className="mt-5">
                        <h3 className="text-lg font-medium text-gray-900">
                          {feature.title}
                        </h3>
                        <p className="mt-2 text-base text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Promoción */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">¿Listo para probar lo mejor?</span>
              <span className="block">Ordena ahora y recibe un 10% de descuento</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-primary-100">
              Válido para tu primera compra online. Aplican términos y condiciones.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 