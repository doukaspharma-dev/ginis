// Αρχικοποίηση εφαρμογής
document.addEventListener('DOMContentLoaded', function() {
  // Αρχικοποίηση μεταβλητών
  let links = JSON.parse(localStorage.getItem('links')) || [];
  let categories = JSON.parse(localStorage.getItem('categories')) || [];
  let history = JSON.parse(localStorage.getItem('history')) || [];
  const MAX_HISTORY = 10;

  // Αρχικοποίηση components
  initApp();
  initEventListeners();
  renderCategories();
  updateDateTime();

  // Ενημέρωση ημερομηνίας/ώρας κάθε δευτερόλεπτο
  setInterval(updateDateTime, 1000);

  // Αρχικοποίηση εφαρμογής
  function initApp() {
    // Προσθήκη default κατηγοριών αν δεν υπάρχουν
    if (categories.length === 0) {
      categories = ['Κυβέρνηση', 'Εργαλεία', 'Social', 'Άλλο'];
      localStorage.setItem('categories', JSON.stringify(categories));
    }

    // Προσθήκη default links αν δεν υπάρχουν
    if (links.length === 0) {
      links = [
        {
          url: 'https://gov.gr',
          name: 'Gov.gr',
          desc: 'Κυβέρνηση',
          category: 'Κυβέρνηση',
          icon: 'auto',
          favicon: ''
        },
        {
          url: 'https://webmail.otenet.gr',
          name: 'Webmail',
          desc: 'Email',
          category: 'Εργαλεία', 
          icon: 'auto',
          favicon: ''
        }
      ];
      localStorage.setItem('links', JSON.stringify(links));
    }

    // Προσθήκη welcome sound αν δεν υπάρχει
    playWelcomeSound();
  }

  // Event listeners
  function initEventListeners() {
    // Κουμπιά προσθήκης link
    document.getElementById('addBtnTop').addEventListener('click', () => openModal());
    document.getElementById('addBtnFoot').addEventListener('click', () => openModal());

    // Κουμπί αναίρεσης
    document.getElementById('undoBtnTop').addEventListener('click', undoDelete);

    // Κουμπί βοήθειας
    document.getElementById('helpBtn').addEventListener('click', openHelp);
    document.getElementById('closeHelp').addEventListener('click', closeHelp);
    document.getElementById('helpOverlay').addEventListener('click', closeHelp);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Volume control
    const volumeControl = document.querySelector('.volume-control');
    if (volumeControl) {
      volumeControl.addEventListener('input', (e) => {
        const volume = e.target.value;
        document.getElementById('welcomeSound').volume = volume;
      });
    }
  }

  // Ανανέωση ημερομηνίας/ώρας
  function updateDateTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');

    if (timeElement) {
      timeElement.textContent = now.toLocaleTimeString('el-GR');
    }

    if (dateElement) {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      dateElement.textContent = now.toLocaleDateString('el-GR', options);
    }
  }

  // Αναπαραγωγή welcome sound
  function playWelcomeSound() {
    const welcomeSound = document.getElementById('welcomeSound');
    if (welcomeSound) {
      welcomeSound.volume = 0.7;
      welcomeSound.play().catch(e => console.log('Audio play failed:', e));
    }
  }

  // Άνοιγμα modal για νέο link
  function openModal(link = null) {
    const modal = document.getElementById('modalForm');
    const form = document.getElementById('linkForm');
    const modalTitle = document.getElementById('modalTitle');

    if (link) {
      modalTitle.textContent = 'Επεξεργασία link';
      // Σύμπληση φόρμας με υπάρχοντα δεδομένα
      document.getElementById('url').value = link.url;
      document.getElementById('name').value = link.name;
      document.getElementById('desc').value = link.desc;
      // ... συμπλήρωση υπόλοιπων πεδίων
    } else {
      modalTitle.textContent = 'Νέο link';
      form.reset();
    }

    modal.style.display = 'flex';
    populateCategorySelect();

    // Event listener για αποθήκευση
    form.onsubmit = (e) => {
      e.preventDefault();
      saveLink(link);
    };
  }

  // Αποθήκευση link
  function saveLink(existingLink = null) {
    const formData = new FormData(document.getElementById('linkForm'));
    
    const linkData = {
      url: formData.get('url') || document.getElementById('url').value,
      name: formData.get('name') || document.getElementById('name').value,
      desc: formData.get('desc') || document.getElementById('desc').value,
      category: document.getElementById('categorySelect').value,
      icon: document.getElementById('iconMode').value,
      // ... υπόλοιπα δεδομένα
    };

    if (existingLink) {
      // Ενημέρωση υπάρχοντος link
      const index = links.findIndex(l => l.url === existingLink.url);
      if (index !== -1) {
        links[index] = { ...links[index], ...linkData };
      }
    } else {
      // Προσθήκη νέου link
      links.push(linkData);
    }

    localStorage.setItem('links', JSON.stringify(links));
    renderCategories();
    closeModal();
  }

  // Κλείσιμο modal
  function closeModal() {
    document.getElementById('modalForm').style.display = 'none';
  }

  // Πλήρωση dropdown κατηγοριών
  function populateCategorySelect() {
    const select = document.getElementById('categorySelect');
    select.innerHTML = '';
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    });
  }

  // Αναίρεση διαγραφής
  function undoDelete() {
    if (history.length > 0) {
      const lastAction = history.pop();
      if (lastAction.type === 'delete') {
        links.push(lastAction.data);
        localStorage.setItem('links', JSON.stringify(links));
        localStorage.setItem('history', JSON.stringify(history));
        renderCategories();
        updateUndoButton();
      }
    }
  }

  // Ενημέρωση κατάστασης κουμπιού undo
  function updateUndoButton() {
    const undoBtn = document.getElementById('undoBtnTop');
    undoBtn.disabled = history.length === 0;
  }

  // Απόδοση κατηγοριών και links
  function renderCategories() {
    const container = document.getElementById('categories');
    container.innerHTML = '';

    categories.forEach(category => {
      const categoryLinks = links.filter(link => link.category === category);
      
      if (categoryLinks.length > 0) {
        const categoryElement = createCategoryElement(category, categoryLinks);
        container.appendChild(categoryElement);
      }
    });

    // Εφαρμογή animations για cards
    animateCards();
  }

  // Δημιουργία στοιχείου κατηγορίας
  function createCategoryElement(categoryName, categoryLinks) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'category-title';
    
    titleDiv.innerHTML = `
      <h2>${categoryName}</h2>
      <div class="cat-actions">
        <span class="toggle-btn" title="Απόκρυψη/Εμφάνιση">−</span>
        <span class="cat-btn edit" title="Επεξεργασία">✎</span>
        <span class="cat-btn del" title="Διαγραφή">×</span>
      </div>
    `;

    const gridDiv = document.createElement('div');
    gridDiv.className = 'grid';
    
    categoryLinks.forEach(link => {
      const card = createLinkCard(link);
      gridDiv.appendChild(card);
    });

    categoryDiv.appendChild(titleDiv);
    categoryDiv.appendChild(gridDiv);

    // Event listeners για κατηγορία
    addCategoryEventListeners(categoryDiv, categoryName);

    return categoryDiv;
  }

  // Δημιουργία κάρτας link
  function createLinkCard(link) {
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    
    card.innerHTML = `
      <a href="${link.url}" target="_blank" title="${link.desc || link.url}">
        ${getLinkIcon(link)}
        <div class="link-title">${link.name}</div>
        ${link.desc ? `<div class="link-desc">${link.desc}</div>` : ''}
      </a>
      <div class="menu-popup">
        <button class="fav" title="Αγαπημένο">♥</button>
        <button class="edit" title="Επεξεργασία">✎</button>
        <button class="del" title="Διαγραφή">×</button>
      </div>
      <button class="menu-btn">⋮</button>
    `;

    // Event listeners για κάρτα
    addCardEventListeners(card, link);

    return card;
  }

  // Λήψη εικονιδίου για link
  function getLinkIcon(link) {
    if (link.icon === 'builtin') {
      return `<div class="builtin-icon">${getBuiltinIcon(link.builtinIcon)}</div>`;
    } else if (link.icon === 'upload' && link.uploadedIcon) {
      return `<img src="${link.uploadedIcon}" class="favicon" alt="${link.name}">`;
    } else {
      // Favicon από URL
      return `<img src="https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32" 
                     class="favicon" alt="${link.name}">`;
    }
  }

  // Event listeners για κατηγορία
  function addCategoryEventListeners(categoryDiv, categoryName) {
    const toggleBtn = categoryDiv.querySelector('.toggle-btn');
    const editBtn = categoryDiv.querySelector('.cat-btn.edit');
    const deleteBtn = categoryDiv.querySelector('.cat-btn.del');
    const grid = categoryDiv.querySelector('.grid');

    toggleBtn.addEventListener('click', () => {
      grid.classList.toggle('collapsed');
      toggleBtn.textContent = grid.classList.contains('collapsed') ? '+' : '−';
    });

    editBtn.addEventListener('click', () => {
      editCategory(categoryName);
    });

    deleteBtn.addEventListener('click', () => {
      deleteCategory(categoryName);
    });
  }

  // Event listeners για κάρτα
  function addCardEventListeners(card, link) {
    const menuBtn = card.querySelector('.menu-btn');
    const menuPopup = card.querySelector('.menu-popup');
    const favBtn = menuPopup.querySelector('.fav');
    const editBtn = menuPopup.querySelector('.edit');
    const deleteBtn = menuPopup.querySelector('.del');

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuPopup.style.display = menuPopup.style.display === 'flex' ? 'none' : 'flex';
    });

    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(link);
    });

    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(link);
    });

    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteLink(link);
    });

    // Κλείσιμο menu όταν κλικάρεται αλλού
    document.addEventListener('click', () => {
      menuPopup.style.display = 'none';
    });
  }

  // Διαγραφή link
  function deleteLink(link) {
    // Προσθήκη στο history για undo
    history.push({
      type: 'delete',
      data: link,
      timestamp: Date.now()
    });
    
    // Διατήρηση μόνο των τελευταίων MAX_HISTORY actions
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    // Διαγραφή από links
    links = links.filter(l => l.url !== link.url);
    
    // Αποθήκευση
    localStorage.setItem('links', JSON.stringify(links));
    localStorage.setItem('history', JSON.stringify(history));
    
    // Re-render
    renderCategories();
    updateUndoButton();
  }

  // Επεξεργασία κατηγορίας
  function editCategory(categoryName) {
    const newName = prompt('Νέο όνομα κατηγορίας:', categoryName);
    if (newName && newName !== categoryName) {
      // Ενημέρωση κατηγορίας σε όλα τα links
      links.forEach(link => {
        if (link.category === categoryName) {
          link.category = newName;
        }
      });
      
      // Ενημέρωση λίστας κατηγοριών
      const index = categories.indexOf(categoryName);
      if (index !== -1) {
        categories[index] = newName;
      }
      
      localStorage.setItem('links', JSON.stringify(links));
      localStorage.setItem('categories', JSON.stringify(categories));
      renderCategories();
    }
  }

  // Διαγραφή κατηγορίας
  function deleteCategory(categoryName) {
    if (confirm(`Θέλετε να διαγράψετε την κατηγορία "${categoryName}" και όλα τα links της;`)) {
      // Διαγραφή links της κατηγορίας
      links = links.filter(link => link.category !== categoryName);
      
      // Διαγραφή από κατηγορίες
      categories = categories.filter(cat => cat !== categoryName);
      
      localStorage.setItem('links', JSON.stringify(links));
      localStorage.setItem('categories', JSON.stringify(categories));
      renderCategories();
    }
  }

  // Αγαπημένο link
  function toggleFavorite(link) {
    link.pinned = !link.pinned;
    localStorage.setItem('links', JSON.stringify(links));
    renderCategories();
  }

  // Keyboard shortcuts
  function handleKeyboardShortcuts(e) {
    // ESC - κλείσιμο help
    if (e.key === 'Escape') {
      closeHelp();
    }
    
    // Ctrl+N - νέο link (μόνο αν δεν είναι ανοιχτό modal)
    if (e.ctrlKey && e.key === 'n' && !document.getElementById('modalForm').style.display) {
      e.preventDefault();
      openModal();
    }
  }

  // Άνοιγμα help
  function openHelp() {
    document.getElementById('helpOverlay').style.display = 'block';
    document.getElementById('helpMenu').style.display = 'block';
  }

  // Κλείσιμο help
  function closeHelp() {
    document.getElementById('helpOverlay').style.display = 'none';
    document.getElementById('helpMenu').style.display = 'none';
  }

  // Animation για cards
  function animateCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  }

  // Event listener για κλείσιμο modal
  document.getElementById('cancelModal').addEventListener('click', closeModal);
});