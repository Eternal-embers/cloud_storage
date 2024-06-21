document.getElementById('loadMoreMessages').addEventListener('click', loadMessages);

let messageCount = 0;

function loadMessages() {
    const messageContainer = document.getElementById('commentsContainer');
    const messagesToLoad = 5; // 每次加载5条消息

    for (let i = 0; i < messagesToLoad; i++) {
        const message = document.createElement('div');
        message.classList.add('comment');
        message.textContent = `消息 ${++messageCount}: 这是一条模拟的消息内容。`;
        messageContainer.appendChild(message);
    }
}

document.getElementById('commentForm').addEventListener('submit', function (event) {
    event.preventDefault(); // 阻止表单默认提交行为

    const commentContent = document.getElementById('commentContent').value;

    // 这里可以添加 AJAX 请求发送评论数据到服务器

    // 模拟评论成功，清空表单
    if (commentContent.trim() !== '') {
        const commentContainer = document.getElementById('commentsContainer'); // 假设存在一个ID为commentsContainer的元素用于显示评论
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.textContent = commentContent; // 显示评论内容

        // 将新评论元素添加到评论容器中
        commentContainer.appendChild(commentElement);

        // 清空表单并重置
        this.reset();
        alert('评论发表成功！');
    } else {
        alert('评论内容不能为空！');
    }
});

// 获取表情窗口和按钮的DOM元素
const emojiButton = document.getElementById('emojiButton');
const emojiWindow = document.getElementById('emojiWindow');

// 插入表情到评论文本区域的函数
function insertEmoji(emoji) {
    const commentTextarea = document.getElementById('commentContent');
    commentTextarea.value += emoji; // 将表情添加到文本末尾
    commentTextarea.focus(); // 使文本区域获得焦点
}

// 点击按钮显示或隐藏表情窗口
emojiButton.addEventListener('click', function () {
    emojiWindow.style.display = emojiWindow.style.display === 'none' ? 'block' : 'none';
});

// 点击表情项的事件
document.querySelectorAll('.emoji-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.stopPropagation(); // 阻止事件冒泡
        insertEmoji(e.target.innerText);
    });
});