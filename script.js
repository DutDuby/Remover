// ---------------- ELEMENTS ----------------
const imageUpload = document.getElementById('image-upload');
const backgroundUpload = document.getElementById('background-upload');
const originalImage = document.getElementById('original-image');
const processedImage = document.getElementById('processed-image');
const downloadButton = document.getElementById('download-button');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const saturationSlider = document.getElementById('saturation');
const rotateSlider = document.getElementById('rotate'); 
const blurSlider = document.getElementById('blur'); // ✅ blur control
const resetEnhancementBtn = document.getElementById('reset-enhancement');
const copyCodeButton = document.getElementById('copy-code-button');

// --- Text overlay controls ---
const applyTextButton = document.getElementById('apply-text-button');
const overlayTextInput = document.getElementById('overlay-text');
const textSizeInput = document.getElementById('text-size');
const textColorInput = document.getElementById('text-color');
const textFontInput = document.getElementById('text-font');
const textStyleInput = document.getElementById('text-style');
const textOverlay = document.getElementById('text-overlay');
const resetTextButton = document.getElementById('reset-text-button'); 

// --- Text move buttons ---
const moveUpBtn = document.getElementById('move-up');
const moveDownBtn = document.getElementById('move-down');
const moveLeftBtn = document.getElementById('move-left');
const moveRightBtn = document.getElementById('move-right');

let textX = 50;
let textY = 50;
const moveStep = 5; // how much text moves per click

let processedImageBlob = null;

// ---------------- THEME TOGGLE ----------------
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});
initTheme();

// ---------------- IMAGE ENHANCEMENTS ----------------
function updateImageEnhancements() {
  const brightness = brightnessSlider.value;
  const contrast = contrastSlider.value;
  const saturation = saturationSlider.value;
  const rotate = rotateSlider.value;
  const blur = blurSlider.value;

  processedImage.style.filter =
    `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;

  processedImage.style.transform = `rotate(${rotate}deg)`; 
}

function resetEnhancements() {
  brightnessSlider.value = 100;
  contrastSlider.value = 100;
  saturationSlider.value = 100;
  rotateSlider.value = 0;
  blurSlider.value = 0;
  updateImageEnhancements();
}

brightnessSlider.addEventListener('input', updateImageEnhancements);
contrastSlider.addEventListener('input', updateImageEnhancements);
saturationSlider.addEventListener('input', updateImageEnhancements);
rotateSlider.addEventListener('input', updateImageEnhancements);
blurSlider.addEventListener('input', updateImageEnhancements);
resetEnhancementBtn.addEventListener('click', resetEnhancements);

// ---------------- TEXT CONTROLS ----------------
function updateTextPosition() {
  textOverlay.style.left = textX + "px";
  textOverlay.style.top = textY + "px";
}

function resetTextControls() {
  overlayTextInput.value = "";
  textSizeInput.value = 24;
  textColorInput.value = "#000000";
  textFontInput.value = "Arial";
  textStyleInput.value = "normal";
  textOverlay.textContent = ""; 
  textOverlay.style = ""; 
  textX = 50;
  textY = 50;
  updateTextPosition();
}
resetTextButton.addEventListener('click', resetTextControls);

// Movement button logic
moveUpBtn.addEventListener("click", () => {
  textY -= moveStep;
  updateTextPosition();
});
moveDownBtn.addEventListener("click", () => {
  textY += moveStep;
  updateTextPosition();
});
moveLeftBtn.addEventListener("click", () => {
  textX -= moveStep;
  updateTextPosition();
});
moveRightBtn.addEventListener("click", () => {
  textX += moveStep;
  updateTextPosition();
});

// ---------------- FILE UPLOAD ----------------
document.querySelectorAll('.upload-box').forEach(box => {
  const input = box.querySelector('input[type="file"]');
  box.addEventListener('click', () => input.click());
});

// Drag and drop setup
function setupDragAndDrop(uploadBox, fileInput) {
  uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault(); e.stopPropagation();
    uploadBox.style.background = 'rgba(255, 255, 255, 0.2)';
    uploadBox.style.borderColor = 'rgba(255, 255, 255, 0.8)';
  });
  uploadBox.addEventListener('dragleave', (e) => {
    e.preventDefault(); e.stopPropagation();
    uploadBox.style.background = 'rgba(255, 255, 255, 0.1)';
    uploadBox.style.borderColor = 'rgba(255, 255, 255, 0.3)';
  });
  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault(); e.stopPropagation();
    uploadBox.style.background = 'rgba(255, 255, 255, 0.1)';
    uploadBox.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelect(file, fileInput.id === 'image-upload');
    }
  });
}
setupDragAndDrop(document.querySelector('.upload-box:not(.background-upload)'), imageUpload);
setupDragAndDrop(document.querySelector('.background-upload'), backgroundUpload);

// Handle file selection
function handleFileSelect(file, isMainImage) {
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (isMainImage) {
        originalImage.src = e.target.result;
        removeBackground(file);
        resetEnhancements();
        resetTextControls();
      } else if (processedImageBlob) {
        applyCustomBackground(processedImageBlob, e.target.result);
        resetEnhancements();
        resetTextControls();
      }
    };
    reader.readAsDataURL(file);
  }
}
imageUpload.addEventListener('change', (event) =>
  handleFileSelect(event.target.files[0], true));
backgroundUpload.addEventListener('change', (event) =>
  handleFileSelect(event.target.files[0], false));

// ---------------- REMOVE BACKGROUND ----------------
async function removeBackground(imageFile) {
  const apiKey = 'N2ak6GE594k45fMi2g51D9Tf'; // ✅ API key
  const url = 'https://api.remove.bg/v1.0/removebg';
  const formData = new FormData();
  formData.append('image_file', imageFile);
  formData.append('size', 'auto');
  loadingSpinner.style.display = 'block';
  errorMessage.style.display = 'none';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: formData
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed: ${response.status} - ${errorText}`);
    }
    const blob = await response.blob();
    processedImageBlob = blob;
    processedImage.src = URL.createObjectURL(blob);
    downloadButton.disabled = false;
  } catch (error) {
    errorMessage.textContent = 'Error: ' + error.message;
    errorMessage.style.display = 'block';
  } finally {
    loadingSpinner.style.display = 'none';
  }
}

// ---------------- APPLY CUSTOM BACKGROUND ----------------
function applyCustomBackground(foregroundBlob, backgroundUrl) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const foregroundImage = new Image();
  foregroundImage.src = URL.createObjectURL(foregroundBlob);
  const backgroundImage = new Image();
  backgroundImage.src = backgroundUrl;
  Promise.all([
    new Promise(resolve => foregroundImage.onload = resolve),
    new Promise(resolve => backgroundImage.onload = resolve)
  ]).then(() => {
    canvas.width = foregroundImage.width;
    canvas.height = foregroundImage.height;
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(foregroundImage, 0, 0);
    processedImage.src = canvas.toDataURL();
  });
}

// ---------------- APPLY TEXT OVERLAY ----------------
applyTextButton.addEventListener('click', () => {
  textOverlay.textContent = overlayTextInput.value || "";
  textOverlay.style.fontSize = `${textSizeInput.value || 24}px`;
  textOverlay.style.color = textColorInput.value || "#000000";
  textOverlay.style.fontFamily = textFontInput.value;

  const style = textStyleInput.value;
  textOverlay.style.fontWeight = style.includes("bold") ? "bold" : "normal";
  textOverlay.style.fontStyle = style.includes("italic") ? "italic" : "normal";

  updateTextPosition();
});

// ---------------- COPY AS CODE ----------------
copyCodeButton.addEventListener('click', () => {
  if (!processedImage.src || processedImage.src === "#") {
    alert("No processed image available to copy!");
    return;
  }
  navigator.clipboard.writeText(processedImage.src)
    .then(() => {
      copyCodeButton.textContent = "Copied!";
      setTimeout(() => {
        copyCodeButton.textContent = "Copy Image as Code";
      }, 2000);
    })
    .catch(err => alert("Failed to copy: " + err));
});

// ---------------- DOWNLOAD IMAGE (formats + resolution) ----------------
downloadButton.addEventListener('click', () => {
  const format = document.getElementById('download-format').value;
  const scale = parseInt(document.getElementById('download-resolution').value) || 1;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const tempImage = new Image();
  tempImage.src = processedImage.src;

  tempImage.onload = () => {
    // Apply scaling
    canvas.width = tempImage.width * scale;
    canvas.height = tempImage.height * scale;
    ctx.scale(scale, scale);

    // Apply filters
    ctx.filter = processedImage.style.filter;

    // Apply rotation
    const rotate = parseInt(rotateSlider.value) || 0;
    ctx.translate(canvas.width / (2 * scale), canvas.height / (2 * scale));
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.drawImage(tempImage, -tempImage.width / 2, -tempImage.height / 2);
    ctx.rotate(-(rotate * Math.PI) / 180);
    ctx.translate(-canvas.width / (2 * scale), -canvas.height / (2 * scale));

    // Draw text overlay
    if (textOverlay.textContent.trim() !== "") {
      const style = textStyleInput.value;
      const weight = style.includes("bold") ? "bold " : "";
      const italic = style.includes("italic") ? "italic " : "";

      ctx.font = `${italic}${weight}${(textSizeInput.value || 24)}px ${textFontInput.value}`;
      ctx.fillStyle = textColorInput.value;
      ctx.fillText(
        textOverlay.textContent,
        textX,
        textY
      );
    }

    // ✅ Export with chosen format
    let mimeType = "image/png";
    let extension = "png";
    if (format === "jpg") { mimeType = "image/jpeg"; extension = "jpg"; }
    if (format === "webp") { mimeType = "image/webp"; extension = "webp"; }

    const link = document.createElement('a');
    link.href = canvas.toDataURL(mimeType, 0.95); // High quality
    link.download = `Background Dropper-${scale}x.${extension}`;
    link.click();
  };
});

// ---------------- SOCIAL MEDIA SHARE ----------------
function getImageShareURL() {
  if (!processedImage.src || processedImage.src === "#") {
    alert("Please process an image before sharing!");
    return null;
  }
  return processedImage.src;
}

document.getElementById("share-facebook").addEventListener("click", () => {
  const imgURL = getImageShareURL();
  if (imgURL) {
    const shareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imgURL)}`;
    window.open(shareURL, "_blank");
  }
});

document.getElementById("share-twitter").addEventListener("click", () => {
  const imgURL = getImageShareURL();
  if (imgURL) {
    const shareURL = `https://twitter.com/intent/tweet?url=${encodeURIComponent(imgURL)}&text=Check out my edited image!`;
    window.open(shareURL, "_blank");
  }
});

document.getElementById("share-linkedin").addEventListener("click", () => {
  const imgURL = getImageShareURL();
  if (imgURL) {
    const shareURL = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(imgURL)}`;
    window.open(shareURL, "_blank");
  }
});

document.getElementById("share-whatsapp").addEventListener("click", () => {
  const imgURL = getImageShareURL();
  if (imgURL) {
    const shareURL = `https://api.whatsapp.com/send?text=Check out my edited image! ${encodeURIComponent(imgURL)}`;
    window.open(shareURL, "_blank");
  }
});

// ---------------- STOCK BACKGROUNDS ----------------
document.querySelectorAll('.stock-item').forEach(item => {
  item.addEventListener('click', () => {
    if (processedImageBlob) {
      applyCustomBackground(processedImageBlob, item.src);
      resetEnhancements();
      resetTextControls();
    } else {
      alert("Please upload and process an image first!");
    }
  });
});

// ---------------- DYNAMIC BACKGROUNDS ----------------
document.querySelectorAll('.dynamic-item').forEach(item => {
  item.addEventListener('click', () => {
    if (!processedImageBlob) {
      alert("Please upload and process an image first!");
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const foregroundImage = new Image();
    foregroundImage.src = URL.createObjectURL(processedImageBlob);

    foregroundImage.onload = () => {
      canvas.width = foregroundImage.width;
      canvas.height = foregroundImage.height;

      // Choose background
      const type = item.dataset.bg;
      if (type === "gradient") {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#4f46e5");
        gradient.addColorStop(1, "#3b82f6");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (type === "moving") {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 200; i++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
          ctx.beginPath();
          ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*2, 0, 2*Math.PI);
          ctx.fill();
        }
      } else if (type === "pattern") {
        ctx.fillStyle = "#f4f4f4";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#ccc";
        for (let x = 0; x < canvas.width; x += 40) {
          for (let y = 0; y < canvas.height; y += 40) {
            ctx.strokeRect(x, y, 40, 40);
          }
        }
      }

      // Draw foreground
      ctx.drawImage(foregroundImage, 0, 0);
      processedImage.src = canvas.toDataURL();
    };
  });
});

// ---------------- BULK REMOVE BACKGROUNDS ----------------
const bulkUploadInput = document.getElementById('bulk-upload-input');
const bulkPreview = document.getElementById('bulk-preview');

bulkUploadInput.addEventListener('change', async (event) => {
  const files = Array.from(event.target.files);
  bulkPreview.innerHTML = ""; // clear old previews

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;

    const previewBox = document.createElement("div");
    previewBox.className = "bulk-item";
    previewBox.innerHTML = `<p>${file.name}</p><p>Processing...</p>`;
    bulkPreview.appendChild(previewBox);

    try {
      const blob = await removeBackgroundBulk(file);
      const img = document.createElement("img");
      img.src = URL.createObjectURL(blob);
      previewBox.innerHTML = `<p>${file.name}</p>`;
      previewBox.appendChild(img);

      const downloadBtn = document.createElement("button");
      downloadBtn.textContent = "Download";
      downloadBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.href = img.src;
        link.download = `processed-${file.name}`;
        link.click();
      });
      previewBox.appendChild(downloadBtn);

    } catch (err) {
      previewBox.innerHTML = `<p>${file.name}</p><p style="color:red;">Error: ${err.message}</p>`;
    }
  }
});

async function removeBackgroundBulk(imageFile) {
  const apiKey = 'N2ak6GE594k45fMi2g51D9Tf';
  const url = 'https://api.remove.bg/v1.0/removebg';
  const formData = new FormData();
  formData.append('image_file', imageFile);
  formData.append('size', 'auto');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed: ${response.status} - ${errorText}`);
  }
  return await response.blob();
}
