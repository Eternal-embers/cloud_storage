//打开用户页面
let user = document.querySelector('.user');
let mask = document.querySelector('.mask');
let user_profile = document.querySelector('.user-profile');

user.addEventListener('click', function () {
    mask.style.display = 'block';
    user_profile.classList.toggle('slide');
});

mask.addEventListener('click', function () {
    mask.style.display = 'none';
    user_profile.classList.toggle('slide');
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

