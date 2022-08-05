//score and winstreak variables
let score;
let winstreak;
//musixmatch api key
const apikey = "251585f21f0dcde77139880f7198a2ea";

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

const scoreVal = document.querySelector("#scoreVal");

const winstreakVal = document.querySelector("#winstreakVal");

let guessAnswer = "";

let randTrack;

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
    const myQuery = `https://api.musixmatch.com/ws/1.1/artist.search?apikey=${apikey}&q_artist=${artist}
    `;
    const response = await fetch(myQuery, {
        mode: 'cors',
        header: {'Access-Control-Allow-Origin': "http://127.0.0.1:5500",
        'Access-Control-Allow-Headers' : "Origin, X-Requested With, Content-Type, Accept"},
    });
    answerBox.innerHTML = "";
    //to start using hard-coded data (note for jean, what does this do?)
    if(!response.ok){
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
    const myQuery = `https://api.musixmatch.com/ws/1.1/artist.albums.get?apikey=${apikey}&artist_id=${artistID}&page_size=10`;
    console.log(myQuery);
    const response = await fetch(myQuery);
    if(!response.ok){
        throw new Error(`Error! status: ${response.status}`);
     }
    // console.log(response)
    const data = await response.json();
    console.log(data);
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
    //pick from one of the albums
    const randomNum = Math.floor(Math.random() * artistAlbums.length);
    const randAlbumID = artistAlbums[randomNum];
    console.log("Random album ID: " + randAlbumID);
    //query to get tracks from random album
    const myQuery = `https://api.musixmatch.com/ws/1.1/album.tracks.get?apikey=${apikey}&album_id=${randAlbumID}`;
    const response = await fetch(myQuery);
    if(!response.ok){
        throw new Error(`Error! status: ${response.status}`);
     }
    // console.log(response)
    const data = await response.json();
    console.log(data);
    //get trackList array and pick a random track
    const trackList = data.message.body.track_list;
    randTrack = trackList[Math.floor(Math.random()*trackList.length)];
    guessAnswer = randTrack.track.track_name;
    return randTrack;
}

async function getLyrics(apikey, artistTrack){
    let trackID = artistTrack.track.track_id;
    console.log(trackID);
    const myQuery = `https://api.musixmatch.com/ws/1.1/track.lyrics.get?apikey=${apikey}&track_id=${trackID}`;
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

function guessChecker(guess){

    //ask juan for help on how to make the guessChecker better
    const answersToCompare = [];

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
    <figure class="image is-96x96 is-inline-block">
        <img src="placeholder-image.png">
    </figure> `+ `</br>
    on <strong>${randTrack.track.album_name}</strong>!
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
    <figure class="image is-96x96 is-inline-block">
        <img src="placeholder-image.png">
    </figure> `+ `</br>
    on <strong>${randTrack.track.album_name}</strong>!
    </h1>`;
    }
}

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

guessInput.addEventListener("change", async ()=> {
    let guess = guessInput.value.toLowerCase();
    console.log(guess);
    guessChecker(guess);
    guessInput.value = "";
})


