var webcam = {
  hVid: null, hSnaps: null, facingMode: "environment", zoomLevel: 1,
  filters: {
    none: "",
    grayscale: "grayscale(100%)",
    sepia: "sepia(100%)",
    invert: "invert(100%)"
  },

  init: () => {
    webcam.startStream();
    webcam.setupControls();
  },

  startStream: () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: webcam.facingMode } })
    .then(stream => {
      webcam.hVid = document.getElementById("cam-live");
      webcam.hSnaps = document.getElementById("cam-snaps");
      webcam.hVid.srcObject = stream;

      if (webcam.facingMode === "user") {
        webcam.hVid.classList.add("mirror");
      } else {
        webcam.hVid.classList.remove("mirror");
      }

      document.getElementById("cam-take").disabled = false;
      document.getElementById("cam-save").disabled = false;
      document.getElementById("cam-toggle").disabled = false;
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao acessar a câmera: " + err.message);
    });
  },

  setupControls: () => {
    // Desktop: Wheel zoom with position adjustment
    webcam.hVid.addEventListener('wheel', (event) => {
        event.preventDefault();
        const rect = webcam.hVid.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const delta = Math.sign(event.deltaY);
        webcam.zoomLevel = Math.max(0.5, Math.min(webcam.zoomLevel - delta * 0.1, 3));
        
        // Adjust transform origin based on mouse position
        webcam.hVid.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
        webcam.applyZoom();
        webcam.updateZoomDisplay();
    });

    // Mobile: Volume buttons as zoom controls
    document.addEventListener('keydown', (event) => {
        if (event.key === 'VolumeUp' || event.code === 'VolumeUp') {
            webcam.zoomLevel = Math.min(webcam.zoomLevel + 0.1, 3);
            webcam.applyZoom();
            webcam.updateZoomDisplay();
            event.preventDefault();
        } else if (event.key === 'VolumeDown' || event.code === 'VolumeDown') {
            webcam.zoomLevel = Math.max(webcam.zoomLevel - 0.1, 0.5);
            webcam.applyZoom();
            webcam.updateZoomDisplay();
            event.preventDefault();
        }
    });

    // Button controls as fallback
    document.getElementById("zoom-in").addEventListener("click", () => {
        webcam.zoomLevel = Math.min(webcam.zoomLevel + 0.1, 3);
        webcam.applyZoom();
        webcam.updateZoomDisplay();
    });
    
    document.getElementById("zoom-out").addEventListener("click", () => {
        webcam.zoomLevel = Math.max(webcam.zoomLevel - 0.1, 0.5);
        webcam.applyZoom();
        webcam.updateZoomDisplay();
    });

    // Controles de filtro
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        webcam.applyFilter(btn.dataset.filter);
        btn.classList.add("active-filter");
      });
    });

    // Exemplo de controle de toque
    // Adicionar no setupControls()
    let startY = 0;
    let zoomStart = 1;

    webcam.hVid.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        zoomStart = webcam.zoomLevel;
        e.preventDefault();
    }, {passive: false});
    
    webcam.hVid.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const deltaY = startY - currentY;
        
        // Ajuste de sensibilidade (quanto maior, menos sensível)
        const sensitivity = 100; 
        const zoomChange = deltaY / sensitivity;
        
        webcam.zoomLevel = Math.max(0.5, Math.min(zoomStart + zoomChange, 3));
        webcam.applyZoom();
        webcam.updateZoomDisplay();
        
        e.preventDefault();
    }, {passive: false});
  },

  applyZoom: () => {
    webcam.zoomLevel = Math.max(0.5, Math.min(webcam.zoomLevel, 3));
    webcam.hVid.style.transform = `scale(${webcam.zoomLevel})`;
    // Reset transform origin after zoom completes
    setTimeout(() => {
        webcam.hVid.style.transformOrigin = 'center center';
    }, 300);
},

updateZoomDisplay: () => {
    document.getElementById("zoom-level").textContent = 
        `${Math.round(webcam.zoomLevel * 100)}%`;
},

  // (B) TOGGLE CAMERA BETWEEN FRONT AND BACK
  toggleCamera: () => {
    webcam.facingMode = webcam.facingMode === "environment" ? "user" : "environment";
    webcam.startStream(); // Reiniciar o stream com a nova facingMode
  },

  // (B) SNAP VIDEO FRAME TO CANVAS
  snap: () => {
    // (B1) CREATE NEW CANVAS
    let cv = document.createElement("canvas"),
        cx = cv.getContext("2d");

    // (B2) CAPTURE VIDEO FRAME TO CANVAS
    cv.width = webcam.hVid.videoWidth;
    cv.height = webcam.hVid.videoHeight;
    cx.drawImage(webcam.hVid, 0, 0, webcam.hVid.videoWidth, webcam.hVid.videoHeight);

    // (B3) DONE
    return cv;
  },

  // (C) PUT SNAPSHOT INTO <DIV> WRAPPER
  take: () => webcam.hSnaps.appendChild(webcam.snap()),

  // (D) FORCE DOWNLOAD SNAPSHOT
  save: () => {
    // (D1) TAKE A SNAPSHOT, CREATE DOWNLOAD LINK
    let cv = webcam.snap(),
        a = document.createElement("a");
    a.href = cv.toDataURL("image/png");
    a.download = "snap.png";

    // (D2) "FORCE DOWNLOAD" - MAY NOT ALWAYS WORK!
    a.click(); a.remove(); cv.remove();

    // (D3) SAFER - LET USERS MANUAL CLICK
    // webcam.hSnaps.appendChild(a);
  },

  // (E) UPLOAD SNAPSHOT TO SERVER
  upload: () => {
    // (E1) APPEND SCREENSHOT TO DATA OBJECT
    var data = new FormData();
    data.append("snap", webcam.snap().toDataURL("image/jpeg", 0.6));
    
    // (E2) UPLOAD SCREENSHOT TO SERVER
    fetch("save.php", { method:"post", body:data })
    .then(res => res.text())
    .then(txt => alert(txt))
    .catch(err => alert("Erro ao fazer upload: " + err.message)); // Adicionado tratamento de erro
  }
};
window.addEventListener("load", webcam.init);

  applyFilter: (filter) => {
    if (webcam.hVid) {
      webcam.hVid.style.filter = webcam.filters[filter] || "";
    }
  }
