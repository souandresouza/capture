<?php
// https://netcell.netlify.com/blog/2016/04/image-base64.html

// (A) CHECK IF DATA IS PRESENT
if (isset($_POST["snap"])) {
  // (B) BASE64 DECODE UPLOADED IMAGE
  $data = explode(",", $_POST["snap"]);
  $data = base64_decode($data[1]);

  // (C) SAVE IMAGE
  $file = fopen("snap.jpg", "w");
  if ($file) {
    fwrite($file, $data);
    fclose($file);
    echo "Imagem salva com sucesso!";
  } else {
    echo "Erro ao salvar a imagem.";
  }
} else {
  echo "Nenhuma imagem enviada.";
}