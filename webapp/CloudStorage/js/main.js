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

//搜索框
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

//处理头像上传
document.getElementById('avatar-input').addEventListener('change', function(event) {
    var file = event.target.files[0]; // 获取选择的文件

    var MAX_FILE_SIZE = 10 * 1024 * 1024; // 限制大小，例如 10MB

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
        alert("文件太大，不能超过 " + MAX_FILE_SIZE / 1024 / 1024 + "MB.");
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
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    // 尝试将响应文本解析为 JSON
                    var response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        // 如果服务器返回成功，获取图片 URL
                        var uploadedImageUrl = response.imageUrl;
                        // 设置图片路径到 user-avatar
                        document.querySelector('.user-avatar').src = uploadedImageUrl;
                    } else {
                        // 如果服务器返回失败，处理错误
                        console.error('上传头像失败:', response.message);
                    }
                } catch (error) {
                    // 如果响应不是有效的 JSON，按照文本处理
                    console.error('解析服务器响应出错:', error);
                    console.error('服务器响应:', xhr.responseText);
                }
            } else {
                // 处理 HTTP 错误
                console.error('上传头像失败，HTTP 状态码：', xhr.status);
            }
        };

        xhr.send(formData); // 发送请求
    } else {
        console.log('没有选择文件。');
    }

    window.open(location.href, '_self');
});

document.querySelector('.change-password').addEventListener('click', function() {
    //打开reset.html页面
    window.open('reset.html', '_self');
});

//文件上传
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('select').addEventListener('change', function (event) {
        let files = event.target.files;

        if (files.length == 0) return;//未选择文件

        document.getElementById('select').style.display = 'none'; //隐藏上传组件
        document.getElementById('submit').style.display = 'block';//显示提交组件


        let filesContent = document.querySelector('.files-content');//获取文件列表块
        filesContent.innerHTML = '';//清空文件列表

        for (var i = 0; i < files.length; i++) {
            var fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.textContent = files[i].name;
            filesContent.appendChild(fileItem);
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

//下载文件
function downloadFile() {
    // 找到.download元素的父节点，即包含文件信息的div
    const fileContainer = event.target.closest('.file');

    // 假设userID存储在页面的某个元素中，例如一个隐藏的input元素
    const userIdElement = document.getElementById('userID');
    const userID = userIdElement ? userIdElement.getAttribute('user-id') : null;

    // 检查userID是否存在
    if (!userID) {
        console.error('User ID not found.');
        alert('用户似乎已经退出，请重新登录.');
        return;
    }

    // 从父节点属性中获取文件名
    const fileName = fileContainer.getAttribute('file-name');

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
                alert('用户似乎已经退出，请重新登录.');
          } else if(response.status === 404){
                alert('文件 \"' + fileName + '\" 不存在！');
          } else if(response.status == 500){
                alert('服务器内部错误！');
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


//删除文件
function deleteFile() {
      // 找到.delete元素的父节点，即包含文件信息的div
      const fileContainer = event.target.closest('.file');

      console.log('删除文件:', fileContainer);

      // 假设userID存储在页面的某个元素中，例如一个隐藏的input元素
      const userIdElement = document.getElementById('userID');
      const userID = userIdElement ? userIdElement.getAttribute('user-id') : null;

      // 检查userID是否存在
      if (!userID) {
        console.error('User ID not found.');
        alert('用户似乎已经退出，请重新登录.');
        return;
      }

      // 从父节点属性中获取文件名
      const fileName = fileContainer.getAttribute('file-name');

      //从父节点属性中获取文件id
      const fileID = fileContainer.getAttribute('file-id');

      // 构建请求体
      const requestBody = {
        fileName: fileName,
        userID: userID
      };

      let url = 'deleteFile?' + "user_id=" + userID + "&file_id=" + fileID;


      // 发送请求到服务器删除文件
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(
        response => {
            if(response.status === 200) {
                // 从DOM中移除父节点
                fileContainer.remove();
                alert('删除文件 \"' + fileName + '\" 成功！');
            } else if (response.status === 401){
                alert('用户似乎已经退出，请重新登录.');
            } else if(response.status === 404){
                alert('文件 \"' + fileName + '\" 不存在！');
            } else if(response.status == 500){
                alert('服务器内部错误！');
            }
            else if(!response.ok) {
                throw new Error('Network response was not ok');
            }
        }
      )
      .then(data => {
            console.log('File deletion response:', data);
      })
      .catch(error => {
            console.error('Error deleting file:', error);
      });
}

/* Ctrl多选文件功能 */
const dir = document.querySelector('.dir');

// 为文件容器添加点击事件监听器
dir.addEventListener('click', function (event) {
    // 检查是否按住Ctrl键
    if (!event.ctrlKey) return;

    // 使用 event.target 来获取实际被点击的元素
    // 检查这个元素或其父元素是否是文件元素
    let target = event.target;
    while (target && target !== this) {
        if (target.matches('.file')) {
            // 如果找到 .file 元素，切换 .selected 类
            target.classList.toggle('selected');
            break;
        }
        target = target.parentElement;
    }
});

/* shift多选文件功能 */
let startFile = null;

// 监听文件元素容器的点击事件
dir.addEventListener('click', function (event) {
    const file = event.target.closest('.file');

    // 如果点击的不是文件元素或者未按住shift键，则直接返回
    if (!event.shiftKey) return;

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
            files[i].classList.add('selected');
        }
    } else {
        // 如果没有按下Shift键，只选中当前点击的文件
        if (startFile != null) startFile.classList.remove('selected');
        file.classList.add('selected');
        startFile = file;
    }
});

//清除选中
dir.addEventListener('click', function (event) {
    if (!event.ctrlKey && !event.shiftKey) {
        // 取消之前所有文件的选中状态
        document.querySelectorAll('.file.selected').forEach(function (el) {
            el.classList.remove('selected');
        });
        startFile = null;//清除起始文件
    }
});