const AboutSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">
            Sobre Nosotros
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Nuestra Historia
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Desde 2015, nos dedicamos a brindar la mejor experiencia cafetera con productos de calidad excepcional.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Imagen de la cafetería */}
            <div className="relative">
              <img
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80"
                alt="Interior de la cafetería"
              />
            </div>

            {/* Contenido */}
            <div>
              <div className="mt-6 lg:mt-0">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Pasión por el Café de Especialidad
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Somos una cafetería especializada en ofrecer café de la más alta calidad, 
                  seleccionado cuidadosamente de las mejores fincas cafetaleras. Nuestro 
                  compromiso es brindar una experiencia única a cada cliente.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-white">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">Calidad Premium</h4>
                      <p className="text-gray-600">
                        Seleccionamos solo los mejores granos de café de origen.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-white">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">Elaboración Artesanal</h4>
                      <p className="text-gray-600">
                        Cada producto es preparado con técnicas tradicionales y dedicación.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-white">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">Ambiente Único</h4>
                      <p className="text-gray-600">
                        Un espacio diseñado para crear la perfecta experiencia cafetera.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">9+</div>
              <div className="text-lg text-gray-600">Años de experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">1000+</div>
              <div className="text-lg text-gray-600">Clientes satisfechos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">50+</div>
              <div className="text-lg text-gray-600">Productos únicos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-lg text-gray-600">Café de especialidad</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 