var webcam = {
  hVid: null, hSnaps: null, facingMode: "environment",
  
  init: () => {
    webcam.startStream();
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
