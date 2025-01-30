document.getElementById('fileForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  
  const files = document.getElementById('files').files;
  if (files.length === 0) {
    alert('Please select some files to combine!');
    return;
  }

  // Sort files based on chapter and page number (assumes files are named properly)
  const sortedFiles = Array.from(files).sort((a, b) => {
    const getFileNumber = (filename) => {
      const match = filename.name.match(/Chapter(\d+).*?p(\d+)/);
      return match ? [parseInt(match[1]), parseInt(match[2])] : [0, 0];
    };

    const [chapterA, pageA] = getFileNumber(a);
    const [chapterB, pageB] = getFileNumber(b);

    if (chapterA !== chapterB) return chapterA - chapterB;
    return pageA - pageB;
  });

  let combinedText = '';

  for (let file of sortedFiles) {
    const fileContent = await file.text();
    combinedText += fileContent + '\n'; // Add each file's content with a newline between them
  }

  document.getElementById('combinedText').textContent = combinedText;
});

// Copy button functionality
document.getElementById('copyButton').addEventListener('click', function () {
  const combinedText = document.getElementById('combinedText').textContent;

  // Create a temporary textarea to copy the text to the clipboard
  const textarea = document.createElement('textarea');
  textarea.value = combinedText;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);

  alert('Combined text copied to clipboard!');
});
