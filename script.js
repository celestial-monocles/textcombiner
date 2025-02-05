let uploadedFiles = [];

document.getElementById('uploadBtn').addEventListener('click', function () {
  const fileInput = document.getElementById('files');
  const files = fileInput.files;

  if (files.length === 0) {
    alert('Please select some files to upload!');
    return;
  }

  const uploadedFilesContainer = document.getElementById('uploadedFiles');

  for (const file of files) {
    // Check if the file already exists in the uploadedFiles array
    const existingFileIndex = uploadedFiles.findIndex(existingFile => existingFile.name === file.name);

    if (existingFileIndex !== -1) {
      // If the file exists, replace the old one in the array and update the UI
      uploadedFiles[existingFileIndex] = file;

      // Find and update the corresponding file item in the uploadedFilesContainer
      const listItem = uploadedFilesContainer.children[existingFileIndex];
      listItem.firstChild.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    } else {
      // If the file doesn't exist, add it to the array and display it in the UI
      const listItem = document.createElement('li');
      listItem.classList.add('file-item');
      listItem.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;

      // Remove button for each file
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => removeFile(file.name, listItem));

      listItem.appendChild(removeButton);
      uploadedFilesContainer.appendChild(listItem);

      // Add file to uploadedFiles array
      uploadedFiles.push(file);
    }
  }

  // Clear file input after uploading
  fileInput.value = '';

  // Reinitialize sortable list after adding files
  initializeSortable();
});

// Remove file from the list
function removeFile(fileName, listItem) {
  const uploadedFilesContainer = document.getElementById('uploadedFiles');
  uploadedFilesContainer.removeChild(listItem);

  // Remove file from the uploadedFiles array
  uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
}

// Initialize sortable functionality
function initializeSortable() {
  new Sortable(document.getElementById('uploadedFiles'), {
    handle: '.file-item',  // Allow reordering by dragging the list items
    animation: 150, // Smooth animation during reorder
    onEnd: () => updateFileOrder()
  });
}

// Update the uploadedFiles array after the user reorders the list
function updateFileOrder() {
  const fileListItems = document.querySelectorAll('#uploadedFiles li');

  uploadedFiles = Array.from(fileListItems).map(item => {
    const fileName = item.firstChild.textContent.trim().split(' ')[0];  // Get the file name only
    return uploadedFiles.find(file => file.name === fileName);  // Find the file by its name
  }).filter(file => file !== undefined); // Remove any undefined values if there are any mistakes
}

// Combine files based on the new order
document.getElementById('combineBtn').addEventListener('click', async function () {
  if (uploadedFiles.length === 0) {
    alert('Please upload some files to combine.');
    return;
  }

  let combinedText = '';
  const addLineBreak = document.getElementById('lineBreakToggle').checked;  // Get checkbox status

  for (let file of uploadedFiles) {
    const fileContent = await file.text();
    const hasPreExistingGap = fileContent.trim().endsWith('\n'); // Check if there's a pre-existing line gap

    // Handle line breaks
    if (addLineBreak) {
      if (hasPreExistingGap) {
        combinedText += fileContent.trim() + '\n\n';  // Add two newlines if there's already a gap at the end
      } else {
        combinedText += fileContent.trim() + '\n\n';  // Add double newline (gap and line break)
      }
    } else {
      if (hasPreExistingGap) {
        combinedText += fileContent.trim() + '\n';  // Add just one newline if there's already a gap at the end
      } else {
        combinedText += fileContent.trim() + '\n';  // Add a single newline for files without pre-existing gaps
      }
    }
  }

  // Display the combined text
  document.getElementById('combinedText').textContent = combinedText.trim(); // Avoid trailing newline at the end
});

// Download button functionality
document.getElementById('downloadButton').addEventListener('click', function () {
  const combinedText = document.getElementById('combinedText').textContent;
  const blob = new Blob([combinedText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'combined.txt';  // Set default file name
  link.click();  // Trigger the download
});

// Copy button functionality
document.getElementById('copyButton').addEventListener('click', function () {
  const copyButton = this; // Reference to the button
  const combinedText = document.getElementById('combinedText').textContent;

  if (!combinedText) {
    return; // Do nothing if there's no text to copy
  }

  navigator.clipboard.writeText(combinedText).then(() => {
    copyButton.textContent = 'Copied!'; // Change text to "Copied!"
    copyButton.style.backgroundColor = '#2e7d32'; // Change color to indicate success

    setTimeout(() => {
      copyButton.textContent = 'Copy'; // Revert text back to "Copy"
      copyButton.style.backgroundColor = '#4CAF50'; // Reset original color
    }, 2000); // Revert after 2 seconds
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
});
