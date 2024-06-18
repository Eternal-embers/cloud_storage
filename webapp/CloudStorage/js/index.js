//跳转道登录页面，在新的标签页打开登录页面
document.addEventListener('DOMContentLoaded', function () {
    var login = document.getElementById('login');
    login.addEventListener('click', function () {
        var timestamp = new Date().getTime();
        window.open('pages/login.html?t=' + timestamp , '_blank').focus();
    })
})

var parallaxElements = document.querySelectorAll('.parallax');

// 创建一个Intersection Observer实例
const observer = new IntersectionObserver((entries, observer) => {
    // 遍历所有观察到的条目
    entries.forEach(entry => {
        // 如果元素50%出现在视口中
        if (entry.intersectionRatio >= 0.5) {
            // 获取当前元素
            const targetElement = entry.target;

            // 计算元素距离文档顶部的距离
            const elementTop = targetElement.offsetTop;

            // 滚动到元素顶部
            window.scrollTo({
                top: elementTop,
                behavior: 'smooth' // 平滑滚动
            });
        }
    });
}, {
    // 配置选项
    root: null, // 观察者根元素，null表示视口
    rootMargin: '0px', // 根元素的边界盒，可以是正值或负值
    threshold: 0.5 // 触发回调的阈值，0.5表示50%
});

// 遍历parallaxElements NodeList，并观察每个元素
parallaxElements.forEach(parallaxElement => {
    observer.observe(parallaxElement);
});

// 定义滚动函数
function scrollToNextParallax(index) {
    const target = parallaxElements[index];

    // 计算parallax_2元素距离文档顶部的距离
    const elementTop = target.offsetTop;

    // 滚动到parallax_2元素顶部
    window.scrollTo({
        top: elementTop,
        behavior: 'smooth' // 使滚动平滑
    });
}

// 立即滚动到页面顶部
function scrollToTop() {
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'auto' // 'auto' 表示立即滚动
    });
}