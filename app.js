const LISTINGS_URL = "./data/airbnb_sf_listings_500.json";
const listingsEl = document.getElementById("listings");
const loadingEl = document.getElementById("loading");
const searchEl = document.getElementById("search");
const FALLBACK_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";

let ALL = [];

async function loadListings() {
  try {
    const res = await fetch(LISTINGS_URL);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const data = await res.json();

    // handle different JSON shapes
    ALL =
      Array.isArray(data) ? data :
      Array.isArray(data.listings) ? data.listings :
      Array.isArray(data.results) ? data.results :
      [];

    render(ALL.slice(0, 50));

    // hide loading text after successful render
    if (loadingEl) loadingEl.style.display = "none";
  } catch (e) {
    console.error(e);
    listingsEl.innerHTML = `<p>Could not load listings. Check JSON path + console.</p>`;

    // show a friendly loading error message
    if (loadingEl) loadingEl.textContent = "Failed to load listings.";
  }
}

function render(items) {
  listingsEl.innerHTML = items.map(cardHTML).join("");
}

function cardHTML(item) {
  const name = item.name ?? "Untitled listing";
  const description = item.description ?? "";
  const cleanDesc = stripHTML(description); // moved ourside template string

  const price = item.price ?? "";
  const hostName = item.host_name ?? "Host";
  const hostPic = item.host_picture_url ?? "";
  const thumb = item.picture_url || FALLBACK_IMAGE;

  let amenities = [];
  try {
    amenities = Array.isArray(item.amenities) 
      ? item.amenities 
      : JSON.parse(item.amenities ?? "[]");
  } catch {
    amenities = [];
  }

  const topAmenities = amenities.slice(0, 6);

  return `
    <article class="card">
      <img class="thumb" src="${thumb}" alt="Listing image">
      <h3>${esc(name)}</h3>
      <p class="meta">${esc(cleanDesc.slice(0, 140))}${cleanDesc.length > 140 ? "…" : ""}</p>
      <p><strong>Price:</strong> ${esc(price)}</p>

      <div>
        <strong>Amenities:</strong><br/>
        ${topAmenities.map(a => `<span class="badge">${esc(a)}</span>`).join("")}
      </div>

      <div class="host">
        ${hostPic ? `<img src="${hostPic}" alt="Host photo">` : ""}
        <div><strong>Host:</strong> ${esc(hostName)}</div>
      </div>
    </article>
  `;
}

function stripHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html ?? "";
  return div.textContent || div.innerText || "";
}

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Creative addition: search by name (filters the 50 shown)
searchEl.addEventListener("input", () => {
  const q = searchEl.value.trim().toLowerCase();
  const first50 = ALL.slice(0, 50);
  const filtered = first50.filter(x =>
    (x.name ?? x.listing_name ?? "").toLowerCase().includes(q)
  );
  render(filtered);
});

loadListings();
