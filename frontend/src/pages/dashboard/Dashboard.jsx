import { useSelector } from 'react-redux';
import { useState } from 'react';
import { ROLE_LABELS } from '../../constants/roles';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import Modal from '../../components/ui/Modal';

// Datos mock para KPIs
const kpis = [
  { label: 'Ventas Diarias', value: 45000, icon: '💰', tooltip: 'Ingreso total generado hoy' },
  { label: 'Ventas Mensuales', value: 1250000, icon: '📈', tooltip: 'Ingreso total generado este mes' },
  { label: 'Ticket Promedio', value: 8500, icon: '🧾', tooltip: 'Monto promedio gastado por cliente' },
  { label: 'Clientes Atendidos (Hoy)', value: 38, icon: '👤', tooltip: 'Clientes únicos atendidos hoy' },
  { label: 'Clientes Atendidos (Mes)', value: 120, icon: '👥', tooltip: 'Clientes únicos atendidos este mes' },
  { label: 'CMV', value: 600000, icon: '📦', tooltip: 'Costo de mercancía vendida este mes' },
  { label: 'Margen Bruto', value: 52, icon: '📊', tooltip: '[(Ventas - CMV) / Ventas] x 100' },
  { label: 'Gastos Operativos', value: 350000, icon: '💡', tooltip: 'Gastos fijos y variables del mes' },
  { label: 'Rotación de Inventario', value: 3.2, icon: '🔄', tooltip: 'Veces que se renueva el inventario al mes' },
  { label: 'Satisfacción Cliente', value: 4.6, icon: '⭐', tooltip: 'Promedio de encuestas (1-5)' },
  { label: 'Merma/Desperdicio', value: 2.5, icon: '🗑️', tooltip: 'Porcentaje de productos desechados' },
  { label: 'Productividad Personal', value: 12, icon: '🧑‍🍳', tooltip: 'Clientes atendidos por empleado (hoy)' },
];

// Datos mock para gráficos
const ventasDiarias = Array.from({ length: 30 }, (_, i) => ({
  dia: `Día ${i + 1}`,
  ventas: Math.floor(30000 + Math.random() * 30000),
}));

const ventasMensuales = [
  { mes: 'Ene', ventas: 90000 },
  { mes: 'Feb', ventas: 110000 },
  { mes: 'Mar', ventas: 95000 },
  { mes: 'Abr', ventas: 120000 },
  { mes: 'May', ventas: 130000 },
  { mes: 'Jun', ventas: 125000 },
  { mes: 'Jul', ventas: 140000 },
  { mes: 'Ago', ventas: 135000 },
  { mes: 'Sep', ventas: 120000 },
  { mes: 'Oct', ventas: 150000 },
  { mes: 'Nov', ventas: 160000 },
  { mes: 'Dic', ventas: 170000 },
];

const productosVendidos = [
  { name: 'Espresso', value: 80 },
  { name: 'Cappuccino', value: 60 },
  { name: 'Latte', value: 50 },
  { name: 'Brownie', value: 40 },
  { name: 'Tiramisú', value: 30 },
  { name: 'Limonada', value: 60 },
];

const satisfaccion = [
  { name: '1 estrella', value: 2 },
  { name: '2 estrellas', value: 3 },
  { name: '3 estrellas', value: 8 },
  { name: '4 estrellas', value: 20 },
  { name: '5 estrellas', value: 67 },
];

const merma = [
  { name: 'Desperdicio', value: 2.5 },
  { name: 'Utilizado', value: 97.5 },
];

const productividad = [
  { empleado: 'Ana', clientes: 15, ventas: 120000 },
  { empleado: 'Luis', clientes: 12, ventas: 95000 },
  { empleado: 'Pedro', clientes: 11, ventas: 90000 },
  { empleado: 'Sofía', clientes: 14, ventas: 110000 },
];

const rotacionInventario = [
  { mes: 'Ene', rotacion: 2.8 },
  { mes: 'Feb', rotacion: 3.1 },
  { mes: 'Mar', rotacion: 3.0 },
  { mes: 'Abr', rotacion: 3.3 },
  { mes: 'May', rotacion: 3.2 },
  { mes: 'Jun', rotacion: 3.4 },
];

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
          <Pie data={merma} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ value }) => `${value}`} labelLine={false} style={labelStyle}>
            {merma.map((entry, index) => (
              <Cell key={`cell-merma-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
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
          <Tooltip />
          <Legend wrapperStyle={legendStyle} iconSize={10} />
          <Bar dataKey="clientes" fill="#0088FE" name="Clientes Atendidos" />
          <Bar dataKey="ventas" fill="#FFBB28" name="Ventas ($)" />
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
          <Tooltip />
          <Legend wrapperStyle={legendStyle} iconSize={10} />
          <Line type="monotone" dataKey="rotacion" stroke="#00C49F" name="Rotación" />
        </LineChart>
      </div>
    ),
  },
];

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [modalChart, setModalChart] = useState(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bienvenido, {user?.name}</h1>
        <p className="text-gray-600 mb-4">
          Tu rol es: <span className="font-semibold">{ROLE_LABELS[user?.role]}</span>
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg shadow p-6 flex flex-col items-center relative group">
            <span className="text-4xl mb-2">{kpi.icon}</span>
            <span className="text-2xl font-bold">{typeof kpi.value === 'number' ? kpi.value.toLocaleString('es-CL') : kpi.value}</span>
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
              <Tooltip formatter={(value) => `$${value.toLocaleString('es-CL')}`} />
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
              <Tooltip formatter={(value) => `$${value.toLocaleString('es-CL')}`} />
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
        {/* Gráficos secundarios mock */}
        {secondaryCharts.map((chart) => (
          <div
            key={chart.key}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:ring-2 hover:ring-primary ${chart.key === 'rotacion' ? 'md:col-span-2' : ''}`}
            onClick={() => setModalChart(chart.key)}
          >
            <h2 className="text-lg font-semibold mb-4 text-center">{chart.title}</h2>
            <div className="flex justify-center items-center">
              {/* Para la card de rotación, usa un gráfico más ancho */}
              {chart.key === 'rotacion' ? (
                <div style={{ padding: 8 }}>
                  <LineChart width={440} height={180} data={rotacionInventario} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={legendStyle} iconSize={10} />
                    <Line type="monotone" dataKey="rotacion" stroke="#00C49F" name="Rotación" />
                  </LineChart>
                </div>
              ) : chart.content}
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
            <div className="mt-4">{secondaryCharts.find((c) => c.key === modalChart)?.content}</div>
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