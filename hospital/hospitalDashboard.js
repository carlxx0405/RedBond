const router = new Navigo('/', { hash: true });
const main = document.getElementById('main-content');

async function getHospitalId() {
  const email = localStorage.getItem('hospitalEmail');
  const { data, error } = await supabase.from('hospital_users').select('id').eq('email', email).single();
  return data?.id || null;
}

async function fetchRequestsByStatus(status, hospitalId) {
  const { data } = await supabase
    .from('blood_requests')
    .select('*')
    .eq('hospital_id', hospitalId)
    .eq('status', status);
  return data || [];
}

async function fetchBloodStock(hospitalId) {
  const { data } = await supabase
    .from('blood_stock')
    .select('*')
    .eq('hospital_id', hospitalId);
  return data || [];
}

async function updateBloodStock(hospitalId, bloodType, units) {
  const { data, error } = await supabase
    .from('blood_stock')
    .upsert({ hospital_id: hospitalId, blood_type: bloodType, units }, { onConflict: ['hospital_id', 'blood_type'] });
  if (error) console.error('Update error:', error);
}

async function submitBloodRequest(hospitalId, request) {
  const { error } = await supabase.from('blood_requests').insert([{ ...request, hospital_id: hospitalId }]);
  if (error) console.error('Insert error:', error);
}

const dashboardView = async () => {
  const hospitalId = await getHospitalId();
  if (!hospitalId) return '<p class="text-red-600">Hospital ID not found.</p>';

  const [pending, active, scheduled, fulfilled] = await Promise.all([
    fetchRequestsByStatus('pending', hospitalId),
    fetchRequestsByStatus('active', hospitalId),
    fetchRequestsByStatus('scheduled', hospitalId),
    fetchRequestsByStatus('fulfilled', hospitalId),
  ]);

  return `
    <h1 class="text-2xl font-bold mb-4">Hospital Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      ${['Pending', 'Active', 'Scheduled', 'Fulfilled'].map((label, i) => {
        const count = [pending, active, scheduled, fulfilled][i].length;
        return `
          <div class="bg-white shadow rounded p-4">
            <h2 class="text-xl font-semibold text-red-600">${label}</h2>
            <p class="text-gray-700 mt-2">${count} request(s)</p>
          </div>`;
      }).join('')}
    </div>
  `;
};

const requestFormView = async () => {
  const hospitalId = await getHospitalId();

  return `
    <h1 class="text-2xl font-semibold mb-6">Submit Blood Request</h1>
    <form id="requestForm" class="bg-white p-6 rounded shadow space-y-4 max-w-xl">
      <div>
        <label class="block text-sm font-medium">Blood Type</label>
        <select name="blood_type" class="w-full mt-1 border p-2 rounded">
          <option>A</option><option>B</option><option>AB</option><option>O</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium">Quantity (units)</label>
        <input name="units" type="number" required class="w-full mt-1 border p-2 rounded" />
      </div>
      <div>
        <label class="block text-sm font-medium">Urgency</label>
        <select name="urgency" class="w-full mt-1 border p-2 rounded">
          <option>Low</option><option>Medium</option><option>High</option>
        </select>
      </div>
      <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Submit</button>
    </form>

    <script>
      document.getElementById("requestForm").onsubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        await submitBloodRequest(${hospitalId}, {
          blood_type: form.blood_type.value,
          units: parseInt(form.units.value),
          urgency: form.urgency.value,
          status: "pending",
          created_at: new Date().toISOString()
        });
        alert("Request submitted!");
        form.reset();
      }
    </script>
  `;
};

const inventoryView = async () => {
  const hospitalId = await getHospitalId();
  const stock = await fetchBloodStock(hospitalId);

  return `
    <h1 class="text-2xl font-semibold mb-6">Update Blood Inventory</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${['A', 'B', 'AB', 'O'].map(type => {
        const current = stock.find(s => s.blood_type === type)?.units || 0;
        return `
          <div class="bg-white p-4 shadow rounded flex items-center justify-between">
            <span>${type}</span>
            <input type="number" id="unit-${type}" class="border p-1 w-20 rounded" value="${current}">
            <button onclick="updateStock('${type}')" class="bg-red-500 text-white px-2 py-1 rounded">Update</button>
          </div>
        `;
      }).join('')}
    </div>
    <script>
      async function updateStock(type) {
        const units = document.getElementById("unit-" + type).value;
        await updateBloodStock(${hospitalId}, type, parseInt(units));
        alert("Updated " + type + " units.");
      }
    </script>
  `;
};

function render(html) {
  main.innerHTML = html;
}

async function renderWithAuth(viewFn) {
  const email = localStorage.getItem("hospitalEmail");
  if (!email) {
    window.location.href = "../hospital/hospitalRegister.html";
    return;
  }
  render(await viewFn());
}

router.on({
  '/': () => renderWithAuth(dashboardView),
  '/requests': () => renderWithAuth(requestFormView),
  '/availability': () => renderWithAuth(inventoryView),
  '/logout': () => {
    localStorage.removeItem("hospitalEmail");
    window.location.href = "../index.html";
  }
}).resolve();

window.addEventListener('DOMContentLoaded', () => {
  router.updatePageLinks();
});
