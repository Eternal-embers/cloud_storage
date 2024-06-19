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
    let url = `verify?email=${encodedEmail}`;

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
            } else if(response.status === 404){
                alert('该账号尚未注册！');
            } else if(response.status === 400){
                alert('验证码错误或已过期，请重新发送。');
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
if (currentUrl.searchParams.get('reset') == 'false'){
    alert('密码重置失败，请稍后重试。');
}


document.getElementById('changePasswordForm').addEventListener('submit', function (event) {
    // 获取新密码和确认密码的输入值
    var newPassword = document.getElementById('newPassword').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    // 检查两个密码是否相同
    if (newPassword !== confirmPassword) {
        // 如果密码不匹配，阻止表单提交
        event.preventDefault();

        alert('新密码和确认密码不匹配，请重新输入。');
    }
});