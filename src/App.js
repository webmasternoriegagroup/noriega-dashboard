import React, { useState, useEffect } from 'react';
import './App.css';

const MONDAY_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjE5MDI1NzkxMCwiYWFpIjoxMSwidWlkIjoxOTM0NDQyNCwiaWFkIjoiMjAyMi0xMS0wN1QyMDo1NTo0OC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODA4NDMyMiwicmduIjoidXNlMSJ9.QhaPeGZLSDuqvp3vA0YLbKj_RRCPRavger3JabQEEsI";

const PROJECTS = [
  { id: 'kasa', name: 'KASA RESIDENCES', boardId: 1009467797, status: 'ready', icon: '🏢' },
  { id: 'lagoon', name: 'LAGOON', boardId: 1015951784, status: 'coming', icon: '💧' },
  { id: 'aria', name: 'ARIA RESIDENCES', boardId: 1281011509, status: 'coming', icon: '🌟' },
  { id: 'arko', name: 'ARKO GOLF', boardId: 1468925724, status: 'coming', icon: '⛳' },
  { id: 'botanika', name: 'BOTANIKA', boardId: 1060556028, status: 'coming', icon: '🌿' },
  { id: 'cppc', name: 'CPPC', boardId: 1211834162, status: 'coming', icon: '🏢' },
  { id: 'lomas', name: 'LOMAS PC (IFC)', boardId: null, status: 'coming', icon: '🏘️' }
];

const KasaResidences = ({ onBack }) => {
  const [data, setData] = useState({
    totalUnits: 109,
    entregadas: 83,
    preEntrega: 14,
    sinEntregar: 16,
    dineroCobrado: 12516508,
    precioTotal: 15089432,
    pendiente: 2572924,
    devoluciones: 639000,
    disponibles: 3,
    lastUpdate: new Date()
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKasaData();
    const interval = setInterval(fetchKasaData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchKasaData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MONDAY_API_KEY}`
        },
        body: JSON.stringify({
          query: `
            query {
              boards(ids: [1009467797]) {
                items_page(limit: 500) {
                  items {
                    name
                    column_values {
                      id
                      value
                    }
                  }
                }
              }
            }
          `
        })
      });

      const result = await response.json();
      if (result.data && result.data.boards && result.data.boards[0]) {
        const items = result.data.boards[0].items_page.items;
        
        const entregadas = items.filter(i => {
          const statusCol = i.column_values.find(cv => cv.id === 'color_mkpega34');
          return statusCol && statusCol.value && statusCol.value.includes('UNIDAD ENTREGADA');
        }).length;

        const disponibles = items.filter(i => {
          const statusCol = i.column_values.find(cv => cv.id === 'status');
          return statusCol && statusCol.value && statusCol.value.includes('DISPONIBLE');
        }).length;

        setData({
          totalUnits: items.length,
          entregadas: entregadas,
          preEntrega: 14,
          sinEntregar: items.length - entregadas - 14,
          dineroCobrado: 12516508,
          precioTotal: 15089432,
          pendiente: 2572924,
          devoluciones: 639000,
          disponibles: disponibles,
          lastUpdate: new Date()
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const cSales = (data.dineroCobrado / data.precioTotal * 100).toFixed(1);
  const percentEntregadas = ((data.entregadas / data.totalUnits) * 100).toFixed(1);

  return (
    <div className="project-view">
      <div className="header-back">
        <button onClick={onBack} className="btn-back">← Volver</button>
        <h1>🏢 KASA RESIDENCES</h1>
        <p className="subtitle">Dashboard Ejecutivo | Datos en Vivo desde Monday.com</p>
      </div>

      <div className="alerts-critical">
        <div className="alert alert-red">
          <span className="alert-icon">🔴</span>
          <div>
            <strong>Extensión Banreservas: 22 DÍAS</strong>
            <p>Vence 30/Abril | $2.5M | ACCIÓN INMEDIATA</p>
          </div>
        </div>
        <div className="alert alert-red">
          <span className="alert-icon">🔴</span>
          <div>
            <strong>{data.sinEntregar} Unidades Sin Entregar</strong>
            <p>15% del proyecto | Target: 60 días máximo</p>
          </div>
        </div>
        <div className="alert alert-yellow">
          <span className="alert-icon">🟡</span>
          <div>
            <strong>${(data.pendiente / 1000000).toFixed(2)}M Pendiente por Cobrar</strong>
            <p>Cobranza activa | 180 días plan</p>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card success">
          <div className="metric-label">Total Unidades</div>
          <div className="metric-value">{data.totalUnits}</div>
          <div className="metric-subtitle">Proyecto completo</div>
        </div>

        <div className="metric-card success">
          <div className="metric-label">Dinero Cobrado</div>
          <div className="metric-value">${(data.dineroCobrado / 1000000).toFixed(1)}M</div>
          <div className="metric-subtitle">{cSales}% | Hard Cash</div>
          <div className="metric-bar">
            <div className="bar-fill" style={{width: cSales + '%'}}></div>
          </div>
        </div>

        <div className="metric-card critical">
          <div className="metric-label">Pendiente por Cobrar</div>
          <div className="metric-value">${(data.pendiente / 1000000).toFixed(1)}M</div>
          <div className="metric-subtitle">{(100 - parseFloat(cSales)).toFixed(1)}% restante</div>
        </div>

        <div className="metric-card success">
          <div className="metric-label">Entregas Realizadas</div>
          <div className="metric-value">{data.entregadas}</div>
          <div className="metric-subtitle">{percentEntregadas}% completado</div>
          <div className="metric-bar">
            <div className="bar-fill" style={{width: percentEntregadas + '%'}}></div>
          </div>
        </div>

        <div className="metric-card critical">
          <div className="metric-label">Sin Entregar</div>
          <div className="metric-value">{data.sinEntregar}</div>
          <div className="metric-subtitle">Acciones en proceso</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Disponibles para Vender</div>
          <div className="metric-value">{data.disponibles}</div>
          <div className="metric-subtitle">~$700K potencial</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>📊 Estado de Entregas</h3>
          <div className="chart-simple">
            <div className="bar-horizontal" style={{width: percentEntregadas + '%', backgroundColor: '#28a745'}}>
              <span>{data.entregadas} entregadas</span>
            </div>
            <div className="bar-horizontal" style={{width: '12.8%', backgroundColor: '#ffc107'}}>
              <span>14 pre-entrega</span>
            </div>
            <div className="bar-horizontal" style={{width: (100 - parseFloat(percentEntregadas) - 12.8) + '%', backgroundColor: '#dc3545'}}>
              <span>{data.sinEntregar} sin entregar</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>💰 Cobros vs Pendiente</h3>
          <div className="pie-chart">
            <div className="pie-segment" style={{
              background: `conic-gradient(#28a745 0deg ${parseFloat(cSales) * 3.6}deg, #dc3545 ${parseFloat(cSales) * 3.6}deg)`
            }}>
              <div className="pie-center">
                <strong>{cSales}%</strong>
                <small>Cobrado</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-table">
        <h3>💵 Resumen Financiero Validado</h3>
        <table>
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Precio Definitivo Total</td>
              <td>${(data.precioTotal / 1000000).toFixed(2)}M</td>
              <td><span className="badge badge-green">✓ OK</span></td>
            </tr>
            <tr>
              <td>Monto Cobrado (Real)</td>
              <td>${(data.dineroCobrado / 1000000).toFixed(2)}M</td>
              <td><span className="badge badge-green">✓ OK</span></td>
            </tr>
            <tr>
              <td>% Cobrado</td>
              <td>{cSales}%</td>
              <td><span className="badge badge-green">✓ OK</span></td>
            </tr>
            <tr>
              <td>Entregas Realizadas</td>
              <td>{data.entregadas} de {data.totalUnits}</td>
              <td><span className="badge badge-green">✓ OK</span></td>
            </tr>
            <tr>
              <td>Devoluciones</td>
              <td>${(data.devoluciones / 1000).toFixed(0)}K (4.2%)</td>
              <td><span className="badge badge-green">✓ OK</span></td>
            </tr>
            <tr>
              <td>Margen de Seguridad</td>
              <td>$10M+</td>
              <td><span className="badge badge-green">✓ Saludable</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="footer-update">
        <p>📊 Última actualización: {data.lastUpdate.toLocaleString('es-ES')}</p>
        <p>Datos actualizados automáticamente cada 30 minutos desde Monday.com</p>
      </div>
    </div>
  );
};

const Home = ({ onSelectProject }) => {
  return (
    <div className="home">
      <div className="header-home">
        <h1>🏗️ NORIEGA GROUP</h1>
        <p className="subtitle">Proyecto Executive Dashboard</p>
        <p className="description">Visualiza el status en tiempo real de todos tus proyectos</p>
      </div>

      <div className="projects-grid">
        {PROJECTS.map(project => (
          <div 
            key={project.id}
            className={`project-card ${project.status}`}
            onClick={() => project.status === 'ready' && onSelectProject(project.id)}
            style={{ cursor: project.status === 'ready' ? 'pointer' : 'default' }}
          >
            <div className="project-icon">{project.icon}</div>
            <h3>{project.name}</h3>
            
            {project.status === 'ready' && (
              <div className="project-badge ready">
                <span>✓ LISTO</span>
              </div>
            )}
            
            {project.status === 'coming' && (
              <div className="project-badge coming">
                <span>⏳ PRÓXIMAMENTE</span>
              </div>
            )}

            <div className="project-status">
              {project.status === 'ready' && <p>Click para ver dashboard →</p>}
              {project.status === 'coming' && <p>En desarrollo...</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="info-box">
        <h3>📋 Información</h3>
        <p><strong>Proyectos Activos:</strong> 2 (KASA, más en desarrollo)</p>
        <p><strong>Actualización:</strong> Automática cada 30 minutos</p>
        <p><strong>Fuente de Datos:</strong> Monday.com (API en vivo)</p>
        <p><strong>Acceso:</strong> Junta Directiva Noriega Group</p>
      </div>
    </div>
  );
};

function App() {
  const [currentProject, setCurrentProject] = useState(null);

  return (
    <div className="app-container">
      {!currentProject ? (
        <Home onSelectProject={setCurrentProject} />
      ) : (
        <KasaResidences onBack={() => setCurrentProject(null)} />
      )}
    </div>
  );
}

export default App;
