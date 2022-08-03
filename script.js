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

let guessAnswer = "";

let randTrack;

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
    //to start using hard-coded data
    if(!response.ok){
        return -1;
    }

    // console.log(response);
    const data = await response.json();
    console.log(data);
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
    //pick from one of the combined tracklist
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



function displayLyrics(trackLyrics){
    // trackLyrics = "Ayy, can you come to Henry's after you done? (Yeah) \nA'ight, for sure, I got a jam \nYeah, yeah \nDon't step on your toes (bitch) \nAh, ah-ah yeah (Cole, you stupid) \nAh-ah, ah, ah yeah \nAh, ah, ah, yeah (yeah) \nUh-uh, uh-uh, uh-uh (yeah) \nUh-uh, uh-uh, uh-uh, uh-uh-uh, yeah (yeah, yeah, motherfucker)"
    let shownLyrics = "";
    let tL1 = "";
    if(trackLyrics.includes("...")){
        tL1 = trackLyrics.slice(0, trackLyrics.indexOf("..."));
    }
    else{
        tL1 = trackLyrics;
    }
    let lyricArray = tL1.split("\n");
    console.log(lyricArray);
    console.log(tL1);
    let segment = Math.floor(Math.random() * lyricArray.length);
    console.log(segment);
    if(segment < 2){
        shownLyrics = lyricArray[0] + "\n" + lyricArray[1] + "\n" + lyricArray[2];
        console.log("wokr");
    }
    else if (segment >= 2){
        shownLyrics = lyricArray[segment - 2] + "\n" + lyricArray[segment - 1] + "\n" + lyricArray[segment];
        console.log("work");
    }
    console.log(shownLyrics);
    lyricsBox.classList.remove("has-text-grey-light");
    lyricsBox.innerText = shownLyrics;
    //this function needs to cut down the lyrics to a randomized section
}

function guessChecker(guess){
    //ask juan for help on how to make the guessChecker better
    const answersToCompare = [];
    //crème brulée (something)
    answersToCompare.push(guessAnswer.toLowerCase());
    //creme brulee (something)
    answersToCompare.push(answersToCompare[0].normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    //crème brulée
    answersToCompare.push(answersToCompare[0].replace(/ \(.+\)/, ""));
    //creme brulee
    answersToCompare.push(answersToCompare[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ \(.+\)/, ""));
    console.log(answersToCompare);
    answerSection.classList.remove("hidden");
    if(answersToCompare.includes(guess)){
        console.log("Correct!");
        correctness.innerText = "Correct!"
    }else{
        console.log("Incorrect.");
        correctness.innerText = "Incorrect!"
    }
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

artistInput.addEventListener("change", async () => {
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
    artistInput.value = "";
});

guessInput.addEventListener("change", async ()=> {
    let guess = guessInput.value.toLowerCase();
    console.log(guess);
    guessChecker(guess);
    guessInput.value = "";
})
