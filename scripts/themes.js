// Theme management
document.addEventListener('DOMContentLoaded', function() {
  const themeSelect = document.getElementById('themeSelect');
  const paletteBtn = document.getElementById('paletteBtn');
  const paletteModal = document.getElementById('paletteModal');
  
  // Φόρτωση αποθηκευμένου theme
  const savedTheme = localStorage.getItem('selectedTheme') || 'dark';
  applyTheme(savedTheme);
  themeSelect.value = savedTheme;

  // Event listener για αλλαγή theme
  themeSelect.addEventListener('change', function() {
    const selectedTheme = this.value;
    applyTheme(selectedTheme);
    localStorage.setItem('selectedTheme', selectedTheme);
  });

  // Event listener για palette button
  paletteBtn.addEventListener('click', function() {
    openPaletteModal();
  });

  // Event listeners για palette modal
  document.getElementById('closePalette').addEventListener('click', closePaletteModal);
  document.getElementById('defaultPalette').addEventListener('click', resetToDefaultPalette);

  // Εφαρμογή theme
  function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    
    // Ενημέρωση color pickers αν είναι ανοιχτό το palette modal
    updateColorPickers();
  }

  // Άνοιγμα palette modal
  function openPaletteModal() {
    updateColorPickers();
    paletteModal.style.display = 'flex';
    
    // Event listeners για color pickers
    setupColorPickerListeners();
  }

  // Κλείσιμο palette modal
  function closePaletteModal() {
    paletteModal.style.display = 'none';
  }

  // Ενημέρωση color pickers με τρέχοντα χρώματα
  function updateColorPickers() {
    const computedStyle = getComputedStyle(document.documentElement);
    
    const colorMap = {
      'bg1': '--bg1',
      'bg2': '--bg2', 
      'card': '--card',
      'accent': '--accent',
      'text': '--text',
      'border': '--border'
    };

    Object.entries(colorMap).forEach(([id, variable]) => {
      const input = document.getElementById(id);
      const preview = document.getElementById(`preview-${id}`);
      const color = computedStyle.getPropertyValue(variable).trim();
      
      if (input) input.value = rgbToHex(color);
      if (preview) preview.style.backgroundColor = color;
    });
  }

  // Ρύθμιση listeners για color pickers
  function setupColorPickerListeners() {
    const colorMap = {
      'bg1': '--bg1',
      'bg2': '--bg2',
      'card': '--card', 
      'accent': '--accent',
      'text': '--text',
      'border': '--border'
    };

    Object.entries(colorMap).forEach(([id, variable]) => {
      const input = document.getElementById(id);
      const preview = document.getElementById(`preview-${id}`);
      
      if (input && preview) {
        input.addEventListener('input', function() {
          const color = this.value;
          document.documentElement.style.setProperty(variable, color);
          preview.style.backgroundColor = color;
          
          // Αποθήκευση custom theme
          saveCustomTheme();
        });
      }
    });
  }

  // Επαναφορά default palette
  function resetToDefaultPalette() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.style = ''; // Remove custom styles
    applyTheme(currentTheme); // Re-apply theme
    updateColorPickers();
  }

  // Αποθήκευση custom theme
  function saveCustomTheme() {
    const computedStyle = getComputedStyle(document.documentElement);
    const customTheme = {};
    
    ['--bg1', '--bg2', '--card', '--accent', '--text', '--border'].forEach(variable => {
      customTheme[variable] = computedStyle.getPropertyValue(variable).trim();
    });
    
    localStorage.setItem('customTheme', JSON.stringify(customTheme));
  }

  // Φόρτωση custom theme
  function loadCustomTheme() {
    const savedTheme = localStorage.getItem('customTheme');
    if (savedTheme) {
      const customTheme = JSON.parse(savedTheme);
      Object.entries(customTheme).forEach(([variable, color]) => {
        document.documentElement.style.setProperty(variable, color);
      });
    }
  }

  // Βοηθητική συνάρτηση για μετατροπή RGB σε HEX
  function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    
    const result = rgb.match(/\d+/g);
    if (result) {
      const [r, g, b] = result.map(x => parseInt(x));
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    return '#000000';
  }

  // Φόρτωση custom theme κατά την εκκίνηση
  loadCustomTheme();
});