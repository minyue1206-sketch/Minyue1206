let state = {
    image: null,
    template: 'classic',
    density: 12,
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
    
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    for (let i = 0; i < 100; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.02})`;
        ctx.lineWidth = 0.5;
        const x = width * 0.2 + Math.random() * width * 0.6;
        const y = height * 0.25 + Math.random() * height * 0.6;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.random() * 30 - 15, y + Math.random() * 30 - 15);
        ctx.stroke();
    }
}

function quantizeColor(r, g, b) {
    const palette = [
        [0, 0, 0], [255, 255, 255], [128, 128, 128], [192, 192, 192],
        [128, 0, 0], [255, 0, 0], [0, 128, 0], [0, 255, 0],
        [128, 128, 0], [255, 255, 0], [0, 0, 128], [0, 0, 255],
        [128, 0, 128], [255, 0, 255], [0, 128, 128], [0, 255, 255],
        [255, 165, 0], [255, 192, 203], [139, 69, 19], [245, 245, 220],
        [255, 215, 0], [230, 230, 250], [152, 251, 152], [173, 216, 230]
    ];
    
    let minDist = Infinity;
    let bestColor = [r, g, b];
    
    for (const color of palette) {
        const dist = Math.sqrt(
            Math.pow(r - color[0], 2) +
            Math.pow(g - color[1], 2) +
            Math.pow(b - color[2], 2)
        );
        if (dist < minDist) {
            minDist = dist;
            bestColor = color;
        }
    }
    
    return bestColor;
}

function drawSatinStitch(ctx, x, y, width, height, angle, color) {
    ctx.save();
    ctx.translate(x + width/2, y + height/2);
    ctx.rotate(angle);
    ctx.translate(-width/2, -height/2);
    
    const stitchWidth = 3;
    const numStitches = Math.ceil(width / stitchWidth);
    
    for (let i = 0; i < numStitches; i++) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        const sx = i * stitchWidth + Math.random() * 0.5;
        const sy = Math.random() * 1;
        const ex = sx + Math.random() * 0.5;
        const ey = height - Math.random() * 1;
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawFrenchKnot(ctx, x, y, color, size = 3) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 0.5;
    ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
    ctx.stroke();
}

function drawChainStitch(ctx, x1, y1, x2, y2, color, width = 3) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(dist / (width * 2));
    
    for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const cx = x1 + dx * t + Math.sin(i * 0.5) * width * 0.3;
        const cy = y1 + dy * t + Math.cos(i * 0.5) * width * 0.3;
        
        if (i === 0) {
            ctx.moveTo(cx, cy);
        } else {
            ctx.lineTo(cx, cy);
        }
    }
    ctx.stroke();
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
    
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, imgWidth, imgHeight);
    
    ctx.strokeStyle = 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 200; i++) {
        ctx.beginPath();
        const x = Math.random() * imgWidth;
        const y = Math.random() * imgHeight;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.random() * 20 - 10, y + Math.random() * 20 - 10);
        ctx.stroke();
    }
    
    const stitchSize = density;
    
    switch (template) {
        case 'classic':
            drawClassicEmbroidery(ctx, data, imgWidth, imgHeight, stitchSize);
            break;
        case 'dense':
            drawDenseEmbroidery(ctx, data, imgWidth, imgHeight, stitchSize);
            break;
        case 'sparse':
            drawSparseEmbroidery(ctx, data, imgWidth, imgHeight, stitchSize);
            break;
        case 'cross':
            drawCrossStitchEmbroidery(ctx, data, imgWidth, imgHeight, stitchSize);
            break;
    }
    
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, imgWidth, imgHeight);
}

function drawClassicEmbroidery(ctx, data, width, height, stitchSize) {
    for (let y = 0; y < height; y += stitchSize) {
        for (let x = 0; x < width; x += stitchSize) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];
            
            if (a > 50) {
                const [qr, qg, qb] = quantizeColor(r, g, b);
                const color = `rgb(${qr},${qg},${qb})`;
                
                ctx.save();
                ctx.translate(x + stitchSize/2, y + stitchSize/2);
                ctx.rotate(Math.PI / 4 + Math.random() * 0.2);
                
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.ellipse(0, 0, stitchSize * 0.4, stitchSize * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0,0,0,0.2)`;
                ctx.lineWidth = 0.5;
                ctx.ellipse(0, 0, stitchSize * 0.35, stitchSize * 0.12, 0, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.restore();
                
                if (Math.random() > 0.7) {
                    const highlightColor = `rgba(255,255,255,0.3)`;
                    ctx.beginPath();
                    ctx.arc(x + stitchSize * 0.3, y + stitchSize * 0.3, stitchSize * 0.1, 0, Math.PI * 2);
                    ctx.fillStyle = highlightColor;
                    ctx.fill();
                }
            }
        }
    }
}

function drawDenseEmbroidery(ctx, data, width, height, stitchSize) {
    for (let y = 0; y < height; y += stitchSize * 0.7) {
        for (let x = 0; x < width; x += stitchSize * 0.7) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];
            
            if (a > 50) {
                const [qr, qg, qb] = quantizeColor(r, g, b);
                const color = `rgb(${qr},${qg},${qb})`;
                
                for (let i = 0; i < 3; i++) {
                    const offsetX = (i - 1) * stitchSize * 0.3 + Math.random() * stitchSize * 0.1;
                    const offsetY = Math.random() * stitchSize * 0.1;
                    drawFrenchKnot(ctx, x + stitchSize/2 + offsetX, y + stitchSize/2 + offsetY, color, stitchSize * 0.2);
                }
            }
        }
    }
}

function drawSparseEmbroidery(ctx, data, width, height, stitchSize) {
    for (let y = 0; y < height; y += stitchSize * 1.5) {
        for (let x = 0; x < width; x += stitchSize * 1.5) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];
            
            if (a > 50) {
                const [qr, qg, qb] = quantizeColor(r, g, b);
                const color = `rgb(${qr},${qg},${qb})`;
                
                drawFrenchKnot(ctx, x + stitchSize/2, y + stitchSize/2, color, stitchSize * 0.35);
                
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = stitchSize * 0.15;
                ctx.lineCap = 'round';
                
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const endX = x + stitchSize/2 + Math.cos(angle) * stitchSize * 0.25;
                    const endY = y + stitchSize/2 + Math.sin(angle) * stitchSize * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(x + stitchSize/2, y + stitchSize/2);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }
        }
    }
}

function drawCrossStitchEmbroidery(ctx, data, width, height, stitchSize) {
    const halfStitch = stitchSize / 2;
    
    for (let y = 0; y < height; y += stitchSize) {
        for (let x = 0; x < width; x += stitchSize) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];
            
            if (a > 50) {
                const [qr, qg, qb] = quantizeColor(r, g, b);
                const color = `rgb(${qr},${qg},${qb})`;
                
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = stitchSize * 0.35;
                ctx.lineCap = 'round';
                
                ctx.moveTo(x + 2, y + 2);
                ctx.lineTo(x + stitchSize - 2, y + stitchSize - 2);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(x + stitchSize - 2, y + 2);
                ctx.lineTo(x + 2, y + stitchSize - 2);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.lineWidth = stitchSize * 0.15;
                ctx.moveTo(x + 3, y + 3);
                ctx.lineTo(x + stitchSize - 3, y + stitchSize - 3);
                ctx.stroke();
            }
        }
    }
    
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= width; i += stitchSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    for (let i = 0; i <= height; i += stitchSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }
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
        embroideryCtx.fillText('请上传图片', embroideryWidth/2, embroideryHeight/2);
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
        alert('请先上传图片！');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'embroidery-tshirt-design.png';
    link.href = previewCanvas.toDataURL('image/png');
    link.click();
});

updatePreview();
