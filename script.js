//musixmatch api key
let apikey = "251585f21f0dcde77139880f7198a2ea";

//first input for an artist
const artistInput = document.querySelector("#artistInput");

async function getArtistID(apikey, artist){
    //query for artist search
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
    const myQuery = `https://cors-anywhere.herokuapp.com/https://api.musixmatch.com/ws/1.1/artist.albums.get?apikey=${apikey}&artist_id=${artistID}&page_size=3`;
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
});