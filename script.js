//musixmatch api key
let apikey = "84f4ec2655a2263d350ed92946c2cdeb";

//first input for an artist
const artistInput = document.querySelector("#artistInput");

//selector for lyrics box
const lyricsBox = document.querySelector("#lyricsBox");

async function getArtistID(apikey, artist){
    //query for artist search (temporary solution using proxy)
    const myQuery = `https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/artist.search?apikey=${apikey}&q_artist=${artist}
    `;
    const response = await fetch(myQuery, {
        mode: 'cors',
        header: {'Access-Control-Allow-Origin': "http://127.0.0.1:5500",
        'Access-Control-Allow-Headers' : "Origin, X-Requested With, Content-Type, Accept"},
    });

    if(!response.ok){
       throw new Error(`Error! status: ${response.status}`);
    }

    console.log(response);
    const data = await response.json();
    console.log(data);
    const artistID = data.message.body.artist_list[0].artist.artist_id;
    return artistID;
}

async function getAlbums(apikey, artistID){
    //array to store album IDs
    let arrAlbums = [];
    //query to get albums using artist IDs
    const myQuery = `https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/artist.albums.get?apikey=${apikey}&artist_id=${artistID}&page_size=4`;
    console.log(myQuery);
    const response = await fetch(myQuery);
    if(!response.ok){
        throw new Error(`Error! status: ${response.status}`);
     }
    console.log(response)
    const data = await response.json();
    console.log(data);
    data.message.body.album_list.forEach(element => {
        console.log(element.album.album_name);
        console.log(element.album.album_id);
        arrAlbums.push(element.album.album_id);
    });
    return arrAlbums;
}

async function getTrack(apikey, artistAlbums){
    //pick from one of the albums
    const randomNum = Math.floor(Math.random() * artistAlbums.length);
    const randAlbumID = artistAlbums[randomNum];
    console.log("Random album ID: " + randAlbumID);
    //query to get tracks from random album
    const myQuery = `https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/album.tracks.get?apikey=${apikey}&album_id=${randAlbumID}`;
    const response = await fetch(myQuery);
    if(!response.ok){
        throw new Error(`Error! status: ${response.status}`);
     }
    console.log(response)
    const data = await response.json();
    console.log(data);
    //get trackList array and pick a random track
    const trackList = data.message.body.track_list;
    const randTrack = trackList[Math.floor(Math.random()*trackList.length)];
    return randTrack;
}

async function getLyrics(apikey, artistTrack){
    let trackID = artistTrack.track.track_id;
    console.log(trackID);
    const myQuery = `https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.lyrics.get?apikey=${apikey}&track_id=${trackID}`;
    const response = await fetch(myQuery);
    if(!response.ok){
        throw new Error(`Error! status: ${response.status}`);
     }
    console.log(response)
    const data = await response.json();
    console.log(data);

    //lyrics from data
    const trackLyrics = data.message.body.lyrics.lyrics_body;

    return trackLyrics;
}



function displayLyrics(trackLyrics){
    // trackLyrics = "Ayy, can you come to Henry's after you done? (Yeah) \nA'ight, for sure, I got a jam \nYeah, yeah \nDon't step on your toes (bitch) \nAh, ah-ah yeah (Cole, you stupid) \nAh-ah, ah, ah yeah \nAh, ah, ah, yeah (yeah) \nUh-uh, uh-uh, uh-uh (yeah) \nUh-uh, uh-uh, uh-uh, uh-uh-uh, yeah (yeah, yeah, motherfucker)"
    let shownLyrics = "";
    let tL1 = trackLyrics.slice(0, trackLyrics.indexOf("..."));
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
        shownLyrics = lyricArray[segment - 2] + lyricArray[segment - 1] + lyricArray[segment];
        console.log("work");
    }
    console.log(shownLyrics);
    lyricsBox.innerText = shownLyrics;
    //this function needs to cut down the lyrics to a randomized section
}


artistInput.addEventListener("change", async () => {
    let artist = artistInput.value;
    //replace all spaces with underscores
    artist = artist.replace(/ /gi, "_");
    console.log(artist);

    //function to get artist ID using name input
    const artistID = await getArtistID(apikey, artist);
    console.log(artistID);

    //function to get artist albums using ID
    let artistAlbums = await getAlbums(apikey, artistID);
    console.log(artistAlbums);

    //function to get a track from album
    let artistTrack = await getTrack(apikey, artistAlbums);
    console.log(artistTrack);

    //function to get lyrics from track
    let trackLyrics = await getLyrics(apikey, artistTrack);
    console.log(trackLyrics);

    //function to put lyrics in box
    displayLyrics(trackLyrics);
});