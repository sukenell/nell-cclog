import jsPDF from "jspdf";

export function downloadFile(content, fileName) {
  const blob = new Blob([content], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadPDF(parseHtml, fileName, darkMode, chunkSize = 1000) {

  const content = parseHtml(darkMode);
  const chunks = splitContent(content, chunkSize);
  chunks.forEach((chunk, index) => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.width = "800px";
    tempDiv.style.padding = "20px";
    tempDiv.style.backgroundColor = darkMode ? "#2c2c2cde" : "white"
    tempDiv.style.color = darkMode ? "gray" : "black";
    tempDiv.style.fontFamily = "'Noto Sans KR', sans-serif";
    
    tempDiv.innerHTML = `
      <html>
        <head>
          <style>
          </style>
        </head>
        <body>
          ${chunk}
        </body>
      </html>
    `;

    document.body.appendChild(tempDiv);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    pdf.setFont("helvetica");

    const cleanFileName = fileName.replace(/\.[^/.]+$/, ""); 

    pdf.html(tempDiv, {
      callback: function (doc) {
        doc.save(`${cleanFileName}_part${index + 1}.pdf`);
        document.body.removeChild(tempDiv);
      },
      x: 10,
      y: 10,
      width: 190,
      windowWidth: tempDiv.scrollWidth
    });
  });
}

function splitContent(content, chunkSize) {
  const chunks = [];
  let currentIndex = 0;
  while (currentIndex < content.length) {
    chunks.push(content.slice(currentIndex, currentIndex + chunkSize));
    currentIndex += chunkSize;
  }
  return chunks;
}

export function handleDownload(parseHtml, fileName, type, darkMode) {
  if (type === "pdf") {
    downloadPDF(parseHtml, fileName, darkMode);
  } else {
    const style = darkMode ? `
      :root {
        --background-color: rgba(44, 44, 44, 0.87);
        --text-color: white;
      }
      body {
        background-color: var(--background-color);
        color: var(--text-color);
      }
    ` : `
      :root {
        --background-color: white;
        --text-color: black;
      }
      body {
        background-color: var(--background-color);
        color: var(--text-color);
      }
    `;

    const modifiedHtml = `
    <html>
      <head>
        <style>
          ${style}
            span:before {
            display: none !important ;
          }
        </style>
      </head>
      <body>
        ${parseHtml(darkMode)}
      </body>
    </html>`;

    const cleanFileName = fileName.replace(/\.[^/.]+$/, ""); 
    downloadFile(modifiedHtml, "custom_" + cleanFileName + ".html");
  }
}
