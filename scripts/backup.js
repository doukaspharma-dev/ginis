// Backup and restore functionality
document.addEventListener('DOMContentLoaded', function() {
  const backupBtn = document.getElementById('backupBtn');
  const restoreBtn = document.getElementById('restoreBtn');
  const autoBackupBtn = document.getElementById('autoBackupBtn');

  // Event listeners
  backupBtn.addEventListener('click', createBackup);
  restoreBtn.addEventListener('click', restoreFromBackup);
  autoBackupBtn.addEventListener('click', restoreAutoBackup);

  // Δημιουργία backup
  function createBackup() {
    const backupData = {
      links: JSON.parse(localStorage.getItem('links')) || [],
      categories: JSON.parse(localStorage.getItem('categories')) || [],
      theme: localStorage.getItem('selectedTheme') || 'dark',
      customTheme: localStorage.getItem('customTheme'),
      timestamp: new Date().toISOString(),
      version: '3.5.3c'
    };

    // Δημιουργία JSON file
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Δημιουργία download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pharmacy-links-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Αποθήκευση auto-backup
    localStorage.setItem('autoBackup', dataStr);
    
    showNotification('Backup created successfully!', 'success');
  }

  // Επαναφορά από backup
  function restoreFromBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          try {
            const backupData = JSON.parse(event.target.result);
            restoreData(backupData);
          } catch (error) {
            showNotification('Invalid backup file', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }

  // Επαναφορά από auto-backup
  function restoreAutoBackup() {
    const autoBackup = localStorage.getItem('autoBackup');
    if (autoBackup) {
      if (confirm('Restore from auto-backup? This will replace all current data.')) {
        try {
          const backupData = JSON.parse(autoBackup);
          restoreData(backupData);
        } catch (error) {
          showNotification('Auto-backup is corrupted', 'error');
        }
      }
    } else {
      showNotification('No auto-backup found', 'error');
    }
  }

  // Επαναφορά δεδομένων
  function restoreData(backupData) {
    // Επαλήθευση backup
    if (!backupData.links || !backupData.categories) {
      showNotification('Invalid backup data', 'error');
      return;
    }

    // Επαναφορά δεδομένων
    localStorage.setItem('links', JSON.stringify(backupData.links));
    localStorage.setItem('categories', JSON.stringify(backupData.categories));
    
    if (backupData.theme) {
      localStorage.setItem('selectedTheme', backupData.theme);
    }
    
    if (backupData.customTheme) {
      localStorage.setItem('customTheme', backupData.customTheme);
    }

    // Reload page to apply changes
    showNotification('Data restored successfully! Reloading...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }

  // Εμφάνιση notification
  function showNotification(message, type) {
    // Δημιουργία notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Styling
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      transition: all 0.3s ease;
      transform: translateX(100%);
    `;
    
    if (type === 'success') {
      notification.style.background = '#4CAF50';
    } else {
      notification.style.background = '#f44336';
    }
    
    document.body.appendChild(notification);
    
    // Animation
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Αυτόματο κλείσιμο
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Auto-backup κάθε 30 λεπτά
  setInterval(() => {
    const links = JSON.parse(localStorage.getItem('links')) || [];
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    
    if (links.length > 0) {
      const autoBackup = {
        links: links,
        categories: categories,
        theme: localStorage.getItem('selectedTheme') || 'dark',
        customTheme: localStorage.getItem('customTheme'),
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('autoBackup', JSON.stringify(autoBackup));
    }
  }, 30 * 60 * 1000); // 30 minutes
});