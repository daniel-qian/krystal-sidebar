// 用户界面
// ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

document.addEventListener('DOMContentLoaded', () => {
  // 初始视图为登录界面
  showView('loginView');

  // 添加点击事件以切换到注册界面
  document.getElementById('registerLink').addEventListener('click', () => {
      showView('registerView');
  });

  // 添加点击事件以返回登录界面
  document.getElementById('backToLoginLink').addEventListener('click', () => {
      showView('loginView');
  });

  // 登录按钮事件
  document.getElementById('loginButton').addEventListener('click', () => {
      // 假设登录成功后显示用户信息界面
      showView('userInfoView');
  });

  // 完成注册按钮事件
  document.getElementById('completeRegistrationButton').addEventListener('click', () => {

    // 用户信息
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const initialQuota = 5; // 新用户的默认可用额度

    // 将账号和默认额度信息存储在chrome储存空间并且发送到服务器
    if (email && password) {
      // 将注册信息和初始额度存储到chrome.storage
      chrome.storage.local.set({
          tmp_Registration: { email, password, quota: initialQuota }
      }, () => {
          console.log('Registration information saved with initial quota:', { email, password, quota: initialQuota });

          // 发送消息给后台脚本，触发服务器注册
          chrome.runtime.sendMessage({ action: 'registerUser' }, (response) => {
              console.log('Background response:', response);
          });

          alert('Registration completed and information saved. Default Quota:5, enjoy！');
          showView('loginView'); // 注册完成后回到登录界面
      });
    } else {
      // 空白账号密码输入
      alert('Please fill in both email and password.');
    }

  });

  // 生成图片按钮事件
  document.getElementById('sendButton').addEventListener('click', () => {
      // 这里放生成图片的逻辑
      console.log('Generate image button clicked');
  });
});

// 切换视图的函数
function showView(viewId) {
  // 隐藏所有视图
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('registerView').classList.add('hidden');
  document.getElementById('userInfoView').classList.add('hidden');

  // 显示选中的视图
  document.getElementById(viewId).classList.remove('hidden');
}

// 封装获取用户信息的函数
async function loadUserInfo() {
  try {
      // 假设从Chrome的storage中获取用户的token
      const { token } = await chrome.storage.local.get('token');
      if (!token) {
          document.getElementById('username').textContent = 'Not logged in';
          document.getElementById('quota').textContent = 'N/A';
          return;
      }

      const response = await fetch('http://your-server-address/get-user-info', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });

      if (!response.ok) {
          throw new Error('Failed to fetch user info');
      }

      const data = await response.json();
      document.getElementById('username').textContent = data.username;
      document.getElementById('quota').textContent = data.free_usage_count;
  } catch (error) {
      console.error('Error loading user info:', error);
      document.getElementById('username').textContent = 'Error';
      document.getElementById('quota').textContent = 'Error';
  }
}

