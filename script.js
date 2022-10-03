//score and winstreak variables
let score;
let winstreak;
//musixmatch api key
const apikey = "84f4ec2655a2263d350ed92946c2cdeb";

//spotify api stuff
var client_id = "38df025f2f344c0cb44bac86a7e50fb1";
var client_secret = "b552b65ef19747a5ba46b6ba887d79a7";
var redirect_uri = "https://lyricguessr.netlify.app/";
console.log(window.location.href);

var currentToken ="";
var refreshToken = "";
var code = "";

//first input for an artist
const artistInput = document.querySelector("#artistInput");
//selector for lyrics box
const lyricsBox = document.querySelector("#lyricsBox");
//guess input
const guessInput = document.querySelector("#guessInput");
//correct answer info
const answerBox = document.querySelector("#answerBox");
//display incorrect or correct
const correctness = document.querySelector("#correctness");
const answerSection = document.querySelector("#answerSection");
const loginButton = document.querySelector("#loginButton");
const spotifyBlock = document.querySelector("#spotifyBlock");

const scoreVal = document.querySelector("#scoreVal");

const winstreakVal = document.querySelector("#winstreakVal");

let guessAnswer = "";

let randTrack = "null";

if(window.localStorage.getItem("Score") == null){
    score = 0;
    winstreak = 0;
}
else{
    score = Number(window.localStorage.getItem("Score"));
    winstreak = Number(window.localStorage.getItem("Winstreak"));
    scoreVal.innerHTML = `<h2 class="subtitle">Score: ${score}</h2>`;
    winstreakVal.innerHTML = `<h2 class="subtitle">Winstreak: ${winstreak}</h2>`;
}

async function getArtistID(apikey, artist){
    //escape to hard-coded song for testing
    if(artist == -1){
        return -1;
    }
    //query for artist search (temporary solution using proxy)
    const myQuery = `https://effulgent-sawine-ae4ee1.netlify.app/.netlify/functions/cors/https://api.musixmatch.com/ws/1.1/artist.search?apikey=${apikey}&q_artist=${artist}
    `;
    const response = await fetch(myQuery, {
        mode: 'cors'
    });
    answerBox.innerHTML = "";
    //to start using hard-coded data (note for jean, what does this do?)
    if(!response.ok){
        console.log(response);
        return -1;
    }
    // console.log(response);
    const data = await response.json();
    console.log(data);
    if(data.message.body.artist_list.length == 0){
        alert("We couldn't find that artist!");
        return -2;
    }
    const artistID = data.message.body.artist_list[0].artist.artist_id;
    return artistID;

    
}

async function getAlbums(apikey, artistID){
    //array to store album IDs
    let arrAlbums = [];
    const albumNames = new Set();
    //query to get albums using artist IDs
    const myQuery = `https://effulgent-sawine-ae4ee1.netlify.app/.netlify/functions/cors/https://api.musixmatch.com/ws/1.1/artist.albums.get?apikey=${apikey}&artist_id=${artistID}&page_size=10`;
    console.log(myQuery);
    const response = await fetch(myQuery);
    if(!response.ok){
        throw new Error(`Error! status: ${response.status}`);
     }
    // console.log(response)
    const data = await response.json();
    console.log(data);
    if(data.message.body.album_list.length == 0){
        alert("Artist has no albums on MusixMatch!");
    }
    data.message.body.album_list.forEach(element => {
        if(!albumNames.has(element.album.album_name)){
            albumNames.add(element.album.album_name);
            arrAlbums.push(element.album.album_id);
            console.log(element.album.album_name);
            console.log(element.album.album_id);
        }
    });
    return arrAlbums;
}

async function getTrack(apikey, artistAlbums){
    var randomNum = Math.floor(Math.random() * artistAlbums.length);
    var randAlbumID = artistAlbums[randomNum];
    console.log("Random album ID: " + randAlbumID);
    //query to get tracks from random album
    const myQuery = `https://effulgent-sawine-ae4ee1.netlify.app/.netlify/functions/cors/https://api.musixmatch.com/ws/1.1/album.tracks.get?apikey=${apikey}&album_id=${randAlbumID}`;
    const response = await fetch(myQuery);
    if(!response.ok){
        throw new Error(`Error! status: ${response.status}`);
    }
    // console.log(response)
    const data = await response.json();
    console.log(data);
    //get trackList array and pick a random track
    var trackList = data.message.body.track_list;
    var randomNumT = Math.floor(Math.random()*trackList.length);
    randTrack = trackList[randomNumT];
    var counter = trackList.length;
    console.log(randTrack);
    Loop1:
    while(randTrack.track.has_lyrics == 0){
        trackList.splice(randomNumT, 1);
        randomNumT = Math.floor(Math.random()*trackList.length);
        randTrack = trackList[randomNumT];
        counter--;
        console.log(randTrack);
        console.log(trackList);
        if(typeof randTrack == "undefined"){
            console.log("No song with lyrics in this album!");
            //return artistAlbums without current album?
            // randTrack == "null";
            break Loop1;
        }
    }
    console.log("broke through Loop1 only");
    console.log(randTrack);
    Loop2:
    while(typeof randTrack == "undefined"){
        //pick from one of the albums
        artistAlbums.splice(randomNum, 1);
        if(artistAlbums.length == 0){
            alert("No albums with lyrics!");
            console.log("No albums with lyrics!");
            break Loop2;
        }
        var randomNum = Math.floor(Math.random() * artistAlbums.length);
        var randAlbumID = artistAlbums[randomNum];
        console.log("Random album ID: " + randAlbumID);
        //query to get tracks from random album
        const myQuery = `https://effulgent-sawine-ae4ee1.netlify.app/.netlify/functions/cors/https://api.musixmatch.com/ws/1.1/album.tracks.get?apikey=${apikey}&album_id=${randAlbumID}`;
        const response = await fetch(myQuery);
        if(!response.ok){
            throw new Error(`Error! status: ${response.status}`);
        }
        // console.log(response)
        const data = await response.json();
        console.log(data);
        //get trackList array and pick a random track
        var trackList = data.message.body.track_list;
        var randomNumT = Math.floor(Math.random()*trackList.length);
        randTrack = trackList[randomNumT];
        var counter = trackList.length;
        console.log(randTrack);
        Loop3:
        while(randTrack.track.has_lyrics == 0){
            trackList.splice(randomNumT, 1);
            randomNumT = Math.floor(Math.random()*trackList.length);
            randTrack = trackList[randomNumT];
            counter--;
            console.log(randTrack);
            if(typeof randTrack == "undefined"){
                console.log("No song with lyrics in this album!");
                //return artistAlbums without current album?
                // randTrack == "null";
                break Loop3;
            }
        }
    }
    guessAnswer = randTrack.track.track_name;
    return randTrack;
}

async function getLyrics(apikey, artistTrack){
    let trackID = artistTrack.track.track_id;
    console.log(trackID);
    const myQuery = `https://effulgent-sawine-ae4ee1.netlify.app/.netlify/functions/cors/https://api.musixmatch.com/ws/1.1/track.lyrics.get?apikey=${apikey}&track_id=${trackID}`;
    const response = await fetch(myQuery);
    if(!response.ok){
        throw new Error(`Error! status: ${response.status}`);
     }
    // console.log(response)
    const data = await response.json();
    console.log(data);

    //lyrics from data
    const trackLyrics = data.message.body.lyrics.lyrics_body;

    return trackLyrics;
}


//TO DO: GET A DIFFERENT SONG IF HAVE NO LYRICS
function displayLyrics(trackLyrics){
    let shownLyrics = "";
    let tL1 = "";
    console.log(trackLyrics);
    if(trackLyrics.includes("...")){
        tL1 = trackLyrics.slice(0, trackLyrics.indexOf("..."));
    }
    else{
        tL1 = trackLyrics;
    }
    let lyricArray = tL1.split("\n");
    console.log(lyricArray);
    console.log(tL1);
    for( var i = 0; i < lyricArray.length; i++){ 
    
        if ( lyricArray[i] === "") { 
    
            lyricArray.splice(i, 1); 
        }
    
    }
    if(lyricArray.length < 3){
        for(let i = 0; i < lyricArray.length; i++ ){
            shownLyrics += lyricArray[i] + "\n"
        }
    }
    let segment = [Math.floor(Math.random() * (lyricArray.length - 3))] ;
    //for loop that checks first unempty string and adds it to the shownlyrics
    let count = 0;
    console.log("working");
    for(let i = segment; i < lyricArray.length; i++ ){
        shownLyrics += lyricArray[i] + "\n"
        count++; 
        if(count == 3){
            break;
        }
    }
    console.log(shownLyrics);
    lyricsBox.classList.remove("has-text-grey-light");
    lyricsBox.innerText = shownLyrics;
    //this function needs to cut down the lyrics to a randomized section
}

async function guessChecker(guess){

    const answersToCompare = [];
    var image;
    if(currentToken != ""){
        image = await getSongSpotify(currentToken, guessAnswer);
        console.log(image);
    }else{
        image = "placeholder-image.png";
    }
    

    if(typeof guessAnswer != "number"){
        //crème brulée (something)
        answersToCompare.push(guessAnswer.toLowerCase());
        //creme brulee (something)
        answersToCompare.push(answersToCompare[0].normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        //crème brulée
        answersToCompare.push(answersToCompare[0].replace(/ \(.+\)/, ""));
        //creme brulee
        answersToCompare.push(answersToCompare[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ \(.+\)/, ""));
        console.log(answersToCompare);
    }
    answerSection.classList.remove("hidden");
    if(guessAnswer == -2){
        console.log("error");
        correctness.innerText = "error"
        answerBox.innerHTML = "error";
    }
    else if(answersToCompare.includes(guess)){
        console.log("Correct!");
        correctness.innerText = "Correct!"
        answerBox.innerHTML = `
     <h1 class="subtitle">
    The song name was </br>
    <h1 class="title"><strong>${guessAnswer}</strong></h1></br>`+`
    <figure class="image is-128x128 is-inline-block">
        <img src="${image}">
    </figure> `+ `</br>
    on <strong>${randTrack.track.album_name}</strong> by <strong>${randTrack.track.artist_name}</strong>!
    </h1>`;
        score += 100;
        winstreak += 1;
        window.localStorage.setItem("Score", score);
        window.localStorage.setItem("Winstreak", winstreak); 
        scoreVal.innerHTML = `<h2 class="subtitle">Score: ${score}</h2>`;
        winstreakVal.innerHTML = `<h2 class="subtitle">Winstreak: ${winstreak}</h2>`;
    }else{
        winstreak = 0;
        window.localStorage.setItem("Winstreak", winstreak);
        winstreakVal.innerHTML = `<h2 class="subtitle">Winstreak: ${winstreak}</h2>`;
        console.log("Incorrect.");
        correctness.innerText = "Incorrect!"
        answerBox.innerHTML = `
    <h1 class="subtitle">
    The song name was </br>
    <h1 class="title"><strong>${guessAnswer}</strong></h1></br>`+`
    <figure class="image is-128x128 is-inline-block">
        <img src="${image}">
    </figure> `+ `</br>
    on <strong>${randTrack.track.album_name}</strong> by <strong>${randTrack.track.artist_name}</strong>!
    </h1>`;
    }
}

/* --- SPOTIFY FUNCTIONS --- */
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

async function getAuth(){
    var response_type =  "code";
    var scope = "user-top-read playlist-read-private user-library-read"
    var state = generateRandomString(16);
    var myQuery = `https://effulgent-sawine-ae4ee1.netlify.app/.netlify/functions/cors/https://accounts.spotify.com/authorize?client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}&response_type=${response_type}&show_dialog=true`;
    const response = await fetch(myQuery);
    if(!response.ok){
        throw new Error(`Error! status: ${response.status}`);
    }
    console.log(response);
    console.log(response.url);
    var url_split = response.url.split(".netlify/functions/cors/")[1];
    console.log(url_split);
    document.cookie = `storedState=${state}`;
    window.location.href = url_split;
}

async function getToken(code){
    const myQuery = `https://accounts.spotify.com/api/token`;
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri
    });
    const response = await fetch(myQuery, {
        method: 'POST',
        headers: {
            "Authorization": 'Basic ' + btoa(client_id + ':' + client_secret),
            "Content-Type": 'application/x-www-form-urlencoded'
        },
        body: params
    });
    console.log(response);
    const data = await response.json();
    console.log(data);
    currentToken = data.access_token;
    refreshToken = data.refresh_token;
    return data;
}

async function refreshTokenFunction(refToken){
    const myQuery = `https://accounts.spotify.com/api/token`;
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refToken
    });
    const response = await fetch(myQuery, {
        method: 'POST',
        headers: {
            "Authorization": 'Basic ' + btoa(client_id + ':' + client_secret),
            "Content-Type": 'application/x-www-form-urlencoded'
        },
        body: params
    });
    console.log(response);
    const data = await response.json();
    console.log(data);
    currentToken = data.access_token;
    return data;
}

async function getTopArtists(token){
    console.log("token in param: " + token);
    const myQuery = `https://api.spotify.com/v1/me/top/artists?time_range=long_term`;
    let result;
    await fetch(myQuery, {
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
    .then(async(response) => {
        if(response.status === 403){
            console.log(response);
            refreshTokenFunction(refreshToken);
        }
        return await response.json();
    })
    .then(function(data){ result=data; })
    return result;
}

function topSpotifyArtist(artistsData){
    var arrayArtists = [];
    artistsData.items.forEach(item => {
        arrayArtists.push(item.name);
    })
    console.log(arrayArtists);
    return arrayArtists;
}

async function randomSpotifyArtist(arrayArtists){
    var randomNum = Math.floor(Math.random()*arrayArtists.length);
    var artist = arrayArtists[randomNum];
    var artistID = await getArtistID(apikey, artist);
    console.log(artist);
    console.log(artistID);

    if(artistID == -1){
        trackLyrics = `You used to call me on my cell phone
        Late night when you need my love
        Call me on my cell phone`;
        console.log(trackLyrics);
        guessAnswer = "Hotline Bling";
        randTrack = {track: {
            track_name: guessAnswer,
            album_name: "Views",
        }};
        console.log(randTrack);
        displayLyrics(trackLyrics);
    }else if(artistID == -2){
        guessAnswer = -2;
        lyricsBox.innerText = "";
        console.log("error");
        correctness.innerText = "error"
        answerBox.innerHTML = "error";
    }else{
        //function to get artist albums using ID
        let artistAlbums = await getAlbums(apikey, artistID);
        console.log(artistAlbums);

        //function to get a track from album
        let artistTrack = await getTrack(apikey, artistAlbums);
        console.log(artistTrack);

        //function to get lyrics from track
        let trackLyrics = await getLyrics(apikey, artistTrack);
        displayLyrics(trackLyrics);
    }
    //function to put lyrics in box

    console.log(guessAnswer);
}

async function getSongSpotify(token, song){
    const album = randTrack.track.album_name;
    const myQuery = `https://api.spotify.com/v1/search?q=${song}%20album:${album}&type=track`;
    let result;
    await fetch(myQuery, {
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
    .then(async(response) => {
        if(response.status === 403){
            console.log(response);
            refreshTokenFunction(refreshToken);
        }
        return await response.json();
    })
    .then(function(data){ result=data; })
    console.log(result);
    if(result.tracks.items[0] !== undefined){
        var image = result.tracks.items[0].album.images[0].url;
    }else{
        var image = "placeholder-image.png"
    }
    return image;
}

function onLoad(){
    //check if coookie is empty?
    const queryString = window.location.search;
    console.log(getCookie("storedState"));
    //if on starter page with no params
    if(queryString == ""){
        //show login button on default start page
    }else{
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code');
        const state = urlParams.get('state');
        if(state === null || state !== getCookie("storedState") || code === null){
            //Something went wrong...
            window.location.href = "index.html";
        }else{
            console.log("Auth success!");
            //delete cookie after
            getToken(code);
        }
        console.log(code);
        console.log(state);

        //change spotify display to select song
        spotifyBlock.innerHTML = `
        <h1 class="subtitle">Random lyrics from your top Spotify Artists!</h1>
        <div class="columns is-centered">
            <div class="column">
                <button id="playButton" class="button is-success is-rounded">Play</button>
            </div>
        </div>
        `;
        const playButton = document.querySelector("#playButton");

        playButton.addEventListener("click", async () => {
            const artistsData = await getTopArtists(currentToken);
            console.log(artistsData);
            console.log("Got tracks!");
            const arrayArtists = topSpotifyArtist(artistsData);
            randomSpotifyArtist(arrayArtists);
        });
    }
}
/* --- END SPOTIFY FUNCTIONS ---*/

artistInput.addEventListener("keypress", async (e) => {
    if(e.key!="Enter"){
        return;
    }
    correctness.innerHTML = "";
    let artist = artistInput.value;
    //replace all spaces with underscores
    artist = artist.replace(/ /gi, "_");
    console.log(artist);

    //function to get artist ID using name input
    const artistID = await getArtistID(apikey, artist);
    console.log(artistID);

    if(artistID == -1){
        trackLyrics = `You used to call me on my cell phone
        Late night when you need my love
        Call me on my cell phone`;
        console.log(trackLyrics);
        guessAnswer = "Hotline Bling";
        randTrack = {track: {
            track_name: guessAnswer,
            album_name: "Views",
        }};
        console.log(randTrack);
        displayLyrics(trackLyrics);
    }else if(artistID == -2){
        guessAnswer = -2;
        lyricsBox.innerText = "";
        console.log("error");
        correctness.innerText = "error"
        answerBox.innerHTML = "error";
    }else{
        //function to get artist albums using ID
        let artistAlbums = await getAlbums(apikey, artistID);
        console.log(artistAlbums);

        //function to get a track from album
        let artistTrack = await getTrack(apikey, artistAlbums);
        console.log(artistTrack);

        //function to get lyrics from track
        let trackLyrics = await getLyrics(apikey, artistTrack);
        displayLyrics(trackLyrics);
    }
    //function to put lyrics in box

    console.log(guessAnswer);
});

loginButton.addEventListener("click", async () => {
    getAuth();
});

guessInput.addEventListener("change", async ()=> {
    let guess = guessInput.value.toLowerCase();
    console.log(guess);
    guessChecker(guess);
    guessInput.value = "";
});

onLoad();
