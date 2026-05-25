let state = {
    image: null,
    template: 'classic',
    density: 15,
    tshirtColor: '#ffffff',
    designSize: 60
};

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewCanvas = document.getElementById('previewCanvas');
const embroideryCanvas = document.getElementById('embroideryCanvas');
const exportBtn = document.getElementById('exportBtn');
const densitySlider = document.getElementById('density');
const sizeSlider = document.getElementById('size');
const densityValue = document.getElementById('densityValue');
const sizeValue = document.getElementById('sizeValue');
const templateBtns = document.querySelectorAll('.template-btn');
const colorBtns = document.querySelectorAll('.color-btn');

const previewCtx = previewCanvas.getContext('2d');
const embroideryCtx = embroideryCanvas.getContext('2d');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        loadImage(e.target.files[0]);
    }
});

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            state.image = img;
            updatePreview();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

templateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        templateBtns.forEach(b => {
            b.classList.remove('active', 'border-amber-500');
            b.classList.add('border-transparent');
        });
        btn.classList.add('active', 'border-amber-500');
        btn.classList.remove('border-transparent');
        state.template = btn.dataset.template;
        updatePreview();
    });
});

colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => {
            b.classList.remove('border-amber-500');
            b.classList.add('border-transparent');
        });
        btn.classList.add('border-amber-500');
        btn.classList.remove('border-transparent');
        state.tshirtColor = btn.dataset.color;
        updatePreview();
    });
});

densitySlider.addEventListener('input', (e) => {
    state.density = parseInt(e.target.value);
    densityValue.textContent = state.density;
    updatePreview();
});

sizeSlider.addEventListener('input', (e) => {
    state.designSize = parseInt(e.target.value);
    sizeValue.textContent = state.designSize + '%';
    updatePreview();
});

function drawTShirt(ctx, width, height, color) {
    ctx.fillStyle = color;
    
    ctx.beginPath();
    ctx.moveTo(width * 0.25, height * 0.15);
    ctx.lineTo(width * 0.1, height * 0.25);
    ctx.lineTo(width * 0.15, height * 0.35);
    ctx.lineTo(width * 0.18, height * 0.3);
    ctx.lineTo(width * 0.18, height * 0.9);
    ctx.lineTo(width * 0.82, height * 0.9);
    ctx.lineTo(width * 0.82, height * 0.3);
    ctx.lineTo(width * 0.85, height * 0.35);
    ctx.lineTo(width * 0.9, height * 0.25);
    ctx.lineTo(width * 0.75, height * 0.15);
    ctx.lineTo(width * 0.7, height * 0.18);
    ctx.quadraticCurveTo(width * 0.6, height * 0.12, width * 0.5, height * 0.12);
    ctx.quadraticCurveTo(width * 0.4, height * 0.12, width * 0.3, height * 0.18);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.03})`;
        ctx.lineWidth = 1;
        const x = width * 0.2 + Math.random() * width * 0.6;
        const y = height * 0.25 + Math.random() * height * 0.6;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.random() * 20 - 10, y + Math.random() * 20 - 10);
        ctx.stroke();
    }
}

function drawEmbroideryEffect(ctx, image, template, density) {
    const imgWidth = embroideryCanvas.width;
    const imgHeight = embroideryCanvas.height;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgWidth;
    tempCanvas.height = imgHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(image, 0, 0, imgWidth, imgHeight);
    
    const imageData = tempCtx.getImageData(0, 0, imgWidth, imgHeight);
    const data = imageData.data;
    
    ctx.clearRect(0, 0, imgWidth, imgHeight);
    
    const stitchSize = density;
    
    for (let y = 0; y < imgHeight; y += stitchSize) {
        for (let x = 0; x < imgWidth; x += stitchSize) {
            const index = (Math.floor(y) * imgWidth + Math.floor(x)) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];
            
            if (a > 0) {
                ctx.fillStyle = `rgba(${r},${g},${b},${a/255})`;
                
                switch (template) {
                    case 'classic':
                        drawClassicStitch(ctx, x, y, stitchSize);
                        break;
                    case 'dense':
                        drawDenseStitch(ctx, x, y, stitchSize);
                        break;
                    case 'sparse':
                        drawSparseStitch(ctx, x, y, stitchSize);
                        break;
                    case 'cross':
                        drawCrossStitch(ctx, x, y, stitchSize);
                        break;
                }
            }
        }
    }
}

function drawClassicStitch(ctx, x, y, size) {
    ctx.beginPath();
    ctx.ellipse(x + size/2, y + size/2, size/3, size/6, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 0.5;
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y + size);
    ctx.stroke();
}

function drawDenseStitch(ctx, x, y, size) {
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x + size/4 + i * size/4, y + size/2, size/5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSparseStitch(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
    ctx.stroke();
}

function drawCrossStitch(ctx, x, y, size) {
    ctx.beginPath();
    ctx.lineWidth = size/4;
    ctx.lineCap = 'round';
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y + size);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.stroke();
}

function updatePreview() {
    const previewWidth = 400;
    const previewHeight = 480;
    const embroideryWidth = 300;
    const embroideryHeight = 300;
    
    previewCanvas.width = previewWidth;
    previewCanvas.height = previewHeight;
    embroideryCanvas.width = embroideryWidth;
    embroideryCanvas.height = embroideryHeight;
    
    if (!state.image) {
        previewCtx.clearRect(0, 0, previewWidth, previewHeight);
        drawTShirt(previewCtx, previewWidth, previewHeight, state.tshirtColor);
        
        embroideryCtx.clearRect(0, 0, embroideryWidth, embroideryHeight);
        embroideryCtx.fillStyle = '#e5e7eb';
        embroideryCtx.fillRect(0, 0, embroideryWidth, embroideryHeight);
        embroideryCtx.fillStyle = '#6b7280';
        embroideryCtx.font = '16px Inter';
        embroideryCtx.textAlign = 'center';
        embroideryCtx.fillText('Please upload an image', embroideryWidth/2, embroideryHeight/2);
        return;
    }
    
    drawEmbroideryEffect(embroideryCtx, state.image, state.template, state.density);
    
    drawTShirt(previewCtx, previewWidth, previewHeight, state.tshirtColor);
    
    const designSize = state.designSize / 100;
    const designWidth = previewWidth * 0.5 * designSize;
    const designHeight = designWidth * (embroideryHeight / embroideryWidth);
    const designX = previewWidth / 2 - designWidth / 2;
    const designY = previewHeight * 0.3;
    
    previewCtx.drawImage(embroideryCanvas, designX, designY, designWidth, designHeight);
}

exportBtn.addEventListener('click', () => {
    if (!state.image) {
        alert('Please upload an image first!');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'embroidery-tshirt-design.png';
    link.href = previewCanvas.toDataURL('image/png');
    link.click();
});

updatePreview();
