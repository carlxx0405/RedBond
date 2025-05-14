document.querySelector(".app").innerHTML = `
<div x-data="registerLogin()" class="max-w-xl mx-auto px-4 py-8">
    <div class="mb-6 flex justify-between">
        <button @click="mode = 'register'" :class="mode === 'register' ? 'font-bold text-red-600' : ''">Register</button>
        <button @click="mode = 'login'" :class="mode === 'login' ? 'font-bold text-red-600' : ''">Login</button>
    </div>

    <div x-show="mode === 'register'" class="space-y-4">
        <h2 class="text-2xl font-semibold mb-4">Hospital Registration</h2>
        <input x-model="name" type="text" placeholder="Hospital Name" class="w-full border p-2 rounded" />
        <input x-model="email" type="email" placeholder="Email" class="w-full border p-2 rounded" />
        <input x-model="password" type="password" placeholder="Password" class="w-full border p-2 rounded" />
        <div class="space-y-2">
            <button @click="getLocation" type="button" class="text-blue-600 underline">Detect My Location</button>
            <p x-show="locationStatus" class="text-sm text-gray-600" x-text="locationStatus"></p>

            <template x-if="locationFetched">
                <div class="text-green-600 text-sm">Location Detected: Lat: <span x-text="latitude"></span>, Lng: <span x-text="longitude"></span></div>
            </template>

            <template x-if="!locationFetched">
                <input x-model="manualLocation" type="text" placeholder="Enter location manually" class="w-full border p-2 rounded" />
            </template>
        </div>

        <input x-model="contact" type="text" placeholder="Contact Number" class="w-full border p-2 rounded" />
        
        <button @click="register" type="button" class="bg-red-600 text-white px-4 py-2 rounded w-full" :disabled="loading">
            <span x-show="!loading">Register</span>
            <span x-show="loading">Registering...</span>
        </button>
        <p class="text-red-500 text-sm mt-2" x-text="error"></p>
    </div>

    <div x-show="mode === 'login'" class="space-y-4">
        <h2 class="text-2xl font-semibold mb-4">Hospital Login</h2>
        <input x-model="loginEmail" type="email" placeholder="Email" class="w-full border p-2 rounded" />
        <input x-model="loginPassword" type="password" placeholder="Password" class="w-full border p-2 rounded" />
        <button @click="login" type="button" class="bg-red-600 text-white px-4 py-2 rounded w-full" :disabled="loading">
            <span x-show="!loading">Login</span>
            <span x-show="loading">Logging in...</span>
        </button>
        <p class="text-red-500 text-sm mt-2" x-text="error"></p>
    </div>
</div>
`;

document.addEventListener("alpine:init", () => {
  Alpine.data("registerLogin", () => ({
    mode: "register",
    loading: false,
    error: "",

    // Register fields
    name: "",
    email: "",
    password: "",
    latitude: null,
    longitude: null,
    manualLocation: "",
    locationFetched: false,
    locationStatus: "",
    contact: "",

    // Login fields
    loginEmail: "",
    loginPassword: "",

    async register() {
      this.error = "";
      if (!this.name || !this.email || !this.password || (!this.manualLocation && (!this.latitude || !this.longitude))) {
        this.error = "Please fill all required fields and provide a location.";
        return;
      }

      this.loading = true;
      try {
        // Check if email already exists
        const { data: existing, error: existingError } = await window.supabase
          .from("hospital_users")
          .select("*")
          .eq("email", this.email);

        if (existingError) throw existingError;

        if (existing.length > 0) {
          this.error = "Email already registered.";
          this.loading = false;
          return;
        }

        const { error } = await window.supabase
          .from("hospital_users")
          .insert([{
            name: this.name,
            email: this.email,
            password: this.password,
            location: this.manualLocation || "Auto",
            contact: this.contact,
            latitude: this.latitude,
            longitude: this.longitude,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;

        alert("Registration successful! You can now log in.");
        this.mode = "login";
      } catch (err) {
        console.error(err);
        this.error = "Registration failed. Try again.";
      } finally {
        this.loading = false;
      }
    },

    async login() {
      this.error = "";
      if (!this.loginEmail || !this.loginPassword) {
        this.error = "Please enter both email and password.";
        return;
      }

      this.loading = true;
      try {
        const { data, error } = await window.supabase
          .from("hospital_users")
          .select("*")
          .eq("email", this.loginEmail)
          .eq("password", this.loginPassword);

        if (error) throw error;

        if (!data || data.length === 0) {
          this.error = "Invalid email or password.";
          return;
        }

        localStorage.setItem("hospitalEmail", this.loginEmail);
        window.location.href = "../hospital/hospitalDashboard.html";
      } catch (err) {
        console.error(err);
        this.error = "Login failed.";
      } finally {
        this.loading = false;
      }
    },

    async getLocation() {
      this.locationStatus = "Requesting location...";
      if (!navigator.geolocation) {
        this.locationStatus = "Geolocation is not supported by your browser.";
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.locationFetched = true;
          this.locationStatus = "Location successfully fetched.";
        },
        (error) => {
          console.error(error);
          this.locationStatus = "Location access denied. Enter location manually.";
          this.locationFetched = false;
        }
      );
    }
  }));
});
