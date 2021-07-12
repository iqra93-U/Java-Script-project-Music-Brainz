// to delay an api call as mention in docs
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let search;
let params;

let recordingsData = [];

let everythingObj = {
  resluts: 0,
  artistName: [],
  songTitle: [],
  albumTitle: [],
  songLength: [],

  albumId: [],
};
//store my data into global state to be axcessable
const error = document.getElementById("error");
const baseUrl = "https://musicbrainz.org/ws/2/";
const searchBar = document.getElementById("searchBar");
const modal = document.getElementById("myModal");
const list = document.getElementById("list");
const submitBtn = document.getElementById("submit");
const artistTable = document.getElementById("artistTable");
const searchResults = document.getElementById("searchResults");
const spinner = document.getElementById("spinner");
const tableBody = document.getElementById("tbody");

// data to show on modal

const covers = document.getElementById("covers");
const modalTitle = document.getElementById("modalTitle");
const songTitle = document.getElementsByClassName("songTitle")[0];
const artistName = document.getElementsByClassName("artistName")[0];
const albumName = document.getElementsByClassName("albumName")[0];
const genres = document.getElementsByClassName("genres")[0];
const songLength = document.getElementsByClassName("songLength")[0];
const note = document.getElementById("note");
const theTitle = document.getElementById("theTitle");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
const modalClose = document.getElementById("modalClose");
// When the user clicks on <span> (x), close the modal
function emptyModal() {
  theTitle.innerText = "";
  songTitle.innerText = "";
  artistName.innerText = "";
  albumName.innerText = "";
  genres.innerText = "";
  songLength.innerText = "";
  note.textContent = "";
  covers.textContent = "";
}

span.onclick = function () {
  modal.style.display = "none";
  emptyModal();
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    emptyModal();
  }
};
modalClose.onclick = function () {
  modal.style.display = "none";
  emptyModal();
};

submitBtn.addEventListener("click", getData);

// get search data from the api
async function getData() {
  everythingObj = {
    resluts: 0,
    artistName: [],
    songTitle: [],
    albumTitle: [],
    songLength: [],
    releaseId: [],
    albumId: [],
  };
  searchResults.innerText = "";
  tableBody.textContent = "";
  search = searchBar.value;
  params = list.value;
  let url;
  let data;
  switch (params) {
    case "everything":
      data = await fetchAPI(
        `${baseUrl}recording/?query=artistname:${search}ANDrelease:${search}ANDrecording:${search}&fmt=json`
      );

      break;
    case "artist":
      url = `${baseUrl}recording/?query=artistname:${search}&fmt=json`;
      data = await fetchAPI(url);
      // console.log(data);

      break;
    case "album":
      url = `${baseUrl}recording/?query=release:${search}&fmt=json`;
      data = await fetchAPI(url);

      break;
    case "track":
      url = `${baseUrl}recording/?query=name:${search}&fmt=json`;
      data = await fetchAPI(url);

      break;
  }

  destructApi(data);

  displayTable(everythingObj);
} //end function getData

// to destruture the api data

const destructApi = (recordings) => {
  // push the artist search result to my everythingObj
  recordings.map((record) => {
    // to check if the items exits then push it in the everythingObj
    if (record && record.releases && record.releases[0]) {
      const { "release-group": album } = record.releases[0];
      const { "artist-credit": credit } = record;

      everythingObj.artistName.push(credit[0].name);
      everythingObj.songTitle.push(record.title);
      everythingObj.songLength.push(record.length);
      everythingObj.releaseId.push(record.releases[0].id);

      everythingObj.albumTitle.push(album.title);
      everythingObj.albumId.push(album.id);
      everythingObj.resluts = everythingObj.artistName.length;
    }
  }); //end map function
};

// the function to display the table
const displayTable = (everythingObj) => {
  searchResults.innerText = `Search Results: ${everythingObj.resluts}`;

  for (let i = 0; i < Object.keys(everythingObj.artistName).length; i++) {
    const button = document.createElement("input");
    button.type = "button";
    button.value = "Info";
    button.className = "btn btn-danger";
    button.setAttribute("tabindex", `${everythingObj.albumId[i]}`);
    button.setAttribute("index", `${i}`);
    button.setAttribute("release", `${everythingObj.releaseId[i]}`);
    button.onclick = () => {
      viewDetails(
        button.getAttribute("tabindex"),
        button.getAttribute("index"),
        button.getAttribute("release")
      );
    };
    const row = tableBody.insertRow(i);
    const srCell = row.insertCell(0);
    const artistCell = row.insertCell(1);
    const songCell = row.insertCell(2);
    const albumCell = row.insertCell(3);
    const inforCell = row.insertCell(4);

    srCell.innerText = `${i + 1}`;
    artistCell.innerText = `${everythingObj.artistName[i]}`;
    songCell.innerText = `${everythingObj.songTitle[i]}`;
    albumCell.innerText = `${everythingObj.albumTitle[i]}`;
    inforCell.appendChild(button);
  }
};

async function viewDetails(tabIndex, index, release) {
  modal.style.display = "block";
  await displayModal(tabIndex, index, release);
}

// function to get data to display for the modal

async function fetchAPI(url, offset = 0) {
  try {
    const query = `${url}&offset=${offset}`;
    const response = await fetch(query);
    const res = await response.json();
    recordingsData = res.recordings;

    // console.log(res.recordings);
    if (res.recordings.length < 1) {
      spinner.style.display = "none";
      return recordingsData;
    } else {
      spinner.style.display = "block";

      return recordingsData.concat(
        await fetchAPI(url, (offset = offset + 100))
      );
    }
  } catch (error) {
    spinner.style.display = "none";
    if (error) error.textContent = `<h1>something went wrong</h1>`;
  }
}

async function modalDataFetch(url) {
  try {
    const response = await fetch(url);
    const res = await response.json();
    return res;
  } catch (error) {
    if (error) error.innerText = `<h1>something went wrong</h1>`;
  }
}

// displayModal function

async function displayModal(albumcover, index, release) {
  // console.log(release);
  const url = ` https://musicbrainz.org/ws/2/release-group/${albumcover}?inc=ratings+genres&fmt=json`;
  const res = await modalDataFetch(url);

  let minutes = 0;
  let seconds = 0;
  // convert seconds on to minutes

  if (everythingObj.songLength[index]) {
    minutes = Math.floor(everythingObj.songLength[index] / 60000);
    seconds = ((everythingObj.songLength[index] % 60000) / 1000).toFixed(2);
  }
  // console.log(res);

  theTitle.innerText = `${everythingObj.artistName[index]}-${everythingObj.songTitle[index]}`;

  //song title
  songTitle.innerText = `${everythingObj.songTitle[index]}`;
  //artist name
  artistName.innerText = `${everythingObj.artistName[index]}`;
  // album name
  albumName.innerText = `${everythingObj.albumTitle[index]}`;
  // check if the genres property exits
  if (res.genres.length != 0) {
    genres.innerText = `${res.genres[0].name}`;
  } else {
    genres.innerText = ``;
  }
  // songLength
  songLength.innerText = `${parseInt(minutes)} : ${parseInt(seconds)}`;
  // rating value

  if (res.rating.value != null) {
    for (i = 0; i < parseInt(res.rating.value); i++) {
      const p = document.createElement("i");
      p.className = "far fa-star";

      note.appendChild(p);
    }
  } else {
    note.innerText = ``;
  }
  const urlPoster = `http://coverartarchive.org/release/${release}`;

  const imageData = await modalDataFetch(urlPoster);
  // console.log(imageData);

  displayImage(imageData);
}
// displayImage
const displayImage = (imageData) => {
  let nextImage;
  if (imageData && imageData.images) {
    for (let i = 0; i < imageData.images.length; i++) {
      nextImage = i + 1;
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "row";
      if (nextImage === imageData.images.length) {
        const innerDiv = document.createElement("div");
        innerDiv.className = "col";
        const image = document.createElement("img");
        image.className = "mt-3";
        image.src = imageData.images[i].image;
        innerDiv.appendChild(image);
        imageWrapper.appendChild(innerDiv);

        covers.appendChild(imageWrapper);
      } else {
        // creat the column divs
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        // asign them their classes
        col1.className = "col";
        col2.className = "col";
        // create the images for bot of the columns

        const firstColumnImage = document.createElement("img");
        firstColumnImage.className = "mt-3";
        firstColumnImage.src = imageData.images[i].image;

        const secondColumnImage = document.createElement("img");
        secondColumnImage.className = "mt-3";
        secondColumnImage.src = imageData.images[nextImage].image;

        //  append them into the divs

        col1.appendChild(firstColumnImage);
        col2.appendChild(secondColumnImage);

        // apend the into the iamge imageWrapper

        imageWrapper.appendChild(col1);
        imageWrapper.appendChild(col2);

        covers.appendChild(imageWrapper);
      }
      i = nextImage;
    }
  } else {
    const errormsg = document.createElement("h1");
    errormsg.innerText = "image not found";
    covers.appendChild(errormsg);
  }
};
