export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const MONDAY_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjE5MDI1NzkxMCwiYWFpIjoxMSwidWlkIjoxOTM0NDQyNCwiaWFkIjoiMjAyMi0xMS0wN1QyMDo1NTo0OC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODA4NDMyMiwicmduIjoidXNlMSJ9.QhaPeGZLSDuqvp3vA0YLbKj_RRCPRavger3JabQEEsI";

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

    const data = await response.json();

    if (data.data && data.data.boards && data.data.boards[0]) {
      const items = data.data.boards[0].items_page.items;
      
      const entregadas = items.filter(i => {
        const statusCol = i.column_values.find(cv => cv.id === 'color_mkpega34');
        return statusCol && statusCol.value && statusCol.value.includes('UNIDAD ENTREGADA');
      }).length;

      const disponibles = items.filter(i => {
        const statusCol = i.column_values.find(cv => cv.id === 'status');
        return statusCol && statusCol.value && statusCol.value.includes('DISPONIBLE');
      }).length;

      res.status(200).json({
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
    } else {
      res.status(500).json({ error: 'No data from Monday.com' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
