// Function to create and show the floating button
function createFloatingButton() {
  const floatButton = document.createElement('div');
  floatButton.id = 'floatingButton';

  // Set the image for the floating button
  const floatImage = document.createElement('img');
  floatImage.src = chrome.runtime.getURL('icons/logo.png'); // Replace with the correct path to your image in the extension directory
  floatImage.alt = 'Open Sidebar';

  // Adjust the size of the image to fit inside the circular button
  floatImage.style.width = '100%'; // Image takes full width of the container
  floatImage.style.height = '100%'; // Image takes full height of the container
  floatImage.style.borderRadius = '50%'; // Makes the image itself circular

  floatButton.appendChild(floatImage);

  // Style the floating button to be larger and circular
  floatButton.style.cssText = `
      position: fixed;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 999999;
      cursor: pointer;
      background-color: white; /* Optional: Background color behind the image */
      border-radius: 50%; /* Makes the button circular */
      width: 80px; /* Adjust the size as needed */
      height: 80px; /* Adjust the size as needed */
      overflow: hidden; /* Ensures the image stays within the circular container */
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Optional: Adds a shadow for better visibility */
      border: 2px solid #ddd; /* Optional: Border around the button */
  `;

  document.body.appendChild(floatButton);

  // Event listener to open the sidebar when the button is clicked
  floatButton.addEventListener('click', function() {
      // Call the function to create and show the sidebar
      createSidebar();
      // Hide the floating button after opening the sidebar
      floatButton.style.display = 'none';
  });
}

// Function to create and show the sidebar
function createSidebar() {
  const iframe = document.createElement('iframe');
  iframe.id = 'sidebarIframe';
  iframe.src = chrome.runtime.getURL('sidebar.html');
  iframe.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 500px;
      height: 100%;
      border: none;
      z-index: 999999;
  `;
  document.body.appendChild(iframe);
  window.addEventListener('message', function(event) {
    if (event.data.action === 'closeSidebar') {
        // Remove the iframe
        iframe.parentNode.removeChild(iframe);
        // Show the floating button again
        document.getElementById('floatingButton').style.display = 'block';
    }
});
  
}

// Initialize the floating button
createFloatingButton();
