var jsonData = null;
var devices = null;
var deviceCFW = [];
var manufacturers = [];
var countsData = null;
var gameGenres = [];

var deviceMap = {
    "ALL": "All Firmwares",
    "jelos": "JELOS",
    "rocknix": "ROCKNIX",
    "arkos": "ArkOS",
    "emuelec": "EmuELEC",
    "amberelec": "AmberELEC",
    "arkos (wummle)": "ArkOS (Wummle)"
}


// Function to create a card element for each JSON object
// https://discord.gg/JxYBp9HTAY
function createCard(data) {
    const div1 = document.createElement('div');
    div1.setAttribute("class", "col");

    const div2 = document.createElement('div');
    div2.setAttribute("class", "card h-100 shadow-sm");

    const imageLink = document.createElement("a");
    imageLink.href = getCardUrl(data.name.replace(".zip", ""));

    const image = document.createElement("img");

    var source = "https://raw.githubusercontent.com/PortsMaster/PortMaster-Website/main/no.image.png";

    if (data.attr.image.screenshot !== null) {
        if (data.source.repo == "main") {
            source = ("https://raw.githubusercontent.com/PortsMaster/PortMaster-New/main/ports/" + data.name.replace(".zip", "/") + data.attr.image.screenshot);
        } else if (data.source.repo == "multiverse") {
            source = ("https://raw.githubusercontent.com/PortsMaster-MV/PortMaster-MV-New/main/ports/" + data.name.replace(".zip", "/") + data.attr.image.screenshot);
        }
    }

    image.src = source;
    image.setAttribute("class", "bd-placeholder-img card-img-top");
    image.setAttribute("loading", "lazy");
    imageLink.appendChild(image);

    const div3 = document.createElement('div');
    div3.setAttribute("class", "card-body");

    const titleLink = document.createElement("a");
    titleLink.setAttribute("class", "text-decoration-none");
    titleLink.href = getCardUrl(data.name.replace(".zip", ""));

    const title = document.createElement('h5');
    title.setAttribute("class", "card-title link-body-emphasis");
    title.setAttribute("style", "padding-top: 20px")
    title.textContent = data.attr.title;
    titleLink.appendChild(title);

    const paragraph = document.createElement('p');
    paragraph.setAttribute("class", "card-text");
    paragraph.setAttribute("style", "padding-top: 10px")

    var converter = new showdown.Converter();


    var desc = data.attr.desc;
    if (data.attr.desc_md){
        desc = data.attr.desc_md;
    }
    paragraph.innerHTML = converter.makeHtml(desc);

    const porter = document.createElement('p');
    porter.setAttribute("class", "card-text");
    porter.setAttribute("style", "padding-top: 10px");
    var porters = data.attr.porter;
    var porterHtml = "Porter: ";
    porters.forEach((porter) => {
        porterHtml += '<a href="profile.html?porter=' + porter + '">' + porter + '</a>';
        if (porters.length > 1) {
            porterHtml += " ";
        }
    });
    porter.innerHTML = porterHtml;

    const supported = document.createElement('p');
    supported.setAttribute("class", "card-text");
    supported.setAttribute("style", "padding-top: 10px");

    var deviceDetails = [];
    var supportedtext = "";
    for (item in data.supported) {
        for (support in data.attr.avail) {
            if (data.attr.avail[support].includes(data.supported[item])) {
                var deviceName = devices[data.attr.avail[support].split(":")[0]]["name"]
                var cfws = deviceMap[data.attr.avail[support].split(":")[1]]
                supportedtext = supportedtext + deviceName + ": " + cfws + "<br>"
                deviceDetails.push(deviceName + ": " + cfws);
            }
        }
    }
    supported.innerHTML = "Supported Devices: <br>" + supportedtext;

    const dateUpdated = document.createElement('p');
    dateUpdated.setAttribute("class", "card-text text-body-secondary");
    dateUpdated.setAttribute("style", "padding-top: 10px")
    dateUpdated.textContent = "Added: " + data.source.date_added;

    var taggedMisc = "";
    if (data.attr.rtr) {
        taggedMisc += '<span class="misc-item badge bg-secondary">Ready to Run</span> ';
    }

    if (data.attr.exp) {
        taggedMisc += '<span class="misc-item badge bg-secondary">Experimental</span> ';
    }

    if (data.source.repo == "multiverse") {
        taggedMisc += '<span class="misc-item badge bg-secondary">Multiverse</span> ';
    }

    const miscValues = document.createElement('p');
    miscValues.innerHTML = taggedMisc;

    const div4 = document.createElement('div');
    div4.setAttribute("class", "d-flex justify-content-between align-items-center");

    const div5 = document.createElement('div');
    div5.setAttribute("class", "btn-group");

    const buttonLink = document.createElement("a");
    buttonLink.href = getCardUrl(data.name.replace(".zip", ""), deviceDetails);

    const button = document.createElement('button');
    button.setAttribute("type", "button");
    button.textContent = "Details"
    button.setAttribute("class", "btn btn-sm btn-outline-primary");
    buttonLink.appendChild(button);

    div5.appendChild(buttonLink);



    const small = document.createElement('small');
    small.setAttribute("class", "text-body-secondary");
    small.textContent = "Downloads: " + (countsData["ports"][data.name] ? countsData["ports"][data.name] : "0");


    div4.appendChild(small);
    div4.appendChild(div5);


    div3.appendChild(imageLink);
    div3.appendChild(titleLink);
    div3.appendChild(paragraph);
    div3.appendChild(miscValues);
    div3.appendChild(porter);
    if (data.supported.length > 0) {
        div3.appendChild(supported);
    }
    div3.appendChild(dateUpdated);
    div3.appendChild(div4);

    div2.appendChild(div3)
    div1.appendChild(div2)


    return div1;
}

// Function to iterate over the JSON data and display cards
function displayCards(data) {
    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.innerHTML = ''; // Clear previous cards
    for (var key of Object.keys(data)) {
        const card = createCard(data[key]);
        cardsContainer.appendChild(card);
    };
}

function stringSimilarity(str1, str2, gramSize = 2) {
    function getNGrams(s, len) {
        s = ' '.repeat(len - 1) + s.toLowerCase() + ' '.repeat(len - 1);
        let v = new Array(s.length - len + 1);
        for (let i = 0; i < v.length; i++) {
            v[i] = s.slice(i, i + len);
        }
        return v;
    }
    if (!(str1 === null || str1 === void 0 ? void 0 : str1.length) || !(str2 === null || str2 === void 0 ? void 0 : str2.length)) {
        return 0.0;
    }
    let s1 = str1.length < str2.length ? str1 : str2;
    let s2 = str1.length < str2.length ? str2 : str1;
    let pairs1 = getNGrams(s1, gramSize);
    let pairs2 = getNGrams(s2, gramSize);
    let set = new Set(pairs1);
    let total = pairs2.length;
    let hits = 0;
    for (let item of pairs2) {
        if (set.delete(item)) {
            hits++;
        }
    }
    return hits / total;
}

// Function to load a saved filter state from the session storage
function loadFilterState() {
    const savedFilterState = sessionStorage.getItem('filterState');

    if (savedFilterState) {
        const filterState = JSON.parse(savedFilterState);
        document.getElementById('ready-to-run').checked = filterState.readyToRun;
        document.getElementById('files-needed').checked = filterState.filesNeeded;
        document.getElementById('sortNewest').checked = filterState.Newest;
        document.getElementById('sortDownloaded').checked = filterState.Downloaded;
        document.getElementById('sortAZ').checked = filterState.AZ;
        document.getElementById('search').value = filterState.searchQuery;
        for (const device in filterState.devices) {
            document.getElementById(device).checked = filterState.devices[device];
        }
        for (const genre in filterState.genres) {
            document.getElementById(genre).checked = filterState.genres[genre];
        }
    }
}

// Function to filter the cards based on the search query
function filterCards() {
    const searchQuery = document.getElementById('search').value.trim().toLowerCase();
    const readyToRun = document.getElementById('ready-to-run').checked;
    const filesNeeded = document.getElementById('files-needed').checked;
    const Newest = document.getElementById('sortNewest').checked;
    const Downloaded = document.getElementById('sortDownloaded').checked;
    const AZ = document.getElementById('sortAZ').checked;

    const filterState = {
        searchQuery: searchQuery ? searchQuery : "",
        readyToRun,
        filesNeeded,
        Newest,
        Downloaded,
        AZ,
        devices: {},
        genres: {}
    };

    var filteredData = []
    var selected = [];
    var selectedGenres = [];
    for (device in devices){
        const deviceElement = document.getElementById(device);
        if (deviceElement.checked){
            selected.push(device)
        }
        filterState.devices[device] = deviceElement.checked;
    }

    for (var i = 0; i < gameGenres.length; i++) {
        const genreElement = document.getElementById(gameGenres[i]);
        if (genreElement.checked){
            selectedGenres.push(gameGenres[i])
        }
        filterState.genres[gameGenres[i]] = genreElement.checked;
    }

    sessionStorage.setItem('filterState', JSON.stringify(filterState));

    if (searchQuery.length > 0) {

        const options = { includeScore: true, isCaseSensitive: false, shouldSort: true, keys: ['attr.title'] };
        const fuse = new Fuse(jsonData, options);
        const result = fuse.search(document.getElementById('search').value.trim());

        if (result.length > 0) {
            result.forEach(element => {
                if (!filteredData.includes(element.item)) {
                    element.item["supported"] = [];
                    if (readyToRun || filesNeeded) {
                        if (readyToRun) {
                            if (element.item.attr.rtr) {
                                if (element.item.attr.avail.length < 1) {
                                    if (!filteredData.includes(element.item)) {
                                        if (!element.item["supported"].includes("ALL")) {
                                            element.item["supported"].push("ALL");
                                        }
                                        filteredData.push(element.item);
                                    }
                                }
                                for (item in element.item.attr.avail) {
                                    var device = element.item.attr.avail[item].split(":")[0];
                                    var cfw = element.item.attr.avail[item].split(":")[1]
                                    if (selected.includes(device)) {
                                        if (!element.item["supported"].includes(device)) {
                                            element.item["supported"].push(device);
                                        }
                                        if (!filteredData.includes(element.item)) {
                                            filteredData.push(element.item);
                                        }
                                    }
                                  
                                        if (device == "ALL") {
                                            if (!element.item["supported"].includes(device)) {
                                                element.item["supported"].push(device);
                                            }
                                            if (!filteredData.includes(element.item)) {
                                                filteredData.push(element.item);
                                            }
                                        }

                                    
                                }
                                if (selected.length < 1) {
                                    if (!filteredData.includes(element.item)) {
                                        filteredData.push(element.item);
                                    }
                                }
                            }
                        } if (filesNeeded) {
                            if (!element.item.attr.rtr) {
                                if (element.item.attr.avail.length < 1) {
                                    if (!filteredData.includes(element.item)) {
                                        if (!element.item["supported"].includes("ALL")) {
                                            element.item["supported"].push("ALL");
                                        }
                                        filteredData.push(element.item);
                                    }
                                }
                                for (item in element.item.attr.avail) {
                                    var device = element.item.attr.avail[item].split(":")[0];
                                    var cfw = element.item.attr.avail[item].split(":")[1]
                                    if (selected.includes(device)) {
                                        if (!element.item["supported"].includes(device)) {
                                            element.item["supported"].push(device);
                                        }
                                        if (!filteredData.includes(element.item)) {
                                            filteredData.push(element.item);
                                        }
                                    }
                                  
                                        if (device == "ALL") {
                                            if (!element.item["supported"].includes(device)) {
                                                element.item["supported"].push(device);
                                            }
                                            if (!filteredData.includes(element.item)) {
                                                filteredData.push(element.item);
                                            }
                                        }

                                    
                                }
                                if (selected.length < 1) {
                                    if (!filteredData.includes(element.item)) {
                                        filteredData.push(element.item);
                                    }
                                }
                            }
                        }
                    }
                    else {
                         // don't show any ports if ready to run or files need are not checked
                    }
                }
            });
        }
    }
    else {
        for (var key of Object.keys(jsonData)) {
            jsonData[key]["supported"] = [];
            if (readyToRun || filesNeeded) {
                if (readyToRun) {
                    if (jsonData[key].attr.rtr) {
                        if (jsonData[key].attr.avail.length < 1) {
                            if (!filteredData.includes(jsonData[key])) {
                                if (!jsonData[key]["supported"].includes("ALL")) {
                                    jsonData[key]["supported"].push("ALL");
                                }
                                filteredData.push(jsonData[key]);
                            }
                        }
                        for (item in jsonData[key].attr.avail) {
                            var device = jsonData[key].attr.avail[item].split(":")[0];
                            var cfw = jsonData[key].attr.avail[item].split(":")[1]
                            if (selected.includes(device)) {
                                if (!jsonData[key]["supported"].includes(device)) {
                                    jsonData[key]["supported"].push(device);
                                }
                                if (!filteredData.includes(jsonData[key])) {
                                    filteredData.push(jsonData[key]);
                                }
                            }
                          
                            if (device == "ALL") {
                                if (!jsonData[key]["supported"].includes(device)) {
                                    jsonData[key]["supported"].push(device);
                                }
                                if (!filteredData.includes(jsonData[key])) {
                                    filteredData.push(jsonData[key]);
                                }
                            }

                            
                        }
                        if (selected.length < 1) {
                            if (!filteredData.includes(jsonData[key])) {
                                filteredData.push(jsonData[key]);
                            }
                        }
                    }
                } if (filesNeeded) {
                    if (!jsonData[key].attr.rtr) {
                        if (jsonData[key].attr.avail.length < 1) {
                            if (!filteredData.includes(jsonData[key])) {
                                if (!jsonData[key]["supported"].includes("ALL")) {
                                    jsonData[key]["supported"].push("ALL");
                                }
                                filteredData.push(jsonData[key]);
                            }
                        }
                        for (item in jsonData[key].attr.avail) {
                            var device = jsonData[key].attr.avail[item].split(":")[0];
                            var cfw = jsonData[key].attr.avail[item].split(":")[1]
                            if (selected.includes(device)) {
                                if (!jsonData[key]["supported"].includes(device)) {
                                    jsonData[key]["supported"].push(device);
                                }
                                if (!filteredData.includes(jsonData[key])) {
                                    filteredData.push(jsonData[key]);
                                }
                            }
                          
                                if (device == "ALL") {
                                    if (!jsonData[key]["supported"].includes(device)) {
                                        jsonData[key]["supported"].push(device);
                                    }
                                    if (!filteredData.includes(jsonData[key])) {
                                        filteredData.push(jsonData[key]);
                                    }
                                }

                            
                        }
                        if (selected.length < 1) {
                            if (!filteredData.includes(jsonData[key])) {
                                filteredData.push(jsonData[key]);
                            }
                        }
                    }
                }
                
                if (selectedGenres.length > 0) {
                    var genres = jsonData[key].attr.genres;
                    var match = false;
                    for (var i = 0; i < genres.length; i++) {
                        if (selectedGenres.includes(genres[i])) {
                            match = true;
                        }
                    }
                    if (match) {
                        if (!filteredData.includes(jsonData[key])) {
                            filteredData.push(jsonData[key]);
                        }
                    } else {
                        //remove the port if it doesn't match the genre
                        if (filteredData.includes(jsonData[key])) {
                            filteredData.splice(filteredData.indexOf(jsonData[key]), 1);
                        }
                    }
                }
            }
            else {
                // don't show any ports if ready to run or files need are not checked
            }
        }

        if (Newest) {
            filteredData.sort((a, b) => Date.parse(a.source.date_added) > Date.parse(b.source.date_added) ? -1 : (Date.parse(a.source.date_added) < Date.parse(b.source.date_added) ? 1 : 0));
        }
    
        if (AZ) {
            filteredData.sort();
        }
    
        if (Downloaded) {
            filteredData.sort((a, b) => a.download_count > b.download_count ? -1 : (a.download_count < b.download_count) ? 1 : 0);
        }
    }

    var availablePorts = document.getElementById("port-count")
    availablePorts.textContent = filteredData.length + " Ports Available"
    displayCards(filteredData);
}

// Function to handle the card title click and redirect to the detail page
function handleCardClick(name) {
    window.location.href = `detail.html?name=${encodeURIComponent(name)}`;
}

function getCardUrl(name, deviceDetails) {
  return `detail.html?name=${encodeURIComponent(name)}` + (deviceDetails ? `&devices=${encodeURIComponent(deviceDetails.join(","))}` : "");
}

function populateManufacturerDropdown() {
    var deviceDropdown = document.getElementById("dropdown-buttons");
    for (manufacturer of manufacturers) {
        const div = document.createElement('div');
        div.setAttribute("class", "btn-group flex-wrap");
        div.setAttribute("role", "group");
        const button = document.createElement('button');
        button.setAttribute("class", "btn btn-outline-primary dropdown-toggle");
        button.setAttribute("data-bs-toggle", "dropdown");
        button.setAttribute("aria-expanded", "false");
        button.textContent = manufacturer
        const ul = document.createElement('ul');
        ul.setAttribute("id", manufacturer);
        ul.setAttribute("class", "dropdown-menu");
        div.appendChild(button);
        div.appendChild(ul);
        deviceDropdown.appendChild(div);

    }
    populateDeviceDropdown();
}

function populateDeviceDropdown() {
    for (var key of Object.keys(devices)) {
        var manufacturerDropdown = document.getElementById(devices[key]["manufacturer"]);
        const li = document.createElement('li');
        const a = document.createElement('a');
        //a.textContent = devices[key]["name"]
        const label = document.createElement('label');
        label.setAttribute("for", key);
        const input = document.createElement('input');
        input.setAttribute("class", "form-check-input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("style", "margin-right: 10px;");
        input.setAttribute("onchange", "filterCards()");
        input.setAttribute("id", key);
        label.textContent = devices[key]["name"]
        li.setAttribute("class", "dropdown-item");
        li.setAttribute("href", "#");
        li.appendChild(input);
        li.appendChild(label);
        manufacturerDropdown.appendChild(li);

    }
}

function populateGenreDropdown() {
    var gamesDropdown = document.getElementById("dropdown-buttons");

    var genresSet = new Set();

    Object.values(jsonData).forEach(game => {
        game.attr.genres.forEach(genre => {
            genresSet.add(genre);
        });
    });

    genresSet.forEach(genre => {
        gameGenres.push(genre);
    });

    const div = document.createElement('div');
    div.setAttribute("class", "btn-group flex-wrap");
    div.setAttribute("role", "group");

    const button = document.createElement('button');
    button.setAttribute("class", "btn btn-outline-primary dropdown-toggle");
    button.setAttribute("data-bs-toggle", "dropdown");
    button.setAttribute("aria-expanded", "false");
    button.textContent = "Genres";

    const ul = document.createElement('ul');
    ul.setAttribute("class", "dropdown-menu");

    genresSet.forEach(genre => {
        const li = document.createElement('li');
        li.setAttribute("class", "dropdown-item");

        const input = document.createElement('input');
        input.type = "checkbox";
        input.id = genre;
        input.name = genre;
        input.value = genre;
        input.setAttribute("onchange", "filterCards()");

        const label = document.createElement('label');
        label.htmlFor = genre;
        label.textContent = genre;
        label.style.marginLeft = "5px";

        li.appendChild(input);
        li.appendChild(label);
        ul.appendChild(li);
    });

    div.appendChild(button);
    div.appendChild(ul);
    gamesDropdown.appendChild(div);
}

async function getDeviceList() {
    try {
        var response = await fetch('https://raw.githubusercontent.com/PortsMaster/PortMaster-Info/main/devices.json'); // Replace 'YOUR_JSON_URL_HERE' with the actual URL of your JSON data.
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        devices = await response.json();
        for (var key of Object.keys(devices)) {
            if (!manufacturers.includes(devices[key]["manufacturer"])) {
                manufacturers.push(devices[key]["manufacturer"]);
            }
        }
        manufacturers.sort();

        populateManufacturerDropdown();


    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}


// Fetch JSON data from the URL and then display the cards
async function fetchDataAndDisplayCards() {

    try {
        var response = await fetch('https://raw.githubusercontent.com/PortsMaster/PortMaster-Info/main/ports.json'); // Replace 'YOUR_JSON_URL_HERE' with the actual URL of your JSON data.
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        jsonData = await response.json();
        var array = [];
        for (port in jsonData.ports) {
            array.push(jsonData.ports[port]);
        }
        jsonData = array;       
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }

    try {
        var response = await fetch('https://raw.githubusercontent.com/PortsMaster/PortMaster-Info/main/port_stats.json'); // Replace 'YOUR_JSON_URL_HERE' with the actual URL of your JSON data.
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        countsData = await response.json();
        for (port in jsonData) {
            jsonData[port]["download_count"] = countsData["ports"][jsonData[port].name];
        }

    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }

    populateGenreDropdown();
    loadFilterState();
    filterCards();

}
window.onload = function () {
    getDeviceList();
    fetchDataAndDisplayCards();
};

