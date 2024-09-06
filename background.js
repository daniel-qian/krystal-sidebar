// let conversationId; // 初始化全局变量

// 扩展程序安装时的事件监听器
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  createNewConversation();
});

// 消息监听器，接收来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendToChatGPT') {
    console.log('Received message to send text to QianFan:', message.text);
    sendSelectionToServer(message.text, message.book, sender.tab.id, sendResponse);
    return true; // 返回true表示响应将异步发送
  } else if (message.action === 'saveFeedback') {
    saveFeedbackToServer(message.feedback, sendResponse);
    return true; // 返回true表示响应将异步发送
  }
});

// 创建新的对话会话
function createNewConversation() {
  fetch('http://47.251.76.117:3000/generate-conversation-id', {
    // mode:'no-cors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Conversation created:', data);
    if (data && data.conversation_id) {
      conversationId = data.conversation_id;
      console.log("conversationID",conversationId)
      // 发送 conversationId 到 content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'setConversationId', conversationId: conversationId });
          console.log('Send conversationid to content:', conversationId);
        }
      });
    } else {
      console.error('Unexpected response format from Baidu Qianfan:', data);
    }
  })
  .catch(error => {
    console.error('Error during fetch from Baidu Qianfan:', error);
  });
}


// 将选中的文本发送到服务器 路由名为/send-query
function sendSelectionToServer(selectedText, bookTitle, tabId, sendResponse) {
  try {
    console.log('Selected text:', selectedText);
    console.log('Book title:', bookTitle); // 打印书名

    // 通知开始请求 API
    chrome.tabs.sendMessage(tabId, { action: 'updateLoading', text: 'Requesting API...' });

    fetch('http://47.251.76.117:3000/send-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: selectedText,
        conversation_id: conversationId,
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.response) {
        const QianFanResponse = JSON.parse(data.response).answer;
        console.log('QianFan API response:', QianFanResponse);

        // 确保 QianFanResponse 是一个字符串而不是 JSON 对象
        const finalPrompt = QianFanResponse;

        // 通知开始调用后端生成图片
        chrome.tabs.sendMessage(tabId, { action: 'updateLoading', text: 'Generating image...' });

        // 调用你的后端 API
        fetch('http://47.251.76.117:3000/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt: QianFanResponse, book: bookTitle }) // 添加书名到请求体
        })
        .then(response => response.json())
        .then(result => {
          if (result && result.screenshot) {
            console.log('Result from Lexica:', result);

            // 通知开始保存数据
            chrome.tabs.sendMessage(tabId, { action: 'updateLoading', text: 'Saving data...' });

            // 保存数据，包括默认评价 "no comment"
            fetch('http://47.251.76.117:3000/save-data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ book: bookTitle, text: selectedText, response: QianFanResponse, image_paths: result.image_paths, feedback: 'no comment' }) // 添加书名和图片链接到请求体
            })
            .then(saveResponse => saveResponse.json())
            .then(saveData => {
              console.log('Data saved:', saveData);
            })
            .catch(saveError => {
              console.error('Error saving data:', saveError);
              chrome.tabs.sendMessage(tabId, { action: 'showError', text: 'Error saving data. Try again.' });
              setTimeout(() => chrome.tabs.sendMessage(tabId, { action: 'hideLoading' }), 3000); // 3秒后自动隐藏
            });

            // 通知完成
            chrome.tabs.sendMessage(tabId, { action: 'displayScreenshot', screenshot: result.screenshot, text: selectedText }); // 传递 selectedText
            sendResponse({ success: true });
          } else {
            console.error('Error: Invalid result format from Lexica');
            chrome.tabs.sendMessage(tabId, { action: 'showError', text: 'Invalid result format from Lexica. Try again.' });
            setTimeout(() => chrome.tabs.sendMessage(tabId, { action: 'hideLoading' }), 3000); // 3秒后自动隐藏
            sendResponse({ success: false, error: 'Invalid result format from Lexica' });
          }
        })
        .catch(error => {
          console.error('Error calling Lexica API:', error);
          chrome.tabs.sendMessage(tabId, { action: 'showError', text: 'Error generating image. Try again.' });
          setTimeout(() => chrome.tabs.sendMessage(tabId, { action: 'hideLoading' }), 3000); // 3秒后自动隐藏
          sendResponse({ success: false, error: error.message });
        });
      } else {
        console.error('Unexpected response format from API:', data);
        chrome.tabs.sendMessage(tabId, { action: 'showError', text: 'Unexpected response from API. Try again.' });
        setTimeout(() => chrome.tabs.sendMessage(tabId, { action: 'hideLoading' }), 3000); // 3秒后自动隐藏
        sendResponse({ success: false, error: 'Unexpected response format from API' });
      }
    })
    .catch(error => {
      console.error('Error during fetch from API:', error);
      chrome.tabs.sendMessage(tabId, { action: 'showError', text: 'Error requesting API. Try again.' });
      setTimeout(() => chrome.tabs.sendMessage(tabId, { action: 'hideLoading' }), 3000); // 3秒后自动隐藏
      sendResponse({ success: false, error: error.message });
    });
  } catch (err) {
    console.error('Error in sendSelectionToServer:', err);
    chrome.tabs.sendMessage(tabId, { action: 'showError', text: 'Unexpected error. Try again.' });
    setTimeout(() => chrome.tabs.sendMessage(tabId, { action: 'hideLoading' }), 3000); // 3秒后自动隐藏
    sendResponse({ success: false, error: err.message });
  }
}

// 保存用户喜欢或不喜欢的反馈到服务器
function saveFeedbackToServer(feedback, sendResponse) {
  fetch('http://47.251.76.117:3000/save-feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ feedback })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Feedback saved:', data);
    sendResponse({ success: true });
  })
  .catch(error => {
    console.error('Error saving feedback:', error);
    sendResponse({ success: false, error: error.message });
  });
}
