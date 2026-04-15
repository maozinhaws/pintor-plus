// Fix for blank PDF issue in Pintor Plus
// The problem occurs when html2pdf.js tries to generate PDF before content is fully rendered

// Add delay function for proper rendering
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Enhanced PDF generation with proper rendering wait
async function _generatePDFBlobFixed(orc, withPhotos) {
  // Generate HTML for the PDF
  const html = genPDFHtml(orc, withPhotos);

  // Create a hidden container to render the content
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.style.minHeight = '297mm'; // A4 height
  container.style.backgroundColor = 'white';
  container.innerHTML = html;

  document.body.appendChild(container);

  try {
    // Wait for content to render
    await delay(500); // Allow basic rendering

    // Force reflow to ensure content is painted
    void container.offsetWidth;

    // Additional wait for complex content
    await delay(300);

    // Configure html2pdf options
    const options = {
      margin: [5, 3, 5, 3],
      filename: `Orc_${orc.nome || 'SemNome'}_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate PDF
    const promise = new Promise((resolve, reject) => {
      try {
        html2pdf()
          .set(options)
          .from(container)
          .outputPdf('blob')
          .then(blob => {
            resolve({
              blob,
              fileName: options.filename
            });
          })
          .catch(error => {
            console.error('PDF generation error:', error);
            reject(error);
          });
      } catch (error) {
        console.error('PDF generation exception:', error);
        reject(error);
      }
    });

    const result = await promise;
    return result;
  } finally {
    // Clean up the container
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

// Alternative implementation with explicit rendering wait
async function _generatePDFBlobWithWait(orc, withPhotos) {
  return new Promise(async (resolve, reject) => {
    try {
      const html = genPDFHtml(orc, withPhotos);

      // Create temporary element
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm';
      tempDiv.style.padding = '10mm';
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.backgroundColor = 'white';
      document.body.appendChild(tempDiv);

      // Wait for DOM to be ready
      await delay(100);

      // Use requestAnimationFrame to ensure rendering
      await new Promise(resolve => requestAnimationFrame(() => resolve()));
      await delay(100);

      // Double animation frame for complex layouts
      await new Promise(resolve => requestAnimationFrame(() => resolve()));
      await delay(100);

      const options = {
        margin: 5,
        filename: `Orc_${orc.nome || 'SemNome'}_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf()
        .set(options)
        .from(tempDiv)
        .outputPdf('blob')
        .then(blob => {
          const fileName = options.filename;
          document.body.removeChild(tempDiv);
          resolve({ blob, fileName });
        })
        .catch(err => {
          console.error('PDF output error:', err);
          document.body.removeChild(tempDiv);
          reject(err);
        });
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Attempt cleanup
      const tempElements = document.querySelectorAll('[style*="-9999px"]');
      tempElements.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      reject(error);
    }
  });
}