class DownloadTask {
    filePath;//文件在服务器的相对路径
    fileSize;//文件大小
    mimeType;//文件类型
    fileIcon;//文件的html元素
    taskItem;//下载任务的html元素
    curStart;//当前下载的范围起始位置
    curEnd;//当前下载的范围的终止位置
    downloaded;//已下载的总字节数
    lastDownloaded;//上一次请求完成时下载的总字节数
    lastTime;//上次更新下载进度的时间
    startTime;//开始下载时间
    endTime;//结束下载时间
    chunks;//下载的分片
    chunkSize;//分片大小
    speed;//下载速度
    isPaused;//是否暂停的状态量
    speedUpdater;//计算速度的定时器
    static updateSpeedInterval = 250;//更新速度的间隔时间为250ms
    static clearTaskDelay = 5;//下载完成后5s后自动清除任务
    static defaultFileIcon = `<svg t="1722776915312" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12544">
    <path
        d="M842.605714 228.059429L625.371429 10.752A36.278857 36.278857 0 0 0 599.405714 0H109.714286a36.571429 36.571429 0 0 0-36.571429 36.571429v950.857142a36.571429 36.571429 0 0 0 36.571429 36.571429h707.072a36.571429 36.571429 0 0 0 36.571428-36.571429V253.878857a36.425143 36.425143 0 0 0-10.752-25.819428zM609.499429 29.403429l214.381714 214.381714H621.714286a12.214857 12.214857 0 0 1-12.214857-12.141714V29.403429z m207.286857 970.24H109.714286a12.214857 12.214857 0 0 1-12.214857-12.214858V36.571429C97.499429 29.842286 102.985143 24.356571 109.714286 24.356571H585.142857v207.286858a36.571429 36.571429 0 0 0 36.571429 36.571428h207.213714V987.428571a12.214857 12.214857 0 0 1-12.141714 12.214858z"
        p-id="12545"></path>
    </svg>`;
    fetchFileSizeUrl = 'getFileSize';
    getMimeTypeUrl = 'getMimeType';
    downloadChunkUrl = 'RangeDownload';

    /**
     * @param {String} path 文件在服务器的相对路径
     * @param {HTMLElement} fileItem 文件的html元素
     * @param {long} chunkSize 分片大小，默认值为1MB
     */
    constructor(filePath, fileIcon = null, chunkSize = 1024 * 1024) {
        this.filePath = filePath;
        this.fileIcon = fileIcon;
        this.chunkSize = chunkSize;

        //初始化一些参数
        this.fileSize = -1;
        this.mimeType = '';
        this.curStart = 0;
        this.curEnd = 1024 * 1024 - 1;
        this.downloaded = 0;
        this.lastDownloaded = 0;
        this.lastTime = new Date().getTime();
        this.startTime = new Date().getTime();
        this.endTime = null;
        this.chunks = [];
        this.chunkSize = chunkSize;// 1MB
        this.speed = 0;
        this.isPaused = false;
        this.speedUpdater = null;

        this.fetchFileSizeUrl += `?path=${encodeURIComponent(this.filePath)}`;
        this.getMimeTypeUrl += `?path=${encodeURIComponent(this.filePath)}`;
        this.downloadChunkUrl += `?path=${encodeURIComponent(this.filePath)}`;
    }

    /**
     * 获取下载速度，自动调整下载速度的单位
     * @returns 下载速度
     */
    getSpeed() {
        const currentTime = new Date().getTime();//获取当前时间的时间戳，单位ms
        const speed = (currentTime - this.lastTime) > 0 ? (this.downloaded - this.lastDownloaded) / ((currentTime - this.lastTime) / 1000) : 0;
        this.lastDownloaded = this.downloaded;
        this.lastTime = currentTime;

        if (speed > 0) {
            // 根据速度选择合适的单位显示
            let speedUnit = 'B/s';
            let displaySpeed = speed;
            if (speed >= 1024) {
                speedUnit = 'KB/s';
                displaySpeed /= 1024;
            }

            if (displaySpeed >= 1024) {
                speedUnit = 'MB/s';
                displaySpeed /= 1024;
            }

            if (displaySpeed >= 1024) {
                speedUnit = 'GB/s';
                displaySpeed /= 1024;
            }

            // 格式化速度显示为两位小数
            const formattedSpeed = displaySpeed.toFixed(2);

            const speedString = `${formattedSpeed} ${speedUnit} `;
            this.speed = speedString;

            return speedString;
        }

        return '0 B/s';
    }

    /**
     * 获取平均下载速度，自动调整下载速度的单位
     * @returns  平均下载速度
     */
    getAverageSpeed() {
        this.endTime = new Date().getTime();
        const speed = (this.endTime - this.startTime) > 0 ? this.fileSize / ((this.endTime - this.startTime) / 1000) : 0;

        if (speed > 0) {
            // 根据速度选择合适的单位显示
            let speedUnit = 'B/s';
            let displaySpeed = speed;

            if (speed >= 1024) {
                speedUnit = 'KB/s';
                displaySpeed /= 1024;
            }
            if (displaySpeed >= 1024) {
                speedUnit = 'MB/s';
                displaySpeed /= 1024;
            }

            if (displaySpeed >= 1024) {
                speedUnit = 'GB/s';
                displaySpeed /= 1024;
            }

            // 格式化速度显示为两位小数
            const formattedSpeed = displaySpeed.toFixed(2);

            return `${formattedSpeed} ${speedUnit} `;
        }

        return '0 B/s';
    }

    /**
     * 获取已下载的数据大小，自动调整单位
     * @returns 已下载数据大小，包括单位
     */
    getDownloaded() {
        const downloaded = this.downloaded;
        if (downloaded > 0) {
            // 根据数据大小选择合适的单位显示
            let dataUnit = 'B';
            let dataDownloaded = this.downloaded;

            if (dataDownloaded >= 1024) {
                dataUnit = 'KB';
                dataDownloaded /= 1024;
            }

            if (dataDownloaded >= 1024) {
                dataUnit = 'MB';
                dataDownloaded /= 1024;
            }

            if (dataDownloaded >= 1024) {
                dataUnit = 'GB';
                dataDownloaded /= 1024;
            }

            // 格式化速度显示为两位小数
            const formattedDownloaded = dataDownloaded.toFixed(2);

            return `${formattedDownloaded} ${dataUnit} `;
        }

        return '0 B';
    }

    /**
     * 向服务器请求文件大小，单位字节(byte)
     */
    async fetchFileSize() {
        let fetchUrl = this.fetchFileSizeUrl;
        try {
            const response = await fetch(fetchUrl);
            if (response.status === 400)
                throw new Error(`File path '${this.filePath}' is invalid`);
            else if (response.status === 404)
                throw new Error(`File not found or is a directory`);
            else if (response.status === 403)
                throw new Error('File cannot be read');
            else if (response.status === 500)
                throw new Error('Internal server error');
            this.fileSize = parseInt(await response.text(), 10);//文件的字节数，单位byte
        } catch (error) {
            console.error(`Fetch url: ${decodeURIComponent(fetchUrl)}`, error);
        }
    }

    /**
     * 获取文件大小的字符串
     * @returns 文件大小，单位自动调整
     */
    getFileSize() {
        const fileSize = this.fileSize;
        if (fileSize > 0) {
            // 根据数据大小选择合适的单位显示
            let dataUnit = 'B';
            let dataSize = fileSize;

            if (dataSize >= 1024) {
                dataUnit = 'KB';
                dataSize /= 1024;
            }

            if (dataSize >= 1024) {
                dataUnit = 'MB';
                dataSize /= 1024;
            }

            if (dataSize >= 1024) {
                dataUnit = 'GB';
                dataSize /= 1024;
            }

            // 格式化速度显示为两位小数
            const formattedDownloaded = dataSize.toFixed(2);

            return `${formattedDownloaded} ${dataUnit} `;
        }

        return '0 B';
    }

    /**
     * 获取文件的MIMEType
     */
    async getMimeType() {
        let fetchUrl = this.getMimeTypeUrl;
        try {
            const response = await fetch(fetchUrl);
            if (response.status === 400)
                throw new Error(`File path '${this.filePath}' is invalid`);
            else if (response.status === 500)
                throw new Error('Internal server error');
            this.mimeType = await response.text();
        } catch (error) {
            console.error(`Fetch url: ${decodeURIComponent(fetchUrl)}`, error);
        }
    }

    /**
     * 下载start~end范围的数据分片
     * @param {long} start 起始字节 
     * @param {long} end 终止字节
     */
    async downloadChunk(start, end) {
        let fetchUrl = this.downloadChunkUrl;
        try {
            const headers = new Headers();
            headers.append('Range', `bytes = ${start} -${end} `);
            const response = await fetch(fetchUrl, { headers: headers });
            if (response.status === 400)
                throw new Error(`File path '${this.filePath}' is invalid`);
            else if (response.status === 404)
                throw new Error('File not found or is a directory');
            else if (response.status === 403)
                throw new Error('File cannot be read');
            else if (response.status === 500)
                throw new Error('Internal server error');

            const reader = response.body.getReader();

            const readStream = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    this.downloaded += value.byteLength;
                    this.chunks.push(value);
                    updateProgress(this);
                }
            };

            await readStream();
        } catch (error) {
            console.error(`Fetch url: ${decodeURIComponent(fetchUrl)}`, error);
        }
    }

    /**
     * 下载文件，根据文件大小采取不同下载方式：
     * fileSize < 10 MB 直接下载整个文件
     * fiieSize > 10 MB 分片下载
     */
    async downloadFile() {
        let start = 0;
        let end = start + this.chunkSize - 1;

        //如果存在之前的下载，从上次下载位置继续下载
        if (this.curStart != 0) {
            start = this.curStart;
            end = this.curEnd;
        }

        while (start < this.fileSize) {
            this.lastDownloaded = this.downloaded;
            await this.downloadChunk(start, end);
            start += this.chunkSize;
            end = start + this.chunkSize - 1;
            //如果暂停则下载完当前的分片，将下一个分片的范围记录下来
            if (this.isPaused) {
                this.curStart = start;
                this.curEnd = end;
                return;
            }
        }
    }

    /**
     * 暂停下载
     */
    pauseDownload() {
        this.isPaused = true;
    }

    /* 恢复下载 */
    resumeDownload() {
        this.isPaused = false;
        this.downloadFile();
    }

    /* 重新下载 */
    redownload() {
        this.isPaused = false;
    }

    /* 触发下载 */
    async triggerDownload() {
        this.getMimeType();//获取mimeType

        const blob = new Blob(this.chunks, { type: this.mimeType });//合并分片得到完整的二进制数据文件
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = this.filePath.split('/').pop();//获取文件名包括文件后缀名
        document.body.appendChild(a);
        a.click();

        //弹出下载窗口
        window.URL.revokeObjectURL(url);

        //移除下载链接
        document.body.removeChild(a);
    }

    /* 清除下载任务 */
    clearTask() {
        this.pauseDownload();
        if (this.speedUpdater != null) clearInterval(this.speedUpdater);
        this.fileIcon = null;
        this.taskItem = null;
    }
}

//获取cookie中的userID
function getUserIDFromCookies() {
    const cookies = document.cookie.split('; '); // 将cookie分割成单独的键值对
    const userID = cookies.find(cookie => cookie.startsWith('userID=')) // 查找以'userID='开头的cookie
        ?.split('=')[1]; // 如果找到，分割键值对并获取值

    return userID; // 返回userID
}

/**
 * 下载文件
 */
async function download() {
    let fileItem = event.target.closest('.file');
    let fileIcon = fileItem.querySelector('svg').cloneNode(true);
    let filePath = fileItem.getAttribute('file-name');
    task = new DownloadTask(filePath, fileIcon);

    await task.fetchFileSize();//获取文件的大小
    await createDownloadTask(task);//在下载窗口创建下载任务
    if (task.fileSize == -1) {
        let message = `下载文件“${task.filePath}”失败！`;
        downloadError(task, '下载失败，请求文件大小失败！');
        errorPopup(message);
        errorConsoleLog(message);
        return;
    }

    if (task.fileSize < 1024 * 1024 * 10) { // 小于 10MB 直接下载
        task.downloadChunk(0, task.fileSize - 1).then(() => {
            updateProgress(task);
            endDownload(task);
        });
    } else {
        //间隔0.5s计算一次实时下载速度
        task.speedUpdater = setInterval(() => {
            let taskItem = task.taskItem;
            let speedElement = taskItem.querySelector('.speed');
            if (!task.isPaused) {
                speedElement.textContent = `下载中，${task.getSpeed()}`;
            } else {
                speedElement.textContent = `下载中，0 B/s`;
            }
        }, DownloadTask.updateSpeedInterval);
        task.downloadFile();
    }
}

/**
 * 根据任务对象重新进行下载
 * @param {DownloadTask} task 
 */
async function redownload(task) {
    await task.fetchFileSize();//获取文件的大小
    if (task.fileSize == -1) {
        let message = `下载文件“${task.filePath}”失败！`;
        downloadError(task, '下载失败，请求文件大小失败！');
        errorPopup(message);
        errorConsoleLog(message);
        return;
    }

    if (task.fileSize < 1024 * 1024 * 10) { // 小于 10MB 直接下载
        task.downloadChunk(0, task.fileSize - 1).then(() => {
            updateProgress(task);
            endDownload(task);
        });
    } else {
        task.downloadFile();
    }
}

/* 创建下载任务 */
var taskContent = document.getElementById('task-content');
async function createDownloadTask(task) {
    if (task == null) return;

    //将下载任务添加到下载窗口
    let htmlContent = `<li class="task-item" file-path="${task.filePath}">
                    <div class="task-info">
                        <div class="file-info">
                            <div class="file-icon"></div>
                            <div class="file-name">${task.filePath}</div>
                        </div>
                        <div class="download-info">
                            <div class="speed">正在准备下载</div>
                            <div class="data-downloaded">
                                <span class="downloaded">0 MB</span>
                                <span class="total"> / ${await task.getFileSize()}</span>
                            </div>
                        </div>
                        <div class="progress">
                            <div class="progress-bar" value="0%"></div>
                            <div class="progress-value">0%</div>
                        </div>
                    </div>
                    <div class="cancel-download">
                        <svg t="1722312828466" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                            p-id="5109">
                            <path
                                d="M544.244622 512.068267l280.712533 280.689778c8.897422 8.874667 8.897422 23.278933 0 32.176356s-23.278933 8.897422-32.176356 0L512.068267 544.267378 232.516267 823.819378c-8.874667 8.874667-23.233422 8.874667-32.085333 0-8.851911-8.851911-8.851911-23.210667 0-32.062578l279.574756-279.574756L199.042844 231.2192c-8.897422-8.897422-8.897422-23.301689 0-32.176356 8.874667-8.897422 23.278933-8.897422 32.176356 0l280.962844 280.962844L792.189156 199.998578c8.851911-8.851911 23.210667-8.851911 32.039822 0 8.874667 8.851911 8.874667 23.233422 0 32.085333L544.244622 512.068267z"
                                p-id="5110"></path>
                        </svg>
                    </div>
                    <div class="task-control">
                        <div class="task-button pause-download">
                            <svg t="1722312871348" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="6107">
                                <path
                                    d="M512 1024C228.266667 1024 0 795.733333 0 512S228.266667 0 512 0s512 228.266667 512 512-228.266667 512-512 512z m0-42.666667c260.266667 0 469.333333-209.066667 469.333333-469.333333S772.266667 42.666667 512 42.666667 42.666667 251.733333 42.666667 512s209.066667 469.333333 469.333333 469.333333z m-106.666667-682.666666c12.8 0 21.333333 8.533333 21.333334 21.333333v384c0 12.8-8.533333 21.333333-21.333334 21.333333s-21.333333-8.533333-21.333333-21.333333V320c0-12.8 8.533333-21.333333 21.333333-21.333333z m213.333334 0c12.8 0 21.333333 8.533333 21.333333 21.333333v384c0 12.8-8.533333 21.333333-21.333333 21.333333s-21.333333-8.533333-21.333334-21.333333V320c0-12.8 8.533333-21.333333 21.333334-21.333333z"
                                    p-id="6108"></path>
                            </svg>
                        </div>
                        <div class="task-button resume-download">
                            <svg t="1722429195333" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="8326">
                                <path
                                    d="M850.944 171.52C759.808 80.384 638.976 30.72 509.952 30.72c-129.024 0-249.856 49.664-340.48 140.8C78.848 262.144 28.672 382.976 28.672 512c0 129.024 49.664 249.856 140.8 340.48C260.096 943.616 380.928 993.28 509.952 993.28c129.024 0 249.856-49.664 340.48-140.8 90.624-90.624 140.8-211.456 140.8-340.48 0-129.024-49.664-249.856-140.288-340.48z m-340.992 773.12c-238.592 0-432.64-194.048-432.64-432.64S271.36 79.36 509.952 79.36s432.64 194.048 432.64 432.64-194.048 432.64-432.64 432.64z"
                                    p-id="8327"></path>
                                <path
                                    d="M698.368 453.12l-230.4-150.016c-17.408-11.776-39.424-12.8-57.856-3.072-21.504 12.8-34.304 36.864-33.28 61.952v300.032c-1.024 25.088 12.288 48.64 33.792 61.44 8.192 4.608 17.408 6.656 26.624 6.656 11.264 0 22.528-3.584 32.256-10.24l227.84-150.016c19.968-13.312 31.744-35.84 31.232-59.392 0.512-22.528-11.264-44.544-30.208-57.344z m-19.456 57.856c0.512 7.168-3.072 13.824-8.704 17.92l-227.84 150.016c-4.096 2.56-6.656 2.048-8.192 1.024-5.632-4.096-8.704-11.264-7.68-17.92V361.472c-0.512-7.168 2.048-13.824 7.68-18.432 1.024-0.512 1.536-0.512 2.56-0.512 2.048 0 3.584 1.024 5.12 2.048l229.888 150.016c4.608 3.584 7.68 9.728 7.168 16.384z"
                                    p-id="8328"></path>
                            </svg>
                        </div>
                        <div class="task-button redownload">
                            <svg t="1722937913331" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="38284">
                                <path
                                    d="M924.869259 506.747369c-10.290367 0-18.637476 8.346085-18.637476 18.637476 0 53.576219-10.488889 105.542778-31.172977 154.449651-19.989263 47.246047-48.599881 89.687672-85.049025 126.133745-36.44505 36.450167-78.885652 65.063855-126.132722 85.048001-48.910966 20.684088-100.873432 31.174-154.450674 31.174s-105.538685-10.489912-154.449651-31.174c-47.248094-19.984147-89.683579-48.598858-126.133745-85.048001-36.44505-36.446074-65.060785-78.887698-85.043908-126.133745-20.684088-48.90585-31.174-100.872409-31.174-154.449651s10.489912-105.539708 31.174-154.445558c19.983123-47.251164 48.598858-89.687672 85.043908-126.136815 36.450167-36.446074 78.885652-65.060785 126.133745-85.044932 48.910966-20.684088 100.872409-31.174 154.449651-31.174 82.028225 0 161.630191 25.391297 228.114394 72.127737l-96.912214 16.32992c-10.151197 1.709945-16.996093 11.325953-15.282055 21.476127 1.531889 9.101285 9.42158 15.544021 18.356067 15.544021 1.026376 0 2.070148-0.086981 3.119037-0.26299l140.05378-23.601534c10.146081-1.708921 16.990976-11.325953 15.281031-21.475104L780.411169 79.676667c-1.707898-10.151197-11.325953-16.990976-21.476127-15.283078-10.149151 1.709945-16.989953 11.326976-15.282055 21.476127l14.057157 83.435271C685.23039 118.744451 598.634126 91.304496 509.426385 91.304496c-58.59042 0-115.440196 11.479449-168.971389 34.122145-51.691289 21.864984-98.111528 53.160757-137.969305 93.019557-39.859823 39.854707-71.155597 86.279039-93.019557 137.969305-22.638603 53.527101-34.118052 110.3779-34.118052 168.968319s11.479449 115.440196 34.121122 168.971389c21.86089 51.691289 53.156664 98.111528 93.016487 137.969305 39.8588 39.859823 86.279039 71.155597 137.974421 93.019557 53.527101 22.642696 110.376876 34.122145 168.967296 34.122145 58.59042 0 115.440196-11.479449 168.971389-34.122145 51.692313-21.86396 98.111528-53.159734 137.970328-93.019557 39.8588-39.8588 71.154573-86.279039 93.019557-137.969305 22.641673-53.531194 34.121122-110.38097 34.121122-168.971389C943.509804 515.089361 935.162696 506.747369 924.869259 506.747369L924.869259 506.747369zM924.869259 506.747369"
                                    p-id="38285"></path>
                            </svg>
                        </div>
                    </div>
                </li>`;
    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlContent, 'text/html');
    let taskItem = doc.querySelector('.task-item');
    let fileIcon = taskItem.querySelector('.file-icon');
    if (task.fileIcon != null)
        fileIcon.appendChild(task.fileIcon);
    else
        fileIcon.innerHTML = DownloadTask.defaultFileIcon;
    taskContent.appendChild(taskItem);
    task.taskItem = taskItem;

    //为取消下载按钮、暂停下载按钮、恢复下载按钮、重新下载按钮添加监听
    taskItem.querySelector('.cancel-download').addEventListener('click', () => {
        task.pauseDownload();//暂停下载
        clearInterval(task.speedUpdater);//清除速度更新器
        task.taskItem.remove();//从DOM中移除任务
        task = null;
    });

    let pauseDownloadButton = taskItem.querySelector('.pause-download');
    pauseDownloadButton.addEventListener('click', () => {
        task.pauseDownload();//暂停下载
        taskItem.classList.add('task-paused');
        taskItem.querySelector('.speed').textContent = '暂停中';

        //将暂停按钮切换到恢复按钮
        pauseDownloadButton.style.display = 'none';
        pauseDownloadButton.nextElementSibling.style.display = 'flex';
    });

    let resumeDownloadButton = taskItem.querySelector('.resume-download');
    resumeDownloadButton.addEventListener('click', () => {
        task.resumeDownload();//恢复下载
        taskItem.classList.remove('task-paused');

        //将暂停按钮切换到恢复按钮
        resumeDownloadButton.style.display = 'none';
        resumeDownloadButton.previousElementSibling.style.display = 'flex';
    });

    let redownloadButton = taskItem.querySelector('.redownload');
    redownloadButton.addEventListener('click', () => {
        task.startTime = new Date.getTime();//更新开始下载时间
        task.chunks = [];//清空分片
        redownload(task);//重新下载
    });

    //进度条达到100%时触发下载
    const progressValue = taskItem.querySelector('.progress-bar');

    const config = {
        attributes: true, // 观察属性的变化
        attributeFilter: ['value'], // 只观察value属性
        subtree: true,
        childList: true
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                if (mutation.target.getAttribute('value') === '100.00%') {
                    observer.disconnect(); // 断开观察
                    endDownload(task); // 结束下载
                    task.triggerDownload(); // 触发文件下载
                }
            }
        });
    });

    // 确保.progress-value元素有value属性
    if (progressValue.hasAttribute('value')) {
        observer.observe(progressValue, config);
    }
}

/* 更新下载进度 */
async function updateProgress(task) {
    loaded = task.downloaded;
    total = task.fileSize;
    const progress = (loaded / total) * 100;

    let taskItem = task.taskItem;

    //更新进度条和已下载的数据大小
    let downloadedElement = taskItem.querySelector('.downloaded');
    let progressBarElement = taskItem.querySelector('.progress-bar');
    let progressValueElement = taskItem.querySelector('.progress-value');

    downloadedElement.textContent = task.getDownloaded();
    progressBarElement.style.width = `${progress.toFixed(2)}%`;
    progressBarElement.setAttribute('value', `${progress.toFixed(2)}%`);
    progressValueElement.textContent = `${progress.toFixed(2)}%`;
}

/* 结束下载任务 */
function endDownload(task) {
    if (task == null) return;
    if (task.speedUpdater != null) clearInterval(task.speedUpdater);
    let taskItem = task.taskItem;
    let speedElement = taskItem.querySelector('.speed');
    let averageSpeed = task.getAverageSpeed();
    speedElement.textContent = `下载完成，平均速度${averageSpeed}, 5秒后将自动删除任务。`;

    //消息提示
    let message = `下载文件"${task.filePath}"成功！`;
    InfoPopup(message);
    infoConsoleLog(message);

    //任务自动删除
    let timeLeft = DownloadTask.clearTaskDelay; // 初始剩余时间
    const interval = setInterval(() => {
        speedElement.textContent = `下载完成，平均速度${averageSpeed}, ${timeLeft}秒后自动删除任务。`;
        timeLeft--;

        if (timeLeft < 0) {
            setTimeout(() => {
                clearInterval(interval);
                if (taskItem != null) taskItem.remove(); // 清除任务项
                task = null;
            }, 1000);
        }
    }, 1000);
}

//下载出错
function downloadError(task, error) {
    task.pauseDownload();
    let taskItem = task.taskItem;
    taskItem.querySelector('.pause-download').style.display = 'none';
    taskItem.querySelector('.redownload').style.display = 'flex';
    taskItem.querySelector('.speed').textContent = error;//显示错误信息
}

//自定义错误的控制台记录
function errorConsoleLog(message) {
    let errorLogCss = "color: white; background-color: rgba(255, 120, 120, 1); padding: 4px 10px; border-radius: 4px; font-weight: bold;"
    console.log(`%c${message}`, errorLogCss);
}

//自定义信息的控制台记录
function infoConsoleLog(message) {
    let infoLogCss = "background-color: rgba(80,200,120,1); color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold;";
    console.log(`%c${message}`, infoLogCss);
}

// 弹出弹窗
async function popup(msgPopup) {
    msgPopup.classList.add('show');
    setTimeout(function () {
        msgPopup.classList.add('hide');
        setTimeout(() => {
            msgPopup.remove();//移除弹窗
        }, 2000);//两秒后移除弹窗
    }, 3000);
}

//信息弹窗
async function InfoPopup(message) {
    var popupDiv = document.createElement('div');
    popupDiv.classList.add('pop-up');
    popupDiv.innerHTML = `<svg t="1718616163146" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="8873">
            <path d="M0 0h1024v1024H0V0z" fill="#202425" opacity=".01" p-id="8874"></path>
            <path
                d="M955.733333 512c0 245.077333-198.656 443.733333-443.733333 443.733333S68.266667 757.077333 68.266667 512 266.922667 68.266667 512 68.266667s443.733333 198.656 443.733333 443.733333z"
                fill="#11AA66" p-id="8875"></path>
            <path
                d="M512 102.4C285.7984 102.4 102.4 285.7984 102.4 512s183.3984 409.6 409.6 409.6 409.6-183.3984 409.6-409.6S738.2016 102.4 512 102.4zM34.133333 512C34.133333 248.081067 248.081067 34.133333 512 34.133333s477.866667 213.947733 477.866667 477.866667-213.947733 477.866667-477.866667 477.866667S34.133333 775.918933 34.133333 512z"
                fill="#11AA66" p-id="8876"></path>
            <path
                d="M512 204.8a68.266667 68.266667 0 0 1 68.266667 68.266667v17.066666a68.266667 68.266667 0 1 1-136.533334 0V273.066667a68.266667 68.266667 0 0 1 68.266667-68.266667z m0 204.8a68.266667 68.266667 0 0 1 68.266667 68.266667v273.066666a68.266667 68.266667 0 1 1-136.533334 0v-273.066666a68.266667 68.266667 0 0 1 68.266667-68.266667z"
                fill="#FFFFFF" p-id="8877"></path>
        </svg>
        <div class="pop-up-info">${message}</div>`;
    document.body.appendChild(popupDiv); // 添加到body元素

    popup(popupDiv);
}

//异常错误弹窗
function errorPopup(message) {
    var popupDiv = document.createElement('div');
    popupDiv.classList.add('pop-up');
    popupDiv.innerHTML = `<svg t="1718545187783" class="pop-up-icon" viewBox="0 0 1024 1024" version="1.1"
            xmlns="http://www.w3.org/2000/svg" p-id="12558" width="1vw" height="1vw">
            <path
                d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0zM593.066667 145.066667l-21.333333 486.4c0 29.866667-25.6 51.2-55.466667 51.2l-12.8 0c-29.866667 0-51.2-21.333333-55.466667-51.2L426.666667 145.066667c0-29.866667 21.333333-51.2 46.933333-51.2l68.266667 0C571.733333 93.866667 597.333333 115.2 593.066667 145.066667zM571.733333 913.066667C554.666667 930.133333 533.333333 938.666667 512 938.666667c-25.6 0-42.666667-8.533333-59.733333-25.6C435.2 896 426.666667 878.933333 426.666667 853.333333c0-25.6 8.533333-42.666667 25.6-59.733333C469.333333 776.533333 486.4 768 512 768c25.6 0 46.933333 8.533333 64 25.6 17.066667 17.066667 25.6 34.133333 25.6 59.733333C597.333333 878.933333 588.8 900.266667 571.733333 913.066667z"
                fill="#F7411C" p-id="12559"></path>
        </svg>
        <div class="pop-up-info">${message}</div>`;
    document.body.appendChild(popupDiv); // 添加到body元素

    popup(popupDiv);
}

/* ======== 单元测试 ======== */
async function fetchFileSizeTest(filePath) {
    const task = new DownloadTask(filePath);
    await task.fetchFileSize().then(() => {
        if (task.fileSize)
            console.log(`file path: ${task.filePath}, file size: ${task.fileSize} byte`);
    });
}

async function downloadChunkTest(filePath) {
    const task = new DownloadTask(filePath);
    await task.downloadChunk(0, task.chunkSize - 1);
}

async function getMimeTypeTest(filePath) {
    const task = new DownloadTask(filePath);
    await task.getMimeType().then(() => {
        if (task.mimeType)
            console.log(`file path: ${task.filePath}, MIMEType: ${task.mimeType}`);
    });
}

function test() {
    fetchFileSizeTest(''); // 400 bad request
    fetchFileSizeTest('video/start'); // 404 not found
    fetchFileSizeTest('../'); // 500 internal server error
    fetchFileSizeTest('video/start.mp4');//200
    downloadChunkTest('');//400 bad request
    downloadChunkTest('video/start');//404 not found
    downloadChunkTest('../');//500 internal server error
    getMimeTypeTest('');//400 bad request
    getMimeTypeTest('../');//500 internal server error
    getMimeTypeTest('video/start.mp4');//200
    getMimeTypeTest('file-docx.docx');//200
    getMimeTypeTest('file-pdf.pdf');//200
    getMimeTypeTest('file-jpg.jpg');//200
    getMimeTypeTest('file-m3u8.m3u8');//200
    getMimeTypeTest('file-java.java');//200
}