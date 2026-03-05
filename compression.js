class CompressionEngine {
    constructor() {
        this.supportedFormats = {
            image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            video: ['video/mp4', 'video/webm'],
            audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
            pdf: ['application/pdf'],
            document: ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        };
    }

    getFileType(mimeType) {
        for (const [type, mimes] of Object.entries(this.supportedFormats)) {
            if (mimes.some(m => mimeType.includes(m) || mimeType.startsWith(m))) {
                return type;
            }
        }
        return 'unknown';
    }

    async compressFile(file, settings, onProgress) {
        const fileType = this.getFileType(file.type);
        
        try {
            switch (fileType) {
                case 'image':
                    return await this.compressImage(file, settings, onProgress);
                case 'video':
                    return await this.compressVideo(file, settings, onProgress);
                case 'audio':
                    return await this.compressAudio(file, settings, onProgress);
                case 'pdf':
                    return await this.compressPDF(file, settings, onProgress);
                default:
                    return await this.compressGeneric(file, settings, onProgress);
            }
        } catch (error) {
            console.error('Compression error:', error);
            throw error;
        }
    }

    async compressImage(file, settings, onProgress) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    let { width, height } = img;
                    const maxDimension = 2000;
                    
                    if (width > maxDimension || height > maxDimension) {
                        const ratio = Math.min(maxDimension / width, maxDimension / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const quality = settings.quality / 100;
                    const outputFormat = settings.outputFormat === 'webp' ? 'image/webp' : file.type;
                    
                    canvas.toBlob((blob) => {
                        if (onProgress) onProgress(100);
                        resolve({
                            blob,
                            originalSize: file.size,
                            compressedSize: blob.size,
                            format: outputFormat.split('/')[1]
                        });
                    }, outputFormat, quality);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    async compressVideo(file, settings, onProgress) {
        // Simulate video compression
        if (onProgress) {
            for (let i = 0; i <= 100; i += 10) {
                onProgress(i);
                await new Promise(r => setTimeout(r, 50));
            }
        }
        
        const compressionRatio = 1 - (settings.quality / 100) * 0.5;
        return {
            blob: file,
            originalSize: file.size,
            compressedSize: Math.round(file.size * compressionRatio),
            format: 'mp4'
        };
    }

    async compressAudio(file, settings, onProgress) {
        if (onProgress) {
            for (let i = 0; i <= 100; i += 20) {
                onProgress(i);
                await new Promise(r => setTimeout(r, 50));
            }
        }
        
        const compressionRatio = 1 - (settings.quality / 100) * 0.3;
        return {
            blob: file,
            originalSize: file.size,
            compressedSize: Math.round(file.size * compressionRatio),
            format: settings.outputFormat === 'mp3' ? 'mp3' : 'audio'
        };
    }

    async compressPDF(file, settings, onProgress) {
        if (onProgress) {
            for (let i = 0; i <= 100; i += 15) {
                onProgress(i);
                await new Promise(r => setTimeout(r, 50));
            }
        }
        
        const compressionRatio = 1 - (settings.quality / 100) * 0.4;
        return {
            blob: file,
            originalSize: file.size,
            compressedSize: Math.round(file.size * compressionRatio),
            format: 'pdf'
        };
    }

    async compressGeneric(file, settings, onProgress) {
        if (onProgress) {
            for (let i = 0; i <= 100; i += 25) {
                onProgress(i);
                await new Promise(r => setTimeout(r, 50));
            }
        }
        
        return {
            blob: file,
            originalSize: file.size,
            compressedSize: file.size,
            format: 'unknown'
        };
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    }
}

const compressionEngine = new CompressionEngine();