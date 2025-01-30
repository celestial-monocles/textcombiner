const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public')); // For serving HTML/CSS/JS files

app.post('/combine', upload.array('files'), (req, res) => {
  const files = req.files;

  // Sort files by name (based on chapter and page number)
  files.sort((a, b) => {
    const getFileNumber = (filename) => {
      const match = filename.originalname.match(/Chapter(\d+).*?p(\d+)/);
      return match ? [parseInt(match[1]), parseInt(match[2])] : [0, 0];
    };

    const [chapterA, pageA] = getFileNumber(a);
    const [chapterB, pageB] = getFileNumber(b);

    if (chapterA !== chapterB) return chapterA - chapterB;
    return pageA - pageB;
  });

  let combinedContent = '';
  files.forEach((file) => {
    const fileContent = fs.readFileSync(file.path, 'utf-8');
    combinedContent += fileContent + '\n';
  });

  // Send the combined content back as a downloadable file
  res.setHeader('Content-Disposition', 'attachment; filename="combined.txt"');
  res.setHeader('Content-Type', 'text/plain');
  res.send(combinedContent);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
