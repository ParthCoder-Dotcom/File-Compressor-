// Utility Functions

// Check browser support for various APIs
const BrowserSupport = {
    hasFileAPI: () => window.File && window.FileReader && window.FileList,
    hasBlob: () => typeof Blob !== 'undefined',
    hasCanvasAPI: () => !!document.createElement('canvas').getContext,
    hasWebWorkers: () => typeof Worker !== 'undefined',
    hasLocalStorage: () => typeof(Storage) !== 'undefined'
};

// File size calculations
const FileSizeUtils = {
    formatBytes: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    parseBytes: (sizeString) => {
        const units = { 'B': 1, 'KB': 1024, 'MB': 1024 ** 2, 'GB': 1024 ** 3 };
        const match = sizeString.match(/(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?/i);
        if (!match) return 0;
        return Math.round(match[1] * (units[match[2]] || 1));
    }
};

// Performance monitoring
const PerformanceMonitor = {
    startTime: null,
    
    start: () => {
        PerformanceMonitor.startTime = performance.now();
    },

    end: (label = 'Operation') => {
        const endTime = performance.now();
        const duration = endTime - PerformanceMonitor.startTime;
        console.log(`${label} took ${duration.toFixed(2)}ms`);
        return duration;
    },

    getMemoryUsage: () => {
        if (performance.memory) {
            return {
                usedJSHeapSize: FileSizeUtils.formatBytes(performance.memory.usedJSHeapSize),
                totalJSHeapSize: FileSizeUtils.formatBytes(performance.memory.totalJSHeapSize),
                jsHeapSizeLimit: FileSizeUtils.formatBytes(performance.memory.jsHeapSizeLimit)
            };
        }
        return null;
    }
};

// Local storage helper
const StorageHelper = {
    saveCompressionSettings: (settings) => {
        if (BrowserSupport.hasLocalStorage()) {
            localStorage.setItem('compressionSettings', JSON.stringify(settings));
        }
    },

    loadCompressionSettings: () => {
        if (BrowserSupport.hasLocalStorage()) {
            const stored = localStorage.getItem('compressionSettings');
            return stored ? JSON.parse(stored) : null;
        }
        return null;
    },

    clearCompressionSettings: () => {
        if (BrowserSupport.hasLocalStorage()) {
            localStorage.removeItem('compressionSettings');
        }
    }
};

// Initialize browser support check
window.addEventListener('load', () => {
    if (!BrowserSupport.hasFileAPI()) {
        alert('Your browser does not support File API. Please use a modern browser.');
    }
});