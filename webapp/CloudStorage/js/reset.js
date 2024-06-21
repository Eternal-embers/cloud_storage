let sendButton = document.querySelector('.resend-code');

sendButton.addEventListener('click', function () {
    let email = document.getElementById('identifier').value;
    var emailPattern = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    if (!emailPattern.test(email)) {
        alert('请输入有效的电子邮件地址。'); // 显示错误消息
        return;
    }

    this.disabled = true;// 禁用按钮
    this.style.cursor = 'not-allowed'; // 设置鼠标指针为不允许操作的状态

    // 设置倒计时时间（60秒）
    let countdown = 60;

    // 显示倒计时
    let intervalId = setInterval(function () {
        // 更新按钮文本为倒计时
        sendButton.textContent = `${countdown}s`;

        countdown--;

        if (countdown < 0) {
            clearInterval(intervalId); // 清除定时器
            sendButton.textContent = '重新发送'; // 重置按钮文本
            sendButton.disabled = false; // 启用按钮
        }
    }, 1000); // 每秒更新一次

    const encodedEmail = encodeURIComponent(email);
    let url = `verify?email=${encodedEmail}&type=reset`;

    //发送请求
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            //发送的数据
        })
    })
    .then(response => {
            // 首先检查响应的状态
            if (!response.ok) {
                throw new Error('网络响应不正确');
            }
            // 解析响应为普通文本
            return response.text();
    })
    .then(data => {
            console.log(data);
            alert('验证码发送成功！');
    })
    .catch(error => {
            console.error('请求失败:', error);
            alert('发送失败，请稍后重试。');

            clearInterval(intervalId); // 清除定时器
            sendButton.textContent = '重新发送'; // 重置按钮文本
            sendButton.disabled = false; // 启用按钮
    });
});

var currentUrl = new URL(window.location);


if (currentUrl.searchParams.has('reset_overdue')){
    alert('验证码已过期，请重新发送。');
} else if (currentUrl.searchParams.has('reset_failed')){
    alert('验证码错误或已过期，请重新发送。');
}


document.getElementById('changePasswordForm').addEventListener('submit', function (event) {
    event.preventDefault(); // 阻止表单的默认提交行为

    // 获取新密码和确认密码的输入值
    var newPassword = document.getElementById('newPassword').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    // 检查两个密码是否相同
    if (newPassword !== confirmPassword) {
        alert('新密码和确认密码不匹配，请重新输入。');
        return; // 如果密码不匹配，直接返回，不提交表单
    }

    // 构建表单数据
    const params = new URLSearchParams();
    params.append("identifier", document.getElementById('identifier').value);
    params.append("verificationCode", document.getElementById('verificationCode').value);
    params.append("newPassword", newPassword);

    // 使用fetch API提交表单数据
    fetch('reset?' + params.toString(), {
        method: 'POST',
    })
    .then(response => {
        if (response.ok) {
            alert('密码修改成功！')
        }
        else if (response.status === 400) {
            alert('验证码错误或已过期，请重新发送。');
        } else if (response.status === 422) {
            alert('验证码错误，请重新输入。');
        } else if(response.status === 500) {
            alert('服务器内部错误，请稍后重试。');
        }
        else if (!response.ok) {
            throw new Error('网络响应错误：' + response.status);
        }
        return response.text(); // 解析响应为普通文本
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('提交表单时发生错误：', error);
        alert('密码修改失败：' + error.message);
    });
});