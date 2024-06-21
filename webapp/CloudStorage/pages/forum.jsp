<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.io.*" %>
<%@ page import="java.util.*" %>

<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>论坛</title>
    <link rel="icon" type="image/png" href="../image/forum.png">
    <link rel="stylesheet" href="../css/forum.css">
    <script defer src="../js/forum.js"></script>
</head>

<body>

<header>
    <nav>
        <ul>
            <li><a href="main.jsp">首页</a></li>
            <li><a href="#">最新帖子</a></li>
            <li><a href="#">热门讨论</a></li>
            <li><a href="publish.html">发帖</a></li>
        </ul>
    </nav>
</header>

<main>
    <section class="forum">
        <article class="thread">
            <article class="blog-post">
                <div class="blog-post-header">
                    <h1 class="blog-post-title">如何创建一个简洁美观的博客文章</h1>
                    <div class="blog-post-meta">
                        <span class="blog-post-author">作者：赖清文</span>
                        <span class="blog-post-date">2024年6月21日</span>
                    </div>
                </div>
                <section class="blog-post-content">
                    <p>在当今快节奏的网络世界中，简洁和美观是吸引读者的关键。这篇文章将指导你如何创建一个既简洁又美观的博客文章，让你的内容脱颖而出。</p>
                    <p>首先，选择一个合适的字体和颜色方案。使用清晰易读的字体，如 Arial, Helvetica 或者 Georgia。颜色方案应该是柔和的，避免使用过于鲜艳的颜色，以免分散读者的注意力。</p>
                    <h2>文章结构</h2>
                    <p>文章应该有清晰的结构，包括引言、主体和结论。使用标题和子标题来组织内容，使读者能够快速抓住文章的要点。</p>
                    <h2>视觉元素</h2>
                    <p>适当地添加图片、图表或视频可以提高文章的吸引力。确保这些视觉元素与文章内容相关，并且优化它们的尺寸以快速加载。</p>
                    <h2>空白的艺术</h2>
                    <p>空白是设计中一个重要的组成部分。它不仅能够提升文章的美观度，还能提高可读性。确保段落之间有足够的间距，避免文字堆积在一起。</p>
                    <p>最后，不要忘记对你的文章进行校对。一个没有语法错误和拼写错误的文章会给读者留下专业的印象。</p>
                    <p>简洁美观的博客文章能够提升用户体验，增加读者的参与度。希望这篇文章能够为你的写作之旅提供一些启发。</p>
                </section>
                <footer class="blog-post-footer">
                    <a href="#" class="blog-post-readmore">阅读更多</a>
                </footer>
            </article>
        </article>
    </section>

    <!-- 评论板块 -->
    <div id="commentsContainer" class="comments-container">
        <h3>评论列表</h3>
        <!-- 示例评论 -->
        <div class="comment">博主写得太棒了！(灬╹ω╹灬)</div>
        <div class="comment">干货满满，大赞！(｡╹ω╹｡)</div>
        <div class="comment">总结的很全面，是我想要的。٩( ╹▿╹ )۶</div>
    </div>

    <button id="loadMoreMessages">加载更多消息</button>

    <!-- 发表评论表单 -->
    <section class="comments">
        <h3>发表评论</h3>
        <form id="commentForm" class="comment-form">
            <div class="form-group">
                    <textarea id="commentContent" name="commentContent" rows="3" required
                              placeholder="写下你的评论..."></textarea>
            </div>

            <!-- 表情窗口触发按钮 -->
            <div id="emojiButton" title="表情">添加表情😄</div>

            <!-- 表情窗口，初始时隐藏 -->
            <div id="emojiWindow" class="emoji-window" style="display: none;">
                <div class="emoji-title">表情</div>
                <div class="emoji-grid">
                </div>
            </div>

            <script defer>
                // 表情数组
                const emojis = [
                                "(⁎⁍̴̛ᴗ⁍̴̛⁎)", "╰(✿´⌣`✿)╯♡", "(๑•́ ₃ •̀๑)ｴｰ",
                                "(๑ơ ₃ ơ)♥", "(๑¯ω¯๑)", "(ง •̀_•́)ง‼",
                                "٩(๑`^´๑)۶", "٩(๑òωó๑)۶", "(⌒ω⌒)",
                                "( ◠‿◠ )", "٩(๑˃̵ᴗ˂̵๑)۶", "ʕ•̀ω•́ʔ✧",
                                "(•ө•)♡", "( つ•̀ω•́)つ", "( ๑॔˃̶◡ ˂̶๑॓)◞♡",
                                "( ó × ò)", "( ๑͒･(ｴ)･๑͒)", "꒰ ๑͒ ･౪･๑͒꒱",
                                "꒰ ๑͒ óｪò๑͒꒱", "σ(o’ω’o)", "(๑•́ ₃ •̀๑)/",
                                "(･’ω’･)", "(｡◕ ∀ ◕｡)", "╲(｡◕‿◕｡)╱",
                                "(´｡✪ω✪｡｀)", "(✿╹◡╹)", "(* Ŏ∀Ŏ)",
                                "(๑◔‿◔๑)", "(δωδ)」", "(･◡ु‹ )",
                                "٩(๑òωó๑)۶", "(灬╹ω╹灬)", "•ू(ᵒ̴̶̷ωᵒ̴̶̷*•ू)",
                                "( ๑˃̶ ॣꇴ ॣ˂̶)♪⁺", "(๑˃̵ᴗ˂̵)و ﾖｼ!",
                                "(´◒`)", "(๑･㉨･๑)", "(｡╹ω╹｡)",
                                "(｀益´)がう", "٩( ╹▿╹ )۶", "(◍´ಲ`◍)",
                                "(●´ϖ`●)", "(◍3◍)", "(●♡ᴗ♡●)",
                                "(◍╹ｘ╹◍)", "(●☌◡☌●)", "(●･̆⍛･̆●)",
                                "(◕̻͠◸◕̻͠)", "ฅ ̳͒•ˑ̫• ̳͒ฅ♡",
                                "චᆽච", "༶ඬ༝ඬ༶", "ოර⌄රო",
                                "⁙ὸ‿ό⁙", "(,,◕ ⋏ ◕,,)", "(..＞◡＜..)",
                                "(,,Ծ‸Ծ,,)", "(◍•ᴗ•◍)❤", "✩◝(◍⌣̎◍)◜✩",
                                "!(•̀ᴗ•́)و ̑̑", "(ง ͡ʘ ͜ʖ ͡ʘ)ง", "╭∩╮(-_-)╭∩╮",
                                "(ಥ⌣ಥ)", "( ͡° ͜ʖ ͡°)", "(。^_・)ノ",
                                "ᕙ༼◕_◕༽ᕤ", "└(=^‥^=)┐", "(′︿‵｡)",
                                "٩(ↀДↀ)۶", "ʕ•͡-•ʔ", "ʕʘ̅͜ʘ̅ʔ",
                                "(✖╭╮✖)", "┌(˘⌣˘)ʃ", "✺◟(∗❛ัᴗ❛ั∗)◞✺", "(｡♥‿♥｡)",
                                "꒰⑅•ᴗ•⑅꒱", "٩(ˊ〇ˋ*)و", "(￣^￣)ゞ",
                                "(－‸ლ)", "(╯°益°)╯彡┻━┻", "┬─┬ノ( º _ ºノ)", "(oT-T)尸", "(ಠ_ಠ)",
                                "౦０o ｡ (‾́。‾́ )y~~", "(￣﹃￣)", "(x(x_(x_x(O_o)x_x)x_x)x)",
                                "( ･ω･)☞", "(⌐■_■)", "(◕‿◕✿)",
                                "( ￣.)o- 【 TV 】", "( • )( • )ԅ(≖‿≖ԅ)", "( ＾▽＾)っ✂╰⋃╯",
                                 "ଘ(੭ˊ꒳​ˋ)੭✧","(:3 」∠)", "∠( ᐛ 」∠)_"
                            ];

                // 动态生成表情项
                const emojiGrid = document.querySelector('.emoji-grid');
                emojis.forEach(emoji => {
                    const emojiItem = document.createElement('div');
                    emojiItem.classList.add('emoji-item');
                    emojiItem.textContent = emoji;
                    emojiGrid.appendChild(emojiItem);
                });
            </script>

            <button type="submit">提交评论</button>
        </form>


    </section>
</main>

</body>

</html>