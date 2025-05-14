document.addEventListener("DOMContentLoaded", () => {
    // Load and display the user's email
    const email = localStorage.getItem("userEmail");
    const userNameEl = document.getElementById("user-name");
    if (email && userNameEl) {
      userNameEl.textContent = email;
    }
  
    // Sample blood request data
    const bloodRequests = [
      { hospital: "MBTS", location: "Lilongwe", status: "Urgent" },
      { hospital: "Kamuzu Hospital", location: "Blantyre", status: "Pending" },
      { hospital: "Partners in Hope", location: "Mzuzu", status: "Fulfilled" },
    ];
  
    // Populate the blood request cards
    const requestContainer = document.getElementById("blood-requests");
    if (requestContainer) {
      requestContainer.innerHTML = "";
      bloodRequests.forEach((req) => {
        const card = document.createElement("div");
        card.className = "bg-red-600 text-white rounded-lg p-4";
        card.innerHTML = `
          <div class="flex justify-between">
            <span class="font-bold">${req.hospital}</span>
            <span class="text-sm">${req.status}</span>
          </div>
          <p class="text-sm">${req.location}</p>
        `;
        requestContainer.appendChild(card);
      });
    }
  
    // Button event listeners for navigation
    document.getElementById("donate-btn").addEventListener("click", () => {
      window.location.href = "donate.html";
    });
  
    document.getElementById("request-btn").addEventListener("click", () => {
      window.location.href = "request.html";
    });
  });
  