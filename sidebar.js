document.addEventListener("DOMContentLoaded", function() {
    const userNameElement = document.getElementById('userName');
    const maxFontSize = 18; // 最大字体大小
    const minFontSize = 12; // 最小字体大小
    const maxLines = 2; // 最大行数

    function adjustFontSize() {
        let fontSize = maxFontSize;
        const containerHeight = parseFloat(window.getComputedStyle(userNameElement).lineHeight) * maxLines;

        // 动态调整字体大小，直到用户名适应两行
        while (userNameElement.scrollHeight > containerHeight && fontSize > minFontSize) {
            fontSize--;
            userNameElement.style.fontSize = fontSize + 'px';
        }
    }

    adjustFontSize(); // 页面加载时执行

    // 如果需要在窗口调整时重新调整字体大小
    window.addEventListener('resize', adjustFontSize);

    const quotaBox = document.querySelector('.quotaBox');
    const tooltip = document.querySelector('.tooltip');

    let hideTimeout;

    function showTooltip() {
        clearTimeout(hideTimeout);
        tooltip.style.display = 'block';
    }

    function hideTooltip() {
        hideTimeout = setTimeout(function() {
            tooltip.style.display = 'none';
        }, 200); // 延迟隐藏 tooltip
    }

    quotaBox.addEventListener('mouseenter', showTooltip);
    quotaBox.addEventListener('mouseleave', function(event) {
        if (!tooltip.contains(event.relatedTarget)) {
            hideTooltip();
        }
    });

    tooltip.addEventListener('mouseenter', showTooltip);
    tooltip.addEventListener('mouseleave', function(event) {
        if (!quotaBox.contains(event.relatedTarget)) {
            hideTooltip();
        }
    });

    // 图片轮播部分
    const images = [
        'icons/dog1.png',
        'icons/dog2.png',
        'icons/dog3.png'
    ];

    let currentIndex = 0;
    const imageElement = document.getElementById('sidebarImage');
    const nextArrow = document.getElementById('nextArrow');

    function updateImage() {
        currentIndex = (currentIndex + 1) % images.length;
        imageElement.src = images[currentIndex];
    }

    nextArrow.addEventListener('click', function() {
        updateImage();
    });

    const downloadButton = document.getElementById('downloadButton');
    const likeButton = document.getElementById('likeButton');
    const dislikeButton = document.getElementById('dislikeButton');

    downloadButton.addEventListener('click', function() {
        alert('Download button clicked');
    });

    likeButton.addEventListener('click', function() {
        alert('Like button clicked');
    });

    dislikeButton.addEventListener('click', function() {
        alert('Dislike button clicked');
    });

    const rows = document.querySelectorAll('#section4 .button-row');

    rows.forEach(row => {
        const buttons = row.querySelectorAll('button');

        buttons.forEach(button => {
            button.addEventListener('click', function() {
                if (button.classList.contains('active')) {
                    button.classList.remove('active');
                    buttons.forEach(btn => btn.disabled = false);
                } else {
                    buttons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.disabled = false;
                    });
                    button.classList.add('active');
                    buttons.forEach(btn => {
                        if (!btn.classList.contains('active')) {
                            btn.disabled = true;
                        }
                    });
                }
            });
        });
    });

    const closeButton = document.getElementById('closeSidebarBtn');
    closeButton.addEventListener('click', function() {
        window.parent.postMessage({ action: 'closeSidebar' }, '*');
        window.parent.document.getElementById('floatingButton').style.display = 'block';
    });

    // 语言切换功能
    const languagePack = {
        "zh": {
            "username": "用户名",
            "balance": "额度",
            "inputLabel": "输入文本",
            "sendButton": "发送",
            "tabs": {
                "ancient": "古代",
                "modern": "近代",
                "future": "未来",
                "asia": "亚洲",
                "north America": "北美洲",
                "south America": "南美洲",
                "middle East": "中东",
                "africa": "非洲",
                "europe": "欧洲",
                "yellowRace": "黄色人种",
                "whiteRace": "白色人种",
                "blackRace": "黑色人种",
                "brownRace": "棕色人种"
            }
        },
        "en": {
            "username": "Username",
            "balance": "Balance",
            "inputLabel": "Input Text",
            "sendButton": "Send",
            "tabs": {
                "ancient": "Ancient",
                "modern": "Modern",
                "future": "Future",
                "asia": "Asia",
                "north America": "North America",
                "south America": "South America",
                "middle east": "Middle East",
                "africa": "Africa",
                "europe": "Europe",
                "yellowRace": "Yellow Race",
                "whiteRace": "White Race",
                "blackRace": "Black Race",
                "brownRace": "Brown Race"
            }
        }
    };

    let currentLanguage = "zh";

    const toggleLanguageButton = document.getElementById("languageToggleBtn");

    // 更新界面文字的函数
function updateLanguage(language) {
    // 更新用户名和额度
    document.getElementById("userName").innerText = languagePack[language]["username"];
    document.querySelector(".quotaBox").childNodes[0].nodeValue = `${languagePack[language]["balance"]}: 1992/2000`; // 仅更新额度文本，不影响子元素

    // 更新输入框标签
    document.querySelector(".input-label").innerText = languagePack[language]["inputLabel"];
    
    // 更新发送按钮
    document.getElementById("sendButton").innerText = languagePack[language]["sendButton"];

    // 更新标签文字
    const tabs = languagePack[language]["tabs"];
    const tabSpans = document.querySelectorAll("#section4 .label-text");  // 找到所有的 span.label-text 元素
    tabSpans[0].innerText = tabs["ancient"];
    tabSpans[1].innerText = tabs["modern"];
    tabSpans[2].innerText = tabs["future"];
    tabSpans[3].innerText = tabs["asia"];
    tabSpans[4].innerText = tabs["north America"];
    tabSpans[5].innerText = tabs["south America"];
    tabSpans[6].innerText = tabs["middle East"];
    tabSpans[7].innerText = tabs["africa"];
    tabSpans[8].innerText = tabs["europe"];
    tabSpans[9].innerText = tabs["yellowRace"];
    tabSpans[10].innerText = tabs["whiteRace"];
    tabSpans[11].innerText = tabs["blackRace"];
    tabSpans[12].innerText = tabs["brownRace"];
}


    toggleLanguageButton.addEventListener("click", function() {
        currentLanguage = currentLanguage === "zh" ? "en" : "zh";
        toggleLanguageButton.innerText = currentLanguage === "zh" ? "EN" : "中文";
        updateLanguage(currentLanguage);
    });

    // 初始化加载时更新页面文字
    updateLanguage(currentLanguage);
});
