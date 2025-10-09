// Drag & Drop functionality
document.addEventListener('DOMContentLoaded', function() {
  let draggedCard = null;
  let draggedCategory = null;

  // Event listeners για drag & drop
  document.addEventListener('dragstart', handleDragStart);
  document.addEventListener('dragover', handleDragOver);
  document.addEventListener('drop', handleDrop);
  document.addEventListener('dragenter', handleDragEnter);
  document.addEventListener('dragleave', handleDragLeave);

  function handleDragStart(e) {
    if (e.target.classList.contains('card')) {
      draggedCard = e.target;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', draggedCard.outerHTML);
      
      // Προσθήκη κλάσης για visual feedback
      setTimeout(() => {
        draggedCard.style.opacity = '0.4';
      }, 0);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  function handleDrop(e) {
    e.preventDefault();
    
    if (draggedCard) {
      draggedCard.style.opacity = '1';
      
      const targetCategory = e.target.closest('.category');
      const targetCard = e.target.closest('.card');
      const targetGrid = e.target.closest('.grid');
      
      if (targetCategory && draggedCard.parentElement !== targetGrid) {
        // Μετακίνηση σε άλλη κατηγορία
        moveCardToCategory(draggedCard, targetCategory);
      } else if (targetCard && targetCard !== draggedCard) {
        // Αλλαγή σειράς μέσα στην ίδια κατηγορία
        swapCards(draggedCard, targetCard);
      }
      
      draggedCard = null;
    }
  }

  function handleDragEnter(e) {
    if (e.target.classList.contains('category')) {
      e.target.classList.add('drag-over');
    }
  }

  function handleDragLeave(e) {
    if (e.target.classList.contains('category')) {
      e.target.classList.remove('drag-over');
    }
  }

  function moveCardToCategory(card, targetCategory) {
    const sourceCategory = card.closest('.category');
    const targetGrid = targetCategory.querySelector('.grid');
    
    if (sourceCategory && targetGrid) {
      targetGrid.appendChild(card);
      updateLinksOrder();
    }
  }

  function swapCards(card1, card2) {
    const parent = card1.parentElement;
    const index1 = Array.from(parent.children).indexOf(card1);
    const index2 = Array.from(parent.children).indexOf(card2);
    
    if (index1 < index2) {
      parent.insertBefore(card2, card1);
    } else {
      parent.insertBefore(card1, card2);
    }
    
    updateLinksOrder();
  }

  function updateLinksOrder() {
    // Ενημέρωση της σειράς των links στο localStorage
    const categories = document.querySelectorAll('.category');
    let links = JSON.parse(localStorage.getItem('links')) || [];
    
    categories.forEach(category => {
      const categoryName = category.querySelector('h2').textContent;
      const cards = category.querySelectorAll('.card');
      
      cards.forEach((card, index) => {
        const linkUrl = card.querySelector('a').href;
        const linkIndex = links.findIndex(link => link.url === linkUrl);
        
        if (linkIndex !== -1) {
          links[linkIndex].category = categoryName;
          links[linkIndex].order = index;
        }
      });
    });
    
    // Ταξινόμηση links βάσει σειράς
    links.sort((a, b) => (a.order || 0) - (b.order || 0));
    localStorage.setItem('links', JSON.stringify(links));
  }
});