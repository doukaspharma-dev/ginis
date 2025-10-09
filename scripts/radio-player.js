// Radio player functionality
document.addEventListener('DOMContentLoaded', function() {
  const radioBtn = document.getElementById('zuccaradioBtn');
  const radioPlayer = createRadioPlayer();
  let audio = null;
  let isPlaying = false;

  // Event listener για radio button
  radioBtn.addEventListener('click', function() {
    toggleRadioPlayer();
  });

  // Δημιουργία radio player
  function createRadioPlayer() {
    const player = document.createElement('div');
    player.className = 'radio-player';
    player.innerHTML = `
      <button class="close-radio">&times;</button>
      <h3>Zuccaradio</h3>
      <div class="radio-controls">
        <button id="playRadio">▶</button>
        <button id="stopRadio">⏹</button>
        <button id="volumeUp">🔊</button>
        <button id="volumeDown">🔉</button>
      </div>
      <div class="radio-info">
        Ακούστε Zuccaradio - Η αγαπημένη σας μουσική!
      </div>
    `;
    
    document.body.appendChild(player);
    
    // Event listeners για controls
    player.querySelector('#playRadio').addEventListener('click', playRadio);
    player.querySelector('#stopRadio').addEventListener('click', stopRadio);
    player.querySelector('#volumeUp').addEventListener('click', volumeUp);
    player.querySelector('#volumeDown').addEventListener('click', volumeDown);
    player.querySelector('.close-radio').addEventListener('click', closeRadioPlayer);
    
    return player;
  }

  // Εναλλαγή κατάστασης radio player
  function toggleRadioPlayer() {
    if (radioPlayer.style.display === 'block') {
      closeRadioPlayer();
    } else {
      openRadioPlayer();
    }
  }

  // Άνοιγμα radio player
  function openRadioPlayer() {
    radioPlayer.style.display = 'block';
  }

  // Κλείσιμο radio player
  function closeRadioPlayer() {
    radioPlayer.style.display = 'none';
    stopRadio();
  }

  // Αναπαραγωγή ραδιοφώνου
  function playRadio() {
    if (!audio) {
      audio = new Audio('https://stream.zuccaradio.com/stream'); // Example stream URL
      audio.volume = 0.7;
      
      audio.addEventListener('loadstart', function() {
        updateRadioInfo('Φόρτωση ραδιοφώνου...');
      });
      
      audio.addEventListener('canplay', function() {
        updateRadioInfo('Αναπαραγωγή Zuccaradio...');
      });
      
      audio.addEventListener('error', function() {
        updateRadioInfo('Σφάλμα φόρτωσης ραδιοφώνου');
      });
    }
    
    audio.play().then(() => {
      isPlaying = true;
      updatePlayButton();
      updateRadioInfo('Αναπαραγωγή Zuccaradio...');
    }).catch(error => {
      console.error('Radio play error:', error);
      updateRadioInfo('Σφάλμα: Δεν μπορεί να ακουστεί το ραδιόφωνο');
    });
  }

  // Διακοπή ραδιοφώνου
  function stopRadio() {
    if (audio && isPlaying) {
      audio.pause();
      isPlaying = false;
      updatePlayButton();
      updateRadioInfo('Ραδιόφωνο σταματημένο');
    }
  }

  // Αύξηση έντασης
  function volumeUp() {
    if (audio) {
      audio.volume = Math.min(1, audio.volume + 0.1);
      updateRadioInfo(`Ένταση: ${Math.round(audio.volume * 100)}%`);
    }
  }

  // Μείωση έντασης
  function volumeDown() {
    if (audio) {
      audio.volume = Math.max(0, audio.volume - 0.1);
      updateRadioInfo(`Ένταση: ${Math.round(audio.volume * 100)}%`);
    }
  }

  // Ενημέρωση κουμπιού play/pause
  function updatePlayButton() {
    const playBtn = document.getElementById('playRadio');
    if (playBtn) {
      playBtn.textContent = isPlaying ? '⏸' : '▶';
    }
  }

  // Ενημέρωση πληροφοριών ραδιοφώνου
  function updateRadioInfo(message) {
    const infoElement = radioPlayer.querySelector('.radio-info');
    if (infoElement) {
      infoElement.textContent = message;
    }
  }

  // Κλείσιμο radio player με ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && radioPlayer.style.display === 'block') {
      closeRadioPlayer();
    }
  });
});