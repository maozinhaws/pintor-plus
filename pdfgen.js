// ╔══════════════════════════════════════════════════════════╗
// ║  PDF GENERATION — pdfmake for Pintor Plus            ║
// ╚══════════════════════════════════════════════════════════╝

// ── Utility functions ──
function _escPdf(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Build PDF document definition for pdfmake ──
function buildPdfMakeDoc(orc, withPhotos) {
  const cfg = S.config || defCfg;
  const total = calcOrcTotal(orc);
  let totalM2 = 0;

  // Logo placeholder or image
  let logoImage = null;
  if (cfg.logo && cfg.logo.startsWith('data:image')) {
    logoImage = cfg.logo;
  }

  // Calculate totals
  (orc.rooms || []).forEach(r => {
    const meds = getRoomMeds(r);
    totalM2 += meds.m2;
  });

  // Build client info
  const clientInfo = [];
  if (orc.nome) clientInfo.push({ text: 'Nome: ' + orc.nome, fontSize: 11, color: '#334155' });
  if (orc.tel) clientInfo.push({ text: 'Telefone: ' + orc.tel, fontSize: 11, color: '#334155' });
  if (orc.email) clientInfo.push({ text: 'Email: ' + orc.email, fontSize: 11, color: '#334155' });
  if (orc.end) clientInfo.push({ text: 'Endereço: ' + orc.end, fontSize: 11, color: '#334155' });
  if (orc.cpf) clientInfo.push({ text: 'CPF/CNPJ: ' + orc.cpf, fontSize: 11, color: '#334155' });

  // Build rooms/items content
  const roomsContent = [];

  (orc.rooms || []).forEach((r, roomIdx) => {
    const meds = getRoomMeds(r);
    
    // Room header
    const roomItems = [];
    
    // Room base price
    if (r.preco) {
      const priceText = r.precoPerM2 
        ? 'Preço base: R$ ' + r.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '/m²'
        : 'Preço fixo: R$ ' + r.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      roomItems.push({
        text: priceText,
        fontSize: 10,
        color: '#64748b',
        margin: [0, 2, 0, 4]
      });
    }

    // Items
    (r.items || []).forEach((it, itemIdx) => {
      const a = ptFloat(it.alt);
      const c = ptFloat(it.comp);
      const measure = (a && c) ? (a * c).toFixed(2) + ' m²' : (a || c ? (a || c).toFixed(2) + ' ml' : '');
      const services = (it.services || []).length > 0 ? ' (' + it.services.join(', ') + ')' : '';
      const price = it.price 
        ? (it.perMeter ? `R$ ${it.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m` : `R$ ${it.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
        : '';

      const itemText = `- ${it.name || 'Item'}${services}`;
      const measureText = measure ? ` [${measure}]` : '';
      const priceText = price ? ` → ${price}` : '';

      roomItems.push({
        text: itemText + measureText + priceText,
        fontSize: 10,
        color: '#0f172a',
        margin: [10, 2, 0, 2]
      });

      if (it.obs) {
        roomItems.push({
          text: '   Obs: ' + it.obs,
          fontSize: 9,
          color: '#64748b',
          italics: true,
          margin: [10, 0, 0, 2]
        });
      }

      // Photos
      if (withPhotos && it.photos && it.photos.length > 0) {
        const photoImages = it.photos
          .filter(p => p.url && p.url.startsWith('data:image'))
          .slice(0, 3) // Max 3 photos per item
          .map(p => ({
            image: p.url,
            width: 100,
            margin: [10, 4, 4, 4]
          }));

        if (photoImages.length > 0) {
          roomItems.push({
            columns: photoImages,
            margin: [10, 4, 0, 4]
          });
        }
      }
    });

    // Room card
    roomsContent.push({
      stack: [
        {
          text: '📍 LOCAL: ' + (r.name || 'Sem nome').toUpperCase(),
          fontSize: 12,
          bold: true,
          color: '#0f172a',
          margin: [0, roomIdx > 0 ? 10 : 0, 0, 8]
        },
        ...roomItems
      ],
      style: 'roomCard',
      margin: [0, 0, 0, 8]
    });
  });

  // Build footer info
  const footerInfo = [];
  if (totalM2 > 0) {
    footerInfo.push({ text: 'ÁREA TOTAL APROX.: ' + totalM2.toFixed(2) + ' m²', fontSize: 10, bold: true, margin: [0, 0, 0, 4] });
  }
  if (orc.tipoServico) {
    footerInfo.push({ text: 'ESCOPO: ' + orc.tipoServico, fontSize: 10, margin: [0, 0, 0, 4] });
  }
  if (orc.valid) {
    footerInfo.push({ text: 'VALIDADE: ' + orc.valid + ' dias', fontSize: 10, margin: [0, 0, 0, 4] });
  }
  const pgtoArr = Array.isArray(orc.pgto) ? orc.pgto : (typeof orc.pgto === 'string' ? [orc.pgto] : []);
  if (pgtoArr.length > 0) {
    footerInfo.push({ text: 'PAGAMENTO: ' + pgtoArr.join(', '), fontSize: 10, margin: [0, 0, 0, 4] });
  }
  if (orc.obs) {
    footerInfo.push({
      text: 'OBSERVAÇÕES: ' + orc.obs,
      fontSize: 9,
      color: '#92400e',
      margin: [0, 8, 0, 0],
      background: '#fffbeb',
      border: [1, 1, 1, 1],
      borderColor: '#fde68a'
    });
  }

  // Build main document
  const orcId = String(orc.id || Date.now()).slice(-6);

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    pageOrientation: 'portrait',
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 11
    },
    content: [
      // Header
      {
        columns: [
          {
            width: logoImage ? 80 : 60,
            stack: logoImage
              ? [{ image: logoImage, width: 70, height: 50 }]
              : [{
                  text: (cfg.empresa || 'PP').charAt(0).toUpperCase(),
                  fontSize: 28,
                  bold: true,
                  color: '#7c3aed',
                  alignment: 'center',
                  fill: '#f5f3ff',
                  margin: [0, 5, 0, 5]
                }]
          },
          {
            width: '*',
            stack: [
              { text: cfg.empresa || 'Empresa PintorPlus', fontSize: 18, bold: true, color: '#0f172a' },
              cfg.tel ? { text: 'Tel: ' + cfg.tel, fontSize: 10, color: '#334155' } : {},
              cfg.emailEmpresa ? { text: 'Email: ' + cfg.emailEmpresa, fontSize: 10, color: '#334155' } : {},
              cfg.endEmpresa ? { text: cfg.endEmpresa, fontSize: 10, color: '#334155' } : {},
              cfg.doc ? { text: 'CNPJ/CPF: ' + cfg.doc, fontSize: 10, color: '#334155' } : {}
            ]
          },
          {
            width: 120,
            stack: [
              { text: 'ORÇAMENTO', fontSize: 20, bold: true, color: '#7c3aed', alignment: 'right' },
              { text: 'Nº #' + orcId, fontSize: 12, bold: true, color: '#64748b', alignment: 'right' },
              { text: 'Data: ' + (orc.date || new Date().toLocaleDateString('pt-BR')), fontSize: 10, color: '#64748b', alignment: 'right' }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },

      // Client section
      {
        stack: [
          { text: 'DADOS DO CLIENTE', fontSize: 11, bold: true, color: '#7c3aed', margin: [0, 0, 0, 8] },
          ...clientInfo
        ],
        style: 'clientCard',
        margin: [0, 0, 0, 20],
        fill: '#f8fafc',
        border: [1, 1, 1, 1],
        borderColor: '#cbd5e1',
        padding: 15
      },

      // Rooms/Services section
      {
        text: 'SERVIÇOS A REALIZAR',
        fontSize: 13,
        bold: true,
        color: '#0f172a',
        margin: [0, 0, 0, 12]
      },
      ...roomsContent,

      // Footer with totals
      {
        columns: [
          {
            width: '*',
            stack: footerInfo
          },
          {
            width: 150,
            stack: [
              { text: 'TOTAL DO ORÇAMENTO', fontSize: 10, bold: true, color: '#64748b', alignment: 'right', margin: [0, 0, 0, 4] },
              { text: 'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), fontSize: 24, bold: true, color: '#15803d', alignment: 'right' }
            ]
          }
        ],
        margin: [0, 20, 0, 0]
      }
    ],

    styles: {
      roomCard: {
        background: '#ffffff',
        border: [1, 1, 1, 1],
        borderColor: '#e2e8f0'
      }
    },

    footer: function(currentPage, pageCount) {
      return {
        text: 'Gerado pelo Pintor Plus · pintorplus.com.br',
        fontSize: 8,
        color: '#94a3b8',
        alignment: 'center',
        margin: [0, 10, 0, 0]
      };
    }
  };

  return docDefinition;
}

// ── Generate PDF blob using pdfmake ──
async function generatePdfMakeBlob(orc, withPhotos) {
  return new Promise((resolve, reject) => {
    try {
      const docDefinition = buildPdfMakeDoc(orc, withPhotos);

      const orcId = String(orc.id || Date.now()).slice(-6);
      const nomeCli = (orc.nome || 'Orcamento').replace(/[^a-zA-ZÀ-ÿ0-9]/g, '_');
      const fileName = `OC_${nomeCli}_${orcId}.pdf`;

      const pdfMake = window.pdfMake || window.pdfMakeDoc;
      if (!pdfMake) {
        reject(new Error('pdfmake não carregado'));
        return;
      }

      pdfMake.createPdf(docDefinition).getBlob(blob => {
        resolve({
          blob: blob,
          fileName: fileName
        });
      });
    } catch (error) {
      console.error('[PDF] Erro na geração:', error);
      reject(error);
    }
  });
}

// ── Generate receipt PDF using pdfmake ──
function generateReceiptPdfMake(data) {
  const cfg = S.config || defCfg;
  const extenso = valorPorExtenso(data.valor);
  const valorFmt = _reciboFmtBRL(data.valor);
  const dataFmt = _reciboFmtData(data.dataRecebimento);
  const cidade = (cfg.endEmpresa || '').split('—').pop().trim() || 'Local';

  // Logo
  let logoImage = null;
  if (cfg.logo && cfg.logo.startsWith('data:image')) {
    logoImage = cfg.logo;
  }

  // Company initial
  const companyInitial = (cfg.empresa || 'P').charAt(0).toUpperCase();

  const docDefinition = {
    pageSize: 'A5',
    pageMargins: [40, 40, 40, 40],
    pageOrientation: 'portrait',
    content: [
      // Header
      {
        columns: [
          {
            width: 50,
            stack: logoImage
              ? [{ image: logoImage, width: 40, height: 40 }]
              : [{
                  text: companyInitial,
                  fontSize: 24,
                  bold: true,
                  color: '#7c3aed',
                  alignment: 'center',
                  fill: '#ede9fe'
                }]
          },
          {
            width: '*',
            stack: [
              { text: cfg.empresa || 'Prestador', fontSize: 14, bold: true },
              { text: (cfg.doc ? 'CNPJ/CPF: ' + cfg.doc + ' · ' : '') + (cfg.tel || ''), fontSize: 9, color: '#64748b' },
              { text: cfg.emailEmpresa || '', fontSize: 9, color: '#64748b' },
              { text: cfg.endEmpresa || '', fontSize: 9, color: '#64748b' }
            ]
          },
          {
            width: 100,
            stack: [
              { text: 'RECIBO', fontSize: 22, bold: true, color: '#7c3aed', alignment: 'right' },
              { text: data.id, fontSize: 9, color: '#475569', alignment: 'right' },
              { text: 'Data: ' + dataFmt, fontSize: 9, color: '#64748b', alignment: 'right' }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },

      // Legal text
      {
        text: 'Recebi(emos) de ' + data.cliente.nome +
              (data.cliente.doc ? ', portador(a) do CPF/CNPJ ' + data.cliente.doc : '') +
              ' a importância de ' + extenso + ' (' + valorFmt + '), ' +
              'referente a ' + data.descServicos + ', ' +
              'pago mediante ' + data.pgto + '. ' +
              (cidade ? cidade + ', ' + dataFmt + '.' : ''),
        fontSize: 12,
        alignment: 'justify',
        margin: [0, 0, 0, 20],
        background: '#f8fafc',
        border: [1, 1, 1, 1],
        borderColor: '#e2e8f0',
        padding: 15
      },

      // Client info
      {
        text: 'DADOS DO CLIENTE',
        fontSize: 10,
        bold: true,
        color: '#7c3aed',
        margin: [0, 0, 0, 8]
      },
      {
        columns: [
          { text: 'Nome', fontSize: 9, color: '#94a3b8' },
          { text: data.cliente.nome || '—', fontSize: 11, bold: true }
        ],
        margin: [0, 0, 0, 4]
      },
      data.cliente.doc ? {
        columns: [
          { text: 'CPF/CNPJ', fontSize: 9, color: '#94a3b8' },
          { text: data.cliente.doc, fontSize: 11 }
        ],
        margin: [0, 0, 0, 4]
      } : {},
      data.cliente.tel ? {
        columns: [
          { text: 'Telefone', fontSize: 9, color: '#94a3b8' },
          { text: data.cliente.tel, fontSize: 11 }
        ],
        margin: [0, 0, 0, 4]
      } : {},
      data.cliente.end ? {
        columns: [
          { text: 'Endereço', fontSize: 9, color: '#94a3b8' },
          { text: data.cliente.end, fontSize: 11 }
        ],
        margin: [0, 0, 0, 4]
      } : {},

      // Observations
      data.obs ? {
        text: 'Observações: ' + data.obs,
        fontSize: 10,
        color: '#475569',
        margin: [0, 12, 0, 0]
      } : {},

      // Signature area
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Prestador de Serviço', fontSize: 9, color: '#94a3b8', alignment: 'center', margin: [0, 30, 0, 4] },
              data.sigPintor
                ? { image: data.sigPintor, width: 150, alignment: 'center' }
                : { text: '', margin: [0, 25, 0, 0], border: [false, true, false, false] },
              { text: cfg.empresa || '', fontSize: 10, bold: true, alignment: 'center', margin: [0, 4, 0, 0] },
              cfg.doc ? { text: cfg.doc, fontSize: 8, color: '#94a3b8', alignment: 'center' } : {}
            ]
          },
          {
            width: '*',
            stack: [
              { text: 'Cliente (opcional)', fontSize: 9, color: '#94a3b8', alignment: 'center', margin: [0, 30, 0, 4] },
              { text: '', margin: [0, 25, 0, 0], border: [false, true, false, false] },
              { text: data.cliente.nome || '', fontSize: 10, bold: true, alignment: 'center', margin: [0, 4, 0, 0] }
            ]
          }
        ],
        margin: [0, 20, 0, 0]
      },

      // Disclaimer
      {
        text: '⚠️ Este recibo não tem valor como documento fiscal. Não substitui Nota Fiscal de Serviço (NFS-e). Serve apenas como comprovante de pagamento entre as partes.',
        fontSize: 8,
        color: '#92400e',
        background: '#fef3c7',
        alignment: 'center',
        margin: [0, 20, 0, 0]
      }
    ],

    footer: {
      text: 'Gerado pelo Pintor Plus · pintorplus.com.br · ID: ' + data.id,
      fontSize: 7,
      color: '#94a3b8',
      alignment: 'center',
      margin: [0, 10, 0, 0]
    }
  };

  return docDefinition;
}

// ── Generate and download receipt PDF ──
async function generateAndDownloadReceipt(data) {
  return new Promise((resolve, reject) => {
    try {
      const docDefinition = generateReceiptPdfMake(data);
      const pdfMake = window.pdfMake || window.pdfMakeDoc;
      if (!pdfMake) {
        reject(new Error('pdfmake não carregado'));
        return;
      }

      pdfMake.createPdf(docDefinition).getBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Recibo_${data.id}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        resolve(true);
      });
    } catch (error) {
      console.error('[PDF] Erro ao gerar recibo:', error);
      reject(error);
    }
  });
}

// ── Wrapper for share functionality ──
async function sharePdfMake(orc, withPhotos) {
  try {
    toast('<svg class="ico" aria-hidden="true"><use href="#ico-loader"/></svg> Gerando PDF...');
    const { blob, fileName } = await generatePdfMakeBlob(orc, withPhotos);
    const file = new File([blob], fileName, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Orçamento - ' + (orc.nome || 'PintorPlus'),
        text: 'Segue o orçamento solicitado.'
      });
    } else {
      // Fallback: download
      _downloadBlob(blob, fileName);
    }

    // Upload to Google Drive if connected
    if (GDrive.accessToken) {
      try {
        const folderId = await GDrive.getOrCreateFolder('Orçamentos');
        if (folderId) await GDrive.uploadFile(file, folderId);
      } catch (e) {
        console.error('Upload PDF falhou:', e);
      }
    }

    return true;
  } catch (e) {
    if (e?.name !== 'AbortError') {
      console.error('[PDF] sharePdfMake falhou:', e);
      toast('<svg class="ico" aria-hidden="true"><use href="#ico-alert"/></svg> Erro ao gerar PDF.');
    }
    return false;
  }
}

// ── Silent PDF generation for auto-upload ──
async function generateSilentPdf(orc, withPhotos) {
  try {
    const { blob, fileName } = await generatePdfMakeBlob(orc, withPhotos);
    const file = new File([blob], fileName, { type: 'application/pdf' });

    if (GDrive.accessToken) {
      try {
        const folderId = await GDrive.getOrCreateFolder('Orçamentos');
        if (folderId) await GDrive.uploadFile(file, folderId);
      } catch (e) {
        console.error('Silent upload falhou:', e);
      }
    }

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Orçamento', text: 'Segue o orçamento.' });
    } else {
      _downloadBlob(blob, fileName);
    }
    return true;
  } catch (e) {
    console.error('[PDF] Silent PDF falhou:', e);
    return false;
  }
}
