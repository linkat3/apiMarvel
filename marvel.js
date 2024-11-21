let input = document.getElementById("input-box");
let button = document.getElementById("submit-button");
let showContainer = document.getElementById("show-container");
let characterList = document.querySelector(".character-list");

// Funcion para manejar API request and result display
async function getResults() {
  if (input.value.trim().length < 1) {
    alert("No puede estar vacio el input de busqueda");
    return;
  }
  showContainer.innerHTML = "";
  const ts = new Date().getTime();
  const publicKey = '22e3db6c24756170accdce1949784f41';//clave publica de la api
  const privateKey = '401fb63a80331013f5a3e46fa8f88b6a3dc733f3';//clave privada de la api
  const hash = CryptoJS.MD5(ts + privateKey + publicKey).toString();//indicaciones hash de api de marvel
  const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters';

  // https://gateway.marvel.com/v1/public/characters

  const url = `${baseUrl}?ts=${ts}&apikey=${publicKey}&hash=${hash}&nameStartsWith=${input.value}`; // Use nameStartsWith for partial matches
  console.log(url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching results: ${response.statusText}`);
    }
    const jsonData = await response.json();
    // Clear results 
    showContainer.innerHTML = "";

    const characters = jsonData.data.results; // Assuming characters are in data.results

    if (characters.length === 0) {
      showContainer.textContent = "No results found."; // Informative message for no results
      showContainer.classList.add("text-light");
    } else {
      characters.sort((a, b) => a.name.localeCompare(b.name));

      characters.forEach(character => {
        let urlCharacter = character.urls[0].url;
        const characterElement = document.createElement('div');
        characterElement.classList.add("col-4", "d-flex", "justify-content-center", "mb-2");
        characterElement.innerHTML = `
          <div class="card d-flex justify-content-center pb-2 bg-warning">
            <img src="${character.thumbnail.path}.${character.thumbnail.extension}" class="rounded-circle card-img-top p-2 img-fluid" alt="${character.name}">
            <div class="card-body">
              <h5 class="card-title">${character.name}</h5>
            </div>
            <a href="#" data-hero-id="${character.id}" class="details-link btn btn-danger m-2"> + </a>
          </div>`;
        showContainer.appendChild(characterElement);
      });
    }
  } catch (error) {
    console.error("Error fetching results:", error);
    showContainer.textContent = "An error occurred. Please try again later."; 
  }
}
// Event listener para los enlaces "Details"
showContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('details-link')) {
    event.preventDefault(); // Evita que el navegador siga el enlace
    cargaDetallesPersonaje(event);
  }
});

// Event listener for button click (optional)
button.addEventListener("click", getResults); // If you still want a button click trigger

function cargaDetallesPersonaje(event) {
  event.preventDefault(); // Prevent default link behavior (navigation)
  const heroId = event.target.dataset.heroId;
  const url = `https://gateway.marvel.com:443/v1/public/characters/${heroId}?ts=1&apikey=22e3db6c24756170accdce1949784f41&hash=ac2cec6698eb0bf841e1ad3c214931e8`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const heroDetails = `
      <div class="container-fluid text-center">
        <h1 class="text-danger p-2 fs-1">${data.data.results[0].name}</h1>
      <div class="row align-items-center fondo-details">
        <div class="col-sm-10 col-md-5">
        <img class="img-thumbnail mx-auto pt-2" src="${data.data.results[0].thumbnail.path}.${data.data.results[0].thumbnail.extension}" 
        alt="${data.data.results[0].name}" style="width: 60%">
       </div>
        <div class="col-sm-10 col-md-7 marvel-text-container"> 
        <p class="text-white fs-5"><span class="text-warning"> Comics: </span> ${data.data.results[0].comics.available}</p>
        <p class="text-white fs-5"><span class="text-warning"> Series: </span> ${data.data.results[0].series.available}</p>
        <p class="text-white fs-5"><span class="text-warning"> Stories: </span> ${data.data.results[0].stories.available}</p>
        <p class="fs-5 text-white card-text overflow: hidden; text-overflow: ellipsis;"><span class="text-warning">Description:</span>  ${data.data.results[0].description || 'No hay descripción disponible.'}</p>
        </div>
      </div>
      </div>`;
      document.body.innerHTML = heroDetails;
    })
    .catch(error => console.error('Error fetching hero details:', error));
}
