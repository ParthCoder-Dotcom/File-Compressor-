class CompressionUI {
    constructor() {
        this.files = [];
        this.results = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Drop Zone
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Quality Slider
        const qualitySlider = document.getElementById('qualitySlider');
        qualitySlider.addEventListener('input', (e) => {
            document.getElementById('qualityValue').textContent = e.target.value + '%';
        });

        // Type Buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Action Buttons
        document.getElementById('compressBtn').addEventListener('click', () => this.startCompression());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearFiles());
        document.getElementById('downloadAllBtn').addEventListener('click', () => this.downloadAll());
    }

    handleFiles(fileList) {
        const newFiles = Array.from(fileList);
        this.files = [...this.files, ...newFiles];
        this.renderFiles();
        this.updateCompressButton();
        this.showToast(`Added ${newFiles.length} file(s)`, 'success');
    }

    renderFiles() {
        const filesList = document.getElementById('filesList');
        
        if (this.files.length === 0) {
            filesList.innerHTML = '<p class="empty-state">No files selected</p>';
            return;
        }

        filesList.innerHTML = this.files.map((file, index) => `
            <div class="file-item">
                <div class="file-item-header">
                    <div style="display: flex; align-items: center; flex: 1;">
                        <span class="file-icon">${this.getFileIcon(file.type)}</span>
                        <span class="file-name">${this.truncateFileName(file.name)}</span>
                    </div>
                    <button class="remove-file" data-index="${index}">×</button>
                </div>
                <div class="file-info">
                    <span>${file.type || 'Unknown'}</span>
                    <span class="file-size">${compressionEngine.formatFileSize(file.size)}</span>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.files.splice(parseInt(e.target.dataset.index), 1);
                this.renderFiles();
                this.updateCompressButton();
            });
        });
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return '📷';
        if (mimeType.startsWith('video/')) return '🎬';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
        return '📦';
    }

    truncateFileName(name, maxLength = 30) {
        return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
    }

    updateCompressButton() {
        document.getElementById('compressBtn').disabled = this.files.length === 0;
    }

    async startCompression() {
        const settings = this.getSettings();
        
        document.getElementById('statusSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('actionButtons').style.display = 'none';
        document.getElementById('compressBtn').disabled = true;

        this.results = [];
        const progressContainer = document.getElementById('progressContainer');
        progressContainer.innerHTML = '';

        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            const progressItem = this.createProgressItem(i, file);
            progressContainer.appendChild(progressItem);

            try {
                await this.compressFile(file, i, settings);
            } catch (error) {
                this.showToast(`Error: ${file.name}`, 'error');
            }
        }

        this.showResults();
    }

    createProgressItem(index, file) {
        const div = document.createElement('div');
        div.className = 'progress-item';
        div.id = `progress-${index}`;
        div.innerHTML = `
            <div class="progress-header">
                <span class="file-name">${this.truncateFileName(file.name)}</span>
                <span class="progress-percent">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-info">
                <span class="original-size">${compressionEngine.formatFileSize(file.size)}</span>
                <span style="color: #999;">→</span>
                <span class="compressed-size">-</span>
            </div>
        `;
        return div;
    }

    async compressFile(file, index, settings) {
        const progressItem = document.querySelector(`#progress-${index}`);
        
        const result = await compressionEngine.compressFile(file, settings, (progress) => {
            progressItem.querySelector('.progress-fill').style.width = progress + '%';
            progressItem.querySelector('.progress-percent').textContent = progress + '%';
        });

        progressItem.querySelector('.compressed-size').textContent = compressionEngine.formatFileSize(result.compressedSize);
        
        this.results.push({
            name: file.name,
            originalSize: file.size,
            compressedSize: result.compressedSize,
            blob: result.blob
        });
    }

    getSettings() {
        return {
            quality: parseInt(document.getElementById('qualitySlider').value),
            targetSize: parseFloat(document.getElementById('targetSize').value) || null,
            method: document.getElementById('methodSelect').value,
            outputFormat: document.getElementById('outputFormat').value
        };
    }

    showResults() {
        document.getElementById('statusSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        const totalOriginal = this.results.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressed = this.results.reduce((sum, r) => sum + r.compressedSize, 0);
        const totalSaved = totalOriginal - totalCompressed;
        const ratio = Math.round((totalCompressed / totalOriginal) * 100);

        document.getElementById('filesProcessed').textContent = this.results.length;
        document.getElementById('totalSaved').textContent = compressionEngine.formatFileSize(totalSaved);
        document.getElementById('compressionRatio').textContent = ratio + '%';

        const resultsList = document.getElementById('resultsList');
        resultsList.innerHTML = this.results.map(result => {
            const saved = result.originalSize - result.compressedSize;
            const savedPercent = Math.round((saved / result.originalSize) * 100);
            return `
                <div class="result-item">
                    <div class="result-item-info">
                        <div class="result-item-name">${result.name}</div>
                        <div class="result-item-details">
                            ${compressionEngine.formatFileSize(result.originalSize)} → 
                            ${compressionEngine.formatFileSize(result.compressedSize)} 
                            (${savedPercent}% saved)
                        </div>
                    </div>
                    <button class="download-btn" data-name="${result.name}">⬇️ Download</button>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fileName = e.target.dataset.name;
                const result = this.results.find(r => r.name === fileName);
                if (result) this.downloadFile(result.blob, fileName);
            });
        });

        document.getElementById('downloadAllBtn').style.display = 'block';
    }

    downloadFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.replace(/\.[^/.]+$/, '_compressed$&');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    downloadAll() {
        this.results.forEach(result => {
            setTimeout(() => {
                this.downloadFile(result.blob, result.name);
            }, 200);
        });
        this.showToast('Downloading all files...', 'success');
    }

    clearFiles() {
        this.files = [];
        this.results = [];
        this.renderFiles();
        this.updateCompressButton();
        document.getElementById('downloadAllBtn').style.display = 'none';
        this.showToast('Cleared all files', 'success');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }
}

const ui = new CompressionUI();