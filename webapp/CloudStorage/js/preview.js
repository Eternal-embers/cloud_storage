class PreviewTask {
    id;//预览任务的id
    filePath;//文件在服务器的相对路径
    fileName;//文件名称
    type;//文件类型
    fileItem;//类名为file的HTML元素元素
    previewItem;//预览任务菜单栏中的预览项元素
    previewWindow;//预览窗口元素
    getPreviewTypeUrl = 'getPreviewType';
    getPreviewContentUrl = 'getPreviewContent';
    static nextID = 0;//下一个ID
    static defaultFileIcon = `<svg t="1722776915312" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12544">
    <path
        d="M842.605714 228.059429L625.371429 10.752A36.278857 36.278857 0 0 0 599.405714 0H109.714286a36.571429 36.571429 0 0 0-36.571429 36.571429v950.857142a36.571429 36.571429 0 0 0 36.571429 36.571429h707.072a36.571429 36.571429 0 0 0 36.571428-36.571429V253.878857a36.425143 36.425143 0 0 0-10.752-25.819428zM609.499429 29.403429l214.381714 214.381714H621.714286a12.214857 12.214857 0 0 1-12.214857-12.141714V29.403429z m207.286857 970.24H109.714286a12.214857 12.214857 0 0 1-12.214857-12.214858V36.571429C97.499429 29.842286 102.985143 24.356571 109.714286 24.356571H585.142857v207.286858a36.571429 36.571429 0 0 0 36.571429 36.571428h207.213714V987.428571a12.214857 12.214857 0 0 1-12.141714 12.214858z"
        p-id="12545"></path>
    </svg>`;

    /**
     * 
     * @param {HTMLElement} fileItem 
     */
    constructor(fileItem = null) {
        this.id = PreviewTask.nextID;
        this.fileItem = fileItem;
        this.filePath = fileItem.getAttribute('file-path');
        this.fileName = this.filePath.split(/[\\\/]/).pop();
        this.getPreviewTypeUrl += `?path=${encodeURIComponent(this.filePath)}`;
        this.getPreviewContentUrl += `?path=${encodeURIComponent(this.filePath)}`;

        PreviewTask.nextID++;
    }

    /**
     *  获取预览类型
     */
    async getPreviewType() {
        let fetchUrl = this.getPreviewTypeUrl;
        try {
            const response = await fetch(fetchUrl);
            if (response.status === 200) {
                this.type = await response.text();
                this.getPreviewContentUrl += `&type=${this.type}`;
            }
        } catch (error) {
            console.error(`Fetch url: ${decodeURIComponent(fetchUrl)}`, error);
        }
    }

    /**
     * 删除预览任务
    */
    removePreviewTask() {
        this.previewItem.remove();
        this.previewWindow.remove();
    }
}

/**
 * 创建预览任务
 */
const previewContent = document.querySelector('.preview-content');
async function createPreviewTask(fileItem) {
    let task = new PreviewTask(fileItem);
    await task.getPreviewType();

    let fileIcon = fileItem.querySelector('svg').cloneNode(true);
    if (fileIcon == null) fileIcon = PreviewTask.defaultFileIcon;
    let htmlContent = `<div class="preview-item active" preview-id="${task.id}">
        <div class="file-icon">${fileIcon.outerHTML}</div>
        <div class="file-name">${task.fileName}</div>
        <div class="preview-close">
            <svg t="1722312828466" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                p-id="5109">
                <path
                    d="M544.244622 512.068267l280.712533 280.689778c8.897422 8.874667 8.897422 23.278933 0 32.176356s-23.278933 8.897422-32.176356 0L512.068267 544.267378 232.516267 823.819378c-8.874667 8.874667-23.233422 8.874667-32.085333 0-8.851911-8.851911-8.851911-23.210667 0-32.062578l279.574756-279.574756L199.042844 231.2192c-8.897422-8.897422-8.897422-23.301689 0-32.176356 8.874667-8.897422 23.278933-8.897422 32.176356 0l280.962844 280.962844L792.189156 199.998578c8.851911-8.851911 23.210667-8.851911 32.039822 0 8.874667 8.851911 8.874667 23.233422 0 32.085333L544.244622 512.068267z"
                    p-id="5110"></path>
            </svg>
        </div>
    </div>`;
    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlContent, 'text/html');
    let previewItem = doc.querySelector('.preview-item');
    previewContent.append(previewItem);
    task.previewItem = previewItem;
    console.log(task.previewItem);

    return task;
}

async function preview(fileItem) {
    console.log(fileItem);
    let task = await createPreviewTask(fileItem);

    let response = await fetch(task.getPreviewContentUrl);
    let previewContent = "";
    if (response.status === 200) {
        previewContent = await response.text();
    } else {
        //...
        return;
    }

    let fileIcon = task.fileItem.querySelector('svg').cloneNode(true);
    let htmlContent = `<div class="preview-window txt-preview">
        <div class="window-header">
            <div class="preview-title">
                ${fileIcon.outerHTML}
                <div class="title">${task.fileName}</div>
            </div>
            <div class="window-minimize" onclick="minimizePreview(event)">
                <svg t="1723118210170" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                    p-id="38759">
                    <path
                        d="M896 540.444444H128v-56.888888h768v56.888888z m28.444444-28.444444q0 2.844444-0.568888 5.575111t-1.592889 5.290667q-1.080889 2.616889-2.616889 4.949333-1.592889 2.275556-3.527111 4.323556-1.991111 1.934222-4.323556 3.527111-2.332444 1.536-4.949333 2.616889-2.56 1.080889-5.347556 1.592889-2.730667 0.568889-5.518222 0.568888-2.844444 0-5.575111-0.568888t-5.290667-1.592889q-2.616889-1.080889-4.949333-2.616889-2.275556-1.592889-4.323556-3.527111-1.934222-1.991111-3.527111-4.323556-1.536-2.332444-2.616889-4.949333-1.080889-2.56-1.592889-5.290667-0.568889-2.787556-0.568888-5.575111 0-2.844444 0.568888-5.575111t1.592889-5.290667q1.080889-2.616889 2.616889-4.949333 1.592889-2.275556 3.527111-4.323556 1.991111-1.934222 4.323556-3.527111 2.332444-1.536 4.949333-2.616889 2.56-1.080889 5.347556-1.592889 2.730667-0.568889 5.518222-0.568888 2.844444 0 5.575111 0.568888t5.290667 1.592889q2.616889 1.080889 4.949333 2.616889 2.275556 1.592889 4.323556 3.527111 1.934222 1.991111 3.527111 4.323556 1.536 2.332444 2.616889 4.949333 1.080889 2.56 1.592889 5.290667 0.568889 2.787556 0.568888 5.575111zM156.444444 512q0 2.844444-0.568888 5.575111t-1.592889 5.290667q-1.080889 2.616889-2.616889 4.949333-1.592889 2.275556-3.527111 4.323556-1.991111 1.934222-4.323556 3.527111-2.332444 1.536-4.949333 2.616889-2.56 1.080889-5.290667 1.592889-2.787556 0.568889-5.575111 0.568888-2.844444 0-5.575111-0.568888t-5.290667-1.592889q-2.616889-1.080889-4.949333-2.616889-2.275556-1.592889-4.323556-3.527111-1.934222-1.991111-3.527111-4.323556-1.536-2.332444-2.616889-4.949333-1.080889-2.56-1.592889-5.290667-0.568889-2.787556-0.568888-5.575111 0-2.844444 0.568888-5.575111t1.592889-5.290667q1.080889-2.616889 2.616889-4.949333 1.592889-2.275556 3.527111-4.323556 1.991111-1.934222 4.323556-3.527111 2.332444-1.536 4.949333-2.616889 2.56-1.080889 5.290667-1.592889 2.787556-0.568889 5.575111-0.568888 2.844444 0 5.575111 0.568888t5.290667 1.592889q2.616889 1.080889 4.949333 2.616889 2.275556 1.592889 4.323556 3.527111 1.934222 1.991111 3.527111 4.323556 1.536 2.332444 2.616889 4.949333 1.080889 2.56 1.592889 5.290667 0.568889 2.787556 0.568888 5.575111z"
                        p-id="38760"></path>
                </svg>
            </div>
            <div class="window-close" onclick="closePreview(event)">
                <svg t="1722312828466" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                    p-id="5109">
                    <path
                        d="M544.244622 512.068267l280.712533 280.689778c8.897422 8.874667 8.897422 23.278933 0 32.176356s-23.278933 8.897422-32.176356 0L512.068267 544.267378 232.516267 823.819378c-8.874667 8.874667-23.233422 8.874667-32.085333 0-8.851911-8.851911-8.851911-23.210667 0-32.062578l279.574756-279.574756L199.042844 231.2192c-8.897422-8.897422-8.897422-23.301689 0-32.176356 8.874667-8.897422 23.278933-8.897422 32.176356 0l280.962844 280.962844L792.189156 199.998578c8.851911-8.851911 23.210667-8.851911 32.039822 0 8.874667 8.851911 8.874667 23.233422 0 32.085333L544.244622 512.068267z"
                        p-id="5110"></path>
                </svg>
            </div>
        </div>
        ${previewContent}
    </div>`;

    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlContent, 'text/html');
    let previewWindow = doc.querySelector('.preview-window');
    console.log(previewWindow);
    const preview = document.getElementById('preview');
    console.log(preview);
    preview.append(previewWindow);
    task.previewWindow = previewWindow;
}