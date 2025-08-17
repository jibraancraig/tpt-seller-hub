export function createModal(title, content, onClose = () => {}) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900">${title}</h2>
                <button class="text-gray-400 hover:text-gray-600" data-testid="button-close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close handlers
    modal.querySelector('[data-testid="button-close-modal"]').onclick = () => {
        modal.remove();
        onClose();
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
            onClose();
        }
    };
    
    return modal;
}

export function createCSVUploadModal(onUpload) {
    const content = `
        <div class="space-y-6">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <p class="text-lg font-medium text-gray-700 mb-2">Drop your CSV file here</p>
                <p class="text-sm text-gray-500 mb-4">or click to browse</p>
                <input type="file" accept=".csv" class="hidden" id="csv-file-input" data-testid="input-csv-file">
                <label for="csv-file-input" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer" data-testid="button-choose-file">
                    Choose File
                </label>
            </div>
            
            <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="text-sm font-medium text-blue-900 mb-2">Expected columns:</h4>
                <div class="flex flex-wrap gap-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">title</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">description</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">tags</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">tpt_url</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">price</span>
                </div>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50" onclick="this.closest('.fixed').remove()" data-testid="button-cancel">
                    Cancel
                </button>
                <button class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700" id="upload-csv-btn" data-testid="button-upload">
                    Upload & Import
                </button>
            </div>
        </div>
    `;
    
    const modal = createModal('Import Products from CSV', content);
    
    const fileInput = modal.querySelector('#csv-file-input');
    const uploadBtn = modal.querySelector('#upload-csv-btn');
    
    uploadBtn.onclick = () => {
        const file = fileInput.files[0];
        if (file) {
            modal.remove();
            onUpload(file);
        } else {
            alert('Please select a CSV file first.');
        }
    };
    
    return modal;
}
