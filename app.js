const LISTINGS_URL = "./data/listings.json";
const listingsEl = document.getElementById("listings");
const searchEl = document.getElementById("search");

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
  } catch (e) {
    console.error(e);
    listingsEl.innerHTML = `<p>Could not load listings. Check JSON path + console.</p>`;
  }
}

function render(items) {
  listingsEl.innerHTML = items.map(cardHTML).join("");
}

function cardHTML(item) {
  const name = item.name ?? item.listing_name ?? "Untitled listing";
  const description = item.description ?? item.summary ?? "";
  const price = item.price ?? item.nightly_price ?? "";
  const amenities = item.amenities ?? [];
  const hostName = item.host_name ?? item.host?.name ?? "Host";
  const hostPic = item.host_picture_url ?? item.host?.picture_url ?? "";
  const thumb = item.thumbnail_url ?? item.picture_url ?? item.images?.[0] ?? "";

  const topAmenities = Array.isArray(amenities) ? amenities.slice(0, 6) : [];

  return `
    <article class="card">
      ${thumb ? `<img class="thumb" src="${thumb}" alt="Listing thumbnail">` : ""}
      <h3>${esc(name)}</h3>
      <p class="meta">${esc(description.slice(0, 140))}${description.length > 140 ? "…" : ""}</p>
      <p><strong>Price:</strong> ${esc(String(price))}</p>

      <div>
        <strong>Amenities:</strong><br/>
        ${topAmenities.map(a => `<span class="badge">${esc(String(a))}</span>`).join("")}
      </div>

      <div class="host">
        ${hostPic ? `<img src="${hostPic}" alt="Host photo">` : ""}
        <div><strong>Host:</strong> ${esc(hostName)}</div>
      </div>
    </article>
  `;
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
