/* 随机切换渐变背景颜色 */
let colors = ["#FFDEE9", "#08AEEA", "#8EC5FC", "#FAACA8", "#A9C9FF", "#74EBD5", "#FF3CAC", "#21D4FD", "#FF9A8B", "#0093E9", "#85FFBD", "#4158D0"];
let images = [
    "linear-gradient(0deg, #FFDEE9 0%, #B5FFFC 100%)",
    "linear-gradient(0deg, #08AEEA 0%, #2AF598 100%)",
    "linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)",
    "linear-gradient(19deg, #FAACA8 0%, #DDD6F3 100%)",
    "linear-gradient(180deg, #A9C9FF 0%, #FFBBEC 100%)",
    "linear-gradient(90deg, #74EBD5 0%, #9FACE6 100%)",
    "linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)",
    "linear-gradient(19deg, #21D4FD 0%, #B721FF 100%)",
    "linear-gradient(90deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)",
    "linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)",
    "linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%)",
    "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
];

let index = Math.round(Math.random() * colors.length);
document.body.style.backgroundColor = colors[index];
document.body.style.backgroundImage = images[index];

/* 邮箱注册，获取验证码 */
let verify = document.getElementById('verify');

let clickBlockTimer;

verify.addEventListener('click', function () {
    // 防止用户重复点击
    if (this.classList.contains('counting')) {
        return;
    }

    let email = document.getElementById('email').value;
    var emailPattern = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    if (!emailPattern.test(email)) {
        alert('请输入有效的电子邮件地址。'); // 显示错误消息
        return;
    }

    this.classList.add('counting');
    this.textContent = '60s';

    let countdown = 60; // 倒计时初始值
    var interval = setInterval(function () {
        countdown--; // 递减秒数
        verify.textContent = countdown + 's'; // 更新显示的秒数

        if (countdown <= 0) {
            clearInterval(interval);
            verify.classList.remove('counting'); // 移除'counting'类
            verify.textContent = '重新发送'; // 重置按钮文本
        }
    }, 1000); // 定时器每秒执行一次

    // 对 email 进行 URL 编码
    const encodedEmail = encodeURIComponent(email);

    // 构造带有查询参数的 URL
    const url = `verify?email=${encodedEmail}&type=register`;

    fetch(url, {
        method: 'POST',
        headers: {
            // 'Content-Type': 'application/json', // 对于 GET 请求，通常不需要设置 Content-Type
        },
    })
    .then(response => {
        // 检查 HTTP 响应状态码是否表示成功
        if (response.ok) {
            console.log('成功发送验证码至' + email);
            alert('验证码已发送至' + email + '，请注意查收。'); // 显示成功消息
            return;
        }else if (response.status === 409) { // 账号已存在
                var popupDiv = document.createElement('div');
                popupDiv.classList.add('pop-up');
                popupDiv.innerHTML = `<svg t="1718616163146" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                    p-id="8873" width="1vw" height="1vw">
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
                <div class="pop-up-info">账号已存在</div>`;
                document.body.appendChild(popupDiv); // 添加到body元素

                popup();

                clearInterval(interval);
                verify.classList.remove('counting'); // 移除'counting'类
                verify.textContent = '获取验证码'; // 重置按钮文本
        }else {
            throw new Error('Network response was not ok: ' + response.status + ' ' + response.statusText);
        }
    })
    .then(data => {
        //处理返回值
    })
    .catch(error => {
        // 处理前面抛出的任何错误
        console.error('fetch error:', error);
    });
});


/* 登录和注册的切换 */
let login = document.querySelector('.login');
let signUp = document.querySelector('.signUp');

function toggle() {
    login.classList.toggle('hidden');
    signUp.classList.toggle('hidden');
}

// 弹出弹窗
function popup() {
    let popupDiv = document.querySelector('.pop-up');
    popupDiv.classList.add('show');
    setTimeout(function () {
        popupDiv.classList.add('hide');
        setTimeout(() => {
            popupDiv.remove();//移除弹窗
        }, 2000);//两秒后移除弹窗
    }, 3000);
}

//登录注册中的弹窗提示
document.addEventListener('DOMContentLoaded', function () {
    var currentUrl = new URL(window.location);

    //账号未注册
    if (currentUrl.searchParams.has('unregistered')) {
        toggle();
        var popupDiv = document.createElement('div');
        popupDiv.classList.add('pop-up');
        popupDiv.innerHTML = `<svg t="1718616163146" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="8873" width="1vw" height="1vw">
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
        <div class="pop-up-info">账号未注册。</div>`;
        document.body.appendChild(popupDiv); // 添加到body元素

        popup();
    }

    //账号已经存在
    if (currentUrl.searchParams.has('registered')) {
        toggle();
        var popupDiv = document.createElement('div');
        popupDiv.classList.add('pop-up');
        popupDiv.innerHTML = `<svg t="1718616163146" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="8873" width="1vw" height="1vw">
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
        <div class="pop-up-info">账号已存在，请直接登录。</div>`;
        document.body.appendChild(popupDiv); // 添加到body元素

        popup();
    }

    //验证码失效
    if (currentUrl.searchParams.has('captcha_overtime')) {
        toggle();
        var popupDiv = document.createElement('div');
        popupDiv.classList.add('pop-up');
        popupDiv.innerHTML = `<svg t="1718545187783" class="pop-up-icon" viewBox="0 0 1024 1024" version="1.1"
            xmlns="http://www.w3.org/2000/svg" p-id="12558" width="1vw" height="1vw">
            <path
                d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0zM593.066667 145.066667l-21.333333 486.4c0 29.866667-25.6 51.2-55.466667 51.2l-12.8 0c-29.866667 0-51.2-21.333333-55.466667-51.2L426.666667 145.066667c0-29.866667 21.333333-51.2 46.933333-51.2l68.266667 0C571.733333 93.866667 597.333333 115.2 593.066667 145.066667zM571.733333 913.066667C554.666667 930.133333 533.333333 938.666667 512 938.666667c-25.6 0-42.666667-8.533333-59.733333-25.6C435.2 896 426.666667 878.933333 426.666667 853.333333c0-25.6 8.533333-42.666667 25.6-59.733333C469.333333 776.533333 486.4 768 512 768c25.6 0 46.933333 8.533333 64 25.6 17.066667 17.066667 25.6 34.133333 25.6 59.733333C597.333333 878.933333 588.8 900.266667 571.733333 913.066667z"
                fill="#F7411C" p-id="12559"></path>
        </svg>
        <div class="pop-up-info">验证码失效，请重新获取！</div>`;
        document.body.appendChild(popupDiv); // 添加到body元素

        popup();
    }

    //验证码错误
    if (currentUrl.searchParams.has('captcha_error')) {
        toggle();
        var popupDiv = document.createElement('div');
        popupDiv.classList.add('pop-up');
        popupDiv.innerHTML = `<svg t="1718547863081" class="pop-up-icon" viewBox="0 0 1028 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="20690" width="1vw" height="1vw">
            <path
                d="M875.086452 153.730058C676.053818-45.302575 353.260522-45.302575 154.128323 153.730058s-199.032634 521.825929 0 720.958129 521.825929 199.032634 720.958129 0 199.032634-521.825929 0-720.958129zM725.836868 725.438604c-9.757478 9.757478-25.488922 9.757478-35.246399 0L514.557604 549.405739 338.624306 725.438604c-9.757478 9.757478-25.488922 9.757478-35.2464 0s-9.757478-25.488922 0-35.2464l176.032865-176.032864-176.032865-175.933299c-9.757478-9.757478-9.757478-25.488922 0-35.246399 9.757478-9.757478 25.488922-9.757478 35.2464 0l176.032864 176.032865 176.032865-176.032865c9.757478-9.757478 25.488922-9.757478 35.246399 0 9.757478 9.757478 9.757478 25.488922 0 35.246399L549.804004 514.15934 725.836868 690.192204c9.657912 9.757478 9.657912 25.488922 0 35.2464z"
                fill="#F56C6C" p-id="20691"></path>
        </svg>
        <div class="pop-up-info">验证码错误！</div>`;
        document.body.appendChild(popupDiv); // 添加到body元素

        popup();
    }

    //注册成功
    if (currentUrl.searchParams.has('signup_success')) {
        var popupDiv = document.createElement('div');
        popupDiv.classList.add('pop-up');
        popupDiv.innerHTML = `<svg t="1718546275538" class="pop-up-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="13535" width="1vw" height="1vw">
            <path
                d="M874.119618 149.859922A510.816461 510.816461 0 0 0 511.997 0.00208a509.910462 509.910462 0 0 0-362.119618 149.857842c-199.817789 199.679789-199.817789 524.581447 0 724.260236a509.969462 509.969462 0 0 0 362.119618 149.857842A508.872463 508.872463 0 0 0 874.119618 874.120158c199.836789-199.679789 199.836789-524.581447 0-724.260236zM814.94268 378.210681L470.999043 744.132295a15.359984 15.359984 0 0 1-5.887994 4.095996c-1.751998 1.180999-2.913997 2.362998-5.276994 2.913997a34.499964 34.499964 0 0 1-13.469986 2.914997 45.547952 45.547952 0 0 1-12.897986-2.303998l-4.095996-2.363997a45.291952 45.291952 0 0 1-7.009992-4.095996l-196.902793-193.789796a34.126964 34.126964 0 0 1-10.555989-25.186973c0-9.37399 3.583996-18.74698 9.98399-25.186974a36.429962 36.429962 0 0 1 50.372947 0l169.98382 167.423824L763.389735 330.220732a37.059961 37.059961 0 0 1 50.371947-1.732998 33.647965 33.647965 0 0 1 11.165988 25.186973 35.544963 35.544963 0 0 1-9.98399 24.575974v-0.04z m0 0"
                fill="#52C41A" p-id="13536"></path>
        </svg>
        <div class="pop-up-info">注册成功！</div>`;
        document.body.appendChild(popupDiv); // 添加到body元素

        popup();
    }

    //登录成功
    if (currentUrl.searchParams.has('login_success')) {
        // 创建提示信息的HTML结构
        document.body.style = '';
        document.body.id = 'login-success';
        var messageHtml = `<div class="success-message">
        <h1>登录成功</h1>
        <p>你将登录到网站主页，即将跳转到网站主页。</p>
        <a href="main.jsp" class="redirect-link">立即访问</a>
        </div>`;
        document.body.innerHTML = messageHtml;

        var popupDiv = document.createElement('div');
        popupDiv.classList.add('pop-up');
        popupDiv.innerHTML = `<svg t="1718546275538" class="pop-up-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="13535" width="1vw" height="1vw">
            <path
                d="M874.119618 149.859922A510.816461 510.816461 0 0 0 511.997 0.00208a509.910462 509.910462 0 0 0-362.119618 149.857842c-199.817789 199.679789-199.817789 524.581447 0 724.260236a509.969462 509.969462 0 0 0 362.119618 149.857842A508.872463 508.872463 0 0 0 874.119618 874.120158c199.836789-199.679789 199.836789-524.581447 0-724.260236zM814.94268 378.210681L470.999043 744.132295a15.359984 15.359984 0 0 1-5.887994 4.095996c-1.751998 1.180999-2.913997 2.362998-5.276994 2.913997a34.499964 34.499964 0 0 1-13.469986 2.914997 45.547952 45.547952 0 0 1-12.897986-2.303998l-4.095996-2.363997a45.291952 45.291952 0 0 1-7.009992-4.095996l-196.902793-193.789796a34.126964 34.126964 0 0 1-10.555989-25.186973c0-9.37399 3.583996-18.74698 9.98399-25.186974a36.429962 36.429962 0 0 1 50.372947 0l169.98382 167.423824L763.389735 330.220732a37.059961 37.059961 0 0 1 50.371947-1.732998 33.647965 33.647965 0 0 1 11.165988 25.186973 35.544963 35.544963 0 0 1-9.98399 24.575974v-0.04z m0 0"
                fill="#52C41A" p-id="13536"></path>
        </svg>
        <div class="pop-up-info">登录成功！</div>`;
        document.body.appendChild(popupDiv); // 添加到body元素

        popup();

        setTimeout(function () {
            window.open('main.jsp', '_self');//打开新窗口
        }, 3000);
    };

    //登录失败
    if (currentUrl.searchParams.has('login_failed')) {
        var popupDiv = document.createElement('div');
        popupDiv.classList.add('pop-up');
        popupDiv.innerHTML = `<svg t="1718547863081" class="pop-up-icon" viewBox="0 0 1028 1024" version="1.1"
            xmlns="http://www.w3.org/2000/svg" p-id="20690" width="1vw" height="1vw">
            <path
                d="M875.086452 153.730058C676.053818-45.302575 353.260522-45.302575 154.128323 153.730058s-199.032634 521.825929 0 720.958129 521.825929 199.032634 720.958129 0 199.032634-521.825929 0-720.958129zM725.836868 725.438604c-9.757478 9.757478-25.488922 9.757478-35.246399 0L514.557604 549.405739 338.624306 725.438604c-9.757478 9.757478-25.488922 9.757478-35.2464 0s-9.757478-25.488922 0-35.2464l176.032865-176.032864-176.032865-175.933299c-9.757478-9.757478-9.757478-25.488922 0-35.246399 9.757478-9.757478 25.488922-9.757478 35.2464 0l176.032864 176.032865 176.032865-176.032865c9.757478-9.757478 25.488922-9.757478 35.246399 0 9.757478 9.757478 9.757478 25.488922 0 35.246399L549.804004 514.15934 725.836868 690.192204c9.657912 9.757478 9.657912 25.488922 0 35.2464z"
                fill="#F56C6C" p-id="20691"></path>
        </svg>
        <div class="pop-up-info">登录失败，密码错误！</div>`;
        document.body.appendChild(popupDiv); // 添加到body元素

        popup();
    }

    //登录异常
    if (currentUrl.searchParams.has('login_error')) {
        var popupDiv = document.createElement('div');
        popupDiv.classList.add('pop-up');
        popupDiv.innerHTML = `<svg t="1718547863081" class="pop-up-icon" viewBox="0 0 1028 1024" version="1.1"
            xmlns="http://www.w3.org/2000/svg" p-id="20690" width="1vw" height="1vw">
            <path
                d="M875.086452 153.730058C676.053818-45.302575 353.260522-45.302575 154.128323 153.730058s-199.032634 521.825929 0 720.958129 521.825929 199.032634 720.958129 0 199.032634-521.825929 0-720.958129zM725.836868 725.438604c-9.757478 9.757478-25.488922 9.757478-35.246399 0L514.557604 549.405739 338.624306 725.438604c-9.757478 9.757478-25.488922 9.757478-35.2464 0s-9.757478-25.488922 0-35.2464l176.032865-176.032864-176.032865-175.933299c-9.757478-9.757478-9.757478-25.488922 0-35.246399 9.757478-9.757478 25.488922-9.757478 35.2464 0l176.032864 176.032865 176.032865-176.032865c9.757478-9.757478 25.488922-9.757478 35.246399 0 9.757478 9.757478 9.757478 25.488922 0 35.246399L549.804004 514.15934 725.836868 690.192204c9.657912 9.757478 9.657912 25.488922 0 35.2464z"
                fill="#F56C6C" p-id="20691"></path>
        </svg>
        <div class="pop-up-info">登录出现错误！请稍后再试！</div>`;
        document.body.appendChild(popupDiv); // 添加到body元素

        popup();
     }

    //重置密码成功
    if (currentUrl.searchParams.has('reset_success')) {
        var popupDiv = document.createElement('div');
        popupDiv.classList.add('pop-up');
        popupDiv.innerHTML = `<svg t="1718546275538" class="pop-up-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="13535" width="1vw" height="1vw">
            <path
                d="M874.119618 149.859922A510.816461 510.816461 0 0 0 511.997 0.00208a509.910462 509.910462 0 0 0-362.119618 149.857842c-199.817789 199.679789-199.817789 524.581447 0 724.260236a509.969462 509.969462 0 0 0 362.119618 149.857842A508.872463 508.872463 0 0 0 874.119618 874.120158c199.836789-199.679789 199.836789-524.581447 0-724.260236zM814.94268 378.210681L470.999043 744.132295a15.359984 15.359984 0 0 1-5.887994 4.095996c-1.751998 1.180999-2.913997 2.362998-5.276994 2.913997a34.499964 34.499964 0 0 1-13.469986 2.914997 45.547952 45.547952 0 0 1-12.897986-2.303998l-4.095996-2.363997a45.291952 45.291952 0 0 1-7.009992-4.095996l-196.902793-193.789796a34.126964 34.126964 0 0 1-10.555989-25.186973c0-9.37399 3.583996-18.74698 9.98399-25.186974a36.429962 36.429962 0 0 1 50.372947 0l169.98382 167.423824L763.389735 330.220732a37.059961 37.059961 0 0 1 50.371947-1.732998 33.647965 33.647965 0 0 1 11.165988 25.186973 35.544963 35.544963 0 0 1-9.98399 24.575974v-0.04z m0 0"
                fill="#52C41A" p-id="13536"></path>
        </svg>
        <div class="pop-up-info">密码重置成功。</div>`;
        document.body.appendChild(popupDiv); // 添加到body元素

        popup();
    }
});

//提交注册表单前验证是否获取验证码
document.getElementById('signup-form').addEventListener('submit', function(event) {
    if(!document.getElementById('verify').classList.contains('counting')){
        alert('请先获取验证码！注册失败！')
        event.preventDefault(); // 阻止表单提交
    }
    else{
        console.log('验证通过，可以提交注册表单！');
    }
});

// 读取Cookie
function getCookieValue(cookieName) {
    let cookieArray = document.cookie.split('; ');
    let cookieValue = null;

    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        let equalsIndex = cookie.indexOf('=');

        if (equalsIndex > -1) {
            let name = cookie.substring(0, equalsIndex);
            if (name === cookieName) {
                cookieValue = cookie.substring(equalsIndex + 1);
                break;
            }
        }
    }

    return cookieValue;
}

// 将读取到的email填入到所有name=email的input中
function fillEmailInputs() {
    let emailValue = getCookieValue('email');
    if (emailValue) {
        let emailInputs = document.querySelectorAll('input[name="email"]');
        for (let i = 0; i < emailInputs.length; i++) {
            emailInputs[i].value = emailValue;
        }
    }
}

// 自动填写email
fillEmailInputs();
