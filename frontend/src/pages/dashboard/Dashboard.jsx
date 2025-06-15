import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { ROLE_LABELS } from '../../constants/roles';
// Importaciones específicas para optimizar bundle
import { BarChart } from 'recharts/lib/chart/BarChart';
import { Bar } from 'recharts/lib/cartesian/Bar';
import { XAxis } from 'recharts/lib/cartesian/XAxis';
import { YAxis } from 'recharts/lib/cartesian/YAxis';
import { CartesianGrid } from 'recharts/lib/cartesian/CartesianGrid';
import { Tooltip } from 'recharts/lib/component/Tooltip';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';
import { PieChart } from 'recharts/lib/chart/PieChart';
import { Pie } from 'recharts/lib/polar/Pie';
import { Cell } from 'recharts/lib/component/Cell';
import { Legend } from 'recharts/lib/component/Legend';
import { LineChart } from 'recharts/lib/chart/LineChart';
import { Line } from 'recharts/lib/cartesian/Line';
import Modal from '../../components/ui/Modal';
import DashboardService from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatters';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [modalChart, setModalChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para datos reales
  const [stats, setStats] = useState({});
  const [ventasDiarias, setVentasDiarias] = useState([]);
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [productosVendidos, setProductosVendidos] = useState([]);
  const [productividad, setProductividad] = useState([]);
  const [rotacionInventario, setRotacionInventario] = useState([]);

  // Datos mock para satisfacción y merma (hasta implementar encuestas)
  const satisfaccion = [
    { name: '1 estrella', value: 2 },
    { name: '2 estrellas', value: 3 },
    { name: '3 estrellas', value: 8 },
    { name: '4 estrellas', value: 20 },
    { name: '5 estrellas', value: 67 },
  ];

  const merma = [
    { name: 'Desperdicio', value: stats.merma || 2.5 },
    { name: 'Utilizado', value: 100 - (stats.merma || 2.5) },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar todos los datos en paralelo
      const [
        statsData,
        ventasDiariasData,
        ventasMensualesData,
        productosVendidosData,
        productividadData,
        rotacionData
      ] = await Promise.all([
        DashboardService.getStats(),
        DashboardService.getVentasDiarias(),
        DashboardService.getVentasMensuales(),
        DashboardService.getProductosMasVendidos(),
        DashboardService.getProductividadPersonal(),
        DashboardService.getRotacionInventario()
      ]);

      setStats(statsData);
      setVentasDiarias(ventasDiariasData);
      setVentasMensuales(ventasMensualesData);
      setProductosVendidos(productosVendidosData);
      setProductividad(productividadData);
      setRotacionInventario(rotacionData);

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // KPIs dinámicos basados en datos reales
  const kpis = [
    { 
      label: 'Ventas Diarias', 
      value: stats.ventasHoy || 0, 
      icon: '💰', 
      tooltip: 'Ingreso total generado hoy',
      format: 'currency'
    },
    { 
      label: 'Ventas Mensuales', 
      value: stats.ventasMes || 0, 
      icon: '📈', 
      tooltip: 'Ingreso total generado este mes',
      format: 'currency'
    },
    { 
      label: 'Ticket Promedio', 
      value: stats.ticketPromedio || 0, 
      icon: '🧾', 
      tooltip: 'Monto promedio gastado por cliente',
      format: 'currency'
    },
    { 
      label: 'Clientes Atendidos (Hoy)', 
      value: stats.clientesHoy || 0, 
      icon: '👤', 
      tooltip: 'Clientes únicos atendidos hoy' 
    },
    { 
      label: 'Clientes Atendidos (Mes)', 
      value: stats.clientesMes || 0, 
      icon: '👥', 
      tooltip: 'Clientes únicos atendidos este mes' 
    },
    { 
      label: 'CMV', 
      value: stats.cmv || 0, 
      icon: '📦', 
      tooltip: 'Costo de mercancía vendida este mes',
      format: 'currency'
    },
    { 
      label: 'Margen Bruto', 
      value: stats.margenBruto || 0, 
      icon: '📊', 
      tooltip: '[(Ventas - CMV) / Ventas] x 100',
      format: 'percentage'
    },
    { 
      label: 'Gastos Operativos', 
      value: stats.gastosOperativos || 0, 
      icon: '💡', 
      tooltip: 'Gastos fijos y variables del mes',
      format: 'currency'
    },
    { 
      label: 'Rotación de Inventario', 
      value: stats.rotacionInventario || 0, 
      icon: '🔄', 
      tooltip: 'Veces que se renueva el inventario al mes',
      format: 'decimal'
    },
    { 
      label: 'Satisfacción Cliente', 
      value: stats.satisfaccionCliente || 4.6, 
      icon: '⭐', 
      tooltip: 'Promedio de encuestas (1-5)',
      format: 'decimal'
    },
    { 
      label: 'Merma/Desperdicio', 
      value: stats.merma || 2.5, 
      icon: '🗑️', 
      tooltip: 'Porcentaje de productos desechados',
      format: 'percentage'
    },
    { 
      label: 'Productividad Personal', 
      value: stats.productividadPersonal || 0, 
      icon: '🧑‍🍳', 
      tooltip: 'Clientes atendidos por empleado (hoy)',
      format: 'decimal'
    },
  ];

  const formatValue = (value, format) => {
    if (typeof value !== 'number') return value;
    
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'decimal':
        return value.toFixed(1);
      default:
        return value.toLocaleString('es-CL');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259F7', '#FF5C8A'];

  // Estilos para leyendas y labels
  const legendStyle = {
    fontSize: '12px',
    maxWidth: 180,
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  };
  const labelStyle = {
    fontSize: '11px',
    fontWeight: 500,
  };

  const secondaryCharts = [
    {
      key: 'satisfaccion',
      title: 'Satisfacción del Cliente',
      content: (
        <div style={{ padding: 8 }}>
          <PieChart width={220} height={180}>
            <Pie data={satisfaccion} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${value}`} labelLine={false} style={labelStyle}>
              {satisfaccion.map((entry, index) => (
                <Cell key={`cell-sat-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          <div className="flex flex-wrap justify-center mt-2" style={legendStyle}>
            {satisfaccion.map((entry, index) => (
              <div key={entry.name} className="flex items-center mr-2 mb-1">
                <span style={{ width: 10, height: 10, background: COLORS[index % COLORS.length], display: 'inline-block', marginRight: 4, borderRadius: 2 }}></span>
                <span className="truncate" title={entry.name}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'merma',
      title: 'Porcentaje de Merma/Desperdicio',
      content: (
        <div style={{ padding: 8 }}>
          <PieChart width={220} height={180}>
            <Pie data={merma} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ value }) => `${value.toFixed(1)}%`} labelLine={false} style={labelStyle}>
              {merma.map((entry, index) => (
                <Cell key={`cell-merma-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
          </PieChart>
          <div className="flex flex-wrap justify-center mt-2" style={legendStyle}>
            {merma.map((entry, index) => (
              <div key={entry.name} className="flex items-center mr-2 mb-1">
                <span style={{ width: 10, height: 10, background: COLORS[index % COLORS.length], display: 'inline-block', marginRight: 4, borderRadius: 2 }}></span>
                <span className="truncate" title={entry.name}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'productividad',
      title: 'Productividad del Personal',
      content: (
        <div style={{ padding: 8 }}>
          <BarChart width={220} height={180} data={productividad} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="empleado" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value, name) => [
              name === 'ventas' ? formatCurrency(value) : value,
              name === 'clientes' ? 'Clientes Atendidos' : 'Ventas'
            ]} />
            <Legend wrapperStyle={legendStyle} iconSize={10} />
            <Bar dataKey="clientes" fill="#0088FE" name="Clientes" />
            <Bar dataKey="ventas" fill="#FFBB28" name="Ventas" />
          </BarChart>
        </div>
      ),
    },
    {
      key: 'rotacion',
      title: 'Rotación de Inventario',
      content: (
        <div style={{ padding: 8 }}>
          <LineChart width={440} height={180} data={rotacionInventario} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [value.toFixed(2), 'Rotación']} />
            <Legend wrapperStyle={legendStyle} iconSize={10} />
            <Line type="monotone" dataKey="rotacion" stroke="#00C49F" name="Rotación" />
          </LineChart>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar el dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bienvenido, {user?.name}</h1>
          <p className="text-gray-600 mb-4">
            Tu rol es: <span className="font-semibold">{ROLE_LABELS[user?.role]}</span>
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg shadow p-6 flex flex-col items-center relative group">
            <span className="text-4xl mb-2">{kpi.icon}</span>
            <span className="text-2xl font-bold">
              {formatValue(kpi.value, kpi.format)}
            </span>
            <span className="text-gray-500 mt-1 text-sm text-center">{kpi.label}</span>
            <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 z-10">
              {kpi.tooltip}
            </span>
          </div>
        ))}
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Gráfico de líneas: Ventas diarias */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Ventas Diarias (Últimos 30 días)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasDiarias} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" hide />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="ventas" stroke="#0088FE" name="Ventas" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Gráfico de barras: Ventas mensuales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Ventas Mensuales (Año Actual)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ventasMensuales} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="ventas" fill="#0088FE" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos secundarios ampliables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Productos más vendidos */}
        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:ring-2 hover:ring-primary" onClick={() => setModalChart('productos')}>
          <h2 className="text-lg font-semibold mb-4 text-center">Productos Más Vendidos</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <Pie
                data={productosVendidos}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={({ value }) => `${value}`}
                labelLine={false}
                style={labelStyle}
              >
                {productosVendidos.map((entry, index) => (
                  <Cell key={`cell-prod-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center mt-2" style={legendStyle}>
            {productosVendidos.map((entry, index) => (
              <div key={entry.name} className="flex items-center mr-2 mb-1">
                <span style={{ width: 10, height: 10, background: COLORS[index % COLORS.length], display: 'inline-block', marginRight: 4, borderRadius: 2 }}></span>
                <span className="truncate" title={entry.name}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Gráficos secundarios */}
        {secondaryCharts.map((chart) => (
          <div
            key={chart.key}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:ring-2 hover:ring-primary ${chart.key === 'rotacion' ? 'md:col-span-2' : ''}`}
            onClick={() => setModalChart(chart.key)}
          >
            <h2 className="text-lg font-semibold mb-4 text-center">{chart.title}</h2>
            <div className="flex justify-center items-center">
              {chart.content}
            </div>
            <div className="text-primary text-xs text-center mt-2">Haz clic para ampliar</div>
          </div>
        ))}
      </div>

      {/* Modal para ampliar gráficos */}
      <Modal isOpen={!!modalChart} onClose={() => setModalChart(null)} title={getModalTitle(modalChart)} size="xl">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-6 text-center w-full">{getModalTitle(modalChart)}</h2>
          {modalChart === 'productos' && (
            <PieChart width={500} height={400}>
              <Pie
                data={productosVendidos}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label
              >
                {productosVendidos.map((entry, index) => (
                  <Cell key={`cell-prod-modal-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
          {secondaryCharts.find((c) => c.key === modalChart)?.content && (
            <div className="mt-4 scale-150 transform origin-center">
              {secondaryCharts.find((c) => c.key === modalChart)?.content}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

function getModalTitle(key) {
  switch (key) {
    case 'productos':
      return 'Productos Más Vendidos';
    case 'satisfaccion':
      return 'Satisfacción del Cliente';
    case 'merma':
      return 'Porcentaje de Merma/Desperdicio';
    case 'productividad':
      return 'Productividad del Personal';
    case 'rotacion':
      return 'Rotación de Inventario';
    default:
      return '';
  }
}

export default Dashboard; 