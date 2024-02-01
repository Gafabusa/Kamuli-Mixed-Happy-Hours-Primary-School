const playlist = [
  { name: 'Abazade', source: '../SONGS/songs/Abazade.mp3' },
  { name: 'Congratulations', source: '../SONGS/songs/Congratulations.mp3' },
  { name: 'Gyetuvude', source: '../SONGS/songs/Gyetuvude.mp3' },
  { name: 'Jesus Hold My Hand', source: '../SONGS/songs/Jesus Hold My Hand.mp3' },
  { name: 'Noah', source: '../SONGS/songs/Noah.mp3' },
  { name: 'School Anthem', source: '../SONGS/songs/School Anthem.mp3' },
  { name: 'Tewali Akwenkana', source: '../SONGS/songs/Tewali Akwenkana.mp3' },
  { name: 'Tulina Katonda', source: '../SONGS/songs/Tulina Katonda.mp3' },
  // Add more songs as needed...
];

const audio = document.getElementById('audio');
const playlistElement = document.getElementById('playlist');

// Function to create playlist items
function createPlaylistItem(song) {
  const listItem = document.createElement('li');
  const playButton = document.createElement('button');
  playButton.textContent = `Play ${song.name}`;

  playButton.addEventListener('click', () => {
    playSong(song);
  });

  const downloadButton = document.createElement('button');
  downloadButton.textContent = 'Download';
  downloadButton.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = song.source;
    const songTitle = song.name.replace(/\s/g, "_");
    a.download = `${songTitle}.mp3`;
    a.click();
  });

  listItem.appendChild(playButton);
  listItem.appendChild(downloadButton);
  playlistElement.appendChild(listItem);
}

// Play song by song object
function playSong(song) {
  audio.src = song.source;
  audio.play();
}

// Populate playlist
playlist.forEach((song) => {
  createPlaylistItem(song);
});

// Audio volume
simp_volume.addEventListener('click', function(e) {
  var eles = e.target.classList;
  if (eles.contains('simp-mute')) {
    if (eles.contains('fa-volume-up')) {
      eles.remove('fa-volume-up');
      eles.add('fa-volume-off');
      simp_v_slider.value = 0;
    } else {
      eles.remove('fa-volume-off');
      eles.add('fa-volume-up');
      simp_v_slider.value = simp_v_num;
    }
  } else {
    simp_v_num = simp_v_slider.value;
    if (simp_v_num != 0) {
      simp_controls.querySelector('.simp-mute').classList.remove('fa-volume-off');
      simp_controls.querySelector('.simp-mute').classList.add('fa-volume-up');
    }
  }
  simp_audio.volume = parseFloat(simp_v_slider.value / 100);
});
