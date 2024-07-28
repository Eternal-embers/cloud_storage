class downloadTask {
    filePath;//文件在服务器的相对路径
    fileSize;//文件大小
    mimeType;//文件类型
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
    getFileSizeUrl = 'getFileSize';
    getMimeTypeUrl = 'getMimeType';
    downloadChunkUrl = 'RangeDownload';

    /**
     * @param {String} path 文件在服务器的相对路径
     * @param {long} chunkSize 分片大小
     */
    constructor(filePath, chunkSize = 1024 * 1024) {
        this.filePath = filePath;
        this.chunkSize = chunkSize;

        //初始化一些参数
        this.curStart = 0;
        this.curEnd = 1024 * 1024 - 1;
        this.downloaded = 0;
        this.receivedLength = 0;
        this.lastDownloaded = 0;
        this.lastTime = new Date().getTime();
        this.startTime = new Date().getTime();
        this.endTime = null;
        this.chunks = [];
        this.chunkSize = chunkSize;// 1MB
        this.speed = 0;
        this.isPaused = false;

        this.getFileSizeUrl += `?path=${encodeURIComponent(this.filePath)}`;
        this.getMimeTypeUrl += `?path=${encodeURIComponent(this.filePath)}`;
        this.downloadChunkUrl += `?path=${encodeURIComponent(this.filePath)}`;
    }

    /* 获取下载速度 */
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
                displaySpeed = speed / 1024;
            }
            if (displaySpeed >= 1024) {
                speedUnit = 'MB/s';
                displaySpeed /= 1024;
            }

            if (displaySpeed >= 1024 * 1024) {
                speedUnit = 'GB/s';
                displaySpeed /= 1024 * 1024;
            }

            // 格式化速度显示为两位小数
            const formattedSpeed = displaySpeed.toFixed(2);

            const speedString = `${formattedSpeed} ${speedUnit} `;
            this.speed = speedString;

            return speedString;
        }
    }

    /* 获取平均下载速度 */
    getAverageSpeed() {
        this.endTime = new Date().getTime();
        const speed = (this.endTime - this.startTime) > 0 ? this.fileSize / ((this.endTime - this.startTime) / 1000) : 0;

        if (speed > 0) {
            // 根据速度选择合适的单位显示
            let speedUnit = 'B/s';
            let displaySpeed = speed;
            if (speed >= 1024) {
                speedUnit = 'KB/s';
                displaySpeed = speed / 1024;
            }
            if (displaySpeed >= 1024) {
                speedUnit = 'MB/s';
                displaySpeed /= 1024;
            }

            if (displaySpeed >= 1024 * 1024) {
                speedUnit = 'GB/s';
                displaySpeed /= 1024 * 1024;
            }

            // 格式化速度显示为两位小数
            const formattedSpeed = displaySpeed.toFixed(2);

            return `${formattedSpeed} ${speedUnit} `;
        }

        return '0 B/s';
    }

    /* 获取文件大小 */
    async getFileSize() {
        try {
            const response = await fetch(this.getFileSizeUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            this.fileSize = parseInt(await response.text(), 10);//文件的字节数，单位byte
        } catch (error) {
            console.error('Error:', error);
        }
    }

    /* 下载文件 */
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

    /* 下载分片 */
    async downloadChunk(start, end) {
        try {
            const headers = new Headers();
            headers.append('Range', `bytes = ${start} -${end} `);
            const response = await fetch(this.downloadChunkUrl, { headers: headers });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body.getReader();

            const readStream = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    this.downloaded += value.byteLength;
                    this.chunks.push(value);
                    updateProgress(this.downloaded, this.fileSize);
                }
            };

            await readStream();
        } catch (error) {
            console.error('Download error:', error);
        }
    }

    /* 暂停下载 */
    pauseDownload() {
        this.isPaused = true;
    }

    /* 恢复下载 */
    resumeDownload() {
        this.isPaused = false;
    }

    /* 触发下载 */
    async triggerDownload() {
        const response = await fetch(this.getMimeTypeUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        this.mimeType = await response.text();

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
}

/* 创建下载任务 */
var task = null;
async function createDownloadTask(filePath) {
    task = new downloadTask(filePath);
    await task.getFileSize();
    if (task.fileSize < 1024 * 1024 * 10) { // 小于 10MB 直接下载
        task.downloadChunk(0, task.fileSize - 1).then(() => {
            task.triggerDownload();
        });
    } else {
        //间隔0.5s计算一次实时下载速度
        task.speedUpdater = setInterval(() => {
            task.getSpeed();
            document.getElementById('downloadSpeed').textContent = task.speed;
        }, downloadTask.updateSpeedInterval);
        task.downloadFile().then(() => {
            task.triggerDownload();
        });
    }
}

/* 更新下载进度 */
function updateProgress(loaded, total) {
    const progress = (loaded / total) * 100;
    downloaded = loaded;
    document.getElementById('progress').style.width = `${progress.toFixed(2)}% `;
    document.getElementById('progress').setAttribute('value', `${progress.toFixed(2)}% `);
    document.getElementById('downloadStatus').textContent = `Downloading... ${progress.toFixed(2)}% `;
}

const progressElement = document.getElementById('progress');

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'value') {
            const currentValue = mutation.target.getAttribute('value');
            if (currentValue === '100.00%') {
                console.log('Progress reached 100%');
                observer.disconnect(); // 断开观察
                clearInterval(task.speedUpdater);
                task.triggerDownload();
                document.getElementById('averageSpeed').textContent = task.getAverageSpeed();
            }
        }
    });
});

// 配置MutationObserver选项
const config = { attributes: true, attributeFilter: ['value'] };
observer.observe(progressElement, config);

let downloadButton = document.getElementById('downloadButton');
let pauseButton = document.getElementById('pauseButton');
let resumeButton = document.getElementById('resumeButton');
let cancelButton = document.getElementById('cancelButton');

pauseButton.disabled = true;
resumeButton.disabled = true;
cancelButton.disabled = true;

//下载
downloadButton.addEventListener('click', () => {
    pauseButton.disabled = false;
    cancelButton.disabled = false;
    createDownloadTask('video/start.mp4');
});

// 暂停下载
pauseButton.addEventListener('click', () => {
    task.pauseDownload();
    console.log(`${task.curStart}, ${task.curEnd} `);
    pauseButton.disabled = true;
    resumeButton.disabled = false;
});

// 恢复下载
resumeButton.addEventListener('click', () => {
    task.resumeDownload();
    pauseButton.disabled = false;
    resumeButton.disabled = true;
    task.downloadFile();//继续下载
});