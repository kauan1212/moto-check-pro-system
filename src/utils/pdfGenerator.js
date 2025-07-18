import jsPDF from 'jspdf';

const newLogoUrl = 'https://storage.googleapis.com/hostinger-horizons-assets-prod/ac761713-0f01-4aa3-a0ce-b3d2354486eb/cdda750bcbce7f37693d3220c262eb0e.jpg';
const CNPJ_EMPRESA = "55.050.610/0001-91";
const TELEFONE_EMPRESA = "(15) 99165-3601";
const ENDERECO_EMPRESA = "Rua Francisco Catalano 395 - Jardim Brasilândia";

const imageToDataUrl = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to fetch or convert image:", error);
    return null;
  }
};

export const generatePDF = async (vistoriaData, checklistItems) => {
  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 30; 
  const contentWidth = pageWidth - (2 * margin);
  let yPosition = margin;
  const lineHeightMultiplier = 1.15; 
  const sectionGap = 12; 
  const itemGap = 8; 
  const photoGap = 4; 

  const checkPageBreak = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  const addText = (text, x, y, options = {}) => {
    const fontSize = options.fontSize || 9; 
    const color = options.color || [0, 0, 0];
    const style = options.style || 'normal';
    const align = options.align || 'left';
    const maxWidth = options.maxWidth || contentWidth - (x - margin);
    
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.setFont(undefined, style);
    
    const lines = pdf.splitTextToSize(String(text), maxWidth);
    const textHeight = lines.length * fontSize * lineHeightMultiplier;
    checkPageBreak(textHeight);

    let textX = x;
    if (align === 'center') {
      textX = margin + (contentWidth - pdf.getStringUnitWidth(lines[0]) * fontSize / pdf.internal.scaleFactor) / 2;
       if (textX < margin) textX = margin;
    } else if (align === 'right') {
      textX = pageWidth - margin - (pdf.getStringUnitWidth(lines[0]) * fontSize / pdf.internal.scaleFactor);
    }
    
    pdf.text(lines, textX, y);
    return y + textHeight;
  };

  const logoDataUrl = await imageToDataUrl(newLogoUrl);
  let logoHeight = 0;
  if (logoDataUrl) {
    const imgProps = pdf.getImageProperties(logoDataUrl);
    const imgWidth = 55; 
    logoHeight = (imgProps.height * imgWidth) / imgProps.width;
    checkPageBreak(logoHeight);
    pdf.addImage(logoDataUrl, 'JPEG', margin, yPosition, imgWidth, logoHeight);
  }

  const headerTextX = margin + (logoDataUrl ? 65 : 0); 
  let companyInfoY = yPosition;
  companyInfoY = addText('LocAuto - Aluguel de Motos', headerTextX, companyInfoY, { fontSize: 16, style: 'bold', color: [0, 90, 110] });
  companyInfoY = addText(`CNPJ: ${CNPJ_EMPRESA}`, headerTextX, companyInfoY, { fontSize: 7, color: [70, 70, 70] });
  companyInfoY = addText(`Telefone: ${TELEFONE_EMPRESA}`, headerTextX, companyInfoY, { fontSize: 7, color: [70, 70, 70] });
  companyInfoY = addText(`Endereço: ${ENDERECO_EMPRESA}`, headerTextX, companyInfoY, { fontSize: 7, color: [70, 70, 70] });

  yPosition = Math.max(yPosition + logoHeight, companyInfoY) + sectionGap;
  
  checkPageBreak(1);
  pdf.setDrawColor(180, 180, 180); 
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += sectionGap;

  checkPageBreak(25);
  yPosition = addText('RELATÓRIO DE VISTORIA DE VEÍCULO', margin, yPosition, { fontSize: 13, style: 'bold', align: 'center'});
  yPosition += sectionGap;
  
  checkPageBreak(20);
  pdf.setFillColor(230, 230, 230); 
  pdf.rect(margin, yPosition - (10 * lineHeightMultiplier * 0.6), contentWidth, (10 * lineHeightMultiplier * 1.1), 'F');
  yPosition = addText('DADOS DA VISTORIA', margin + 4, yPosition, { fontSize: 10, style: 'bold' });
  yPosition += itemGap;

  const addDataRow = (label, value) => {
    const labelY = yPosition;
    const valueIndent = 110; 
    addText(`${label}:`, margin, labelY, { fontSize: 8, style: 'bold'});
    const valueY = addText(String(value || 'Não informado'), margin + valueIndent, labelY, { fontSize: 8, maxWidth: contentWidth - valueIndent });
    yPosition = Math.max(labelY + (8 * lineHeightMultiplier), valueY) + (itemGap / 2.5); 
    checkPageBreak(18);
  };
  
  addDataRow('Cliente', vistoriaData.cliente);
  addDataRow('RG do Locatário', vistoriaData.rgLocatario);
  addDataRow('Modelo da Moto', vistoriaData.moto);
  addDataRow('Placa', vistoriaData.placa);
  addDataRow('Cor', vistoriaData.cor);
  addDataRow('KM Total (Painel)', vistoriaData.kmTotal);
  addDataRow('Nº Chassi', vistoriaData.numeroChassi);
  addDataRow('Nº Motor', vistoriaData.numeroMotor);
  addDataRow('Data da Vistoria', new Date(vistoriaData.data + 'T00:00:00').toLocaleDateString('pt-BR'));
  yPosition += sectionGap;

  const categoriasOrdenadas = [
    'Informações Iniciais',
    'Identificação do Veículo',
    'Fotos Gerais da Moto',
    'Pneus',
    'Sistema de Freios',
    'Sistema Elétrico',
    'Mecânica',
    'Suspensão',
    'Carroceria e Acessórios',
    'Observações', 
  ];
  
  for (const categoria of categoriasOrdenadas) {
    const itensCategoria = checklistItems.filter(item => item.categoria === categoria);
    if (itensCategoria.length === 0) continue;

    checkPageBreak(25);
    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, yPosition - (10 * lineHeightMultiplier * 0.6), contentWidth, (10 * lineHeightMultiplier * 1.1), 'F');
    yPosition = addText(categoria.toUpperCase(), margin + 4, yPosition, { fontSize: 10, style: 'bold' });
    yPosition += itemGap;
    
    for (const item of itensCategoria) {
      let itemStartY = yPosition;
      checkPageBreak(40); 
      
      itemStartY = addText(`• ${item.nome}`, margin, itemStartY, { fontSize: 9, style: 'bold' });
      
      if (item.hasKmInput) {
         itemStartY = addText(`  KM no Painel: ${String(vistoriaData.checklist[item.id] || 'Não informado')}`, margin + 8, itemStartY, { fontSize: 8, style: 'normal'});
      } else if (item.isTextEntry) {
         itemStartY = addText(`  Valor: ${String(vistoriaData.checklist[item.id] || 'Não informado')}`, margin + 8, itemStartY, { fontSize: 8, style: 'normal'});
      } else if (item.isTextAndPhotoOptional) {
        const obsText = vistoriaData.checklist['observacoes_finais_texto'];
        if (obsText) {
            itemStartY = addText(`  Texto: ${obsText}`, margin + 8, itemStartY, { fontSize: 8, style: 'normal'});
        } else {
            itemStartY = addText(`  Texto: (Nenhuma observação em texto)`, margin + 8, itemStartY, { fontSize: 8, style: 'italic', color: [100,100,100]});
        }
      } else if (!item.isPhotoOnly) {
        const condicao = vistoriaData.checklist[item.id];
        let condicaoTexto = 'NÃO AVALIADO';
        let corCondicao = [100, 100, 100];
        
        switch (condicao) {
          case 'bom': condicaoTexto = 'BOM'; corCondicao = [0, 130, 0]; break;
          case 'regular': condicaoTexto = 'REGULAR'; corCondicao = [180, 130, 0]; break;
          case 'necessita_troca': condicaoTexto = 'NECESSITA TROCA'; corCondicao = [180, 0, 0]; break;
        }
        itemStartY = addText(`  Condição: ${condicaoTexto}`, margin + 8, itemStartY, { fontSize: 8, style: 'bold', color: corCondicao});
      }
      yPosition = itemStartY;
      
      const fotos = vistoriaData.fotos[item.id] || [];
      if (fotos.length > 0) {
        yPosition += photoGap / 2;
        const photoWidth = 100; 
        const photoHeight = 75; 
        const photosPerRow = Math.floor(contentWidth / (photoWidth + photoGap));
        let currentX = margin + 8;
        
        for(let i = 0; i < fotos.length; i++) {
           const foto = fotos[i];
           if (i > 0 && i % photosPerRow === 0) {
             currentX = margin + 8;
             yPosition += photoHeight + photoGap;
           }
           checkPageBreak(photoHeight + photoGap);
           try {
              pdf.addImage(foto, 'JPEG', currentX, yPosition, photoWidth, photoHeight);
            } catch (error) {
              addText('[Erro Foto]', currentX + photoWidth/2, yPosition + photoHeight / 2, { fontSize: 7, color: [255,0,0], align: 'center'});
            }
            currentX += photoWidth + photoGap;
        }
        yPosition += photoHeight + photoGap;
      }
      yPosition += itemGap / 1.5; 
    }
    yPosition += sectionGap / 2;
  }

  checkPageBreak(130);
  pdf.setFillColor(230, 230, 230);
  pdf.rect(margin, yPosition - (10 * lineHeightMultiplier * 0.6), contentWidth, (10 * lineHeightMultiplier * 1.1), 'F');
  yPosition = addText('ASSINATURAS', margin + 4, yPosition, { fontSize: 10, style: 'bold' });
  yPosition += sectionGap * 1.2;

  const signatureWidth = 160; 
  const signatureHeight = 60; 
  const signatureY = yPosition;

  const signatureXvistoriador = margin + (contentWidth / 2 - signatureWidth) / 2;
  const signatureXlocatario = margin + contentWidth / 2 + (contentWidth / 2 - signatureWidth) / 2;

  if (vistoriaData.assinaturaVistoriador) {
    try {
      pdf.addImage(vistoriaData.assinaturaVistoriador, 'PNG', signatureXvistoriador, signatureY, signatureWidth, signatureHeight);
    } catch (error) {
      addText('[Erro Assinatura]', signatureXvistoriador + signatureWidth/2, signatureY + signatureHeight / 2, { fontSize: 7, align: 'center' });
    }
  }
  pdf.setDrawColor(100, 100, 100);
  pdf.line(signatureXvistoriador, signatureY + signatureHeight + 4, signatureXvistoriador + signatureWidth, signatureY + signatureHeight + 4);
  let textYVistoriador = addText('Vistoriador (LocAuto)', signatureXvistoriador, signatureY + signatureHeight + 12, { fontSize: 8, maxWidth: signatureWidth });
  addText(`CNPJ: ${CNPJ_EMPRESA}`, signatureXvistoriador, textYVistoriador, { fontSize: 7, maxWidth: signatureWidth });


  if (vistoriaData.assinaturaLocatario) {
    try {
      pdf.addImage(vistoriaData.assinaturaLocatario, 'PNG', signatureXlocatario, signatureY, signatureWidth, signatureHeight);
    } catch (error) {
      addText('[Erro Assinatura]', signatureXlocatario + signatureWidth/2, signatureY + signatureHeight / 2, { fontSize: 7, align: 'center' });
    }
  }
  pdf.line(signatureXlocatario, signatureY + signatureHeight + 4, signatureXlocatario + signatureWidth, signatureY + signatureHeight + 4);
  let textYLocatario = addText('Locatário', signatureXlocatario, signatureY + signatureHeight + 12, { fontSize: 8, maxWidth: signatureWidth });
  if (vistoriaData.rgLocatario) {
    addText(`RG: ${vistoriaData.rgLocatario}`, signatureXlocatario, textYLocatario, { fontSize: 7, maxWidth: signatureWidth });
  }

  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    const footerText = `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} | LocAuto`;
    const footerPageText = `Página ${i} de ${totalPages}`;
    
    const footerTextWidth = pdf.getStringUnitWidth(footerText) * 7 / pdf.internal.scaleFactor;
    pdf.text(footerText, margin, pageHeight - margin / 2.5);
    pdf.text(footerPageText, pageWidth - margin - (pdf.getStringUnitWidth(footerPageText) * 7 / pdf.internal.scaleFactor), pageHeight - margin / 2.5);
  }

  const fileName = `Vistoria_LocAuto_${vistoriaData.placa || 'S_PLACA'}_${vistoriaData.data.replace(/-/g, '')}.pdf`;
  pdf.save(fileName);
};