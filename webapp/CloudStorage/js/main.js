//打开用户页面
let user = document.querySelector('.user');
let mask = document.querySelector('.mask');
let user_profile = document.querySelector('.user-profile');

user.addEventListener('click', function () {
    mask.style.display = 'block';
    user_profile.classList.toggle('slide');
    document.body.style.overflowY = 'hidden';
});

mask.addEventListener('click', function () {
    mask.style.display = 'none';
    user_profile.classList.toggle('slide');
    document.body.style.overflowY = 'auto';
})

/* ================ 搜索框 ================ */
let search_input = document.getElementById('search-input');
let search_clear = document.querySelector('.search-clear');

search_input.addEventListener('input', function () {
    if (search_input.value.trim() !== '')
        search_clear.style.display = 'block';
    else
        search_clear.style.display = 'none';

});

search_input.addEventListener('blur', function () {
    if (search_input.value.trim() === '') {
        search_clear.style.display = 'none';
    }
});

search_clear.addEventListener('click', function () {
    search_input.value = "";
    search_clear.style.display = 'none';
});

/* ================ 头像上传 ================ */
document.getElementById('avatar-input').addEventListener('change', function (event) {
    var file = event.target.files[0]; // 获取选择的文件

    var MAX_FILE_SIZE = 10 * 1024 * 1024; // 限制大小，例如 10MB

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
        warningPopup("上传无效，文件大小不能超过 " + MAX_FILE_SIZE / 1024 / 1024 + "MB.");
        return; // 终止函数执行，不上传大文件
    }

    var formData = new FormData(); // 创建 FormData 对象

    // 检查文件是否存在
    if (file) {
        // 给 FormData 对象添加文件
        formData.append('avatar', file);

        // 使用 XMLHttpRequest 发送 AJAX 请求
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'uploadAvatar', true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                location.reload(); // 刷新页面
            }
            else if (xhr.status === 400) {
                errorPopup('上传失败，请检查文件类型是否为图片类型.');
            }
            else if (xhr.status === 401) {
                warningPopup('登录已过期，请重新登录.');
                setTimeout(() => {
                    location.href = 'login.html'; // 直接跳转到指定的URL
                }, 2000);//两秒后跳转到登录页面
            } else if (xhr.status === 500) {
                errorPopup('内部服务器错误！');
            }
        };

        xhr.onerror = function () {
            console.error('Network Error: Something went wrong with the request.');
        };

        xhr.ontimeout = function () {
            // 请求超时
            warningPopup('请求超时');
        };

        xhr.send(formData); // 发送请求
    }
});

document.querySelector('.change-password').addEventListener('click', function () {
    //打开reset.html页面
    window.open('reset.html', '_self');
});

/* ================ 文件上传的组件切换 ================ */
document.addEventListener('DOMContentLoaded', function () {
    let filesContent = document.querySelector('.files-content');//获取文件列表块
    let ignoreFilesInput = document.getElementById('ignore-files');//忽略的文件的索引
    let ignoreFiles = []; // 存储需要忽略的文件的索引
    document.getElementById('select').addEventListener('change', function (event) {
        let files = event.target.files;

        if (files.length == 0) return;//未选择文件

        document.getElementById('select').style.display = 'none'; //隐藏上传组件
        document.getElementById('submit').style.display = 'block';//显示提交组件

        filesContent.innerHTML = '';//清空文件列表

        let deleteSvg = `<svg t="1721363268007" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11631"><path d="M851.416 217.84l-45.256-45.248L512 466.744l-294.152-294.16-45.256 45.256L466.744 512l-294.152 294.16 45.248 45.256L512 557.256l294.16 294.16 45.256-45.256L557.256 512z" p-id="11632"></path></svg>`;

        for (var i = 0; i < files.length; i++) {
            let fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `<div class="file-name">${files[i].name}</div><div class="file-delete" data-index="${i}">${deleteSvg}</div>`;
            filesContent.appendChild(fileItem);

            //添加删除文件项的监听
            fileItem.querySelector('.file-delete').addEventListener('click', function () {
                let fileItem = this.closest('.file-item');
                let index = parseInt(this.dataset.index, 10); // 获取文件索引
                if (fileItem) {
                    //将文件索引添加到忽略列表
                    ignoreFiles.push(index);

                    ignoreFilesInput.value = ignoreFiles.join(' ');

                    // 从DOM中移除对应的文件项
                    filesContent.removeChild(fileItem);

                    if (ignoreFiles.length >= files.length) {
                        filesContent.style.border = '1px solid #30363d';
                    }
                }
            });
        }

        document.getElementById('files-list').style.display = 'block';//显示选择的文件列表

        // 将元素滚动到视窗的底部
        filesContent.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    });
});

//重新上传
document.getElementById('clear').addEventListener('click', function () {
    document.getElementById('submit').style.display = 'none';
    document.getElementById('select').style.display = 'block';
    document.getElementById('files-list').style.display = 'none';
});

/* ================ 文件的下载 ================ */
/* 使用download.js替代此函数的功能
function downloadFile() {
    // 找到.download元素的父节点，即包含文件信息的div
    const fileContainer = event.target.closest('.file');

    // 假设userID存储在页面的某个元素中，例如一个隐藏的input元素
    const userIdElement = document.getElementById('userID');
    const userID = userIdElement ? userIdElement.getAttribute('user-id') : null;

    // 检查userID是否存在
    if (!userID) {
        console.error('User ID not found.');
        warningPopup('用户似乎已经退出，请重新登录.');
        return;
    }

    // 从父节点属性中获取文件名
    const fileName = fileContainer.getAttribute('file-path');

    //从父节点属性中获取文件id
    const fileID = fileContainer.getAttribute('file-id');

    // 构建请求体
    const requestBody = {
        fileName: fileName,
        userID: userID
    };

    let url = 'downloadFile?' + "user_id=" + userID + "&file_id=" + fileID;

     fetch(url)
        .then(response => {
          if (response.ok) {
              return response.blob();
          }else if (response.status === 401){
                warningPopup('用户似乎已经退出，请重新登录.');
          } else if(response.status === 404){
                errorPopup('文件 \"' + fileName + '\" 不存在！');
          } else if(response.status == 500){
                errorPopup('服务器内部错误！');
          }
          else {
                throw new Error('Network response was not ok');
          }
        })
        .then(blob => {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName; // 设置下载文件名
          document.body.appendChild(link);
          link.click(); // 触发下载
          document.body.removeChild(link); // 清理DOM
          URL.revokeObjectURL(downloadUrl); // 释放blob URL
          console.log("下载文件\"" + fileName + "\"成功！")
        })
        .catch(e => console.error('Download error:', e));
}
*/

//删除文件
function deleteFile() {
    // 找到.delete元素的父节点，即包含文件信息的div
    const fileContainer = event.target.closest('.file');

    //从父节点属性中获取文件名
    const fileName = fileContainer.getAttribute('file-path');

    //从父节点属性中获取文件id
    const fileID = fileContainer.getAttribute('file-id');

    let url = 'deleteFile?file_id=' + fileID;


    // 发送请求到服务器删除文件
    fetch(url, {
        method: 'POST',
    })
        .then(
            response => {
                if (response.status === 200) {
                    // 从DOM中移除父节点
                    fileContainer.remove();
                    infoPopup('删除文件 \"' + fileName + '\" 成功！');
                } else if (response.status === 401) {
                    warningPopup('登录已过期，请重新登录.');
                    setTimeout(() => {
                        location.href = 'login.html'; // 直接跳转到指定的URL
                    }, 2000);//两秒后跳转到登录页面
                } else if (response.status === 404) {
                    errorPopup('文件 \"' + fileName + '\" 不存在！');
                } else if (response.status == 500) {
                    errorPopup('服务器内部错误！');
                }
                else if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
            }
        )
        .catch(error => {
            console.error('Error deleting file:', error);
        });
}

//下载所有已选项
function downloadSelected() {
    let selectedDownloadTasks = document.querySelectorAll('.selected .download');
    selectedDownloadTasks.forEach((e) => {
        e.click();//点击下载按钮触发下载任务
    });
}

//删除所有已选项
function deleteSelected() {
    let selectedDeleteTasks = document.querySelectorAll('.selected .delete');
    downloadCount = selectedDeleteTasks.length;
    selectedDeleteTasks.forEach((e) => {
        e.click();//点击删除按钮触发删除任务
    });
}

/*
    实现main.jsp中的工具栏中的功能：
    1.文件多选
    2.连续多选
    3.文件全选
    4.文件排序
 */
const dir = document.querySelector('.dir');//文件容器
var ctrlMode = false;//多选模式
var shiftMode = false;//连续多选模式
var allMode = false;//全选模式

//工具栏选项的开启与关闭
let toolOption = document.querySelectorAll('.tool-option');
toolOption.forEach((option) => {
    if (option.id == 'sort') return;//sort功能可以与其他功能一起开启

    //多选、连续多选、全选相互排斥
    option.addEventListener('click', function () {
        let on = option.classList.contains('on');

        //移除所有开启的功能
        let enabled = document.querySelectorAll('.on');
        enabled.forEach((e) => {
            if (e.id == 'sort') return;
            e.classList.remove('on');
        })

        ctrlMode = false;
        shiftMode = false;
        allMode = false;

        if (!on) option.classList.add('on');
    });
})

//开启或关闭文件多选模式
let ctrlOption = document.getElementById('ctrl');
ctrlOption.addEventListener('click', function () {
    if (ctrlOption.classList.contains('on')) ctrlMode = true;
    else ctrlMode = false;
});

//开启或关闭文件连续多选模式
let shiftOption = document.getElementById('shift');
shiftOption.addEventListener('click', function () {
    if (shiftOption.classList.contains('on')) shiftMode = true;
    else shiftMode = false;
});

//排序选项的菜单选中时进行高亮显示
var sortTool = document.getElementById('sort');
let modeSelected = null;
let modeOptions = sortTool.querySelectorAll('.mode-content li');
modeOptions.forEach((e) => {
    e.addEventListener('click', function () {
        if (modeSelected != e) {
            if (modeSelected != null) modeSelected.classList.remove('mode-selected');
            modeSelected = e;
            e.classList.add('mode-selected');
            sortTool.classList.add('on');
        } else {
            modeSelected = null;
            e.classList.remove('mode-selected');
            sortTool.classList.remove('on');
        }
    })
})

/* ================= Ctrl多选文件功能 ================== */

// 为文件容器添加点击事件监听器
dir.addEventListener('click', function (event) {
    // 检查是否按住Ctrl键或者开启多选模式
    if (!event.ctrlKey && !ctrlMode) return;

    // 使用 event.target 来获取实际被点击的元素
    // 检查这个元素或其父元素是否是文件元素
    let target = event.target;
    while (target && target !== this) {
        if (target.matches('.file')) {
            // 如果找到 .file 元素，切换 .selected 类
            target.classList.toggle('selected');

            //为.selected元素添加监听
            let contextMenu = document.getElementById('context-menu');
            target.addEventListener('contextmenu', function (e) {
                e.preventDefault();//阻止默认的右键菜单显示

                if (!target.classList.contains('selected')) return;

                //计算菜单的显示位置
                let x = e.clientX + window.scrollX;
                let y = e.clientY + window.scrollY;
                contextMenu.style.left = x + 'px';
                contextMenu.style.top = y + 'px';
                contextMenu.style.display = 'flex';

                // 监听鼠标点击或按 Esc 键关闭菜单
                document.addEventListener('click', function () {
                    contextMenu.style.display = 'none';
                }, { once: true });
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape') {
                        contextMenu.style.display = 'none';
                    }
                }, { once: true });
            });

            break;
        }
        target = target.parentElement;//通过递归检查父节点来查找到所点击的.file元素
    }
});

/* ================== shift连续多选文件功能 ================== */
let startFile = null;//连续多选的起始文件

// 监听文件元素容器的点击事件
dir.addEventListener('click', function (event) {
    // 如果点击的不是文件元素或者未按住shift键，则直接返回
    if (!event.shiftKey && !shiftMode) return;

    const file = event.target.closest('.file');
    if (file == null) return;

    // 如果已经记录了起始文件元素
    if (startFile) {
        // 取消之前所有文件的选中状态
        document.querySelectorAll('.file.selected').forEach(function (el) {
            el.classList.remove('selected');
        });

        // 选择起始文件到当前文件之间的所有文件
        const files = document.querySelectorAll('.file');
        let startIndex = Array.prototype.indexOf.call(files, startFile);
        let endIndex = Array.prototype.indexOf.call(files, file);

        for (let i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
            if (files[i] == null) return;
            files[i].classList.add('selected');

            //为.selected元素添加监听
            let contextMenu = document.getElementById('context-menu');
            files[i].addEventListener('contextmenu', function (e) {
                e.preventDefault();//阻止默认的右键菜单显示

                if (!files[i].classList.contains('selected')) return;

                //计算菜单的显示位置
                let x = e.clientX + window.scrollX;
                let y = e.clientY + window.scrollY;
                contextMenu.style.left = x + 'px';
                contextMenu.style.top = y + 'px';
                contextMenu.style.display = 'flex';

                // 监听鼠标点击或按 Esc 键关闭菜单
                document.addEventListener('click', function () {
                    contextMenu.style.display = 'none';
                }, { once: true });
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape') {
                        contextMenu.style.display = 'none';
                    }
                }, { once: true });
            });
        }
    } else {
        // 如果没有按下Shift键，只选中当前点击的文件
        if (startFile != null) startFile.classList.remove('selected');
        file.classList.add('selected');
        startFile = file;
    }
});

/* ================== 文件全选功能 ================== */
var allOption = document.getElementById('all');
allOption.addEventListener('click', function () {
    if (allOption.classList.contains('on')) {
        selectAllFiles();
        allMode = true;
    } else {
        cancelSelectAllFiles();
        allMode = false;
    }
});

//文件全选
function selectAllFiles() {
    document.querySelectorAll('.file').forEach(function (file) {
        file.classList.add('selected');

        //为.selected元素添加监听
        let contextMenu = document.getElementById('context-menu');
        file.addEventListener('contextmenu', function (e) {
            e.preventDefault();//阻止默认的右键菜单显示

            //计算菜单的显示位置
            let x = e.clientX;
            let y = e.clientY + window.scrollY;
            contextMenu.style.left = x + 'px';
            contextMenu.style.top = y + 'px';
            contextMenu.style.display = 'flex';

            // 监听鼠标点击或按 Esc 键关闭菜单
            document.addEventListener('click', function () {
                contextMenu.style.display = 'none';
            }, { once: true });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    contextMenu.style.display = 'none';
                }
            }, { once: true });
        });
    });
}

//文件取消全选
function cancelSelectAllFiles() {
    document.querySelectorAll('.file').forEach(function (file) {
        file.classList.remove('selected');
    });
}

//当切换到多选或连续多选的模式时清除文件全选的效果
var observer = new MutationObserver(function (mutationsList, observer) {
    // 遍历mutationsList，检查每个变化
    for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            // 检查是否移除了selected类
            if (!allOption.classList.contains('selected')) {
                // 清除所有文件的选中状态
                document.querySelectorAll('.file').forEach(function (file) {
                    file.classList.remove('selected');
                });
            }
        }
    }
});

var config = { attributes: true, attributeFilter: ['class'] };

observer.observe(allOption, config);
// 如果需要停止观察，可以调用observer.disconnect()


/* ================== 文件选中状态的取消 ================== */

//当未开启工具栏中任何模式时，点击文件容器的文件外的其他位置将取消全部文件的选中状态
dir.addEventListener('click', function (event) {
    const file = event.target.closest('.file');

    if (!event.ctrlKey && !event.shiftKey && !shiftMode && !ctrlMode && !allMode || file == null && !allMode) {
        // 取消之前所有文件的选中状态
        document.querySelectorAll('.file.selected').forEach(function (el) {
            el.classList.remove('selected');
        });
        startFile = null;//清除起始文件
    }
});

/* ================== 下载任务列表 ================== */
let taskWindow = document.getElementById('task-window');
let windowTitle = taskWindow.querySelector('.window-title');

/* 拖动下载任务列表 */
var startX, startY, startMouseX, startMouseY;

// 鼠标按下事件，记录初始位置
windowTitle.addEventListener('mousedown', function (event) {
    // 阻止默认行为，例如文本选择等
    event.preventDefault();

    // 记录鼠标和元素的初始位置
    startX = taskWindow.offsetLeft;
    startY = taskWindow.offsetTop;
    startMouseX = event.clientX;
    startMouseY = event.clientY;

    taskWindow.classList.add('dragging');

    // 添加mousemove和mouseup事件监听器
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// 鼠标移动事件，更新元素位置
function onMouseMove(event) {
    var deltaX = event.clientX - startMouseX;
    var deltaY = event.clientY - startMouseY;

    // 更新元素的位置
    taskWindow.style.left = startX + deltaX + 'px';
    taskWindow.style.top = startY + deltaY + 'px';
}

// 鼠标释放事件，停止拖动
function onMouseUp() {
    taskWindow.classList.remove('dragging');

    // 移除mousemove和mouseup事件监听器
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

//打开和关闭下载任务列表
document.getElementById('task').addEventListener('click', function () {
    if (taskWindow.style.display === 'flex')
        taskWindow.style.display = 'none';
    else
        taskWindow.style.display = 'flex';
});

//关闭下载页面
document.querySelector('.window-exit').addEventListener('click', function () {
    taskWindow.style.display = 'none';
});

/* 下载任务窗口的缩放 */
const windowShrink = taskWindow.querySelector('.window-shrink');
const windowFull = taskWindow.querySelector('.window-full');
const taskTools = taskWindow.querySelector('.task-tools');
windowShrink.addEventListener('click', function () {
    taskTools.classList.remove('fade-in');
    taskTools.classList.add('fade-out');
    taskWindow.classList.add('window-shrunk');
    setTimeout(() => {
        taskTools.style.display = 'none';
    }, 500);
    windowShrink.style.display = 'none';
    windowFull.style.display = 'flex';
});
windowFull.addEventListener('click', function () {
    windowFull.style.display = 'none';
    windowShrink.style.display = 'flex';
    taskTools.style.display = 'flex';
    taskTools.classList.remove('fade-out');
    taskTools.classList.add('fade-in');
    taskWindow.classList.remove('window-shrunk');
});

/* ================== 文件名的修改 ================== */
var inputElement = document.createElement('input');//创建input元素
inputElement.classList.add('name-input');
inputElement.type = 'text';
inputElement.placeholder = '请输入文件夹名称';

// 为所有具有'name'类的元素添加点击事件监听器
let userFolder = dir.querySelectorAll('.folder[type=user-folder]');
userFolder.forEach(function (e) {
    let folderNameElement = e.querySelector('.name');
    let folderModifyTime = e.querySelector('.modify-date');
    folderNameElement.addEventListener('click', function (event) {
        e.classList.add("edit");
        var folderNameElement = event.target.closest('.name');
        var originalName = folderNameElement.textContent; // 保存原始名称

        inputElement.value = originalName; // 设置输入框的初始值为原始名称

        folderNameElement.innerHTML = ''; // 清空原有内容
        folderNameElement.appendChild(inputElement); // 添加input元素到父元素中
        inputElement.focus(); // 聚焦到input元素

        inputElement.onblur = function () {
            // 当输入框失去焦点时执行
            var newName = this.value.trim(); // 去除字符串两端的空格

            if (newName === '') {
                // 如果去除空格后输入框中没有内容，恢复原始名称
                folderNameElement.textContent = originalName;
            } else {
                // 如果去除空格后输入框中有内容，更新名称
                folderNameElement.textContent = newName;

                //更新文件夹的修改日期
                folderModifyTime.textContent = getFormattedDate();
            }

            e.classList.remove("edit");

        };

        inputElement.onkeydown = function (e) {
            // 监听键盘事件，当按下回车键时提交更改
            if (e.key === 'Enter') {
                this.blur(); // 使input失去焦点，触发onblur事件
            }
        };
    });
});

/* ================== 创建文件夹 ================== */

//获取最后一个用户文件夹
var otherFolder = dir.querySelector('.other');
var allUserFolders = dir.querySelectorAll('.folder[type="user-folder"]');
var lastUserFolder = allUserFolders.length > 0 ? allUserFolders[allUserFolders.length - 1] : otherFolder;

//点击新建按钮创建用户文件夹
const createDir = document.querySelector('.create-dir');
createDir.addEventListener('click', function () {
    //创建新的文件夹元素
    const newFolder = document.createElement('div');
    newFolder.classList.add('folder');
    newFolder.setAttribute('type', 'user-folder');
    newFolder.innerHTML = `
    <svg t="1718768286042" class="folder-icon" viewBox="0 0 1024 1024" version="1.1"
        xmlns="http://www.w3.org/2000/svg" p-id="22970">
        <path
            d="M81.16 412.073333L0 709.653333V138.666667a53.393333 53.393333 0 0 1 53.333333-53.333334h253.413334a52.986667 52.986667 0 0 1 37.713333 15.62l109.253333 109.253334a10.573333 10.573333 0 0 0 7.54 3.126666H842.666667a53.393333 53.393333 0 0 1 53.333333 53.333334v74.666666H173.773333a96.2 96.2 0 0 0-92.613333 70.74z m922-7.113333a52.933333 52.933333 0 0 0-42.386667-20.96H173.773333a53.453333 53.453333 0 0 0-51.453333 39.333333L11.773333 828.666667a53.333333 53.333333 0 0 0 51.453334 67.333333h787a53.453333 53.453333 0 0 0 51.453333-39.333333l110.546667-405.333334a52.953333 52.953333 0 0 0-9.073334-46.373333z"
            p-id="22971"></path>
    </svg>
    <div class="name">新建文件夹</div>
    <div class="modify-date">${getFormattedDate()}</div>
    <div class="type">用户文件夹</div>
    <div class="size"> 0&nbsp;B</div>`;

    lastUserFolder.insertAdjacentElement('afterend', newFolder);
    lastUserFolder = newFolder;

    //滚动到newFolder处
    newFolder.scrollIntoView({ behavior: 'smooth' });

    let folderNameElement = newFolder.querySelector('.name');
    let folderModifyTime = newFolder.querySelector('.modify-date');
    editFolderName();

    //添加允许修改文件夹名称的功能
    folderNameElement.addEventListener('click', editFolderName);

    function editFolderName() {
        newFolder.classList.add('edit');

        var originalName = folderNameElement.textContent;
        inputElement.value = originalName; // 设置输入框的初始值为原始名称

        folderNameElement.innerHTML = ''; // 清空原有内容
        folderNameElement.appendChild(inputElement); // 添加input元素到父元素中
        inputElement.focus(); // 聚焦到input元素

        inputElement.onblur = function () {
            // 当输入框失去焦点时执行
            var newName = this.value.trim(); // 去除字符串两端的空格

            if (newName === '') {
                // 如果去除空格后输入框中没有内容，恢复原始名称
                folderNameElement.textContent = originalName;
            } else {
                // 如果去除空格后输入框中有内容，更新名称
                folderNameElement.textContent = newName;

                //更新文件夹的修改日期
                folderModifyTime.textContent = getFormattedDate();
            }

            newFolder.classList.remove("edit");

        };

        inputElement.onkeydown = function (e) {
            // 监听键盘事件，当按下回车键时提交更改
            if (e.key === 'Enter') {
                this.blur(); // 使input失去焦点，触发onblur事件
            }
        };
    }
});

//获取创建日期
function getFormattedDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString(); // 月份从0开始，所以需要加1
    var day = date.getDate().toString();
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    var seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
};

/* ================ 自定义消息提示 ================ */

// 弹出弹窗
function popup(msgPopup) {
    msgPopup.classList.add('show');
    setTimeout(function () {
        msgPopup.classList.add('hide');
        setTimeout(() => {
            msgPopup.remove();//移除弹窗
        }, 2000);//两秒后移除弹窗
    }, 3000);
}

//信息弹窗
function infoPopup(message) {
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

//警告弹窗
function warningPopup(message) {
    var popupDiv = document.createElement('div');
    popupDiv.classList.add('pop-up');
    popupDiv.innerHTML = `<svg t="1721737216452" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
        p-id="31530">
        <path d="M0 512a512 512 0 1 0 1024 0A512 512 0 1 0 0 512z" fill="#FFBB0C" p-id="31531"></path>
        <path
            d="M512 227.556c39.822 0 73.956 34.133 73.956 73.955v11.378l-39.823 290.133c0 11.378-11.377 22.756-28.444 22.756H506.31c-11.378 0-28.444-11.378-28.444-22.756L438.044 312.89c-5.688-39.822 22.756-79.645 62.578-85.333H512z m0 483.555c34.133 0 56.889 22.756 56.889 56.889S546.133 824.889 512 824.889 455.111 802.133 455.111 768s22.756-56.889 56.889-56.889z"
            fill="#fff" p-id="31532"></path>
    </svg>
    <div class="pop-up-info">${message}</div>`;

    document.body.appendChild(popupDiv); // 添加到body元素

    popup(popupDiv);
}